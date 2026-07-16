import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { OrdersSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/EmptyState';
import OrderTimeline from '../components/OrderTimeline';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/my");
        setOrders(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || 'Unable to load orders'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mx-auto max-w-container-max space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-primary">My Orders</h1>
            <p className="mt-2 text-body-md text-on-surface-variant">Track your purchases and delivery status.</p>
          </div>
          <Link to="/">
            <Button variant="ghost">Continue shopping</Button>
          </Link>
        </div>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        {!orders.length && !error ? (
          <EmptyState
            icon="receipt_long"
            title="No orders yet"
            description="Once you place an order, it will appear here with the latest updates and delivery status."
            actionLabel="Continue shopping"
            actionTo="/"
          />
        ) : null}

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} variant="panel" className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-secondary">{order.orderNumber}</p>
                  <h3 className="mt-1 text-body-lg font-body-lg text-primary">{order.items?.length || 0} item(s)</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <p className="text-headline-sm font-headline-sm text-primary">${(order.total || 0).toFixed(2)}</p>
                  <p className="text-sm capitalize text-on-surface-variant">{order.status}</p>
                  <Link to={`/orders/${order._id}`}>
                    <Button variant="secondary" size="sm">Track order</Button>
                  </Link>
                </div>
              </div>
              <div className="mt-6 border-t border-outline-variant/30 pt-5">
                <OrderTimeline
                  status={order.status}
                  timestamps={order.statusHistory}
                  updatedAt={order.updatedAt}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
