import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReviewSummary,
  getProductReviewsData,
  recalculateProductReviewSummary,
} from '../controllers/reviewController.js';

const makeReviewQuery = (reviews) => {
  const query = {
    populate() {
      return query;
    },
    select() {
      return Promise.resolve(reviews);
    },
    sort() {
      return Promise.resolve(reviews);
    },
  };
  return query;
};

test('GET review data computes a summary without writing Product', async () => {
  let productWriteCount = 0;
  const reviews = [
    { rating: 5, user: { name: 'A' } },
    { rating: 3, user: { name: 'B' } },
  ];
  const productModel = {
    findById: async () => ({ _id: 'product-1' }),
    findByIdAndUpdate: async () => {
      productWriteCount += 1;
    },
  };
  const reviewModel = {
    find: () => makeReviewQuery(reviews),
  };

  const result = await getProductReviewsData({
    productId: 'product-1',
    productModel,
    reviewModel,
  });

  assert.deepEqual(result.summary, {
    averageRating: 4,
    reviewsCount: 2,
    ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 1 },
  });
  assert.equal(result.reviews, reviews);
  assert.equal(productWriteCount, 0);
});

test('review aggregate summary is correct after a mutation recalculation', async () => {
  let update;
  const reviews = [{ rating: 4 }, { rating: 4.5 }, { rating: 2 }];
  const reviewModel = { find: () => makeReviewQuery(reviews) };
  const productModel = {
    findByIdAndUpdate: async (_id, values) => {
      update = values;
    },
  };

  const summary = await recalculateProductReviewSummary({
    productId: 'product-2',
    reviewModel,
    productModel,
  });

  assert.deepEqual(summary, {
    averageRating: 3.5,
    reviewsCount: 3,
    ratingDistribution: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 1 },
  });
  assert.deepEqual(update, {
    averageRating: 3.5,
    reviewsCount: 3,
    rating: 3.5,
  });
});

test('review summary handles an empty aggregate', () => {
  assert.deepEqual(buildReviewSummary([]), {
    averageRating: 0,
    reviewsCount: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
});
