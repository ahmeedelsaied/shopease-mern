import { useCallback, useRef, useState } from 'react';

/**
 * useImageZoom — Drives hover zoom (pointer / desktop) and tap-to-zoom (mobile).
 *
 * Returns the zoom state plus stable event handlers that should be spread onto
 * the zoom container element. The container is responsible for rendering the
 * magnified image and reading `backgroundPosition` / `transformOrigin` from the
 * returned `origin`.
 *
 * Pointer behavior is opt-in via the `enabled` flag so the gallery can keep
 * zoom disabled while the lightbox is open and on touch-only devices where
 * hover is not meaningful.
 *
 * @param {object}  options
 * @param {boolean} [options.enabled=true] - Master toggle (disable on touch / during lightbox).
 * @param {number}  [options.scale=2.2]    - Magnification factor applied to the image.
 * @returns {{
 *   isZoomed: boolean,
 *   origin: string,
 *   cursor: string,
 *   handlers: {
 *     onPointerEnter: () => void,
 *     onPointerMove: (event: PointerEvent) => void,
 *     onPointerLeave: () => void,
 *     onClick: (event: MouseEvent) => void,
 *   },
 *   containerRef: React.MutableRefObject<HTMLElement|null>
 * }}
 */
export default function useImageZoom({ enabled = true, scale = 2.2 } = {}) {
  const containerRef = useRef(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [origin, setOrigin] = useState('center center');

  const updateOriginFromEvent = useCallback((event) => {
    const element = containerRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * 100;
    const relativeY = ((event.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.min(Math.max(relativeX, 0), 100);
    const clampedY = Math.min(Math.max(relativeY, 0), 100);

    setOrigin(`${clampedX}% ${clampedY}%`);
  }, []);

  const handlePointerEnter = useCallback(() => {
    if (!enabled) return;
    setIsZoomed(true);
  }, [enabled]);

  const handlePointerMove = useCallback(
    (event) => {
      if (!enabled || !isZoomed) return;
      updateOriginFromEvent(event);
    },
    [enabled, isZoomed, updateOriginFromEvent]
  );

  const handlePointerLeave = useCallback(() => {
    if (!enabled) return;
    setIsZoomed(false);
    setOrigin('center center');
  }, [enabled]);

  // Tap-to-zoom on touch devices: each tap toggles zoom centered on the tap point.
  const handleClick = useCallback(
    (event) => {
      if (!enabled) return;
      setIsZoomed((previous) => {
        if (!previous) {
          updateOriginFromEvent(event);
          return true;
        }
        setOrigin('center center');
        return false;
      });
    },
    [enabled, updateOriginFromEvent]
  );

  const cursor = !enabled ? 'initial' : isZoomed ? 'zoom-out' : 'zoom-in';

  return {
    isZoomed,
    origin,
    scale,
    cursor,
    handlers: {
      onPointerEnter: handlePointerEnter,
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave,
      onClick: handleClick,
    },
    containerRef,
  };
}
