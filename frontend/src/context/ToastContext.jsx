import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ToastContainer } from '../components/ui/Toast';
import { subscribeToToasts } from '../utils/toastBus';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 4200;

const normalizeToast = (toast) => ({
  id: toast.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type: toast.type || toast.variant || 'info',
  message: toast.message || '',
  duration: toast.duration ?? DEFAULT_DURATION,
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast) => {
      const nextToast = normalizeToast(typeof toast === 'string' ? { message: toast } : toast);
      if (!nextToast.message) return '';

      setToasts((current) => [...current, nextToast]);

      if (nextToast.duration > 0 && typeof window !== 'undefined') {
        const timer = window.setTimeout(() => dismissToast(nextToast.id), nextToast.duration);
        timersRef.current.set(nextToast.id, timer);
      }

      return nextToast.id;
    },
    [dismissToast]
  );

  const success = useCallback((message, options = {}) => (
    addToast({ ...options, message, type: 'success' })
  ), [addToast]);

  const error = useCallback((message, options = {}) => (
    addToast({ ...options, message, type: 'error' })
  ), [addToast]);

  const warning = useCallback((message, options = {}) => (
    addToast({ ...options, message, type: 'warning' })
  ), [addToast]);

  const info = useCallback((message, options = {}) => (
    addToast({ ...options, message, type: 'info' })
  ), [addToast]);

  useEffect(() => subscribeToToasts(addToast), [addToast]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const value = useMemo(
    () => ({
      addToast,
      dismissToast,
      success,
      error,
      warning,
      info,
    }),
    [addToast, dismissToast, error, info, success, warning]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
