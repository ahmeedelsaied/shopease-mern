import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SEO from '../components/SEO';
import { NOINDEX_ROBOTS } from '../seo/seoDefaults';
import { WishlistSkeleton } from '../components/ui/Skeleton';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
  const { wishlistItems, itemCount, loading, hydrated, clearWishlist } = useWishlist();
  const showLoading = loading || !hydrated;
  const isEmpty = !showLoading && itemCount === 0;

  return (
    <div className="page-shell">
      <SEO title="Wishlist" robots={NOINDEX_ROBOTS} />
      <div className="mx-auto max-w-container-max space-y-10">
        <div className="flex flex-col gap-5 border-b border-outline-variant/40 pb-8 md:flex-row md:items-end md:justify-between"><div className="max-w-2xl"><p className="eyebrow">Saved for later</p><h1 className="mt-3 font-display-lg text-5xl leading-none text-primary">Your edit.</h1><p className="mt-4 text-body-md text-on-surface-variant">Keep the pieces you love close. Your picks stay on this device and sync when you sign in.</p></div>{!isEmpty && <div className="flex flex-wrap gap-2"><Link to="/"><Button variant="secondary" icon="arrow_back">Continue shopping</Button></Link><Button variant="ghost" onClick={clearWishlist}>Clear wishlist</Button></div>}</div>
        {showLoading ? <WishlistSkeleton /> : isEmpty ? <EmptyState icon="favorite" title="Your wishlist is empty" description="Tap the heart on any product to save it here. Your edit is waiting to take shape." actionLabel="Explore products" actionTo="/" /> : <Card variant="panel" className="bg-surface-container-low/70 p-4 md:p-7"><div className="mb-6 flex items-center justify-between"><p className="text-sm font-semibold text-on-surface-variant">{itemCount} saved product{itemCount === 1 ? '' : 's'}</p><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">Your shortlist</span></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{wishlistItems.map((product) => <ProductCard key={product._id || product.id} product={product} />)}</div></Card>}
      </div>
    </div>
  );
};

export default Wishlist;
