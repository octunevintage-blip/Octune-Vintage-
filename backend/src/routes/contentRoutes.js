import express from 'express';
import { getContent, updateContent } from '../controllers/contentController.js';
import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getContent);
router.put('/', adminOnly, updateContent);

export default router;
