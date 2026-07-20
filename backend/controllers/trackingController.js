import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Tracking controller — read-only order status timeline.
 *
 * `getOrderTracking` returns the lightweight status view of an order: its
 * order number, current status, the full status history log (never mutated by
 * reads), and the order creation date. Ownership is enforced identically to
 * `orderController.getOrderById` so only the order's owner may track it.
 */
const getOrderTracking = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).select(
    'orderNumber status statusHistory createdAt user'
  );

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.status(200).json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      status: order.status,
      history: order.statusHistory,
      createdAt: order.createdAt,
    },
  });
});

export { getOrderTracking };
