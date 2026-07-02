import { cn } from '../../styles/designSystem';

const Skeleton = ({ className = '', ...props }) => (
  <div
    className={cn('animate-pulse rounded-xl bg-surface-container-high/70', className)}
    {...props}
  />
);

const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={cn('w-full space-y-2', className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        className={cn('h-4', index === lines - 1 ? 'w-3/4' : 'w-full')}
      />
    ))}
  </div>
);

const SkeletonCard = ({ className = '' }) => (
  <div
    className={cn(
      'animate-pulse rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6 shadow-soft',
      className
    )}
  >
    <Skeleton className="h-40 w-full rounded-2xl" />
    <div className="mt-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <SkeletonText lines={2} className="max-w-[90%]" />
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  </div>
);

export { Skeleton, SkeletonText, SkeletonCard };
export default Skeleton;
