import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', adminOnly, getDashboardStats);

export default router;
