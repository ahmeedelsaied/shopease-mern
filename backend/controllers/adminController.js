import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  canTransitionOrderStatus,
  isValidOrderStatus,
  NON_REVENUE_STATUSES,
  TERMINAL_STATUSES,
} from '../constants/orderStatus.js';
import {
  releaseReservedInventory,
  requireMongoTransactions,
  runWithOptionalTransaction,
  runWithRequiredTransaction,
} from '../utils/orderInventory.js';

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [users, products, orders] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
  ]);

  const revenue = await Order.aggregate([
    { $match: { status: { $nin: NON_REVENUE_STATUSES } } },
    { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
  ]);
  const totalRevenue = revenue[0]?.totalRevenue || 0;

  res.status(200).json({
    success: true,
    data: {
      users,
      products,
      orders,
      revenue: totalRevenue,
    },
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: users,
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!['user', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot change your own role');
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, stock, rating = 0, featured = false } = req.body;

  if (!name || !description || !price || !image || !category || stock === undefined) {
    res.status(400);
    throw new Error('Please provide all required product fields');
  }

  const product = await Product.create({
    name,
    description,
    price,
    image,
    category,
    rating,
    stock,
    featured,
  });

  res.status(201).json({
    success: true,
    data: product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category, stock, rating, featured } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (image !== undefined) product.image = image;
  if (category !== undefined) product.category = category;
  if (stock !== undefined) product.stock = stock;
  if (rating !== undefined) product.rating = rating;
  if (featured !== undefined) product.featured = featured;

  await product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: orders,
  });
});

const getOrderDetails = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

const validateOrderStatusChange = ({ order, status, res }) => {
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (TERMINAL_STATUSES.includes(order.status)) {
    res.status(409);
    throw new Error(`Order is already in a terminal state (${order.status})`);
  }

  if (!canTransitionOrderStatus(order.status, status)) {
    res.status(409);
    throw new Error(`Invalid order status transition: ${order.status} -> ${status}`);
  }
};

const applyOrderStatusChange = async ({ id, status, note, userId, res, session }) => {
  const orderQuery = Order.findById(id);
  if (session) orderQuery.session(session);
  const order = await orderQuery;

  validateOrderStatusChange({ order, status, res });

  // History is append-only: a log entry is pushed only when the status
  // actually changes, so re-sending the same status is idempotent and does
  // not duplicate the log. `order.status` and `statusHistory` always move
  // together.
  if (order.status !== status) {
    order.status = status;
    order.statusHistory.push({
      status,
      note: note || undefined,
      changedBy: userId,
    });
  }

  if (status === 'cancelled') {
    const released = await releaseReservedInventory(order._id, session ? { session } : {});
    if (released) {
      order.inventoryReserved = false;
    }
  }

  await order.save(session ? { session } : undefined);

  return order;
};

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const { id } = req.params;

  if (!isValidOrderStatus(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const applyChange = (session) => applyOrderStatusChange({
    id,
    status,
    note,
    userId: req.user._id,
    res,
    session,
  });

  let order;
  if (status === 'cancelled') {
    requireMongoTransactions(
      res,
      'Order cancellation is temporarily unavailable because inventory transactions are not supported by this MongoDB deployment',
    );
    order = await runWithRequiredTransaction(applyChange);
  } else {
    order = await runWithOptionalTransaction(
      (session) => applyChange(session),
      () => applyChange(),
    );
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleteInScope = async (session) => {
    const orderQuery = Order.findById(id);
    if (session) orderQuery.session(session);
    const order = await orderQuery;

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    await releaseReservedInventory(order._id, session ? { session } : {});
    await order.deleteOne(session ? { session } : undefined);
    return order;
  };

  requireMongoTransactions(
    res,
    'Order deletion is temporarily unavailable because inventory transactions are not supported by this MongoDB deployment',
  );
  await runWithRequiredTransaction((session) => deleteInScope(session));

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully',
  });
});

export {
  getAdminDashboard,
  getUsers,
  updateUserRole,
  deleteUser,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  deleteOrder,
};
