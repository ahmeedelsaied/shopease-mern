import Toggle from './Toggle';

/**
 * StockFilter – "In stock only" boolean toggle, reusing the shared Toggle
 * primitive so styling stays consistent with FeaturedFilter.
 */
const StockFilter = ({ checked, onChange }) => (
  <Toggle label="In stock only" checked={checked} onChange={onChange} />
);

export default StockFilter;
