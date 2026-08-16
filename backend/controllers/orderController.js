import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

const REQUIRED_SHIPPING_FIELDS = ['fullName', 'address', 'city', 'state', 'zipCode', 'phone'];

const normalizeShippingAddress = (shippingAddress) => ({
  fullName: String(shippingAddress.fullName).trim(),
  address: String(shippingAddress.address).trim(),
  city: String(shippingAddress.city).trim(),
  state: String(shippingAddress.state).trim(),
  zipCode: String(shippingAddress.zipCode).trim(),
  phone: String(shippingAddress.phone).trim(),
  ...(shippingAddress.notes?.trim() ? { notes: shippingAddress.notes.trim() } : {}),
});

const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'Cash on Delivery' } = req.body;

  if (!Array.isArray(items) || !items.length) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  if (
    !shippingAddress ||
    REQUIRED_SHIPPING_FIELDS.some((field) => !String(shippingAddress[field] ?? '').trim())
  ) {
    res.status(400);
    throw new Error('Please provide complete shipping information');
  }

  const requestedItems = items.map((item) => ({
    productId: item?.productId,
    quantity: Number(item?.quantity),
  }));

  if (
    requestedItems.some(
      ({ productId, quantity }) =>
        !mongoose.isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1,
    )
  ) {
    res.status(400);
    throw new Error('Order items contain an invalid product or quantity');
  }

  const reservedItems = [];

  try {
    const orderItems = [];

    for (const { productId, quantity } of requestedItems) {
      // The conditional update prevents two concurrent checkouts from
      // reserving more stock than the product currently has.
      const product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true, runValidators: true },
      ).lean();

      if (!product) {
        const productExists = await Product.exists({ _id: productId });
        res.status(productExists ? 409 : 404);
        throw new Error(productExists ? `Insufficient stock for ${productId}` : 'Product not found');
      }

      reservedItems.push({ productId, quantity });
      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      });
    }

    const subtotal = Number(
      orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
    );
    const orderNumber = `SE-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      items: orderItems,
      shippingAddress: normalizeShippingAddress(shippingAddress),
      paymentMethod,
      subtotal,
      total: subtotal,
      statusHistory: [
        {
          status: 'pending',
          changedBy: req.user._id,
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    // If order validation/creation fails after one or more reservations,
    // return those quantities so a partial checkout cannot consume stock.
    if (reservedItems.length) {
      await Promise.all(
        reservedItems.map(({ productId, quantity }) =>
          Product.updateOne({ _id: productId }, { $inc: { stock: quantity } }),
        ),
      );
    }
    throw error;
  }
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
