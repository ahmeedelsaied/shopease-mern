import Button from './ui/Button';

const CategoryFilter = ({ categories, selectedCategory, onSelect }) => {
  if (!categories.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <Button
          key={category}
          type="button"
          variant={selectedCategory === category ? 'chip-active' : 'chip'}
          onClick={() => onSelect(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
