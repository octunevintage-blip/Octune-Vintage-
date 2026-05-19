import express from 'express';
import { subscribe, unsubscribe, listSubscribers, exportSubscribers, deleteSubscriber } from '../controllers/subscriberController.js';
import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', subscribe);
router.get('/unsubscribe/:token', unsubscribe);

router.get('/', adminOnly, listSubscribers);
router.get('/export', adminOnly, exportSubscribers);
router.delete('/:id', adminOnly, deleteSubscriber);

export default router;
