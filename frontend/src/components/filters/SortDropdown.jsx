import { useId } from 'react';
import { cn } from '../../styles/designSystem';

/**
 * SortDropdown – accessible <select> for product sort order.
 *
 * The list of sort options is owned by `useProductFilters().sortOptions`
 * (single source of truth, mirroring the backend sortMap) and passed in via
 * `options` so every consumer stays in sync with the supported sort keys.
 */
const SortDropdown = ({
  options,
  value,
  onChange,
  label = 'Sort',
  id,
  className = '',
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor={selectId}
        className="mb-2 block text-label-sm font-label-sm text-on-surface-variant"
      >
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface shadow-sm outline-none transition-all duration-200 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortDropdown;
