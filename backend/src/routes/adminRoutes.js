import express from 'express';
import { getDashboardStats, getCustomers, globalSearch } from '../controllers/adminController.js';
import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', adminOnly, getDashboardStats);
router.get('/customers', adminOnly, getCustomers);
router.get('/search', adminOnly, globalSearch);

export default router;
