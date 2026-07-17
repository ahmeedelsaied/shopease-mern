import { useCallback, useEffect, useRef, useState } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * useLightbox — Fullscreen gallery controller.
 *
 * Manages open/close state, the active index (with wrapping), keyboard
 * navigation (Escape to close, ArrowLeft/ArrowRight to move), a focus trap
 * scoped to the provided dialog element, and a touch swipe handler that
 * returns a stable `onTouchEnd` for a single element to consume.
 *
 * The hook locks body scroll while open and restores focus to the element
 * that was focused before opening (returns focus to the trigger).
 *
 * @param {number}  count     - Total number of images in the gallery.
 * @param {function} [onClose] - Optional extra callback fired on close.
 * @returns {object} Lightbox controller.
 */
export default function useLightbox(count, onClose) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const handleClose = useCallback(() => {
    setIsOpen(false);
    closeRef.current?.();
  }, []);

  const goTo = useCallback(
    (nextIndex) => {
      if (count <= 0) return;
      setIndex(((nextIndex % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const previous = useCallback(() => goTo(index - 1), [goTo, index]);

  const open = useCallback(
    (openIndex = 0) => {
      previouslyFocusedRef.current =
        document.activeElement && document.activeElement !== document.body
          ? document.activeElement
          : null;
      goTo(openIndex);
      setIsOpen(true);
    },
    [goTo]
  );

  const trapFocus = useCallback((event) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  // Keyboard + scroll lock while open.
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          handleClose();
          break;
        case 'ArrowRight':
          event.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          previous();
          break;
        case 'Tab':
          trapFocus(event);
          break;
        default:
          break;
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose, next, previous, trapFocus]);

  // Move focus into the dialog on open, restore it on close.
  useEffect(() => {
    if (!isOpen) {
      previouslyFocusedRef.current?.focus?.();
      return undefined;
    }

    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const initialFocus =
      dialog.querySelector('[data-autofocus="true"]') ||
      dialog.querySelector(FOCUSABLE_SELECTOR) ||
      dialog;
    initialFocus.focus?.();

    return undefined;
  }, [isOpen]);

  // Swipe handling consumed by a single touch surface (the image stage).
  const swipeStateRef = useRef({ startX: 0, startY: 0 });

  const onTouchStart = useCallback((event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    swipeStateRef.current = { startX: touch.clientX, startY: touch.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (event) => {
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - swipeStateRef.current.startX;
      const deltaY = touch.clientY - swipeStateRef.current.startY;

      // Ignore vertical swipes (likely a scroll attempt).
      if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }

      if (deltaX < 0) {
        next();
      } else {
        previous();
      }
    },
    [next, previous]
  );

  return {
    isOpen,
    index,
    open,
    close: handleClose,
    next,
    previous,
    goTo,
    dialogRef,
    swipeProps: { onTouchStart, onTouchEnd },
  };
}
