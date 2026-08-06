import { memo } from 'react';
import DashboardSection from '../DashboardSection';
import { ChartSkeleton } from '../../ui/Skeleton';
import { cn } from '../../../styles/designSystem';

/**
 * ChartCard – the shared chassis for every analytics chart. It wraps a
 * `DashboardSection` and centralises the loading / empty / populated triad so
 * each chart component only has to render its Recharts subtree. Reusing the
 * existing panel styling keeps charts visually unified with the rest of the
 * dashboard (BestSellerSection, LatestOrdersSection, etc.) rather than
 * introducing a second card variant.
 *
 * @param {object} props
 * @param {string} props.title       - Chart headline (renders as the panel h2).
 * @param {string} [props.subtitle]  - Optional one-line description.
 * @param {boolean} [props.isLoading=false] - Show the chart skeleton placeholder.
 * @param {boolean} [props.isEmpty=false]   - Render the inline empty state.
 * @param {string} [props.emptyMessage]    - Message shown when `isEmpty` is true.
 * @param {number} [props.skeletonHeight=280] - Height of the loading skeleton.
 * @param {React.ReactNode} props.children  - The chart subtree (Recharts).
 * @param {string} [props.className]
 */
const ChartCard = ({
  title,
  subtitle,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data available yet.',
  skeletonHeight = 280,
  children,
  className = '',
}) => {
  return (
    <DashboardSection
      title={title}
      subtitle={subtitle}
      className={cn('flex flex-col', className)}
    >
      {/* The chart SVG is decorative — the panel heading already names the
          chart and tooltips carry the per-point data — so the container stays
          plain (no duplicate aria-label, no keyboard tab-stop) to avoid
          screen-readers announcing the title twice. */}
      {isLoading ? (
        <ChartSkeleton height={skeletonHeight} />
      ) : isEmpty ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/50 py-8 text-center">
          <span className="material-symbols-outlined rounded-full bg-surface-container-high/60 p-3 text-[32px] text-on-surface-variant">
            insights
          </span>
          <h3 className="mt-3 text-headline-sm font-headline-sm text-on-surface-variant">
            Nothing to chart yet
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant/80">{emptyMessage}</p>
        </div>
      ) : (
        // Recharts' SVG has no built-in a11y semantics — hide it from AT so
        // screen-readers skip the decorative shape and rely on the panel
        // heading plus the tooltip text for meaning.
        <div aria-hidden="true">{children}</div>
      )}
    </DashboardSection>
  );
};

ChartCard.displayName = 'ChartCard';

export default memo(ChartCard);
