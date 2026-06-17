import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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

  // Check if this specific user has already used this coupon
  if (email || phone) {
    const orderQuery = { 'coupon.code': code.toUpperCase(), status: { $ne: 'cancelled' } };
    const userOrCond = [];
    if (email) userOrCond.push({ 'customer.email': { $regex: new RegExp(`^${email}$`, 'i') } });
    if (phone) userOrCond.push({ 'customer.phone': phone });
    
    if (userOrCond.length > 0) {
      orderQuery.$or = userOrCond;
      const existingOrder = await Order.findOne(orderQuery);
      if (existingOrder) {
        return res.json({ valid: false, reason: 'You have already used this coupon.' });
      }
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
  let userEmail = null;
  let userPhone = null;

  let token;
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        userEmail = user.email;
        userPhone = user.phone;
      }
    } catch (err) {
      // ignore
    }
  }

  let usedCouponCodes = [];
  if (userEmail || userPhone) {
    const userOrCond = [];
    if (userEmail) userOrCond.push({ 'customer.email': { $regex: new RegExp(`^${userEmail}$`, 'i') } });
    if (userPhone) userOrCond.push({ 'customer.phone': userPhone });
    
    const orders = await Order.find({ 'coupon.code': { $exists: true, $ne: null }, status: { $ne: 'cancelled' }, $or: userOrCond });
    usedCouponCodes = orders.map(o => o.coupon.code.toUpperCase());
  }

  const query = {
    isActive: true,
    validFrom: { $lte: new Date() },
    validTo: { $gte: new Date() },
    $expr: { $lt: ["$usedCount", "$usageLimit"] }
  };

  const andConditions = [];

  if (usedCouponCodes.length > 0) {
    andConditions.push({ code: { $nin: usedCouponCodes } });
  }

  const orConditions = [
    {
      restrictedToEmail: { $in: [null, "", undefined] },
      restrictedToPhone: { $in: [null, "", undefined] },
      code: { $not: /^COMP-/i }
    }
  ];

  if (userEmail || userPhone) {
    const personalizedConditions = [];
    if (userEmail) personalizedConditions.push({ restrictedToEmail: new RegExp(`^${userEmail}$`, 'i') });
    if (userPhone) personalizedConditions.push({ restrictedToPhone: userPhone });
    
    if (personalizedConditions.length > 0) {
      orConditions.push({ $or: personalizedConditions });
    }
  }

  andConditions.push({ $or: orConditions });
  query.$and = andConditions;

  const coupons = await Coupon.find(query).sort({ createdAt: -1 });
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
