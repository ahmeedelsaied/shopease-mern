import { useEffect } from 'react';
import { cn, components } from '../../styles/designSystem';

const Modal = ({
  isOpen,
  onClose,
  children,
  className = '',
  showClose = true,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-margin-mobile md:p-margin-desktop">
      <div
        className={cn('absolute inset-0', components.modal.overlay)}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-[151] w-full max-w-md glass-panel',
          components.modal.panel,
          className
        )}
      >
        {showClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
