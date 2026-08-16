import test from 'node:test';
import assert from 'node:assert/strict';
import { getCanonicalProductRating } from '../utils/productRating.js';

test('canonical rating prefers review-derived averageRating', () => {
  assert.equal(
    getCanonicalProductRating({ averageRating: 4.2, rating: 5, reviewsCount: 8 }),
    4.2,
  );
});

test('canonical rating falls back to legacy rating for existing products without reviews', () => {
  assert.equal(
    getCanonicalProductRating({ averageRating: 0, rating: 4.5, reviewsCount: 0 }),
    4.5,
  );
});

test('canonical rating returns zero when neither rating source is usable', () => {
  assert.equal(getCanonicalProductRating({ averageRating: 'invalid', rating: undefined }), 0);
});
