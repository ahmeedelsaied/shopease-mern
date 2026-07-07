import express from 'express';
import { deleteReview, updateReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
