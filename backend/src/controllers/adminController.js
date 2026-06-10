import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import sendEmail from '../utils/sendEmail.js';
import { sendWhatsAppMessage } from '../utils/sendWhatsApp.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalProducts,
    available,
    sold,
    ordersToday,
    ordersMonth,
    pendingOrders,
    revenueResult,
    recentOrders,
    recentSales
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ status: 'available' }),
    Product.countDocuments({ status: 'sold' }),
    Order.countDocuments({ createdAt: { $gte: today }, 'payment.status': 'paid' }),
    Order.countDocuments({ createdAt: { $gte: firstDayOfMonth }, 'payment.status': 'paid' }),
    Order.countDocuments({ status: 'pending' }),
    Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' } } }
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5)
      .select('orderNumber customer.name pricing.total status createdAt')
      .lean(),
    Product.find({ status: 'sold' }).sort({ updatedAt: -1 }).limit(5)
      .select('name slug status updatedAt images')
      .lean()
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  res.json({
    totalProducts,
    available,
    sold,
    ordersToday,
    ordersMonth,
    pendingOrders,
    totalRevenue,
    recentOrders,
    recentSales
  });
});

import User from '../models/User.js';

export const getCustomers = asyncHandler(async (req, res) => {
  // Aggregate to get users along with their order counts
  const customers = await User.aggregate([
    {
      $lookup: {
        from: 'orders',
        let: { userEmail: '$email' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$customer.email', '$$userEmail'] },
              'payment.status': 'paid'
            }
          }
        ],
        as: 'orders'
      }
    },
    {
      $project: {
        name: 1,
        email: 1,
        phone: 1,
        addresses: 1,
        createdAt: 1,
        totalOrders: { $size: '$orders' },
        totalSpent: { $sum: '$orders.pricing.total' }
      }
    },
    { $sort: { createdAt: -1 } }
  ]);

  res.json(customers);
});

export const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ products: [], orders: [], customers: [] });

  const regex = new RegExp(q, 'i');

  const [products, orders, customers] = await Promise.all([
    Product.find({ name: regex }).select('name slug status images').limit(5).lean(),
    Order.find({
      $or: [
        { orderNumber: regex },
        { 'shippingAddress.name': regex },
        { 'customer.email': regex }
      ]
    }).select('orderNumber status customer pricing createdAt').limit(5).lean(),
    User.find({
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex }
      ]
    }).select('name email phone').limit(5).lean()
  ]);

  res.json({
    products,
    orders,
    customers
  });
});

export const sendPersonalizedCoupon = asyncHandler(async (req, res) => {
  const { email, phone, type, value, reason } = req.body;

  if (!email || !value) {
    res.status(400);
    throw new Error('Email and value are required');
  }

  // Generate unique code
  const code = `COMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const coupon = await Coupon.create({
    code,
    type: type || 'flat',
    value: Number(value),
    usageLimit: 1,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Valid for 2 days
    restrictedToEmail: email,
    restrictedToPhone: phone
  });

  const discountText = type === 'percent' ? `${value}% OFF` : `₹${value} OFF`;

  // Send Email
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
      <h2 style="text-transform: uppercase; letter-spacing: 2px;">Octune Vintage</h2>
      <p>Hello,</p>
      <p>We're reaching out regarding your recent experience with us. ${reason ? `We understand that: ${reason}. ` : ''}We sincerely apologize for any inconvenience caused.</p>
      <p>As a gesture of our commitment to you, we have generated a special, one-time use coupon for your next purchase:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="margin: 0; letter-spacing: 4px; font-family: monospace;">${code}</h1>
        <p style="margin-top: 10px; font-weight: bold;">Enjoy ${discountText} on your next order!</p>
      </div>
      <p>This code is valid for 30 days. If you need any further assistance, please reply to this email.</p>
      <p>Best regards,<br>The Octune Vintage Team</p>
    </div>
  `;
  
  try {
    await sendEmail({
      to: email,
      subject: 'A Special Gift from Octune Vintage',
      html: emailHtml
    });
  } catch (err) {
    console.error('Email failed to send but coupon was generated:', err);
    // Continue execution to send WhatsApp and return success
  }

  // Send WhatsApp if phone is provided
  if (phone) {
    // Note: We might need a generic template or a specific template for this on Meta.
    // For now, if no specific template exists, we can log it or send a standard message.
    // Assuming we have a template 'custom_coupon' or we fallback gracefully.
    try {
      await sendWhatsAppMessage(phone, 'custom_coupon', [
        { type: "text", text: code },
        { type: "text", text: discountText }
      ]);
    } catch (e) {
      console.error('WhatsApp custom coupon failed:', e);
    }
  }

  res.status(201).json({ message: 'Coupon generated and sent to customer', coupon });
});

