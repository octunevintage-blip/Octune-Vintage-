import express from 'express';
import { createPaymentOrder, verifyPayment, razorpayWebhook, refundOrder } from '../controllers/paymentController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// protect not strictly required if guest checkout is allowed, but based on models user is optional, so we'll use a relaxed approach in controller.
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

// Webhook requires express.raw in server.js before this point, which is handled.
router.post('/webhook', razorpayWebhook);

router.post('/refund/:orderId', adminOnly, refundOrder);

export default router;
