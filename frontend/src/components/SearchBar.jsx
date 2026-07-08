import Input from './ui/Input';

const SearchBar = ({ searchQuery = '', value, onChange }) => {
  return (
    <div className="w-full">
      <Input
        id="product-search"
        label="Search products"
        value={value ?? searchQuery}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name"
        className="bg-surface-container-lowest"
      />
    </div>
  );
};

export default SearchBar;
