import { useEffect, useMemo } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import CategoryFilter from './CategoryFilter';
import PriceRangeFilter from './filters/PriceRangeFilter';
import RatingFilter from './filters/RatingFilter';
import FeaturedFilter from './filters/FeaturedFilter';
import StockFilter from './filters/StockFilter';

const ProductFiltersPanel = ({
  categories = [],
  filters,
  priceBounds,
  onCategoryChange,
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
        <PriceRangeFilter
          priceBounds={priceBounds}
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinPriceChange={onMinPriceChange}
          onMaxPriceChange={onMaxPriceChange}
        />
      </div>

      <div className="space-y-3">
        <p className="text-label-sm font-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
          Minimum rating
        </p>
        <RatingFilter value={filters.rating} onChange={onRatingChange} />
      </div>

      <div className="space-y-3">
        <p className="text-label-sm font-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
          Status
        </p>
        <div className="space-y-3">
          <FeaturedFilter checked={filters.featured} onChange={onFeaturedChange} />
          <StockFilter checked={filters.inStock} onChange={onInStockChange} />
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
