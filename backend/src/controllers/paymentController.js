import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import razorpay from '../config/razorpay.js';
import sendEmail, { orderConfirmationTemplate } from '../utils/sendEmail.js';
import sendWhatsAppMessage from '../utils/sendWhatsApp.js';

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { productId, productIds, customer, shippingAddress, couponCode, paymentMethod = 'razorpay' } = req.body;

  let ids = [];
  if (Array.isArray(productIds)) {
    ids = productIds;
  } else if (productId) {
    ids = [productId];
  }

  if (ids.length === 0) {
    res.status(400);
    throw new Error('No products specified');
  }

  const products = await Product.find({ _id: { $in: ids } });
  if (products.length !== ids.length) {
    res.status(404);
    throw new Error('One or more products not found');
  }

  // Check availability for all products first
  for (const product of products) {
    if (product.status === 'sold' || product.status === 'upcoming') {
      res.status(400);
      throw new Error(`Product "${product.name}" is not available`);
    }

    if (product.status === 'reserved' && product.reservedUntil > new Date() && 
        String(product.reservedBy) !== String(req.user?._id)) {
      res.status(400);
      throw new Error(`Product "${product.name}" is currently reserved by another user`);
    }
  }

  // Reserve all products
  for (const product of products) {
    product.status = 'reserved';
    product.reservedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 mins lock
    if (req.user) product.reservedBy = req.user._id;
    await product.save();
  }

  let subtotal = products.reduce((acc, curr) => acc + curr.price, 0);
  let couponDiscount = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() }
    });

    if (coupon) {
      // Enforce restrictions
      if (coupon.restrictedToEmail || coupon.restrictedToPhone) {
        const emailMatches = coupon.restrictedToEmail && customer.email && coupon.restrictedToEmail.toLowerCase() === customer.email.toLowerCase();
        const phoneMatches = coupon.restrictedToPhone && customer.phone && coupon.restrictedToPhone === customer.phone;
        
        if (!emailMatches && !phoneMatches) {
          res.status(400);
          throw new Error('This coupon is restricted to the customer it was sent to.');
        }
      }

      if (coupon.usedCount < coupon.usageLimit && subtotal >= coupon.minOrderValue) {
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
  }

  const totalDiscount = couponDiscount;

  const shipping = (subtotal - couponDiscount) >= 999 ? 0 : 99;
  const total = Math.max(subtotal - totalDiscount + shipping, 0);

  const orderNumber = `OCT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

  let razorpayOrder = null;
  if (paymentMethod === 'razorpay') {
    const amount = Math.round(total * 100);
    if (amount < 100) {
      res.status(400);
      throw new Error('Amount must be at least 100 paise (₹1)');
    }
    try {
      razorpayOrder = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: orderNumber,
        notes: { productIds: ids.join(',') }
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
  }

  // Auto-save address and phone to user profile if logged-in and has none saved yet
  if (req.user) {
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        let updated = false;
        if (!user.phone && customer.phone) {
          user.phone = customer.phone;
          updated = true;
        }
        if (shippingAddress) {
          const newAddress = {
            label: 'Default',
            line1: shippingAddress.line1,
            line2: shippingAddress.line2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            isDefault: true
          };

          if (!user.addresses) {
            user.addresses = [newAddress];
            updated = true;
          } else {
            // Check if this exact address already exists
            const exists = user.addresses.some(a => 
              a.line1 === newAddress.line1 &&
              a.pincode === newAddress.pincode
            );
            
            if (!exists) {
              // Unset other defaults
              user.addresses.forEach(a => { a.isDefault = false; });
              user.addresses.push(newAddress);
              updated = true;
            }
          }
        }
        if (updated) {
          await user.save();
        }
      }
    } catch (err) {
      console.error('Failed to auto-save user details during checkout:', err);
    }
  }

  const order = await Order.create({
    orderNumber,
    customer,
    user: req.user?._id || null,
    product: {
      productId: products[0]._id,
      name: products[0].name,
      image: products[0].images?.[0]?.url || '',
      size: products[0].size,
      color: products[0].color?.name || '',
      price: products[0].price
    },
    products: products.map(p => ({
      productId: p._id,
      name: p.name,
      image: p.images?.[0]?.url || '',
      size: p.size,
      color: p.color?.name || '',
      price: p.price
    })),
    shippingAddress,
    pricing: { subtotal, shipping, discount: totalDiscount, total },
    coupon: couponCode ? { code: couponCode, discount: couponDiscount } : undefined,
    payment: {
      method: paymentMethod,
      razorpayOrderId: razorpayOrder ? razorpayOrder.id : undefined,
      status: paymentMethod === 'cod' ? 'pending' : 'pending'
    },
    status: paymentMethod === 'cod' ? 'confirmed' : 'pending'
  });

  if (paymentMethod === 'cod') {
    const productIds = products.map(p => p._id);
    await Product.updateMany(
      { _id: { $in: productIds } },
      {
        $set: {
          status: 'sold',
          soldAt: new Date(),
          deleteAt: new Date(Date.now() + 168 * 60 * 60 * 1000), // 168 hours
          soldTo: order._id,
          reservedUntil: null,
          reservedBy: null
        }
      }
    );

    if (couponCode) {
      await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
    }

    const html = orderConfirmationTemplate(order);
    sendEmail({ to: order.customer.email, subject: `Octune Vintage: Order ${order.orderNumber} Confirmed`, html }).catch(console.error);

    sendWhatsAppMessage({
      to: order.customer.phone,
      type: 'order_confirmation',
      data: {
        customerName: order.customer.name.split(' ')[0],
        orderNumber: order.orderNumber
      }
    });

    return res.json({
      success: true,
      orderId: order._id,
      paymentMethod: 'cod',
      breakdown: { subtotal, totalDiscount, shipping, total }
    });
  }

  res.json({
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    paymentMethod: 'razorpay',
    breakdown: { subtotal, totalDiscount, shipping, total }
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

  const productIds = order.products && order.products.length > 0 
    ? order.products.map(p => p.productId) 
    : [order.product.productId];

  await Product.updateMany(
    { _id: { $in: productIds } },
    {
      $set: {
        status: 'sold',
        soldAt: new Date(),
        deleteAt: new Date(Date.now() + 168 * 60 * 60 * 1000), // 168 hours
        soldTo: order._id,
        reservedUntil: null,
        reservedBy: null
      }
    }
  );

  if (order.coupon?.code) {
    await Coupon.findOneAndUpdate({ code: order.coupon.code }, { $inc: { usedCount: 1 } });
  }

  const html = orderConfirmationTemplate(order);
  sendEmail({ to: order.customer.email, subject: `Octune Vintage: Order ${order.orderNumber} Confirmed`, html }).catch(console.error);

  sendWhatsAppMessage({
    to: order.customer.phone,
    type: 'order_confirmation',
    data: {
      customerName: order.customer.name.split(' ')[0],
      orderNumber: order.orderNumber
    }
  });

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
