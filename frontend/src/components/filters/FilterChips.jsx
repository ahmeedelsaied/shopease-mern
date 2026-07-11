import Button from '../ui/Button';

/**
 * FilterChips – renders the active-filter chips produced by
 * `useProductFilters().activeChips` plus a "Clear all" affordance.
 *
 * Each chip carries a `key` that maps to a filter field, so the parent can
 * decide how to clear it (single vs. all). Renders nothing when there are no
 * active filters, keeping the catalog layout clean at rest.
 */
const FilterChips = ({ chips, onClear, onClearAll, className = '' }) => {
  if (!chips || chips.length === 0) return null;

  return (
    <div className={className}>
      <ul className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <li key={chip.key}>
            <Button
              type="button"
              variant="chip"
              size="sm"
              icon="close"
              onClick={() => onClear(chip.key)}
              aria-label={`Remove filter: ${chip.label}`}
            >
              {chip.label}
            </Button>
          </li>
        ))}
        <li>
          <Button
            type="button"
            variant="chip-active"
            size="sm"
            onClick={onClearAll}
            aria-label="Clear all filters"
          >
            Clear all
          </Button>
        </li>
      </ul>
    </div>
  );
};

export default FilterChips;
