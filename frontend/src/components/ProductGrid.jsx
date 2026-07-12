import ProductCard from './ProductCard';
import { ProductCardSkeleton } from './ui/Skeleton';
import EmptyState from './EmptyState';

const ProductGrid = ({
  products,
  loading,
  error,
  searchTerm = '',
  onClearFilters,
}) => {
  if (loading) {
    return (
      <div className="grid w-full min-w-0 grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState icon="error" title="Products unavailable" description={error} />;
  }

  if (!products.length) {
    return (
      <EmptyState
        icon="search_off"
        title="No products found"
        description="We couldn't find any products matching your current filters. Try adjusting your search or clearing the active filters."
        actionLabel="Clear Filters"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} searchTerm={searchTerm} />
      ))}
    </div>
  );
};

export default ProductGrid;
