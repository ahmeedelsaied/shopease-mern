import { memo } from 'react';
import { cn } from '../../styles/designSystem';

/**
 * DashboardSection – reusable card wrapper for analytics sections. Renders a
 * `<Card variant="panel">` with an optional title and subtitle, consistent
 * padding, and a slot for children. Matches the existing stat-card chassis
 * (rounded-[1.75rem], border, surface, shadow-soft, p-6) so new analytics
 * tiles visually unify with the original 4-card header grid.
 *
 * @param {object} props
 * @param {string} [props.title] - Section title (headline-sm, text-primary).
 * @param {string} [props.subtitle] - Optional subtitle (text-sm, on-surface-variant).
 * @param {React.ReactNode} props.children - Section content.
 * @param {string} [props.className] - Additional Tailwind classes.
 * @returns {JSX.Element}
 */
const DashboardSection = ({ title, subtitle, children, className = '' }) => {
  return (
    <Card variant="panel" className={cn('p-6', className)}>
      {(title || subtitle) ? (
        <div className="mb-4">
          {title && (
            <h2 className="text-headline-sm font-headline-sm text-primary">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
          )}
        </div>
      ) : null}
      {children}
    </Card>
  );
};

DashboardSection.displayName = 'DashboardSection';

export default memo(DashboardSection);