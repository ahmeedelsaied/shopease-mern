import { memo } from 'react';
import { cn } from '../styles/designSystem';

/**
 * OrderTimeline – vertical stepper that visualises an order's lifecycle.
 *
 * Statuses mirror the backend Order enum exactly
 * (models/Order.js): pending → processing → shipped → delivered.
 * `cancelled` is terminal and short-circuits the happy-path rendering.
 *
 * Each step shows: material icon, title, timestamp (when present), and a
 * connector line to the next step. The active step is animated.
 */
const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: 'receipt_long' },
  { key: 'processing', label: 'Processing', icon: 'inventory_2' },
  { key: 'shipped', label: 'Shipped', icon: 'local_shipping' },
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

const OrderTimeline = memo(({ status, timestamps = {}, updatedAt, className = '' }) => {
  const cancelled = isCancelled(status);
  const steps = cancelled ? [CANCELLED_STEP] : STATUS_STEPS;
  const currentIndex = cancelled ? 0 : STATUS_STEPS.findIndex((step) => step.key === status);

  return (
    <ol
      className={cn('relative space-y-1', className)}
      aria-label="Order tracking timeline"
    >
      {steps.map((step, index) => {
        const isComplete = !cancelled && index < currentIndex;
        const isActive = !cancelled && index === currentIndex;
        const isLast = index === steps.length - 1;
        const timestamp = cancelled
          ? formatTimestamp(updatedAt)
          : formatTimestamp(timestamps[step.key]);
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
                  'absolute left-[19px] top-10 h-[calc(100%-1.5rem)] w-0.5',
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
            </div>
          </li>
        );
      })}
    </ol>
  );
});

OrderTimeline.displayName = 'OrderTimeline';

export default OrderTimeline;
