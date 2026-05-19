import express from 'express';
import { registerUser, loginUser, adminLogin, logout, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many auth attempts, please try again after 15 minutes'
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/admin/login', authLimiter, adminLogin);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
