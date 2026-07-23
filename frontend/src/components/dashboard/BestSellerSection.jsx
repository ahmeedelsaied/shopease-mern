import { memo } from 'react';
import { Link } from 'react-router-dom';
import ImageWithSkeleton from '../ui/ImageWithSkeleton';
import DashboardSection from './DashboardSection';
import { cn, components } from '../../styles/designSystem';

const formatCurrency = (value) =>
  value != null && !Number.isNaN(Number(value))
    ? `$${Number(value).toFixed(2)}`
    : '—';

/**
 * BestSellerSection – renders the best-selling product card with image, units
 * sold, and revenue. Shows an empty state when no best seller is available
 * (e.g. no non-cancelled orders yet). Links through to the product edit page
 * in admin if a productId is present.
 */
const BestSellerSection = ({ bestSeller }) => {
  if (!bestSeller) {
    return (
      <DashboardSection title="Best Seller" subtitle="Most units sold">
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/50 p-6 text-center">
          <span className="material-symbols-outlined rounded-full bg-surface-container-high/60 p-3 text-[32px] text-on-surface-variant">
            inventory_2
          </span>
          <h3 className="mt-3 text-headline-sm font-headline-sm text-on-surface-variant">No best seller yet</h3>
          <p className="mt-1 text-sm text-on-surface-variant/80">Complete some orders to see your top product.</p>
        </div>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection
      title="Best Seller"
      subtitle={`${bestSeller.unitsSold.toLocaleString()} units sold · ${formatCurrency(bestSeller.revenue)} revenue`}
    >
      <Link
        to={bestSeller.productId ? `/admin/products/${bestSeller.productId}` : '#'}
        className="block group"
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            'shrink-0 w-24 h-24 rounded-[1rem] overflow-hidden bg-surface-container-low',
            'group-hover:shadow-lg transition-shadow duration-200'
          )}>
            <ImageWithSkeleton
              src={bestSeller.image || ''}
              alt={bestSeller.name}
              loading="lazy"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="text-body-md font-medium text-primary truncate">{bestSeller.name}</h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
              <span>Units sold: <span className="font-semibold text-on-surface">{bestSeller.unitsSold.toLocaleString()}</span></span>
              <span>Revenue: <span className="font-semibold text-primary">{formatCurrency(bestSeller.revenue)}</span></span>
              {bestSeller.price != null && (
                <span>Price: <span className="font-semibold text-on-surface">{formatCurrency(bestSeller.price)}</span></span>
              )}
              {bestSeller.stock != null && (
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  bestSeller.stock > 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                )}>
                  {bestSeller.stock > 0 ? `${bestSeller.stock} in stock` : 'Out of stock'}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </DashboardSection>
  );
};

BestSellerSection.displayName = 'BestSellerSection';

export default memo(BestSellerSection);