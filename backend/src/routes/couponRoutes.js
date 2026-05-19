import express from 'express';
import { validateCoupon, listCoupons, getActiveCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/active', getActiveCoupons);

router.get('/', adminOnly, listCoupons);
router.post('/', adminOnly, createCoupon);
router.put('/:id', adminOnly, updateCoupon);
router.delete('/:id', adminOnly, deleteCoupon);

export default router;
