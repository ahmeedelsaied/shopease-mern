import { cn } from '../../styles/designSystem';

/**
 * Toggle – shared accessible switch used by the boolean filters
 * (FeaturedFilter, StockFilter). Extracted from ProductFiltersPanel so the
 * styling stays in one place.
 */
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
          checked ? 'left-6' : 'left-1',
        )}
      />
    </button>
  </label>
);

export default Toggle;
