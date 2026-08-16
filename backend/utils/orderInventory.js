import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const TRANSACTION_TOPOLOGIES = new Set([
  'ReplicaSetWithPrimary',
  'ReplicaSetNoPrimary',
  'Sharded',
  'LoadBalanced',
]);

/**
 * Standalone MongoDB deployments report topology type `Single` and do not
 * support multi-document transactions. Replica sets, sharded clusters, and
 * load-balanced deployments do. Unknown topology types deliberately fail
 * closed for inventory-sensitive operations.
 */
export const supportsMongoTransactions = () => {
  try {
    const client = mongoose.connection.getClient();
    return TRANSACTION_TOPOLOGIES.has(client?.topology?.description?.type);
  } catch {
    return false;
  }
};

export const requireMongoTransactions = (res, message) => {
  if (!supportsMongoTransactions()) {
    res.status(503);
    throw new Error(message);
  }
};

/**
 * Run a non-inventory order mutation in a real transaction when supported, or
 * use the caller's safe no-inventory fallback when no transaction is needed.
 * Inventory-sensitive callers must call requireMongoTransactions first.
 */
export const runWithOptionalTransaction = async (transactionWork, fallbackWork) => {
  if (!supportsMongoTransactions()) {
    return fallbackWork();
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await transactionWork(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

/**
 * Run an inventory-sensitive order creation in a real MongoDB transaction.
 * There is intentionally no standalone compensation path: stock reservation
 * and Order creation must either commit together or not run.
 */
export const runWithRequiredTransaction = async (transactionWork) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await transactionWork(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

const buildStockIncrements = (items = []) =>
  items.map(({ productId, quantity }) => ({
    updateOne: {
      filter: { _id: productId },
      update: { $inc: { stock: quantity } },
    },
  }));

/**
 * Release an order's reserved inventory exactly once inside the caller's
 * transaction. The reservation flag is claimed atomically before stock is
 * incremented, so repeated calls within concurrent transactions cannot restore
 * the same reservation twice. Calling this without a transaction is rejected
 * so standalone MongoDB cannot lose the reservation state during a crash.
 */
export const releaseReservedInventory = async (orderId, { session } = {}) => {
  if (!session) {
    throw new Error('Inventory release requires a transaction-capable MongoDB deployment');
  }

  const claimedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      inventoryReserved: true,
      status: { $ne: 'delivered' },
    },
    { $set: { inventoryReserved: false } },
    { new: true, session },
  );

  if (!claimedOrder) {
    return false;
  }

  const stockUpdates = buildStockIncrements(claimedOrder.items);
  if (stockUpdates.length) {
    await Product.bulkWrite(stockUpdates, { session });
  }

  return true;
};
