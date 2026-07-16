import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { WishlistSkeleton } from '../components/ui/Skeleton';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';

const RecentlyViewed = () => {
  const { recentlyViewedItems, itemCount, hydrated, clearRecentlyViewed } = useRecentlyViewed();
  const showLoading = !hydrated;
  const isEmpty = !showLoading && itemCount === 0;

  return (
    <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mx-auto max-w-container-max space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Browsing history</p>
            <h1 className="text-headline-lg font-headline-lg text-primary">Recently Viewed</h1>
            <p className="max-w-2xl text-body-md text-on-surface-variant">
              Products you have viewed are saved here so you can easily find them again.
            </p>
          </div>

          {!isEmpty ? (
            <div className="flex flex-wrap gap-3">
              <Link to="/">
                <Button variant="secondary">Continue shopping</Button>
              </Link>
              <Button variant="ghost" onClick={clearRecentlyViewed}>
                Clear history
              </Button>
            </div>
          ) : null}
        </div>

        {showLoading ? (
          <WishlistSkeleton />
        ) : isEmpty ? (
          <EmptyState
            icon="history"
            title="No recently viewed products"
            description="Products you view on their detail page will appear here automatically."
            actionLabel="Explore products"
            actionTo="/"
          />
        ) : (
          <Card variant="panel" className="bg-surface-container-low/70 p-4 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-body-md text-on-surface-variant">
                {itemCount} product{itemCount === 1 ? '' : 's'}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-3">
              {recentlyViewedItems.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecentlyViewed;
