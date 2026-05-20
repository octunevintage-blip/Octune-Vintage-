import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import razorpay from '../config/razorpay.js';
import sendEmail, { orderConfirmationTemplate } from '../utils/sendEmail.js';

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { productId, customer, shippingAddress, couponCode } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.status === 'sold' || product.status === 'upcoming') {
    res.status(400);
    throw new Error('Product is not available');
  }

  if (product.status === 'reserved' && product.reservedUntil > new Date() && 
      String(product.reservedBy) !== String(req.user?._id)) {
    res.status(400);
    throw new Error('Product is currently reserved by another user');
  }

  product.status = 'reserved';
  product.reservedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 mins lock
  if (req.user) product.reservedBy = req.user._id;
  await product.save();

  let subtotal = product.price;
  let couponDiscount = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() }
    });

    if (coupon && coupon.usedCount < coupon.usageLimit && subtotal >= coupon.minOrderValue) {
      if (coupon.type === 'flat') {
        couponDiscount = coupon.value;
      } else {
        couponDiscount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
          couponDiscount = coupon.maxDiscount;
        }
      }
    }
  }

  const shipping = (subtotal - couponDiscount) >= 999 ? 0 : 99;
  const total = subtotal - couponDiscount + shipping;

  const amount = Math.round(total * 100);
  if (amount < 100) {
    res.status(400);
    throw new Error('Amount must be at least 100 paise (₹1)');
  }

  const orderNumber = `OCT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: orderNumber,
      notes: { productId: product._id.toString() }
    });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    if (error.statusCode === 401 || error.status === 401 || (error.message && error.message.includes('401'))) {
      res.status(401);
      throw new Error('Razorpay authentication failure. Please check API credentials.');
    }
    res.status(500);
    throw new Error(error.description || error.message || 'Failed to create payment order with Razorpay');
  }

  const order = await Order.create({
    orderNumber,
    customer,
    user: req.user?._id || null,
    product: {
      productId: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      size: product.size,
      color: product.color?.name || '',
      price: product.price
    },
    shippingAddress,
    pricing: { subtotal, shipping, discount: couponDiscount, total },
    coupon: couponCode ? { code: couponCode, discount: couponDiscount } : undefined,
    payment: {
      method: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      status: 'pending'
    }
  });

  res.json({
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    breakdown: { subtotal, couponDiscount, shipping, total }
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    res.status(400);
    throw new Error('Missing fields required for payment verification');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const text = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    res.status(400);
    throw new Error('Invalid signature');
  }

  order.payment.status = 'paid';
  order.payment.paidAt = new Date();
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.razorpaySignature = razorpaySignature;
  order.status = 'confirmed';
  await order.save();

  const product = await Product.findById(order.product.productId);
  if (product) {
    product.status = 'sold';
    product.soldAt = new Date();
    product.deleteAt = new Date(Date.now() + 168 * 60 * 60 * 1000); // 168 hours
    product.soldTo = order._id;
    product.reservedUntil = null;
    product.reservedBy = null;
    await product.save();
  }

  if (order.coupon?.code) {
    await Coupon.findOneAndUpdate({ code: order.coupon.code }, { $inc: { usedCount: 1 } });
  }

  const html = orderConfirmationTemplate(order);
  sendEmail({ to: order.customer.email, subject: `Octune Vintage: Order ${order.orderNumber} Confirmed`, html }).catch(console.error);

  res.json({ success: true, orderId: order._id, orderNumber: order.orderNumber });
});

export const razorpayWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  
  if (!req.rawBody) {
    return res.status(400).send('Raw body is missing');
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body.event;
  console.log('Razorpay Webhook Event:', event);

  res.json({ status: 'ok' });
});

export const refundOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.payment.razorpayPaymentId) {
    res.status(400);
    throw new Error('No payment ID found to refund');
  }

  const refund = await razorpay.payments.refund(order.payment.razorpayPaymentId, {
    amount: Math.round(order.pricing.total * 100)
  });

  order.payment.status = 'refunded';
  order.status = 'refunded';
  await order.save();

  res.json({ message: 'Refund initiated successfully', refund });
});
