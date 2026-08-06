import { useEffect, useMemo, useState } from 'react';

/**
 * Ordered palette for multi-series charts (pie slices, category bars). The
 * hexes mirror Tailwind's 500-shade tokens already used for the dashboard stat
 * cards and order-status badges, so charts read as part of the same design
 * system rather than a Recharts default. Picked to stay WCAG-AA distinguishable
 * on both the light (`#ffffff`/`#f6f3f5`) and dark surface containers.
 */
export const CHART_COLORS = [
  '#10b981', // emerald-500  — revenue/positive
  '#2563eb', // blue-600     — secondary, matches design-system `secondary`
  '#f59e0b', // amber-500    — pending
  '#6366f1', // indigo-500   — shipped
  '#8b5cf6', // violet-500   — out_for_delivery
  '#3b82f6', // blue-500     — processing
  '#f43f5e', // rose-500     — cancelled / negative
  '#0f172a', // primary       — neutral headline
];

/**
 * Per-status colour map, reused across the pie chart and any status legend so
 * the colour for "delivered" is the same emerald wherever it appears. Lifted
 * from the badge palette in `LatestOrdersSection.jsx` to keep chart semantics
 * in lockstep with the status badge semantics on the existing dashboard.
 */
export const STATUS_COLOR = {
  pending: '#f59e0b',
  confirmed: '#2563eb',
  processing: '#3b82f6',
  shipped: '#6366f1',
  out_for_delivery: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#f43f5e',
};

/**
 * Friendly display label for an order-status value. Matches the title-case +
 * underscore-to-space formatting already used by `LatestOrdersSection`.
 */
const formatStatusLabel = (status) =>
  status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

export const statusLabel = formatStatusLabel;

/**
 * `useChartTheme` — returns Recharts-friendly theme tokens (axis/grid stroke,
 * tooltip inline style) for the current light/dark mode. The app toggles dark
 * mode by toggling the `dark` class on `document.documentElement` directly
 * (see `layouts/TopNavBar.jsx`) without a React context, so charts cannot
 * subscribe via props. A `MutationObserver` on the root `<html>` `class`
 * attribute is the cheapest way to re-render the affected chart wrappers when
 * the user flips the theme — cheaper than hoisting theme into context (which
 * would touch `TopNavBar` and break the "do not modify customer-facing pages"
 * constraint).
 */
export const useChartTheme = () => {
  const getMode = () =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
  const [mode, setMode] = useState(getMode);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const element = document.documentElement;
    const observer = new MutationObserver((mutations) => {
      const classMutation = mutations.find(
        (mutation) => mutation.attributeName === 'class'
      );
      if (classMutation) setMode(getMode());
    });
    observer.observe(element, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return useMemo(() => {
    const isDark = mode === 'dark';
    return {
      mode,
      axisStroke: isDark ? '#cfc4c5' : '#4c4546',
      gridStroke: isDark ? 'rgba(207, 196, 197, 0.18)' : 'rgba(126, 117, 118, 0.18)',
      // The donut's slice separator stroke matches the card surface so the
      // segments visually fuse with their containing panel rather than reading
      // as a separate bordered shape.
      surfaceStroke: isDark ? '#1e293b' : '#ffffff',
      tooltipStyle: {
        background: isDark ? '#1e293b' : '#ffffff',
        border: `1px solid ${isDark ? '#475569' : '#cfc4c5'}`,
        borderRadius: '0.75rem',
        color: isDark ? '#f3f0f2' : '#1b1b1d',
        fontSize: '0.8rem',
        padding: '0.5rem 0.75rem',
      },
    };
  }, [mode]);
};
