import { useEffect, useMemo } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import CategoryFilter from './CategoryFilter';
import { cn } from '../styles/designSystem';

const priceLabel = (value) => `$${Number(value || 0).toFixed(2)}`;

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface">
    <span>{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10',
        checked ? 'border-primary bg-primary' : 'border-outline-variant bg-surface-container-high'
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-5 w-5 rounded-full bg-surface-container-lowest shadow-sm transition-all duration-200',
          checked ? 'left-6' : 'left-1'
        )}
      />
    </button>
  </label>
);

const SliderField = ({ label, value, min, max, onChange, helper }) => (
  <div className="space-y-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
    <div className="flex items-center justify-between gap-3">
      <span className="text-body-md font-medium text-on-surface">{label}</span>
      <span className="text-label-sm text-on-surface-variant">{helper}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full accent-secondary"
    />
    <div className="flex items-center justify-between text-label-sm text-on-surface-variant">
      <span>{priceLabel(min)}</span>
      <span>{priceLabel(max)}</span>
    </div>
  </div>
);

const ProductFiltersPanel = ({
  categories = [],
  filters,
  priceBounds,
  onCategoryChange,
  onSortChange,
  onMinPriceChange,
  onMaxPriceChange,
  onRatingChange,
  onFeaturedChange,
  onInStockChange,
  onClearFilters,
  mobileOpen,
  onMobileClose,
}) => {
  const categoryOptions = useMemo(() => ['All', ...categories.filter(Boolean)], [categories]);
  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.category !== 'All' ||
    filters.sort !== 'newest' ||
    filters.minPrice !== priceBounds.min ||
    filters.maxPrice !== priceBounds.max ||
    filters.rating !== '0' ||
    filters.featured ||
    filters.inStock;

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onMobileClose?.();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileOpen, onMobileClose]);

  const content = (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
            Filters
          </p>
          <h3 className="text-headline-sm font-headline-sm text-primary">Refine results</h3>
        </div>
        {hasActiveFilters ? (
          <Button type="button" variant="secondary" size="sm" onClick={onClearFilters}>
            Clear
          </Button>
        ) : null}
      </div>

      <div className="space-y-3">
        <p className="text-label-sm font-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
          Category
        </p>
        <CategoryFilter
          categories={categoryOptions}
          selectedCategory={filters.category}
          onSelect={onCategoryChange}
        />
      </div>

      <div className="space-y-3">
        <p className="text-label-sm font-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
          Price range
        </p>
        <div className="space-y-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
          <SliderField
            label="Minimum"
            value={filters.minPrice}
            min={priceBounds.min}
            max={priceBounds.max}
            helper={priceLabel(filters.minPrice)}
            onChange={onMinPriceChange}
          />
          <SliderField
            label="Maximum"
            value={filters.maxPrice}
            min={priceBounds.min}
            max={priceBounds.max}
            helper={priceLabel(filters.maxPrice)}
            onChange={onMaxPriceChange}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-label-sm font-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
          Minimum rating
        </p>
        <select
          value={filters.rating}
          onChange={(event) => onRatingChange(event.target.value)}
          className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface shadow-sm outline-none transition-all duration-200 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
        >
          <option value="0">Any rating</option>
          <option value="4">4 stars and up</option>
          <option value="3">3 stars and up</option>
          <option value="2">2 stars and up</option>
          <option value="1">1 star and up</option>
        </select>
      </div>

      <div className="space-y-3">
        <p className="text-label-sm font-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
          Status
        </p>
        <div className="space-y-3">
          <Toggle
            label="Featured only"
            checked={filters.featured}
            onChange={onFeaturedChange}
          />
          <Toggle
            label="In stock only"
            checked={filters.inStock}
            onChange={onInStockChange}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Card variant="panel" className="sticky top-32 hidden h-fit w-full min-w-0 space-y-5 xl:block">
        {content}
      </Card>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[160] xl:hidden" aria-modal="true" role="dialog">
          <div
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onMobileClose}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[2rem] border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
                  Filters
                </p>
                <h3 className="text-headline-sm font-headline-sm text-primary">Refine results</h3>
              </div>
              <Button type="button" variant="icon" icon="close" onClick={onMobileClose} aria-label="Close filters" />
            </div>
            <div className="max-h-[78vh] overflow-y-auto pr-1">{content}</div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ProductFiltersPanel;
