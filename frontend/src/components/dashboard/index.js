export { default as DashboardStatCard } from './DashboardStatCard';
export { default as DashboardGrid } from './DashboardGrid';
export { default as DashboardSection } from './DashboardSection';
export { default as BestSellerSection } from './BestSellerSection';
export { default as LatestOrdersSection } from './LatestOrdersSection';
export { default as LatestUsersSection } from './LatestUsersSection';
// AnalyticsSection aggregates its own data + lazy-loads Recharts so the chart
// bundle stays out of the main /admin chunk. Re-exported from here so the page
// only needs a single dashboard import.
export { default as AnalyticsSection } from './charts/AnalyticsSection';
