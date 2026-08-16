import test from 'node:test';
import assert from 'node:assert/strict';
import { ORDER_STATUS_TRANSITIONS, canTransitionOrderStatus } from '../constants/orderStatus.js';
import {
  releaseReservedInventory,
  requireMongoTransactions,
} from '../utils/orderInventory.js';

test('order lifecycle permits only the canonical forward transitions', () => {
  assert.equal(canTransitionOrderStatus('pending', 'confirmed'), true);
  assert.equal(canTransitionOrderStatus('confirmed', 'processing'), true);
  assert.equal(canTransitionOrderStatus('processing', 'shipped'), true);
  assert.equal(canTransitionOrderStatus('shipped', 'out_for_delivery'), true);
  assert.equal(canTransitionOrderStatus('out_for_delivery', 'delivered'), true);
  assert.equal(canTransitionOrderStatus('pending', 'shipped'), false);
  assert.equal(canTransitionOrderStatus('delivered', 'processing'), false);
  assert.equal(canTransitionOrderStatus('cancelled', 'pending'), false);
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.delivered, []);
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.cancelled, []);
});

test('inventory-sensitive mutations fail closed without transaction support', () => {
  const response = {
    statusCode: null,
    status(code) {
      this.statusCode = code;
    },
  };

  assert.throws(
    () => requireMongoTransactions(response, 'Inventory transaction required'),
    /Inventory transaction required/,
  );
  assert.equal(response.statusCode, 503);
});

test('reserved inventory release cannot run without an explicit transaction session', async () => {
  await assert.rejects(
    releaseReservedInventory('order-1'),
    /Inventory release requires a transaction-capable MongoDB deployment/,
  );
});
