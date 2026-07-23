import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { TERMINAL_STATUSES } from '../constants/orderStatus.js';

/**
 * Stage that excludes orders whose status will never realise revenue. Using
 * the canonical `TERMINAL_STATUSES` constant keeps this filter in lockstep
 * with the order lifecycle defined in `constants/orderStatus.js` — if a new
 * terminal non-revenue status is added there, this pipeline stops counting it
 * as revenue automatically.
 */
const excludeTerminalOrders = { status: { $nin: TERMINAL_STATUSES } };

/**
 * Start of the current calendar day in UTC. Used as the `$gte` bound for the
 * "today" revenue/orders pipelines so the analytics reflect the admin's local
 * day rather than a rolling 24h window (which would silently shift the numbers
 * on every page load).
 */
const startOfToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

/**
 * Single $group pass over every order producing the headline revenue + order
 * totals, the per-status counts (pending/delivered/cancelled), and the average
 * order value. Filtering out cancelled orders from `revenue`/`avgOrderValue`
 * matches the business meaning of "realised" money — a cancelled order is not
 * revenue. The status-count facet runs against the full set so all four counts
 * come from one collection scan.
 */
const buildOrderSummary = async () => {
  const [summary] = await Order.aggregate([
    {
      $facet: {
        totals: [
          { $match: excludeTerminalOrders },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$total' },
              totalOrders: { $sum: 1 },
              avgOrderValue: { $avg: '$total' },
            },
          },
        ],
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ],
        today: [
          { $match: { createdAt: { $gte: startOfToday() } } },
          {
            $group: {
              _id: '$status',
              revenue: { $sum: '$total' },
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const totals = summary.totals[0] ?? { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
  const statusCounts = Object.fromEntries(
    (summary.byStatus ?? []).map((entry) => [entry._id, entry.count])
  );
  const todayRows = summary.today ?? [];
  // Today's revenue excludes terminal orders (consistent with the headline
  // totals facet above); today's order count includes every status so the
  // number reflects the day's activity including cancellations.
  const todayRevenue = todayRows
    .filter((row) => !TERMINAL_STATUSES.includes(row._id))
    .reduce((sum, row) => sum + (row.revenue || 0), 0);
  const todayOrders = todayRows.reduce((sum, row) => sum + (row.count || 0), 0);

  return {
    totalRevenue: totals.totalRevenue,
    totalOrders: totals.totalOrders,
    avgOrderValue: totals.avgOrderValue,
    todayRevenue,
    todayOrders,
    pendingOrders: statusCounts.pending ?? 0,
    deliveredOrders: statusCounts.delivered ?? 0,
    cancelledOrders: statusCounts.cancelled ?? 0,
  };
};

/**
 * Best-selling product by total units sold across non-cancelled orders. One
 * pipeline `$unwind`s the items array, groups by `productId`, sums quantity,
 * and `$lookup`s the Product for name/image. Returns null when there are no
 * sold items so the UI can render an empty state instead of a phantom card.
 */
const buildBestSeller = async () => {
  const [bestSeller] = await Order.aggregate([
    { $match: excludeTerminalOrders },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        name: { $first: '$items.name' },
        image: { $first: '$items.image' },
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
        pipeline: [{ $project: { name: 1, image: 1, price: 1, stock: 1 } }],
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
  ]);

  if (!bestSeller) return null;

  return {
    productId: bestSeller._id,
    name: bestSeller.product?.name ?? bestSeller.name,
    image: bestSeller.product?.image ?? bestSeller.image,
    price: bestSeller.product?.price ?? null,
    stock: bestSeller.product?.stock ?? null,
    unitsSold: bestSeller.unitsSold,
    revenue: bestSeller.revenue,
  };
};

/**
 * Latest 5 orders with the customer's name/email joined so the dashboard can
 * show "who ordered what" without a second round-trip. Excludes the shipping
 * notes/phone to keep the payload light.
 */
const buildLatestOrders = async () => {
  const orders = await Order.aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'customer',
        pipeline: [{ $project: { name: 1, email: 1 } }],
      },
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        orderNumber: 1,
        total: 1,
        status: 1,
        createdAt: 1,
        itemCount: { $size: '$items' },
        customerName: '$customer.name',
        customerEmail: '$customer.email',
      },
    },
  ]);

  return orders;
};

/**
 * Latest 5 registered users. Excludes the password field (already `select:
 * false` on the model, but the explicit projection is defence-in-depth for the
 * analytics payload).
 */
const LATEST_USERS_LIMIT = 5;

const buildLatestUsers = async () => {
  const users = await User.find({})
    .sort({ createdAt: -1 })
    .limit(LATEST_USERS_LIMIT)
    .select('name email role createdAt')
    .lean();

  return users;
};

/**
 * getAdminAnalytics – aggregated KPIs for the admin dashboard.
 *
 * Returns the headline totals, today snapshot, per-status counts, average
 * order value, best-selling product, latest 5 orders, and latest 5 users. All
 * sub-queries run in parallel via Promise.all for a single round-trip's worth
 * of await; each aggregation is self-contained so it stays testable and the
 * response shape is stable if one source is later swapped.
 *
 * Read-only: this controller performs no writes. Authorization is enforced
 * upstream by the `admin` middleware applied router-wide on `/api/admin/*`.
 */
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [orderSummary, bestSeller, latestOrders, latestUsers, totalUsers, totalProducts] =
    await Promise.all([
      buildOrderSummary(),
      buildBestSeller(),
      buildLatestOrders(),
      buildLatestUsers(),
      User.countDocuments(),
      Product.countDocuments(),
    ]);

  res.status(200).json({
    success: true,
    data: {
      totalRevenue: orderSummary.totalRevenue,
      totalOrders: orderSummary.totalOrders,
      totalUsers,
      totalProducts,
      todayRevenue: orderSummary.todayRevenue,
      todayOrders: orderSummary.todayOrders,
      pendingOrders: orderSummary.pendingOrders,
      deliveredOrders: orderSummary.deliveredOrders,
      cancelledOrders: orderSummary.cancelledOrders,
      averageOrderValue: orderSummary.avgOrderValue,
      bestSeller,
      latestOrders,
      latestUsers,
    },
  });
});

export { getAdminAnalytics };
