import Product from '../models/Product.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const normalizeProductIds = (productIds = []) => {
  const uniqueIds = [];
  const seen = new Set();

  productIds.forEach((productId) => {
    const normalizedId = productId?.toString?.() || '';
    if (!normalizedId || seen.has(normalizedId)) {
      return;
    }

    seen.add(normalizedId);
    uniqueIds.push(normalizedId);
  });

  return uniqueIds;
};

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');

  res.status(200).json({
    success: true,
    data: user.wishlist || [],
  });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product id is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const user = await User.findById(req.user._id);
  const currentWishlist = normalizeProductIds(user.wishlist || []);

  if (!currentWishlist.includes(productId)) {
    currentWishlist.push(productId);
    user.wishlist = currentWishlist;
    await user.save();
  }

  const updatedUser = await User.findById(req.user._id).populate('wishlist');

  res.status(200).json({
    success: true,
    data: updatedUser.wishlist || [],
  });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  const currentWishlist = normalizeProductIds(user.wishlist || []).filter((id) => id !== productId);

  user.wishlist = currentWishlist;
  await user.save();

  const updatedUser = await User.findById(req.user._id).populate('wishlist');

  res.status(200).json({
    success: true,
    data: updatedUser.wishlist || [],
  });
});

const syncWishlist = asyncHandler(async (req, res) => {
  const { productIds = [] } = req.body;

  const user = await User.findById(req.user._id);
  user.wishlist = normalizeProductIds(productIds);
  await user.save();

  const updatedUser = await User.findById(req.user._id).populate('wishlist');

  res.status(200).json({
    success: true,
    data: updatedUser.wishlist || [],
  });
});

const clearWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = [];
  await user.save();

  const updatedUser = await User.findById(req.user._id).populate('wishlist');

  res.status(200).json({
    success: true,
    data: updatedUser.wishlist || [],
  });
});

export { getWishlist, addToWishlist, removeFromWishlist, syncWishlist, clearWishlist };
export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  syncWishlist,
  clearWishlist,
};
