import ProductCard from './ProductCard';
import Card from './ui/Card';
import Loader from './ui/Loader';
import EmptyState from './EmptyState';

const ProductGrid = ({ products, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} variant="product" className="overflow-hidden">
            <div className="relative aspect-[4/5] bg-surface-container-low">
              <Loader variant="product" className="h-full" />
            </div>
          </Card>
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
    <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
