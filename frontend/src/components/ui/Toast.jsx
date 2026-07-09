import { memo } from 'react';
import { cn } from '../../styles/designSystem';

const toastStyles = {
  success: {
    icon: 'check_circle',
    className: 'border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-100',
  },
  error: {
    icon: 'error',
    className: 'border-error/30 bg-error-container text-error dark:bg-error/20 dark:text-red-100',
  },
  warning: {
    icon: 'warning',
    className: 'border-amber-500/30 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-100',
  },
  info: {
    icon: 'info',
    className: 'border-secondary/30 bg-secondary-container text-on-secondary-container dark:bg-secondary/20 dark:text-blue-100',
  },
};

const ToastItem = memo(({ toast, onDismiss }) => {
  const style = toastStyles[toast.type] || toastStyles.info;

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-xl transition-all duration-300 ease-out animate-[toast-in_260ms_ease-out]',
        'sm:max-w-sm',
        style.className
      )}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <span className="material-symbols-outlined mt-0.5 text-[20px]" aria-hidden="true">
        {style.icon}
      </span>
      <p className="min-w-0 flex-1 text-sm font-medium leading-6">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="rounded-full p-1 transition-colors hover:bg-surface-container-lowest/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        aria-label="Dismiss notification"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          close
        </span>
      </button>
    </div>
  );
});

ToastItem.displayName = 'ToastItem';

const ToastContainer = ({ toasts = [], onDismiss = () => {}, className = '' }) => {
  if (!toasts.length) return null;

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-4 bottom-4 z-[2000] flex flex-col-reverse gap-3 sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-6 sm:w-[min(24rem,calc(100vw-3rem))] sm:flex-col',
        className
      )}
      aria-live="polite"
      aria-relevant="additions removals"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export { ToastContainer };

