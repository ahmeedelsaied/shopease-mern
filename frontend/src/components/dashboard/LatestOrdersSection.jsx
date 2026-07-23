import { memo } from 'react';
import { Link } from 'react-router-dom';
import DashboardSection from './DashboardSection';
import { cn } from '../../styles/designSystem';

const formatCurrency = (value) =>
  value != null && !Number.isNaN(Number(value))
    ? `$${Number(value).toFixed(2)}`
    : '—';

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const STATUS_BADGE = {
  delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  confirmed: 'bg-secondary/10 text-secondary border-secondary/20',
  processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  shipped: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  out_for_delivery: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
};

/**
 * LatestOrdersSection – renders a compact list of the 5 most recent orders.
 * Each row links to the admin order detail page. Uses the same status-badge
 * colour semantics as OrderTimeline for visual consistency.
 */
const LatestOrdersSection = ({ latestOrders = [] }) => {
  if (!latestOrders.length) {
    return (
      <DashboardSection title="Latest Orders" subtitle="5 most recent">
        <p className="text-sm text-on-surface-variant text-center py-4">
          No orders yet. Orders will appear here as they are placed.
        </p>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection title="Latest Orders" subtitle="5 most recent">
      <div className="divide-y divide-outline-variant/20">
        {latestOrders.map((order) => {
          const badgeClass = STATUS_BADGE[order.status] ?? STATUS_BADGE.confirmed;
          return (
            <Link
              key={order.orderNumber}
              to={`/admin/orders/${order._id}`}
              className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-surface-container-low/50 transition-colors"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-body-md font-medium text-primary truncate">
                  {order.orderNumber}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {order.customerName || 'Unknown customer'}
                  {order.customerEmail ? ` • ${order.customerEmail}` : ''}
                </p>
                <p className="text-xs text-on-surface-variant/70">
                  {formatDate(order.createdAt)} • {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3 text-right">
                <span className="text-headline-sm font-headline-sm text-primary">
                  {formatCurrency(order.total)}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    badgeClass
                  )}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </DashboardSection>
  );
};

LatestOrdersSection.displayName = 'LatestOrdersSection';

export default memo(LatestOrdersSection);