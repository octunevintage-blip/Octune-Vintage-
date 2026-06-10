import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal, email, phone } = req.body;
  
  if (!code || !subtotal) {
    res.status(400);
    throw new Error('Code and subtotal are required');
  }

  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validTo: { $gte: new Date() }
  });

  if (!coupon) {
    return res.json({ valid: false, reason: 'Invalid or expired coupon' });
  }

  // Enforce restrictions
  if (coupon.restrictedToEmail || coupon.restrictedToPhone) {
    const emailMatches = coupon.restrictedToEmail && email && coupon.restrictedToEmail.toLowerCase() === email.toLowerCase();
    const phoneMatches = coupon.restrictedToPhone && phone && coupon.restrictedToPhone === phone;
    
    if (!emailMatches && !phoneMatches) {
      return res.json({ valid: false, reason: 'This coupon is restricted to the customer it was sent to.' });
    }
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return res.json({ valid: false, reason: 'Coupon usage limit reached' });
  }

  if (subtotal < coupon.minOrderValue) {
    return res.json({ valid: false, reason: `Minimum order value of ₹${coupon.minOrderValue} required` });
  }

  let discount = 0;
  if (coupon.type === 'flat') {
    discount = coupon.value;
  } else if (coupon.type === 'percent') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  }

  res.json({ valid: true, code: coupon.code, discount, type: coupon.type, value: coupon.value });
});

export const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

export const getActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({
    isActive: true,
    validFrom: { $lte: new Date() },
    validTo: { $gte: new Date() },
    $expr: { $lt: ["$usedCount", "$usageLimit"] }
  }).sort({ createdAt: -1 });
  res.json(coupons);
});

export const createCoupon = asyncHandler(async (req, res) => {
  const existing = await Coupon.findOne({ code: req.body.code.toUpperCase() });
  if (existing) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }
  
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  Object.assign(coupon, req.body);
  const updatedCoupon = await coupon.save();
  res.json(updatedCoupon);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  await coupon.deleteOne();
  res.json({ message: 'Coupon removed' });
});
