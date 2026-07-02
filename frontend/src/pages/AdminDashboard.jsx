import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';

const stats = [
  { key: 'users', label: 'Total Users', icon: 'group' },
  { key: 'products', label: 'Total Products', icon: 'inventory_2' },
  { key: 'orders', label: 'Total Orders', icon: 'receipt_long' },
  { key: 'revenue', label: 'Total Revenue', icon: 'payments' },
];

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/admin/dashboard');
        setDashboard(response.data?.data ?? null);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.key} variant="panel" className="p-6">
                <Loader lines={3} />
              </Card>
            ))}
          </div>
        ) : error ? (
          <EmptyState title="Dashboard unavailable" description={error} icon="error" />
        ) : !dashboard ? (
          <EmptyState title="No dashboard data" description="There is no data available to show yet." icon="dashboard" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.key} variant="panel" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">{stat.label}</p>
                    <p className="mt-3 text-headline-lg font-headline-lg text-primary">
                      {stat.key === 'revenue' ? `$${dashboard.revenue?.toFixed(2) ?? '0.00'}` : dashboard[stat.key] ?? 0}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[32px] text-primary">{stat.icon}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
