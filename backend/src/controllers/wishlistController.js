import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json(user.wishlist || []);
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;

  if (user.wishlist.includes(productId)) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }

  user.wishlist.push(productId);
  await user.save();

  const updated = await User.findById(req.user._id).populate('wishlist');
  res.json(updated.wishlist);
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== req.params.productId
  );
  await user.save();

  const updated = await User.findById(req.user._id).populate('wishlist');
  res.json(updated.wishlist);
});
