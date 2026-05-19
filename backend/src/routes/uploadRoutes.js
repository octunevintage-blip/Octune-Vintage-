import express from 'express';
import { adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import cloudinary from '../config/cloudinary.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.post('/', adminOnly, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;
  
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'octune-vintage/content',
  });

  res.json({
    url: result.secure_url,
    public_id: result.public_id,
  });
}));

export default router;
