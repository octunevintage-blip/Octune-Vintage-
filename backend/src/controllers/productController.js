import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Drop from '../models/Drop.js';
import cloudinary from '../config/cloudinary.js';
import slugify from 'slugify';

export const getProducts = asyncHandler(async (req, res) => {
  const { category, sort, search, status, page = 1, limit = 24, includeUpcoming } = req.query;
  const query = {};

  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: 'i' };
  
  if (status) {
    query.status = status;
  } else if (includeUpcoming === 'true') {
    query.status = { $in: ['available', 'reserved', 'sold', 'upcoming', 'out-of-stock'] };
  } else {
    query.status = { $in: ['available', 'reserved', 'sold', 'out-of-stock'] };
  }

  // Sort available items first, then by the specified criteria (default: newest first)
  let sortCriteria = { status: 1, createdAt: -1 };
  if (sort === 'price-asc') sortCriteria = { status: 1, price: 1 };
  if (sort === 'price-desc') sortCriteria = { status: 1, price: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortCriteria)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  let product = await Product.findOne({ slug: req.params.slug });
  
  if (!product && req.params.slug.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(req.params.slug);
  }

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.views += 1;
  await product.save();

  const productData = product.toJSON();
  if (product.status === 'upcoming') {
    productData.isLocked = true;
  }

  res.json(productData);
});

export const createProduct = asyncHandler(async (req, res) => {
  const data = JSON.parse(req.body.data);
  const files = req.files;

  if (!files || files.length === 0) {
    res.status(400);
    throw new Error('At least one image is required');
  }
  if (files.length > 5) {
    res.status(400);
    throw new Error('Maximum 5 images allowed per product');
  }

  const uploadedImages = [];
  for (const file of files) {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, { folder: 'octune-vintage/products' });
    uploadedImages.push({ url: result.secure_url, publicId: result.public_id });
  }

  const status = (data.dropAt && new Date(data.dropAt) > new Date()) ? 'upcoming' : 'available';

  const product = await Product.create({
    ...data,
    images: uploadedImages,
    status
  });

  if (data.dropId) {
    await Drop.findByIdAndUpdate(data.dropId, { $inc: { productCount: 1 } });
  }

  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const data = req.body.data ? JSON.parse(req.body.data) : req.body;
  const files = req.files || [];

  if (product.images.length + files.length > 5) {
    res.status(400);
    throw new Error(`Cannot add ${files.length} image(s). Product already has ${product.images.length} image(s). Max 5 allowed.`);
  }

  for (const file of files) {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, { folder: 'octune-vintage/products' });
    product.images.push({ url: result.secure_url, publicId: result.public_id });
  }

  Object.assign(product, data);
  
  if (data.dropAt && new Date(data.dropAt) > new Date() && product.status !== 'sold') {
    product.status = 'upcoming';
  } else if (data.status === 'available') {
    product.status = 'available';
  }

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  for (const img of product.images) {
    await cloudinary.uploader.destroy(img.publicId);
  }

  if (product.dropId) {
    await Drop.findByIdAndUpdate(product.dropId, { $inc: { productCount: -1 } });
  }

  await product.deleteOne();
  res.json({ message: 'Product removed' });
});

// @desc    Add user to waitlist
// @route   POST /api/products/:id/waitlist
// @access  Public
export const addToWaitlist = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.status === 'available') {
    res.status(400);
    throw new Error('Product is already available. You can buy it now.');
  }

  // Check if email already in waitlist
  const alreadyExists = product.waitlist?.find(w => w.email === email);
  if (alreadyExists) {
    return res.status(200).json({ message: 'You are already on the waitlist for this item.' });
  }

  product.waitlist.push({ email, phone });
  await product.save();

  res.status(201).json({ message: 'Added to waitlist successfully. We will notify you when it is back in stock.' });
});


export const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const { publicId } = req.params;
  
  if (product.images.length === 1) {
    res.status(400);
    throw new Error('Cannot delete the last image');
  }

  await cloudinary.uploader.destroy(publicId);
  product.images = product.images.filter(img => img.publicId !== publicId);
  await product.save();

  res.json(product);
});

export const goLiveNow = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.status = 'available';
  product.dropAt = null;
  await product.save();

  res.json(product);
});
