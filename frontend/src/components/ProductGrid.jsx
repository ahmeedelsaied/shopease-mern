import ProductCard from './ProductCard';
import Loader from './ui/Loader';

const ProductGrid = ({ products, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
        <div className="col-span-full py-20 text-center">
          <Loader variant="spinner" className="text-[32px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-error/20 bg-error-container p-8 text-center">
        <p className="text-body-lg font-body-lg text-error">{error}</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-8 text-center">
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
