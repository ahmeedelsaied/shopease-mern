import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseBoolean = (value) => {
  if (value === undefined || value === null) return undefined;
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return undefined;
};

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parsePageValue = (value, fallback) => {
  const parsed = parseNumber(value);
  return parsed && parsed > 0 ? Math.floor(parsed) : fallback;
};

const sortMap = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { averageRating: -1, reviewsCount: -1, createdAt: -1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
};

const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    rating,
    featured,
    inStock,
    sort,
    page,
    limit,
  } = req.query;

  const filter = {};

  if (search) {
    const searchRegex = { $regex: escapeRegex(String(search).trim()), $options: 'i' };
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
    ];
  }

  if (category) {
    filter.category = category;
  }

  const minPriceValue = parseNumber(minPrice);
  const maxPriceValue = parseNumber(maxPrice);
  const ratingValue = parseNumber(rating);
  const featuredValue = parseBoolean(featured);
  const inStockValue = parseBoolean(inStock);

  if (minPriceValue !== undefined || maxPriceValue !== undefined) {
    filter.price = {};
    if (minPriceValue !== undefined) {
      filter.price.$gte = minPriceValue;
    }
    if (maxPriceValue !== undefined) {
      filter.price.$lte = maxPriceValue;
    }
  }

  if (ratingValue !== undefined) {
    filter.averageRating = { $gte: ratingValue };
  }

  if (featuredValue !== undefined) {
    filter.featured = featuredValue;
  }

  if (inStockValue !== undefined) {
    filter.stock = inStockValue ? { $gt: 0 } : { $lte: 0 };
  }

  const sortKey = typeof sort === 'string' ? sort.toLowerCase() : 'newest';
  const sortOption = sortMap[sortKey] || sortMap.newest;
  const paginationRequested = page !== undefined || limit !== undefined;
  const pageNumber = parsePageValue(page, 1);

  const totalProducts = await Product.countDocuments(filter);
  const categories = await Product.distinct('category');
  const pageSize = paginationRequested
    ? Math.max(1, parsePageValue(limit, 12))
    : Math.max(totalProducts, 1);
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const currentPage = Math.min(pageNumber, totalPages);
  const skip = paginationRequested ? (currentPage - 1) * pageSize : 0;
  let productQuery = Product.find(filter).sort(sortOption);

  if (paginationRequested) {
    productQuery = productQuery.skip(skip).limit(pageSize);
  }

  const products = await productQuery;

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  res.status(200).json({
    success: true,
    data: products,
    products,
    totalProducts,
    totalPages,
    currentPage,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    categories: categories.sort(),
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
