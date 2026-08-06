import { memo, useMemo } from 'react';
import DashboardSection from '../DashboardSection';
import DashboardStatCard from '../DashboardStatCard';
import DashboardGrid from '../DashboardGrid';

/**
 * GrowthMetrics – month-over-month change for revenue and orders, rendered as
 * two stat cards in a 2-column grid. Reuses the existing `DashboardStatCard`
 * so the styling fuses with the rest of the dashboard. Positive growth uses
 * the `delivered` (emerald) tone and the `trending_up` icon; negative growth
 * uses the `cancelled` (rose) tone and the `trending_down` icon; `null`
 * (no prior month to compare against, e.g. a brand-new store) shows an em-dash
 * with a neutral helper explaining why. No Recharts — pure stat tiles.
 *
 * @param {object} props
 * @param {number|null} props.revenueGrowth - Signed percent or null.
 * @param {number|null} props.ordersGrowth  - Signed percent or null.
 */
const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const numeric = Number(value);
  const sign = numeric > 0 ? '+' : '';
  return `${sign}${numeric.toFixed(1)}%`;
};

const GrowthMetrics = ({ revenueGrowth, ordersGrowth }) => {
  const revenue = useMemo(() => revenueGrowth, [revenueGrowth]);
  const orders = useMemo(() => ordersGrowth, [ordersGrowth]);

  const revenueTone = revenue === null ? 'info' : revenue >= 0 ? 'delivered' : 'cancelled';
  const revenueIcon = revenue === null ? 'analytics' : revenue >= 0 ? 'trending_up' : 'trending_down';
  const revenueHelper =
    revenue === null ? 'No prior-month revenue to compare' : 'vs. last month';

  const ordersTone = orders === null ? 'info' : orders >= 0 ? 'delivered' : 'cancelled';
  const ordersIcon = orders === null ? 'analytics' : orders >= 0 ? 'trending_up' : 'trending_down';
  const ordersHelper = orders === null ? 'No prior-month orders to compare' : 'vs. last month';

  return (
    <DashboardSection title="Growth" subtitle="Month-over-month change">
      <DashboardGrid columns="2">
        <DashboardStatCard
          label="Revenue Growth"
          value={formatPercent(revenue)}
          icon={revenueIcon}
          tone={revenueTone}
          helper={revenueHelper}
        />
        <DashboardStatCard
          label="Orders Growth"
          value={formatPercent(orders)}
          icon={ordersIcon}
          tone={ordersTone}
          helper={ordersHelper}
        />
      </DashboardGrid>
    </DashboardSection>
  );
};

GrowthMetrics.displayName = 'GrowthMetrics';

export default memo(GrowthMetrics);
