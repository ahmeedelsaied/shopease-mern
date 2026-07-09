import { memo } from 'react';
import { cn } from '../../styles/designSystem';

const Skeleton = ({ className = '', ...props }) => (
  <div
    className={cn('animate-pulse rounded-xl bg-surface-container-high/80 dark:bg-surface-container-high/20', className)}
    aria-hidden="true"
    {...props}
  />
);

const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={cn('w-full space-y-2', className)} aria-hidden="true">
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        className={cn('h-4', index === lines - 1 ? 'w-3/4' : 'w-full')}
      />
    ))}
  </div>
);

const ProductCardSkeleton = memo(({ className = '' }) => (
  <div
    className={cn(
      'h-full overflow-hidden rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest shadow-soft',
      className
    )}
  >
    <Skeleton className="aspect-[4/5] w-full rounded-none" />
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-7 w-3/4" />
      <SkeletonText lines={3} />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-10 w-16 rounded-full" />
      </div>
    </div>
  </div>
));

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

const ProductDetailsSkeleton = () => (
  <div className="px-margin-mobile py-stack-xl md:px-margin-desktop" aria-busy="true">
    <div className="mx-auto max-w-container-max space-y-8">
      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-4 w-24" />
        <Skeleton className="mx-auto h-8 w-56" />
        <SkeletonText lines={3} className="mx-auto max-w-2xl" />
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
        <Skeleton className="h-[520px] w-full rounded-[1.75rem]" />
        <div className="space-y-8 rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-soft">
          <div className="space-y-4">
            <Skeleton className="h-14 w-44" />
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-6 w-64" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
          <SkeletonText lines={5} />
        </div>
      </div>
      <ReviewSkeleton />
    </div>
  </div>
);

const CartSkeleton = () => (
  <div className="px-margin-mobile py-stack-xl md:px-margin-desktop" aria-busy="true">
    <div className="mx-auto max-w-container-max space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-4 rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-4 md:flex-row md:items-center">
              <Skeleton className="h-24 w-24 rounded-[1.25rem]" />
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-10 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-48 rounded-[1.75rem]" />
      </div>
    </div>
  </div>
);

const WishlistSkeleton = () => (
  <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
    {Array.from({ length: 6 }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

const OrdersSkeleton = () => (
  <div className="px-margin-mobile py-stack-xl md:px-margin-desktop" aria-busy="true">
    <div className="mx-auto max-w-container-max space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <SkeletonText lines={2} className="max-w-md" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-52" />
              </div>
              <div className="space-y-2 md:flex md:flex-col md:items-end">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProfileSkeleton = () => (
  <div className="px-margin-mobile py-stack-xl md:px-margin-desktop" aria-busy="true">
    <div className="mx-auto max-w-container-max space-y-6">
      <div className="rounded-[2rem] border border-outline-variant/30 bg-surface-container-low/80 p-8 shadow-soft">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-3 h-5 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
          <Skeleton className="h-7 w-40" />
          <SkeletonText lines={3} className="mt-4" />
        </div>
        <div className="rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="mt-4 h-11 w-full rounded-full" />
          <Skeleton className="mt-3 h-11 w-full rounded-full" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <FormSkeleton />
        <FormSkeleton />
      </div>
    </div>
  </div>
);

const FormSkeleton = () => (
  <div className="rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
    <Skeleton className="h-7 w-36" />
    <div className="mt-4 space-y-4">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  </div>
);

const ReviewSkeleton = () => (
  <div className="space-y-4" aria-busy="true">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-soft">
        <div className="flex gap-4">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
            <SkeletonText lines={2} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const CategorySkeleton = ({ count = 6 }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
        <Skeleton className="h-24 rounded-[1.25rem]" />
        <Skeleton className="mt-5 h-7 w-36" />
        <SkeletonText lines={2} className="mt-2" />
      </div>
    ))}
  </div>
);

const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <div className="overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-surface-container-lowest shadow-soft" aria-busy="true">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-outline-variant/40 text-left">
        <thead className="bg-surface-container-low">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-4 py-4">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, columnIndex) => (
                <td key={columnIndex} className="px-4 py-4">
                  <Skeleton className={cn('h-5', columnIndex === 0 ? 'w-44' : 'w-24')} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DashboardSkeleton = ({ count = 4 }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-busy="true">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
          <Skeleton className="h-14 w-14 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

const SkeletonCard = ProductCardSkeleton;

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  ProductCardSkeleton,
  ProductDetailsSkeleton,
  CartSkeleton,
  WishlistSkeleton,
  OrdersSkeleton,
  ProfileSkeleton,
  ReviewSkeleton,
  CategorySkeleton,
  TableSkeleton,
  DashboardSkeleton,
};

export default Skeleton;

