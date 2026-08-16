export const getCanonicalProductRating = (product = {}) => {
  const averageRating = Number(product.averageRating);
  const legacyRating = Number(product.rating);
  const reviewsCount = Number(product.reviewsCount);

  if (Number.isFinite(averageRating) && (reviewsCount > 0 || averageRating > 0)) {
    return Math.min(5, Math.max(0, averageRating));
  }

  return Number.isFinite(legacyRating) ? Math.min(5, Math.max(0, legacyRating)) : 0;
};
