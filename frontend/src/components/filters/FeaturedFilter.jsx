import Toggle from './Toggle';

/**
 * FeaturedFilter – "Featured only" boolean toggle, reusing the shared Toggle
 * primitive so styling stays consistent with StockFilter.
 */
const FeaturedFilter = ({ checked, onChange }) => (
  <Toggle label="Featured only" checked={checked} onChange={onChange} />
);

export default FeaturedFilter;
