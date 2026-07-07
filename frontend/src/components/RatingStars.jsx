import { useId, useState } from 'react';
import { cn } from '../styles/designSystem';

const clampRating = (value) => Math.min(5, Math.max(0, Number(value) || 0));
const roundToHalf = (value) => Math.round(clampRating(value) * 2) / 2;

const RatingStars = ({
  value = 0,
  onChange,
  readonly = false,
  size = 'md',
  label,
  className = '',
}) => {
  const labelId = useId();
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = roundToHalf(hoverValue || value);
  const starSize = size === 'lg' ? 'text-[30px]' : size === 'sm' ? 'text-[18px]' : 'text-[24px]';

  const handleKeyDown = (event) => {
    if (readonly || !onChange) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(Math.min(5, roundToHalf(value) + 0.5));
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(Math.max(0.5, roundToHalf(value) - 0.5));
    }

    if (event.key === 'Home') {
      event.preventDefault();
      onChange(0.5);
    }

    if (event.key === 'End') {
      event.preventDefault();
      onChange(5);
    }
  };

  const getPointerRating = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width;
    return Math.max(0.5, roundToHalf(position * 5));
  };

  const renderStars = () =>
    Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      const fillPercent = Math.max(0, Math.min(1, displayValue - index)) * 100;

      return (
        <span
          key={starValue}
          className={cn('relative inline-flex leading-none text-outline-variant', starSize)}
          aria-hidden="true"
        >
          <span className="material-symbols-outlined">star</span>
          <span className="absolute inset-0 overflow-hidden text-secondary" style={{ width: `${fillPercent}%` }}>
            <span className="material-symbols-outlined">star</span>
          </span>
        </span>
      );
    });

  if (readonly) {
    return (
      <div
        className={cn('inline-flex items-center gap-1', className)}
        role="img"
        aria-label={label || `${displayValue.toFixed(1)} out of 5 stars`}
      >
        {renderStars()}
      </div>
    );
  }

  return (
    <div className={cn('inline-flex flex-col gap-2', className)}>
      {label ? (
        <span id={labelId} className="text-label-sm font-label-sm text-on-surface-variant">
          {label}
        </span>
      ) : null}
      <div
        className="inline-flex cursor-pointer items-center gap-1 rounded-full px-1 py-0.5 outline-none transition-transform duration-200 hover:scale-[1.02] focus-visible:ring-4 focus-visible:ring-primary/10"
        role="slider"
        tabIndex={0}
        aria-valuemin={0.5}
        aria-valuemax={5}
        aria-valuenow={roundToHalf(value)}
        aria-valuetext={`${roundToHalf(value).toFixed(1)} out of 5 stars`}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : 'Select review rating'}
        onMouseLeave={() => setHoverValue(0)}
        onMouseMove={(event) => setHoverValue(getPointerRating(event))}
        onClick={(event) => onChange?.(getPointerRating(event))}
        onKeyDown={handleKeyDown}
      >
        {renderStars()}
      </div>
    </div>
  );
};

export default RatingStars;
