/**
 * useScrollToSection – React hook
 *
 * Reads the URL hash and scrolls to the corresponding section on the home
 * page. Repeated clicks on the same link are handled by the navigation helper,
 * while distinct hashes and browser history transitions are handled here.
 */

import { useEffect, useRef } from 'react';
import { isHomePage, isHomeSection, scrollElementIntoView } from '../utils/navigation';

/**
 * @param {string} pathname - `location.pathname`
 * @param {string} hash     - `location.hash`
 */
export default function useScrollToSection(pathname, hash) {
  const handledHashRef = useRef('');

  useEffect(() => {
    /* Only handle hashes when on the home page. */
    if (!isHomePage(pathname)) {
      handledHashRef.current = '';
      return;
    }

    const sectionId = hash.replace('#', '');
    if (!sectionId || !isHomeSection(sectionId)) {
      handledHashRef.current = '';
      return;
    }

    /* Prevent duplicate scroll for the same hash, but allow a new hash or
       a back/forward transition to run again. */
    if (handledHashRef.current === hash) {
      return;
    }

    handledHashRef.current = hash;

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
