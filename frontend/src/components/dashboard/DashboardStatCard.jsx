import { memo } from 'react';
import { cn } from '../../styles/designSystem';
import Card from '../ui/Card';

/**
 * Decorative tone for a stat card's icon chip. `primary` mirrors the existing
 * dashboard look; the rest let secondary metrics carry a semantic colour
 * (e.g. `delivered` green, `cancelled` rose) without introducing a new visual
 * language — the chip shape, size, and the surrounding card are unchanged.
 */
const TONE_CLASSES = {
  primary: 'bg-primary/10 text-primary',
  revenue: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'bg-secondary/10 text-secondary',
};

/**
 * resolveToneValue – formats the raw stat value for display. Money values use
 * `isCurrency` to render with a `$` and two decimals; counters render as-is.
 * Returned as a string so the memo boundary holds across re-renders.
 */
const formatStatValue = (value, { isCurrency = false } = {}) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const numeric = Number(value);
  if (isCurrency) return `$${numeric.toFixed(2)}`;
  return String(numeric.toLocaleString());
};

/**
 * DashboardStatCard – single KPI tile reusing the existing dashboard card look
 * (`Card variant="panel"` + the `material-symbols-outlined` icon chip). It
 * preserves the AdminDashboard's current label/value/icon layout verbatim so
 * existing cards look identical when migrated to this component.
 *
 * Props are intentionally minimal: every visual decision (tone, currency) is
 * driven by the data passed in, and the component owns no fetch/state — it is
 * a pure presentational leaf, memoized so a parent re-render with stable props
 * does not re-paint it.
 *
 * @param {object} props
 * @param {string} props.label       - Uppercase eyebrow label (e.g. "Total Revenue").
 * @param {string} props.value       - Raw numeric value (number|string|number|null).
 * @param {string} props.icon        - Material Symbols icon name.
 * @param {string} [props.tone="primary"] - Semantic tone for the icon chip.
 * @param {boolean} [props.isCurrency=false] - Render value as USD currency.
 * @param {string} [props.helper]   - Optional helper line under the value.
 * @param {string} [props.className]
 */
const DashboardStatCard = ({
  label,
  value,
  icon,
  tone = 'primary',
  isCurrency = false,
  helper,
  className = '',
}) => {
  const toneClass = TONE_CLASSES[tone] ?? TONE_CLASSES.primary;

  return (
    <Card variant="panel" className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
            {label}
          </p>
          <p className="mt-3 text-headline-lg font-headline-lg text-primary" aria-live="polite">
            {formatStatValue(value, { isCurrency })}
          </p>
          {helper ? (
            <p className="mt-1 text-sm text-on-surface-variant/80">{helper}</p>
          ) : null}
        </div>
        <span
          aria-hidden="true"
          className={cn(
            'material-symbols-outlined shrink-0 rounded-full p-3 text-[28px]',
            toneClass
          )}
        >
          {icon}
        </span>
      </div>
    </Card>
  );
};

DashboardStatCard.displayName = 'DashboardStatCard';

export default memo(DashboardStatCard);
