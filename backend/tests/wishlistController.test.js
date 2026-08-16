import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWishlistProductIds } from '../controllers/wishlistController.js';

const productModelFor = (products, calls = { count: 0 }) => ({
  find() {
    calls.count += 1;
    const query = {
      select() {
        return query;
      },
      lean: async () => products,
    };
    return query;
  },
});

test('wishlist sync rejects malformed product ids before querying Product', async () => {
  const calls = { count: 0 };
  const result = await validateWishlistProductIds(
    ['not-an-object-id'],
    productModelFor([], calls),
  );

  assert.equal(result.ids, null);
  assert.equal(result.error, 'Wishlist contains invalid product ids');
  assert.equal(calls.count, 0);
});

test('wishlist sync rejects valid-looking ids for deleted products', async () => {
  const result = await validateWishlistProductIds(
    ['507f1f77bcf86cd799439011'],
    productModelFor([]),
  );

  assert.equal(result.ids, null);
  assert.equal(result.error, 'Wishlist contains unavailable products');
});

test('wishlist sync accepts existing ids and deduplicates them', async () => {
  const id = '507f1f77bcf86cd799439011';
  const result = await validateWishlistProductIds(
    [id, id],
    productModelFor([{ _id: id }]),
  );

  assert.deepEqual(result, { ids: [id], error: null });
});
