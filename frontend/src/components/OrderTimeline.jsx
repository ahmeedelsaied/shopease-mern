import { memo } from 'react';
import { cn } from '../styles/designSystem';

/**
 * OrderTimeline – vertical stepper that visualises an order's lifecycle.
 *
 * Statuses mirror the backend Order enum exactly
 * (constants/orderStatus.js): pending → confirmed → processing → shipped →
 * out_for_delivery → delivered. `cancelled` is terminal and short-circuits the
 * happy-path rendering.
 *
 * Each step shows: material icon, title, timestamp (when present), an optional
 * admin note, and a connector line to the next step. The active step animates.
 *
 * Backward compatibility: the `timestamps` prop accepts either the original
 * object shape keyed by status (`{ pending: <dateString>, ... }`) or the new
 * append-only history array returned by the backend
 * (`[{ status, timestamp, note, changedBy }]`). Both are normalized into a
 * single lookup so existing call sites (Orders, OrderDetails, AdminOrders) keep
 * rendering without changes.
 */
const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: 'receipt_long' },
  { key: 'confirmed', label: 'Confirmed', icon: 'verified' },
  { key: 'processing', label: 'Processing', icon: 'inventory_2' },
  { key: 'shipped', label: 'Shipped', icon: 'local_shipping' },
  { key: 'out_for_delivery', label: 'Out For Delivery', icon: 'delivery_dining' },
  { key: 'delivered', label: 'Delivered', icon: 'package_2' },
];

const CANCELLED_STEP = { key: 'cancelled', label: 'Cancelled', icon: 'cancel' };

const isCancelled = (status) => status === 'cancelled';

const formatTimestamp = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Build a `Map<status, { timestamp, note }>` from either history shape.
 *
 * - Array form (backend): entries carry `{ status, timestamp, note }`.
 * - Object form (legacy): keys are statuses, values are date strings.
 *
 * Later entries win so the most recent transition timestamp for a status is
 * the one displayed (matching the append-only semantics of `statusHistory`).
 */
const normalizeHistory = (timestamps) => {
  const map = new Map();

  if (Array.isArray(timestamps)) {
    timestamps.forEach((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return;
      map.set(entry.status, {
        timestamp: entry.timestamp,
        note: entry.note,
      });
    });
    return map;
  }

  if (timestamps && typeof timestamps === 'object') {
    Object.entries(timestamps).forEach(([status, value]) => {
      // Allow value to be either a date string or an object carrying a note.
      const entry = value && typeof value === 'object' ? value : { timestamp: value };
      map.set(status, { timestamp: entry.timestamp, note: entry.note });
    });
  }

  return map;
};

const OrderTimeline = memo(({ status, timestamps = {}, updatedAt, className = '' }) => {
  const cancelled = isCancelled(status);
  const steps = cancelled ? [CANCELLED_STEP] : STATUS_STEPS;
  const currentIndex = cancelled ? 0 : STATUS_STEPS.findIndex((step) => step.key === status);
  const history = normalizeHistory(timestamps);

  return (
    <ol
      className={cn('relative space-y-1', className)}
      aria-label="Order tracking timeline"
    >
      {steps.map((step, index) => {
        const isComplete = !cancelled && index < currentIndex;
        const isActive = !cancelled && index === currentIndex;
        const isLast = index === steps.length - 1;
        const entry = cancelled ? null : history.get(step.key);
        const timestamp = cancelled
          ? formatTimestamp(updatedAt)
          : formatTimestamp(entry?.timestamp);
        const note = cancelled ? null : entry?.note;
        const stateLabel = cancelled
          ? 'Cancelled'
          : isActive
            ? 'Current step'
            : isComplete
              ? 'Completed'
              : 'Upcoming';

        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-[19px] top-10 h-[calc(100%-1.5rem)] w-0.5 transition-colors duration-300',
                  isComplete ? 'bg-primary' : 'bg-outline-variant/40'
                )}
              />
            ) : null}

            <span
              className={cn(
                'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300',
                cancelled && 'border-error bg-error/10 text-error',
                !cancelled && isComplete && 'border-primary bg-primary text-on-primary',
                !cancelled && isActive && 'border-primary bg-primary/10 text-primary animate-pulse',
                !cancelled && !isComplete && !isActive && 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'
              )}
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {step.icon}
              </span>
            </span>

            <div className="flex min-w-0 flex-col justify-center pt-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span
                  className={cn(
                    'text-body-md font-medium',
                    cancelled ? 'text-error' : isActive ? 'text-primary' : 'text-on-surface'
                  )}
                >
                  {step.label}
                </span>
                <span className="sr-only">{stateLabel}</span>
              </div>
              {timestamp ? (
                <time className="text-sm text-on-surface-variant">{timestamp}</time>
              ) : (
                <span className="text-sm text-on-surface-variant/60">Pending</span>
              )}
              {note ? (
                <p className="mt-1 text-xs text-on-surface-variant/80">{note}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
});

OrderTimeline.displayName = 'OrderTimeline';

export default OrderTimeline;
