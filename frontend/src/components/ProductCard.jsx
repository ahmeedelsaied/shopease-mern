import Card from './ui/Card';

const ProductCard = ({ product }) => {
  return (
    <Card variant="product" className="group overflow-hidden shadow-soft">
      <div className="relative overflow-hidden bg-surface-container-low">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-[300px] object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 text-on-surface-variant">
          <span className="text-label-sm font-label-sm uppercase tracking-[0.2em]">
            {product.category}
          </span>
          <span className="text-label-sm font-label-sm">
            {product.rating?.toFixed(1) ?? '0.0'} ★
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-headline-md font-headline-md text-primary">
            {product.name}
          </h3>
          <p className="text-body-md text-on-surface-variant leading-7">
            {product.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-headline-md font-headline-md text-primary">
            ${product.price.toFixed(2)}
          </p>
          <span
            className={`text-label-sm font-label-sm ${
              product.stock > 0 ? 'text-on-surface-variant' : 'text-error'
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
