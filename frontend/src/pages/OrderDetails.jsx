import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ImageWithSkeleton from '../components/ui/ImageWithSkeleton';
import EmptyState from '../components/EmptyState';
import OrderTimeline from '../components/OrderTimeline';
import { OrdersSkeleton } from '../components/ui/Skeleton';

const formatPlacedDate = (value) =>
  new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data?.data ?? null);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Unable to load this order.');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadOrder();
  }, [id]);

  if (loading) return <OrdersSkeleton />;

  if (error) {
    return (
      <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <EmptyState icon="error" title="Order unavailable" description={error} actionLabel="Back to orders" actionTo="/orders" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mx-auto max-w-container-max space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-secondary">{order.orderNumber}</p>
            <h1 className="text-headline-lg font-headline-lg text-primary">Order details</h1>
            <p className="text-body-md text-on-surface-variant">
              Placed on {order.createdAt ? formatPlacedDate(order.createdAt) : '—'}
            </p>
          </div>
          <Link to="/orders">
            <Button variant="ghost">Back to orders</Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <Card variant="panel" className="p-6">
              <h2 className="text-headline-sm font-headline-sm text-primary">Items</h2>
              <ul className="mt-4 space-y-4">
                {order.items?.map((item) => (
                  <li key={`${item.productId}-${item.name}`} className="flex gap-4">
                    <ImageWithSkeleton
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      wrapperClassName="h-20 w-20 shrink-0 rounded-[1rem]"
                    />
                    <div className="flex flex-1 flex-col">
                      <span className="text-body-md font-medium text-primary">{item.name}</span>
                      <span className="text-sm text-on-surface-variant">Qty {item.quantity}</span>
                      <span className="mt-auto text-sm font-semibold text-on-surface">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2 border-t border-outline-variant/40 pt-4 text-body-md text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-headline-sm font-headline-sm text-primary">
                  <span>Total</span>
                  <span>${(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card variant="panel" className="p-6">
              <h2 className="text-headline-sm font-headline-sm text-primary">Tracking</h2>
              <OrderTimeline
                status={order.status}
                timestamps={order.statusHistory}
                updatedAt={order.updatedAt}
                className="mt-5"
              />
            </Card>

            <Card variant="panel" className="p-6">
              <h2 className="text-headline-sm font-headline-sm text-primary">Shipping</h2>
              <dl className="mt-4 space-y-2 text-body-md text-on-surface-variant">
                <div className="flex justify-between gap-3">
                  <dt className="text-on-surface-variant/70">Recipient</dt>
                  <dd className="text-right text-on-surface">{order.shippingAddress?.fullName || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-on-surface-variant/70">Address</dt>
                  <dd className="text-right text-on-surface">{order.shippingAddress?.address || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-on-surface-variant/70">City</dt>
                  <dd className="text-right text-on-surface">{order.shippingAddress?.city || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-on-surface-variant/70">Phone</dt>
                  <dd className="text-right text-on-surface">{order.shippingAddress?.phone || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-on-surface-variant/70">Payment</dt>
                  <dd className="text-right text-on-surface">{order.paymentMethod || '—'}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
