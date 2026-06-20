import { cn, components } from '../../styles/designSystem';

const Loader = ({
  variant = 'skeleton',
  className = '',
  lines = 3,
}) => {
  if (variant === 'spinner') {
    return (
      <span
        className={cn(
          'material-symbols-outlined animate-spin text-[20px] text-primary',
          className
        )}
        role="status"
        aria-label="Loading"
      >
        progress_activity
      </span>
    );
  }

  if (variant === 'product') {
    return (
      <div
        className={cn(
          'absolute inset-0 z-20 flex flex-col gap-4 bg-surface-container-lowest transition-opacity duration-500',
          className
        )}
        role="status"
        aria-label="Loading"
      >
        <div
          className={cn(
            'w-full aspect-[4/5]',
            components.loader.skeletonBlock
          )}
        />
        <div className={cn('w-3/4 h-5 rounded', components.loader.skeleton)} />
        <div className={cn('w-1/4 h-4 rounded', components.loader.skeleton)} />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)} role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-4 rounded',
            components.loader.skeleton,
            index === 0 ? 'w-full' : index === 1 ? 'w-3/4' : 'w-1/2'
          )}
        />
      ))}
    </div>
  );
};

export default Loader;
