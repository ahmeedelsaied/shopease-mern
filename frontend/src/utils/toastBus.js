const TOAST_EVENT = 'shopease:toast';

export const emitToast = (toast) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: typeof toast === 'string' ? { message: toast } : toast,
    })
  );
};

export const subscribeToToasts = (handler) => {
  if (typeof window === 'undefined') return () => {};

  const listener = (event) => handler(event.detail || {});
  window.addEventListener(TOAST_EVENT, listener);
  return () => window.removeEventListener(TOAST_EVENT, listener);
};

