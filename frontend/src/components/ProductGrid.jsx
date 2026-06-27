import ProductCard from './ProductCard';
import Card from './ui/Card';
import Loader from './ui/Loader';

const ProductGrid = ({ products, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card
            key={index}
            variant="product"
            className="overflow-hidden shadow-soft"
          >
            <div className="relative bg-surface-container-low">
              <Loader variant="product" className="h-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-error/20 bg-error-container p-10 text-center shadow-soft">
        <p className="text-body-lg font-body-lg text-error">{error}</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-low p-10 text-center shadow-soft">
        <p className="text-body-lg font-body-lg text-on-surface-variant">
          No products match your search. Try a different query or category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
