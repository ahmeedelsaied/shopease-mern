import { memo } from 'react';
import { ChartSkeleton } from '../../ui/Skeleton';

/**
 * LoadingOrchestrator – the loading state for `AnalyticsSection`. Renders the
 * same grid layout the populated section uses (one full-width panel, one
 * full-width panel, then a 2-up row) so the page does not reflow when the real
 * charts swap in. Kept as its own component so `AnalyticsSection` can hand the
 * same element to both the section-level loading branch and each chart's
 * `Suspense` fallback without re-allocating it.
 */
const LoadingOrchestrator = () => (
  <div className="space-y-6" aria-busy="true">
    <ChartSkeleton height={280} />
    <ChartSkeleton height={260} />
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartSkeleton height={260} />
      <ChartSkeleton height={260} />
    </div>
  </div>
);

LoadingOrchestrator.displayName = 'LoadingOrchestrator';

export default memo(LoadingOrchestrator);
