import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '../../styles/designSystem';
import { Card, ImageWithSkeleton } from '../ui';
import useLightbox from '../../hooks/useLightbox';
import ProductImageZoom from './ProductImageZoom';
import ProductLightbox from './ProductLightbox';

/**
 * Build the gallery image list from a product. Supports a future `images`
 * array on the product schema (without modifying the schema today) and falls
 * back to a single `image` field.
 *
 * Each entry carries `src` and `alt` derived from the product name.
 *
 * @param {{image?: string, images?: string[], name?: string}} product
 * @returns {Array<{src: string, alt: string}>}
 */
const buildGalleryImages = (product) => {
  const baseAlt = product?.name ?? 'Product image';

  if (Array.isArray(product?.images) && product.images.length > 0) {
    return product.images.map((src) => ({ src, alt: baseAlt }));
  }
  if (product?.image) {
    return [{ src: product.image, alt: baseAlt }];
  }
  return [];
};

/**
 * ProductGallery — Replaces the single product image on the details page
 * with a professional gallery:
 *
 *  - Large main image with hover/tap zoom ("lens" effect).
 *  - Thumbnail strip below the main image (hidden when only one image exists).
 *  - Clicking the main image (desktop) or the expand button (mobile) opens a
 *    fullscreen lightbox with keyboard navigation and swipe support.
 *
 * Images are lazy-loaded via the existing `ImageWithSkeleton` component and the
 * adjacent images are preloaded so thumbnail/lightbox navigation is instant.
 * The component memoizes its sub-pieces to avoid unnecessary re-renders.
 *
 * @param {object} props
 * @param {object} props.product - The product document.
 * @param {string} [props.className] - Extra classes for the outer wrapper.
 * @returns {JSX.Element}
 */
const ProductGallery = ({ product, className = '' }) => {
  const images = useMemo(() => buildGalleryImages(product), [product]);
  const [activeIndex, setActiveIndex] = useState(0);

  const lightbox = useLightbox(images.length);

  // Reset selection whenever the underlying product changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [product]);

  // Preload the adjacent gallery images so thumbnail switching feels instant.
  useEffect(() => {
    if (images.length <= 1) return undefined;

    const preload = [activeIndex - 1, activeIndex + 1]
      .filter((position) => position >= 0 && position < images.length)
      .map((position) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = images[position].src;
        document.head.appendChild(link);
        return link;
      });

    return () => {
      preload.forEach((link) => link.parentNode?.removeChild(link));
    };
  }, [activeIndex, images]);

  const handleSelect = useCallback(
    (position) => {
      setActiveIndex(position);
    },
    []
  );

  const handleOpenLightbox = useCallback(() => {
    lightbox.open(activeIndex);
  }, [lightbox, activeIndex]);

  const current = images[activeIndex] ?? images[0];
  const showThumbnails = images.length > 1;

  if (!current) {
    return (
      <Card variant="product" className="overflow-hidden shadow-soft">
        <div className="h-[520px] w-full bg-surface-container" aria-hidden="true" />
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main image card — press to open lightbox, hover to zoom. */}
      <Card variant="product" className="overflow-hidden shadow-soft">
        <div className="relative h-[520px] w-full">
          <ProductImageZoom
            src={current.src}
            alt={current.alt}
            zoomEnabled={!lightbox.isOpen}
          />

          {/* Click target to open lightbox. On desktop the zoom consumes
              pointermove; the click here opens the fullscreen view without
              interfering because tap-to-zoom only triggers on touch. */}
          <button
            type="button"
            aria-label={`Open ${current.alt} in fullscreen`}
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest/85 text-primary shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 active:scale-95"
            onClick={handleOpenLightbox}
          >
            <span className="material-symbols-outlined text-[20px]">fullscreen</span>
          </button>
        </div>
      </Card>

      {/* Thumbnail strip — automatically hidden for single-image products. */}
      {showThumbnails && (
        <div
          role="tablist"
          aria-label="Product image thumbnails"
          className="flex flex-wrap gap-3"
        >
          {images.map((image, position) => {
            const isSelected = position === activeIndex;
            return (
              <button
                key={image.src}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`View image ${position + 1} of ${images.length}`}
                onClick={() => handleSelect(position)}
                className={cn(
                  'group relative h-20 w-20 overflow-hidden rounded-2xl border bg-surface-container-low transition-all duration-200',
                  'hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10',
                  isSelected
                    ? 'border-secondary ring-2 ring-secondary/40'
                    : 'border-outline-variant/30 opacity-70 hover:opacity-100'
                )}
              >
                <ImageWithSkeleton
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  wrapperClassName="h-full w-full"
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen gallery overlay. */}
      <ProductLightbox
        isOpen={lightbox.isOpen}
        images={images}
        index={lightbox.index}
        onClose={lightbox.close}
        onNext={lightbox.next}
        onPrevious={lightbox.previous}
        dialogRef={lightbox.dialogRef}
        swipeProps={lightbox.swipeProps}
      />
    </div>
  );
};

ProductGallery.displayName = 'ProductGallery';

export default memo(ProductGallery);
