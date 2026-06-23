import Input from './ui/Input';

const SearchBar = ({ searchQuery, onChange }) => {
  return (
    <div className="w-full">
      <Input
        id="product-search"
        label="Search products"
        value={searchQuery}
        onChange={(event) => onChange(event.target.value)}
        className="bg-surface-container-low"
      />
    </div>
  );
};

export default SearchBar;
