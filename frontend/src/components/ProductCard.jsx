import { Link } from 'react-router-dom';
import Card from './ui/Card';

const ProductCard = ({ product }) => {
  const isInStock = product.stock > 0;

  return (
    <Link to={`/products/${product._id}`} className="group block h-full" aria-label={`View details for ${product.name}`}>
      <Card variant="product" className="flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <span className="rounded-full border border-outline-variant/40 bg-surface-container-lowest/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant backdrop-blur">
              {product.category}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isInStock ? 'bg-emerald-500/90 text-on-primary' : 'bg-rose-500/90 text-on-primary'}`}>
              {isInStock ? 'In stock' : 'Sold out'}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-inverse-surface/70 to-transparent p-4 text-on-surface opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="text-sm font-semibold">Quick view</span>
            <span className="rounded-full border border-outline-variant/30 p-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface">east</span>
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col space-y-4 p-6">
          <div className="flex items-center justify-between gap-3 text-on-surface-variant">
            <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
              <span className="material-symbols-outlined text-[16px] text-secondary">star</span>
              <span>{product.rating?.toFixed(1) ?? '0.0'}</span>
            </div>
            <span className="text-sm text-on-surface-variant">
              {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-headline-md font-headline-md text-primary">{product.name}</h3>
            <p className="line-clamp-3 text-body-md leading-7 text-on-surface-variant">{product.description}</p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <p className="text-headline-md font-headline-md text-primary">${product.price.toFixed(2)}</p>
            <button type="button" className="rounded-full border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-high">
              Add
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
