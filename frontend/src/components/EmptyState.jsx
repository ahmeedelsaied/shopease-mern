import { Link } from 'react-router-dom';
import Button from './ui/Button';
import { cn } from '../styles/designSystem';

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
  className = '',
}) => {
  const content = (
    <div className={cn('rounded-3xl border border-outline-variant/30 bg-surface-container-low p-10 text-center shadow-soft', className)}>
      {icon ? (
        <div className="mb-4 flex justify-center">
          <span className="material-symbols-outlined text-[40px] text-primary">{icon}</span>
        </div>
      ) : null}
      <h2 className="text-headline-sm font-headline-sm text-primary">{title}</h2>
      <p className="mt-3 text-body-md text-on-surface-variant">{description}</p>
      {actionLabel ? (
        <div className="mt-6 flex justify-center">
          {onAction ? (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : actionTo ? (
            <Link to={actionTo}>
              <Button variant="primary">{actionLabel}</Button>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return content;
};

export default EmptyState;
