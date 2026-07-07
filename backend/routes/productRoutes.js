import express from 'express';
import { getProducts, getProductById } from '../controllers/productController.js';
import { createProductReview, getProductReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', protect, createProductReview);
router.get('/:id', getProductById);

export default router;
