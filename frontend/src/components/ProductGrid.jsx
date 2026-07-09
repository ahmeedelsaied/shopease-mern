import ProductCard from './ProductCard';
import { ProductCardSkeleton } from './ui/Skeleton';
import EmptyState from './EmptyState';

const ProductGrid = ({ products, loading, error }) => {
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
        title="No products match your search"
        description="Try a different query or category to explore more items."
      />
    );
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
