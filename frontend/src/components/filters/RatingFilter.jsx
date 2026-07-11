import { cn } from '../../styles/designSystem';

const RATING_OPTIONS = [
  { value: '0', label: 'Any rating' },
  { value: '4', label: '4 stars and up' },
  { value: '3', label: '3 stars and up' },
  { value: '2', label: '2 stars and up' },
  { value: '1', label: '1 star and up' },
];

/**
 * RatingFilter – minimum-rating <select>.
 *
 * `value` is a string ('0' = any) to match the URL-search-param convention
 * used across the catalog. Extracted from ProductFiltersPanel for reuse.
 */
const RatingFilter = ({ value, onChange, className = '' }) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={cn(
      'w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface shadow-sm outline-none transition-all duration-200 focus:border-secondary focus:ring-4 focus:ring-secondary/10',
      className
    )}
  >
    {RATING_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export default RatingFilter;
