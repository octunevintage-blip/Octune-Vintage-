import express from 'express';
import { listDrops, getDropBySlug, getActiveDrop, createDrop, updateDrop, deleteDrop, assignProductsToDrop } from '../controllers/dropController.js';
import { adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/active', getActiveDrop);
router.get('/', listDrops);
router.get('/:slug', getDropBySlug);

router.post('/', adminOnly, upload.single('coverImage'), createDrop);
router.put('/:id', adminOnly, upload.single('coverImage'), updateDrop);
router.delete('/:id', adminOnly, deleteDrop);
router.post('/:id/assign', adminOnly, assignProductsToDrop);

export default router;
