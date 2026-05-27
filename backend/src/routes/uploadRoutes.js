import express from 'express';
import { adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { uploadImage } from '../utils/storage.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.post('/', adminOnly, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  const result = await uploadImage(req.file.buffer, req.file.mimetype, 'octune-vintage/content');

  res.json({
    url: result.url,
    public_id: result.publicId,
  });
}));

export default router;
