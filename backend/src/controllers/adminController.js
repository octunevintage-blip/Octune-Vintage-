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
