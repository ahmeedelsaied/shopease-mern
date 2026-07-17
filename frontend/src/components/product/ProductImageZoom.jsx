import { memo } from 'react';
import { cn } from '../../styles/designSystem';
import { ImageWithSkeleton } from '../ui';
import useImageZoom from '../../hooks/useImageZoom';

/**
 * ProductImageZoom — Wraps a single gallery image with hover (desktop) and
 * tap-to-zoom (mobile) magnification built on `useImageZoom`.
 *
 * The magnified image is rendered behind a translucent copy whose
 * `transformOrigin` tracks the pointer, producing a smooth "lens" effect
 * without requiring any external library. The outer element forwards
 * `onActivateClick` so the gallery can open the lightbox from the same image
 * surface on pointer devices.
 *
 * @param {object}   props
 * @param {string}   props.src          - Image URL.
 * @param {string}   props.alt          - Alt text for the image.
 * @param {boolean}  [props.zoomEnabled=true] - Master zoom toggle (disable while lightbox is open).
 * @param {string}   [props.className]  - Extra classes for the outer container.
 * @returns {JSX.Element}
 */
const ProductImageZoom = ({
  src,
  alt,
  zoomEnabled = true,
  className = '',
}) => {
  const {
    isZoomed,
    origin,
    scale,
    cursor,
    handlers,
    containerRef,
  } = useImageZoom({ enabled: zoomEnabled });

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={alt}
      className={cn(
        'group relative h-full w-full overflow-hidden rounded-[1.75rem] bg-surface-container-low',
        'select-none touch-manipulation',
        className
      )}
      style={{ cursor }}
      onPointerEnter={handlers.onPointerEnter}
      onPointerMove={handlers.onPointerMove}
      onPointerLeave={handlers.onPointerLeave}
      onClick={handlers.onClick}
    >
      <ImageWithSkeleton
        key={src}
        src={src}
        alt={alt}
        draggable={false}
        loading="lazy"
        decoding="async"
        wrapperClassName="h-full w-full"
        className={cn(
          'animate-gallery-fade h-full w-full object-cover transition-[transform,opacity] duration-500 ease-out will-change-transform',
          isZoomed && 'pointer-events-none opacity-0'
        )}
      />

      {/* Magnified layer: revealed while zooming, follows the pointer origin. */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 bg-surface-container-low bg-cover bg-center',
          'opacity-0 transition-opacity duration-300 ease-out',
          isZoomed && 'opacity-100'
        )}
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: `${scale * 100}%`,
          backgroundPosition: origin,
        }}
      />

      {/* Subtle zoom hint badge (desktop only), hidden once zooming. */}
      <span
        className={cn(
          'pointer-events-none absolute bottom-4 left-4 hidden items-center gap-1 rounded-full',
          'border border-outline-variant/40 bg-surface-container-lowest/80 px-3 py-1 text-xs',
          'font-semibold text-on-surface-variant backdrop-blur transition-opacity duration-300',
          'md:inline-flex',
          isZoomed && 'opacity-0'
        )}
      >
        <span className="material-symbols-outlined text-[16px]">zoom_in</span>
        Hover to zoom
      </span>
    </div>
  );
};

ProductImageZoom.displayName = 'ProductImageZoom';

export default memo(ProductImageZoom);
