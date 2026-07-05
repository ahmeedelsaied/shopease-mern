import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  syncWishlist,
  clearWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/', protect, addToWishlist);
router.post('/sync', protect, syncWishlist);
router.delete('/:productId', protect, removeFromWishlist);
router.delete('/', protect, clearWishlist);

export default router;
