import { Link } from 'react-router-dom';
import Card from './ui/Card';

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/products/${product._id}`}
      className="group overflow-hidden shadow-soft transition-transform duration-300 hover:-translate-y-1"
      aria-label={`View details for ${product.name}`}
    >
      <Card
        variant="product"
        className="h-full"
      >
        <div className="relative overflow-hidden bg-surface-container-low">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-[320px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-on-surface-variant">
            <span className="inline-flex rounded-full border border-outline-variant/50 bg-surface-container px-3 py-1 text-label-sm font-label-sm uppercase tracking-[0.16em]">
              {product.category}
            </span>
            <span className="text-label-sm font-label-sm text-on-surface-variant">
              {product.rating?.toFixed(1) ?? '0.0'} ★
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-headline-md font-headline-md text-primary">
              {product.name}
            </h3>
            <p className="max-h-[5.2rem] overflow-hidden text-body-md text-on-surface-variant leading-7">
              {product.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-headline-md font-headline-md text-primary">
              ${product.price.toFixed(2)}
            </p>
            <span className={`text-label-sm font-label-sm ${product.stock > 0 ? 'text-on-surface-variant' : 'text-error'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
