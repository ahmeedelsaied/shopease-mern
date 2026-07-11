import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useDebounce – Debounces a value by the specified delay.
 *
 * @param {*}      value  - The value to debounce.
 * @param {number} delay  - Delay in milliseconds (default 300).
 * @returns {[*, boolean]} Tuple of debounced value and a boolean indicating
 *                         whether the value is still pending (i.e. within the
 *                         debounce window).
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const isPendingRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    isPendingRef.current = true;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
      isPendingRef.current = false;
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      isPendingRef.current = false;
    }
  }, []);

  return [debouncedValue, cancel];
}
