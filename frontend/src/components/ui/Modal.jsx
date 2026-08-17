import { useEffect, useState } from 'react';
import { cn, components } from '../../styles/designSystem';

const Modal = ({
  isOpen,
  onClose,
  children,
  className = '',
  showClose = true,
}) => {
  const [rendered, setRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setRendered(false), 180);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

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

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-margin-mobile md:p-margin-desktop">
      <div
        className={cn('absolute inset-0', components.modal.overlay, isOpen ? 'animate-modal-fade-in' : 'animate-modal-fade-out')}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-[151] w-full max-w-md glass-panel',
          components.modal.panel,
          isOpen ? 'animate-modal-in' : 'animate-modal-out',
          className,
        )}
      >
        {showClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 text-on-surface-variant transition-colors hover:text-primary"
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
