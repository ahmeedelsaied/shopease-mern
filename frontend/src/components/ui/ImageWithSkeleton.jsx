import { memo, useState } from 'react';
import { cn } from '../../styles/designSystem';
import { Skeleton } from './Skeleton';

const ImageWithSkeleton = memo(({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  skeletonClassName = '',
  onLoad,
  onError,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-surface-container-low', wrapperClassName)}>
      {!loaded ? (
        <Skeleton className={cn('absolute inset-0 h-full w-full rounded-none', skeletonClassName)} />
      ) : null}
      <img
        src={src}
        alt={alt}
        {...props}
        className={cn(
          'h-full w-full object-cover opacity-0 transition-opacity duration-500',
          loaded && 'opacity-100',
          className
        )}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setLoaded(true);
          onError?.(event);
        }}
      />
    </div>
  );
});

ImageWithSkeleton.displayName = 'ImageWithSkeleton';

export default ImageWithSkeleton;
