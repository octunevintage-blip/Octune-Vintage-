import express from 'express';
import { getOrderById, getAllOrders, updateOrderStatus, getMyOrders } from '../controllers/orderController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', adminOnly, getAllOrders);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', adminOnly, updateOrderStatus);

export default router;
