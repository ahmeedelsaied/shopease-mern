import { memo } from 'react';
import { cn } from '../styles/designSystem';

/**
 * CheckoutSteps – horizontal progress indicator for the checkout flow.
 *
 * Purely presentational: the active step is driven by `current` so the parent
 * owns the navigation state. Steps are informational (Shipping → Payment →
 * Review → Confirmation); the single-page checkout does not navigate between
 * them, but the indicator communicates where the user is in the flow.
 */
const STEPS = [
  { key: 'shipping', label: 'Shipping', icon: 'local_shipping' },
  { key: 'payment', label: 'Payment', icon: 'payments' },
  { key: 'review', label: 'Review', icon: 'fact_check' },
  { key: 'confirmation', label: 'Confirmation', icon: 'verified' },
];

const CheckoutSteps = memo(({ current = 'shipping', className = '' }) => {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <ol
      className={cn('flex items-center gap-2 sm:gap-4', className)}
      aria-label="Checkout progress"
    >
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <li key={step.key} className="flex flex-1 items-center gap-2 sm:gap-4">
            <div className="flex min-w-0 flex-col items-center gap-2">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300',
                  isActive && 'border-primary bg-primary text-on-primary',
                  isComplete && 'border-primary bg-primary/10 text-primary',
                  !isActive && !isComplete && 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  {step.icon}
                </span>
              </span>
              <span
                className={cn(
                  'text-center text-xs font-medium sm:text-sm',
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLastStep(index) ? (
              <span
                aria-hidden="true"
                className={cn(
                  'h-0.5 flex-1 rounded-full transition-colors duration-300',
                  isComplete ? 'bg-primary' : 'bg-outline-variant/40'
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
});

const isLastStep = (index) => index === STEPS.length - 1;

CheckoutSteps.displayName = 'CheckoutSteps';

export default CheckoutSteps;
