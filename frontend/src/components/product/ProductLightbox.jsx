import { memo } from 'react';
import { cn } from '../../styles/designSystem';

const NAV_BUTTON_BASE =
  'absolute top-1/2 z-[152] -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center ' +
  'rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all ' +
  'duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 active:scale-95';

/**
 * ProductLightbox — Fullscreen, keyboard-navigable gallery overlay.
 *
 * Renders above the page once `isOpen` is true. Clicking the dark backdrop,
 * pressing Escape, or activating the close button dismisses it. Arrow keys,
 * the on-screen Previous/Next buttons, and horizontal swipe gestures on touch
 * devices all move between images.
 *
 * The component is intentionally presentational: focus trap, scroll lock and
 * keyboard handling live in `useLightbox`, which provides `dialogRef` and
 * `swipeProps` for this component to wire up.
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen       - Whether the lightbox is visible.
 * @param {Array<{src: string, alt: string}>} props.images - Gallery images.
 * @param {number}   props.index       - Currently active image index.
 * @param {function} props.onClose     - Close handler.
 * @param {function} props.onNext      - Go to next image.
 * @param {function} props.onPrevious  - Go to previous image.
 * @param {React.Ref} props.dialogRef  - Ref for the dialog element (focus trap).
 * @param {object}   props.swipeProps  - Touch handlers spread on the image stage.
 * @returns {JSX.Element|null}
 */
const ProductLightbox = ({
  isOpen,
  images,
  index,
  onClose,
  onNext,
  onPrevious,
  dialogRef,
  swipeProps,
}) => {
  if (!isOpen || images.length === 0) return null;

  const current = images[index] ?? images[0];
  const counter = `${index + 1} / ${images.length}`;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center animate-content-in"
      role="presentation"
    >
      {/* Dark overlay — click outside closes. */}
      <div
        className="absolute inset-0 bg-inverse-surface/90 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Image gallery lightbox"
        tabIndex={-1}
        className="relative z-[201] flex h-full w-full flex-col items-center justify-center px-4 py-6 outline-none"
      >
        {/* Top bar: counter + close. */}
        <div className="absolute inset-x-0 top-0 z-[202] flex items-center justify-between p-4 sm:p-6">
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
            {counter}
          </span>
          <button
            type="button"
            data-autofocus="true"
            aria-label="Close lightbox"
            onClick={onClose}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 active:scale-95"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Image stage — also the swipe surface. */}
        <div
          className="relative flex max-h-[80vh] w-full max-w-5xl items-center justify-center"
          {...swipeProps}
        >
          {images.length > 1 && (
            <button
              type="button"
              aria-label="Previous image"
              onClick={onPrevious}
              className={cn(NAV_BUTTON_BASE, 'left-2 sm:-left-14')}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}

          <img
            key={current.src}
            src={current.src}
            alt={current.alt}
            draggable={false}
            className="max-h-[80vh] w-auto max-w-full select-none rounded-2xl object-contain shadow-xl animate-content-in"
          />

          {images.length > 1 && (
            <button
              type="button"
              aria-label="Next image"
              onClick={onNext}
              className={cn(NAV_BUTTON_BASE, 'right-2 sm:-right-14')}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )}
        </div>

        {/* Accessibility hint for non-touch users. */}
        <p className="mt-6 hidden text-sm text-white/60 sm:block">
          Use arrow keys to navigate. Press Escape to close.
        </p>
      </div>
    </div>
  );
};

ProductLightbox.displayName = 'ProductLightbox';

export default memo(ProductLightbox);
