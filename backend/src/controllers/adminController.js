import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

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
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
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
        localField: '_id',
        foreignField: 'user',
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
