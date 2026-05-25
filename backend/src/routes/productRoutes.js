import express from 'express';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, deleteProductImage, goLiveNow, addToWaitlist } from '../controllers/productController.js';
import { adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(adminOnly, upload.array('images', 8), createProduct);

router.post('/:id/waitlist', addToWaitlist);

router.route('/:id')
  .put(adminOnly, upload.array('images', 8), updateProduct)
  .delete(adminOnly, deleteProduct);

router.get('/:slug', getProductBySlug);
router.delete('/:id/image/:publicId', adminOnly, deleteProductImage);
router.post('/:id/go-live', adminOnly, goLiveNow);

export default router;
