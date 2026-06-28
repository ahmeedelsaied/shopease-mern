import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';

const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'Cash on Delivery' } = req.body;

  if (!items?.length) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  if (!shippingAddress?.fullName || !shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zipCode || !shippingAddress?.phone) {
    res.status(400);
    throw new Error('Please provide complete shipping information');
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;
  const orderNumber = `SE-${Date.now()}`;

  const order = await Order.create({
    user: req.user._id,
    orderNumber,
    items,
    shippingAddress,
    paymentMethod,
    subtotal,
    total,
  });

  res.status(201).json({
    success: true,
    data: order,
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: orders,
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

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
    data: order,
  });
});

export { createOrder, getMyOrders, getOrderById };
