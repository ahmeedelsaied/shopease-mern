import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/ui/Card';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { DashboardStatCard, DashboardGrid, BestSellerSection, LatestOrdersSection, LatestUsersSection } from '../components/dashboard';

const stats = [
  { key: 'users', label: 'Total Users', icon: 'group' },
  { key: 'products', label: 'Total Products', icon: 'inventory_2' },
  { key: 'orders', label: 'Total Orders', icon: 'receipt_long' },
  { key: 'revenue', label: 'Total Revenue', icon: 'payments' },
];

const formatCurrency = (value) =>
  value != null && !Number.isNaN(Number(value))
    ? `$${Number(value).toFixed(2)}`
    : '—';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [dashboardRes, analyticsRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/analytics'),
        ]);
        setDashboard(dashboardRes.data?.data ?? null);
        setAnalytics(analyticsRes.data?.data ?? null);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mx-auto max-w-container-max space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Administration</p>
            <h1 className="text-headline-lg font-headline-lg text-primary">Admin Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/users"><Button variant="secondary">Manage Users</Button></Link>
            <Link to="/admin/products"><Button variant="primary">Manage Products</Button></Link>
            <Link to="/admin/orders"><Button variant="secondary">Manage Orders</Button></Link>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton count={stats.length} />
        ) : error ? (
          <EmptyState title="Dashboard unavailable" description={error} icon="error" />
        ) : !dashboard ? (
          <EmptyState title="No dashboard data" description="There is no data available to show yet." icon="dashboard" />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <DashboardStatCard
                  key={stat.key}
                  label={stat.label}
                  value={stat.key === 'revenue' ? dashboard.revenue : dashboard[stat.key]}
                  icon={stat.icon}
                  isCurrency={stat.key === 'revenue'}
                />
              ))}
            </div>

            {analytics && (
              <>
                <DashboardGrid columns="4">
                  <DashboardStatCard
                    label="Today's Revenue"
                    value={analytics.todayRevenue}
                    icon="payments"
                    tone="revenue"
                    isCurrency
                  />
                  <DashboardStatCard
                    label="Today's Orders"
                    value={analytics.todayOrders}
                    icon="receipt_long"
                    tone="pending"
                  />
                  <DashboardStatCard
                    label="Pending Orders"
                    value={analytics.pendingOrders}
                    icon="hourglass_empty"
                    tone="pending"
                  />
                  <DashboardStatCard
                    label="Delivered Orders"
                    value={analytics.deliveredOrders}
                    icon="package_2"
                    tone="delivered"
                  />
                  <DashboardStatCard
                    label="Cancelled Orders"
                    value={analytics.cancelledOrders}
                    icon="cancel"
                    tone="cancelled"
                  />
                  <DashboardStatCard
                    label="Avg Order Value"
                    value={analytics.averageOrderValue}
                    icon="analytics"
                    tone="info"
                    isCurrency
                  />
                </DashboardGrid>

                <div className="space-y-6">
                  <BestSellerSection bestSeller={analytics.bestSeller} />
                  <LatestOrdersSection latestOrders={analytics.latestOrders} />
                  <LatestUsersSection latestUsers={analytics.latestUsers} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
