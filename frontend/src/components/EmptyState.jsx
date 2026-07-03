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
  return (
    <div className={cn('rounded-[2rem] border border-outline-variant/30 bg-gradient-to-br from-surface-container-low to-surface-container-lowest p-10 text-center shadow-soft', className)}>
      {icon ? (
        <div className="mb-5 flex justify-center">
          <span className="material-symbols-outlined rounded-full bg-primary/10 p-4 text-[40px] text-primary">{icon}</span>
        </div>
      ) : null}
      <h2 className="text-headline-sm font-headline-sm text-primary">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-body-md text-on-surface-variant">{description}</p>
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
};

export default EmptyState;
