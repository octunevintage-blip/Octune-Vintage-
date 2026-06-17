import express from 'express';
import { getDashboardStats, getCustomers, globalSearch, sendPersonalizedCoupon, deleteCustomer } from '../controllers/adminController.js';
import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', adminOnly, getDashboardStats);
router.get('/customers', adminOnly, getCustomers);
router.delete('/customers/:id', adminOnly, deleteCustomer);
router.get('/search', adminOnly, globalSearch);
router.post('/marketing/personalized-coupon', adminOnly, sendPersonalizedCoupon);


export default router;
