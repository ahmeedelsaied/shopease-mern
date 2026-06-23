import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

const getProducts = asyncHandler(async (req, res) => {
  const { search, category, sort } = req.query;

  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  if (category) {
    filter.category = category;
  }

  let query = Product.find(filter);

  if (sort) {
    const sortDirection = sort.toLowerCase() === 'asc' ? 1 : -1;
    query = query.sort({ price: sortDirection });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const products = await query;

  res.status(200).json({
    success: true,
    data: products,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

export { getProducts, getProductById };
