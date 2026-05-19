import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json(order);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, tracking, notes, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  
  if (tracking) {
    order.tracking = tracking;
  }
  
  if (notes) {
    order.notes = notes;
  }
  
  if (paymentStatus) {
    order.payment.status = paymentStatus;
  } else if (status === 'refunded') {
    order.payment.status = 'refunded';
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    $or: [
      { user: req.user._id },
      { 'customer.email': req.user.email }
    ]
  }).sort({ createdAt: -1 });

  res.json(orders);
});
