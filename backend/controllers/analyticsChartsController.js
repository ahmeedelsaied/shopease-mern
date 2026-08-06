import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ORDER_STATUSES, TERMINAL_STATUSES } from '../constants/orderStatus.js';

/**
 * Filter that excludes orders whose status will never realise revenue. Mirrors
 * `analyticsController.js` so the chart's revenue series is consistent with the
 * KPI cards: cancelled orders count as activity (orders series byStatus) but
 * not as revenue. Keeping the constant local to this controller preserves the
 * single-responsibility boundary (this module owns the chart payload).
 */
const excludeTerminalOrders = { status: { $nin: TERMINAL_STATUSES } };

/**
 * Start of the current calendar day in UTC. Equivalent to the KPI controller's
 * `startOfToday`; duplicated here so each controller stays self-contained and
 * testable without a cross-module dependency on a private helper.
 */
const startOfToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

/**
 * Start of the month for a Date offset by `monthOffset` months from today
 * (positive offsets go backwards). Returns a UTC midnight boundary used as the
 * `$gte` bound for the monthly revenue/orders facet stage.
 */
const startOfMonthFromOffset = (monthOffset) => {
  const now = new Date();
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  base.setUTCMonth(base.getUTCMonth() - monthOffset);
  return base;
};

/**
 * Twelve-month window ending with the current month, oldest first. Used to
 * backfill the monthly revenue/orders series so the line/bar chart axes stay
 * continuous even when a month had no orders — a missing month is data
 * ("nothing sold"), not a gap to skip.
 */
const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const buildMonthlyRange = () => {
  const range = [];
  for (let offset = 11; offset >= 0; offset -= 1) {
    const base = startOfMonthFromOffset(offset);
    const monthKey = `${base.getUTCFullYear()}-${String(base.getUTCMonth() + 1).padStart(2, '0')}`;
    range.push({ monthKey, label: MONTH_LABEL_FORMATTER.format(base) });
  }
  return range;
};

const WEEKDAY_LABEL_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'UTC',
});

const buildWeeklyRange = () => {
  const today = startOfToday();
  const range = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - offset);
    const dateKey = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, '0')}-${String(day.getUTCDate()).padStart(2, '0')}`;
    range.push({ dateKey, weekday: WEEKDAY_LABEL_FORMATTER.format(day) });
  }
  return range;
};

/**
 * Percentage change from `previous` to `current`, returning a signed number
 * rounded to one decimal. Returns `null` when there is no prior reading so the
 * UI can show an em-dash instead of `Infinity` for the first month of trading.
 */
const growthPercent = (current, previous) => {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

/**
 * Single `$facet` over the orders collection that yields every chart series in
 * one round-trip: monthly revenue (non-terminal orders), monthly orders (all
 * statuses), weekly orders (all statuses), per-status counts, top products by
 * units, and top categories by revenue. Stages that need item-level grouping
 * (`$unwind` + product join) live in their own facet branch so they don't
 * disturb the per-order branches.
 *
 * `monthly`/`weekly` use `$gte` bounds so MongoDB can use the `createdAt` index
 * rather than scanning the whole collection on each request.
 */
const CHART_TOP_LIMIT = 5;

const buildChartAggregation = () => {
  const monthlyFrom = startOfMonthFromOffset(11);
  const weeklyFrom = new Date(startOfToday());
  weeklyFrom.setUTCDate(weeklyFrom.getUTCDate() - 6);

  return Order.aggregate([
    {
      $facet: {
        monthlyRevenue: [
          { $match: { ...excludeTerminalOrders, createdAt: { $gte: monthlyFrom } } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              revenue: { $sum: '$total' },
            },
          },
        ],
        monthlyOrders: [
          { $match: { createdAt: { $gte: monthlyFrom } } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              orders: { $sum: 1 },
            },
          },
        ],
        weeklyOrders: [
          { $match: { createdAt: { $gte: weeklyFrom } } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' },
              },
              orders: { $sum: 1 },
            },
          },
        ],
        ordersByStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        topProducts: [
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
          { $limit: CHART_TOP_LIMIT },
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
          {
            $project: {
              productId: '$_id',
              // Fall back to the order-line snapshot when the product has been
              // deleted (lookup returns null) so historical "best seller"
              // entries keep a readable name/image instead of becoming null.
              name: { $ifNull: ['$product.name', '$name'] },
              image: { $ifNull: ['$product.image', '$image'] },
              price: '$product.price',
              stock: '$product.stock',
              unitsSold: 1,
              revenue: 1,
            },
          },
        ],
        topCategories: [
          { $match: excludeTerminalOrders },
          { $unwind: '$items' },
          {
            $lookup: {
              from: 'products',
              localField: 'items.productId',
              foreignField: '_id',
              as: 'product',
              pipeline: [{ $project: { category: 1 } }],
            },
          },
          { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: { $ifNull: ['$product.category', 'Uncategorised'] },
              revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
              unitsSold: { $sum: '$items.quantity' },
              orders: { $sum: 1 },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: CHART_TOP_LIMIT },
          {
            $project: {
              category: '$_id',
              revenue: 1,
              unitsSold: 1,
              orders: 1,
            },
          },
        ],
      },
    },
  ]);
};

/**
 * Fold the raw `{year, month}` groups into the pre-built 12-month range so the
 * chart axis is always 12 buckets wide. Missing months default to zero so the
 * line stays continuous across a brand-new store's sparse early months. The
 * `valueKey` names the output field (and matches the group's value field) so
 * the same merger serves the revenue and orders series.
 */
const mergeMonthlySeries = (groups, range, valueKey) => {
  const lookup = new Map();
  groups.forEach((group) => {
    const monthKey = `${group._id.year}-${String(group._id.month).padStart(2, '0')}`;
    lookup.set(monthKey, group[valueKey] ?? 0);
  });
  return range.map((bucket) => ({
    monthKey: bucket.monthKey,
    label: bucket.label,
    [valueKey]: lookup.get(bucket.monthKey) ?? 0,
  }));
};

/**
 * Fold per-day groups into the 7-day window so days with no orders still appear
 * (otherwise the bar chart would compress onto the left of the axis).
 */
const mergeWeeklySeries = (groups, range) => {
  const lookup = new Map();
  groups.forEach((group) => {
    const dateKey = `${group._id.year}-${String(group._id.month).padStart(2, '0')}-${String(group._id.day).padStart(2, '0')}`;
    lookup.set(dateKey, group.orders ?? 0);
  });
  return range.map((bucket) => ({
    date: bucket.dateKey,
    weekday: bucket.weekday,
    orders: lookup.get(bucket.dateKey) ?? 0,
  }));
};

/**
 * Guarantee every canonical order status appears in the status breakdown —
 * even statuses with zero orders — so the pie legend is stable across reloads.
 */
const mergeStatusSeries = (groups) =>
  ORDER_STATUSES.map((status) => ({
    status,
    count: groups.find((group) => group._id === status)?.count ?? 0,
  }));

/**
 * getAdminAnalyticsCharts – chart-ready aggregations for the admin dashboard.
 *
 * Returns monthly revenue & orders (12 months), weekly orders (7 days), orders
 * by status (all canonical statuses), top 5 products by units sold, top 5
 * categories by revenue, and month-over-month revenue/orders growth. All
 * series come from a single `$facet` aggregation so the orders collection is
 * scanned once per request. Read-only; authorisation is enforced upstream by
 * the `admin` middleware applied router-wide on `/api/admin/*`.
 */
const getAdminAnalyticsCharts = asyncHandler(async (req, res) => {
  const [chartData] = await buildChartAggregation();

  const monthlyRange = buildMonthlyRange();
  const weeklyRange = buildWeeklyRange();

  const monthlyRevenue = mergeMonthlySeries(
    chartData.monthlyRevenue,
    monthlyRange,
    'revenue'
  );
  const monthlyOrders = mergeMonthlySeries(
    chartData.monthlyOrders,
    monthlyRange,
    'orders'
  );
  const weeklyOrders = mergeWeeklySeries(chartData.weeklyOrders, weeklyRange);
  const ordersByStatus = mergeStatusSeries(chartData.ordersByStatus);

  const lastMonthRevenue = monthlyRevenue[monthlyRevenue.length - 2]?.revenue ?? 0;
  const thisMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.revenue ?? 0;
  const lastMonthOrders = monthlyOrders[monthlyOrders.length - 2]?.orders ?? 0;
  const thisMonthOrders = monthlyOrders[monthlyOrders.length - 1]?.orders ?? 0;

  res.status(200).json({
    success: true,
    data: {
      monthlyRevenue,
      monthlyOrders,
      weeklyOrders,
      ordersByStatus,
      topProducts: chartData.topProducts,
      topCategories: chartData.topCategories,
      revenueGrowth: growthPercent(thisMonthRevenue, lastMonthRevenue),
      ordersGrowth: growthPercent(thisMonthOrders, lastMonthOrders),
    },
  });
});

export { getAdminAnalyticsCharts };
