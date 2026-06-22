import { useEffect, useState } from 'react';
import { cn, components } from '../../styles/designSystem';

const Toast = ({
  message,
  variant = 'status',
  icon = 'check_circle',
  isVisible = false,
  onClose,
  duration = 3000,
  className = '',
}) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setActive(false);
      return undefined;
    }

    setActive(true);
    const timer = setTimeout(() => {
      setActive(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible && !active) return null;

  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'fixed bottom-8 right-8 z-[200]',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className={components.toast.pill}>{message}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed bottom-stack-lg right-margin-mobile md:right-margin-desktop z-50',
        !active ? 'toast-enter hidden' : 'toast-enter-active',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className={components.toast.status}>
        {icon && (
          <span className="material-symbols-outlined text-secondary">{icon}</span>
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

const ToastContainer = ({ toasts = [], className = '' }) => {
  if (!toasts.length) return null;

  return (
    <div
      className={cn(
        'fixed bottom-8 right-8 z-[200] flex flex-col gap-2',
        className
      )}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className={components.toast.pill}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export { ToastContainer };
export default Toast;
