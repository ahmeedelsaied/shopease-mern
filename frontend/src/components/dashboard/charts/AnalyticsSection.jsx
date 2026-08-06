import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import EmptyState from '../../EmptyState';
import LoadingOrchestrator from './LoadingOrchestrator';

// Lazy-load the chart components so Recharts is split into its own bundle and
// does not bloat the initial /admin chunk. Each falls back to a chart skeleton
// while the code downloads, so the dashboard never flashes empty containers.
const RevenueLineChart = lazy(() => import('./RevenueLineChart'));
const OrdersBarChart = lazy(() => import('./OrdersBarChart'));
const OrdersStatusPieChart = lazy(() => import('./OrdersStatusPieChart'));
const TopProductsChart = lazy(() => import('./TopProductsChart'));
const TopCategoriesChart = lazy(() => import('./TopCategoriesChart'));
const GrowthMetrics = lazy(() => import('./GrowthMetrics'));

/**
 * AnalyticsSection – orchestrates the chart panel on the admin dashboard. Owns
 * the only stateful concern here: fetching `/admin/analytics/charts`, holding
 * the loading/error/data state, and laying the charts out in a responsive
 * grid. Each child chart is presentational (data-only props, memoised), so
 * this is the single SRP boundary that knows "what data the dashboard needs
 * and in what order to render it".
 *
 * The section loads independently of the KPI endpoint above it — it does not
 * block the existing stat cards / BestSeller / LatestOrders blocks.
 */
const AnalyticsSection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchCharts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/admin/analytics/charts');
        if (active) setData(response.data?.data ?? null);
      } catch (fetchError) {
        if (active) setError(fetchError?.response?.data?.message || 'Unable to load analytics charts');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCharts();
    return () => {
      active = false;
    };
  }, []);

  const memoisedData = useMemo(() => data, [data]);

  if (loading) return <LoadingOrchestrator />;
  if (error) {
    return (
      <EmptyState
        title="Analytics unavailable"
        description={error}
        icon="error"
      />
    );
  }
  if (!memoisedData) return null;

  const loadingFallback = <LoadingOrchestrator />;

  return (
    <section aria-label="Analytics charts" className="space-y-6">
      <Suspense fallback={loadingFallback}>
        <RevenueLineChart data={memoisedData.monthlyRevenue ?? []} />
      </Suspense>

      <Suspense fallback={loadingFallback}>
        <OrdersBarChart
          monthlyData={memoisedData.monthlyOrders ?? []}
          weeklyData={memoisedData.weeklyOrders ?? []}
        />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={loadingFallback}>
          <OrdersStatusPieChart data={memoisedData.ordersByStatus ?? []} />
        </Suspense>
        <Suspense fallback={loadingFallback}>
          <TopProductsChart data={memoisedData.topProducts ?? []} />
        </Suspense>
      </div>

      <Suspense fallback={loadingFallback}>
        <TopCategoriesChart data={memoisedData.topCategories ?? []} />
      </Suspense>

      <Suspense fallback={loadingFallback}>
        <GrowthMetrics
          revenueGrowth={memoisedData.revenueGrowth}
          ordersGrowth={memoisedData.ordersGrowth}
        />
      </Suspense>
    </section>
  );
};

AnalyticsSection.displayName = 'AnalyticsSection';

export default AnalyticsSection;
