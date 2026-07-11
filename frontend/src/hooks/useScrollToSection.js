/**
 * useScrollToSection – React hook
 *
 * Reads the URL hash on mount and scrolls to the corresponding
 * section on the home page.  Clears the hash after scrolling so
 * that repeated clicks on the same link still work.
 */

import { useEffect, useRef } from 'react';
import { isHomePage, isHomeSection, scrollElementIntoView } from '../utils/navigation';

/**
 * @param {string} pathname - `location.pathname`
 * @param {string} hash     - `location.hash`
 */
export default function useScrollToSection(pathname, hash) {
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    /* Only handle hashes when on the home page. */
    if (!isHomePage(pathname)) {
      hasScrolledRef.current = false;
      return;
    }

    const sectionId = hash.replace('#', '');
    if (!sectionId || !isHomeSection(sectionId)) {
      hasScrolledRef.current = false;
      return;
    }

    /* Prevent duplicate scroll on the same hash. */
    if (hasScrolledRef.current) {
      return;
    }

    hasScrolledRef.current = true;

    /* Small delay to let lazy content render. */
    const timerId = setTimeout(() => {
      const scrolled = scrollElementIntoView(sectionId);
      if (!scrolled) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(timerId);
  }, [pathname, hash]);
}
