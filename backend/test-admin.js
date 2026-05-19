import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Product from './src/models/Product.js';
import Order from './src/models/Order.js';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  try {
    const res = await Promise.all([
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
      Order.find().sort({ createdAt: -1 }).limit(5).select('orderNumber customer.name pricing.total status createdAt'),
      Product.find({ status: 'sold' }).sort({ updatedAt: -1 }).limit(5).select('name slug status updatedAt images')
    ]);
    console.log("Success:", res.length);
  } catch (err) {
    console.error("Error in promise all:", err);
  }
  
  process.exit(0);
}

test();
