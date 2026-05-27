import asyncHandler from 'express-async-handler';
import Drop from '../models/Drop.js';
import Product from '../models/Product.js';
import Subscriber from '../models/Subscriber.js';
import { uploadImage, deleteImage } from '../utils/storage.js';
import sendEmail, { dropScheduledTemplate } from '../utils/sendEmail.js';

export const listDrops = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const drops = await Drop.find(query).sort({ dropAt: 1 });
  res.json(drops);
});

export const getDropBySlug = asyncHandler(async (req, res) => {
  const drop = await Drop.findOne({ slug: req.params.slug });
  if (!drop) {
    res.status(404);
    throw new Error('Drop not found');
  }
  const products = await Product.find({ dropId: drop._id });
  res.json({ drop, products });
});

export const getActiveDrop = asyncHandler(async (req, res) => {
  const drop = await Drop.findOne({ status: 'scheduled', dropAt: { $gt: new Date() } }).sort({ dropAt: 1 });
  res.json(drop || null);
});

export const createDrop = asyncHandler(async (req, res) => {
  const { name, description, dropAt } = req.body;
  let coverImage = {};

  if (req.file) {
    const result = await uploadImage(req.file.buffer, req.file.mimetype, 'octune-vintage/drops');
    coverImage = { url: result.url, publicId: result.publicId };
  }

  const drop = await Drop.create({
    name,
    description,
    dropAt,
    coverImage,
    status: 'scheduled'
  });

  // Async email sending
  Subscriber.find({ isActive: true }).then(subscribers => {
    const html = dropScheduledTemplate(drop);
    subscribers.forEach(sub => {
      sendEmail({ to: sub.email, subject: `Octune Vintage: New Drop Scheduled`, html }).catch(console.error);
    });
  });

  res.status(201).json(drop);
});

export const updateDrop = asyncHandler(async (req, res) => {
  const drop = await Drop.findById(req.params.id);
  if (!drop) {
    res.status(404);
    throw new Error('Drop not found');
  }
  if (drop.status === 'ended') {
    res.status(400);
    throw new Error('Cannot update ended drop');
  }

  Object.assign(drop, req.body);
  const updatedDrop = await drop.save();
  res.json(updatedDrop);
});

export const deleteDrop = asyncHandler(async (req, res) => {
  const drop = await Drop.findById(req.params.id);
  if (!drop) {
    res.status(404);
    throw new Error('Drop not found');
  }

  if (drop.coverImage?.publicId) {
    try {
      await deleteImage(drop.coverImage.publicId);
    } catch (err) {
      console.error('Failed to delete cover image:', err);
    }
  }

  await Product.updateMany(
    { dropId: drop._id },
    { $unset: { dropId: 1, dropAt: 1 }, $set: { status: 'available' } }
  );

  await drop.deleteOne();
  res.json({ message: 'Drop removed' });
});

export const assignProductsToDrop = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  const drop = await Drop.findById(req.params.id);
  if (!drop) {
    res.status(404);
    throw new Error('Drop not found');
  }

  await Product.updateMany(
    { _id: { $in: productIds } },
    { $set: { dropId: drop._id, dropAt: drop.dropAt, status: 'upcoming' } }
  );

  drop.productCount += productIds.length;
  await drop.save();

  res.json({ message: 'Products assigned to drop' });
});
