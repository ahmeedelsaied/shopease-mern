import { cn } from '../../styles/designSystem';

const priceLabel = (value) => `$${Number(value || 0).toFixed(2)}`;

const SliderField = ({ label, value, min, max, onChange, helper }) => (
  <div className="space-y-3">
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
  </div>
);

/**
 * PriceRangeFilter – dual min/max range sliders bounded by `priceBounds`.
 *
 * Extracted from ProductFiltersPanel so the same control can be composed into
 * future layouts. Keeps the existing clamp behaviour (min never exceeds max).
 */
const PriceRangeFilter = ({
  priceBounds,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  className = '',
}) => (
  <div className={cn('space-y-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4', className)}>
    <SliderField
      label="Minimum"
      value={minPrice}
      min={priceBounds.min}
      max={priceBounds.max}
      helper={priceLabel(minPrice)}
      onChange={onMinPriceChange}
    />
    <SliderField
      label="Maximum"
      value={maxPrice}
      min={priceBounds.min}
      max={priceBounds.max}
      helper={priceLabel(maxPrice)}
      onChange={onMaxPriceChange}
    />
    <div className="flex items-center justify-between text-label-sm text-on-surface-variant">
      <span>{priceLabel(priceBounds.min)}</span>
      <span>{priceLabel(priceBounds.max)}</span>
    </div>
  </div>
);

export default PriceRangeFilter;
