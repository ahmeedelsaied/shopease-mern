import { memo } from 'react';
import { Link } from 'react-router-dom';
import Card from './ui/Card';
import ImageWithSkeleton from './ui/ImageWithSkeleton';
import Highlight from './Highlight';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../styles/designSystem';

const ProductCard = memo(({ product, searchTerm = '' }) => {
  const productId = product._id || product.id;
  const isInStock = Number(product.stock) > 0;
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();
  const wished = isInWishlist(product);
  const rating = Number(product.averageRating ?? product.rating ?? 0);
  const price = Number(product.price) || 0;

  const handleWishlistToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isInStock) {
      addToCart(product);
      toast.success('Product added to cart');
    }
  };

  return (
    <Card variant="product" className="group flex h-full flex-col overflow-hidden">
      <div className="relative overflow-hidden bg-surface-container">
        <Link to={`/products/${productId}`} className="block" aria-label={`View details for ${product.name}`}>
          <ImageWithSkeleton src={product.image} alt={product.name} loading="lazy" decoding="async" wrapperClassName="relative aspect-[4/4.7]" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <span className="rounded-full bg-surface-container-lowest/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary shadow-sm backdrop-blur"><Highlight text={product.category || 'Essential'} term={searchTerm} /></span>
            <span className={cn('rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm', isInStock ? 'bg-primary text-primary-fixed' : 'bg-error text-on-error')}>{isInStock ? 'In stock' : 'Sold out'}</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-primary/80 via-primary/10 to-transparent p-4 pt-16 text-on-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"><span className="text-xs font-bold uppercase tracking-[0.14em]">View details</span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest text-primary"><span className="material-symbols-outlined text-[18px]">arrow_outward</span></span></div>
        </Link>
        <button type="button" onClick={handleWishlistToggle} className={cn('absolute right-4 top-12 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/45 bg-surface-container-lowest/90 text-primary shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/20 active:scale-95', wished && 'border-secondary bg-secondary text-on-secondary shadow-lg shadow-secondary/20')} aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} aria-pressed={wished}><span className={cn('material-symbols-outlined text-[20px]', wished && 'fill-current')}>favorite</span></button>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-1.5 text-sm font-bold text-primary"><span className="material-symbols-outlined text-[16px] text-secondary">star</span><span>{Number.isFinite(rating) ? rating.toFixed(1) : '0.0'}</span><span className="text-xs font-normal text-on-surface-variant">({product.reviewsCount ?? 0})</span></div><span className="text-xs font-semibold text-on-surface-variant">{isInStock ? `${product.stock} left` : 'Unavailable'}</span></div>
        <div className="space-y-2"><Link to={`/products/${productId}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/20"><h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-[-0.025em] text-primary transition-colors group-hover:text-secondary"><Highlight text={product.name} term={searchTerm} /></h3></Link><p className="line-clamp-2 text-sm leading-6 text-on-surface-variant"><Highlight text={product.description || 'A considered essential for your everyday.'} term={searchTerm} /></p></div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-outline-variant/25 pt-4"><p className="text-xl font-bold tracking-[-0.03em] text-primary">${price.toFixed(2)}</p><button type="button" onClick={handleAddToCart} disabled={!isInStock} className={cn('rounded-full px-4 py-2.5 text-xs font-bold transition-all active:scale-[0.97]', isInStock ? 'bg-primary text-on-primary hover:bg-secondary' : 'cursor-not-allowed bg-surface-container text-on-surface-variant/60')}>{isInStock ? 'Add to bag' : 'Sold out'}</button></div>
      </div>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
