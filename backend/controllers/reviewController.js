import Product from '../models/Product.js';
import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';

const buildRatingDistribution = (reviews = []) => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach((review) => {
    const ratingBucket = Math.min(5, Math.max(1, Math.round(review.rating)));
    distribution[ratingBucket] += 1;
  });

  return distribution;
};

const validateReviewPayload = ({ rating, comment }) => {
  if (rating === undefined || Number.isNaN(Number(rating))) {
    return 'Rating is required';
  }

  const numericRating = Number(rating);

  if (numericRating < 1 || numericRating > 5 || numericRating * 2 !== Math.round(numericRating * 2)) {
    return 'Rating must be between 1 and 5 in half-star increments';
  }

  if (comment === undefined || comment.trim().length < 3) {
    return 'Comment must be at least 3 characters';
  }

  return '';
};

const calculateReviewSummary = async (productId) => {
  const reviews = await Review.find({ product: productId }).select('rating');
  const reviewsCount = reviews.length;
  const averageRating = reviewsCount
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount).toFixed(1))
    : 0;
  const ratingDistribution = buildRatingDistribution(reviews);

  await Product.findByIdAndUpdate(productId, {
    averageRating,
    reviewsCount,
    rating: averageRating,
  });

  return {
    averageRating,
    reviewsCount,
    ratingDistribution,
  };
};

const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const reviews = await Review.find({ product: req.params.id })
    .populate('user', 'name role')
    .sort({ createdAt: -1 });
  const summary = await calculateReviewSummary(req.params.id);

  res.status(200).json({
    success: true,
    data: reviews,
    summary,
  });
});

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;
  const validationMessage = validateReviewPayload({ rating, comment });

  if (validationMessage) {
    res.status(400);
    throw new Error(validationMessage);
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const existingReview = await Review.findOne({ user: req.user._id, product: productId });

  if (existingReview) {
    res.status(409);
    throw new Error('You have already reviewed this product');
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating: Number(rating),
    comment: comment.trim(),
  });

  const populatedReview = await review.populate('user', 'name role');
  const summary = await calculateReviewSummary(productId);

  res.status(201).json({
    success: true,
    data: populatedReview,
    summary,
  });
});

const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const validationMessage = validateReviewPayload({
    rating: rating ?? review.rating,
    comment: comment ?? review.comment,
  });

  if (validationMessage) {
    res.status(400);
    throw new Error(validationMessage);
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }

  if (rating !== undefined) {
    review.rating = Number(rating);
  }

  if (comment !== undefined) {
    review.comment = comment.trim();
  }

  await review.save();

  const populatedReview = await review.populate('user', 'name role');
  const summary = await calculateReviewSummary(review.product);

  res.status(200).json({
    success: true,
    data: populatedReview,
    summary,
  });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  const productId = review.product;
  await review.deleteOne();
  const summary = await calculateReviewSummary(productId);

  res.status(200).json({
    success: true,
    message: 'Review deleted',
    summary,
  });
});

export { getProductReviews, createProductReview, updateReview, deleteReview };
export default {
  getProductReviews,
  createProductReview,
  updateReview,
  deleteReview,
};
