import { Link } from 'react-router-dom';
import Button from './ui/Button';
import { cn } from '../styles/designSystem';

const EmptyState = ({ icon, title, description, actionLabel, onAction, actionTo, className = '' }) => (
  <div className={cn('relative overflow-hidden rounded-[2rem] border border-outline-variant/40 bg-surface-container-lowest p-8 text-center shadow-soft sm:p-12', className)}>
    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />
    {icon ? <div className="relative mb-5 flex justify-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container/45 text-secondary"><span className="material-symbols-outlined text-[30px]">{icon}</span></span></div> : null}
    <h2 className="relative font-display-lg text-3xl leading-tight text-primary">{title}</h2>
    <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-on-surface-variant">{description}</p>
    {actionLabel ? <div className="relative mt-6 flex justify-center">{onAction ? <Button variant="primary" onClick={onAction} icon="arrow_forward">{actionLabel}</Button> : actionTo ? <Link to={actionTo}><Button variant="primary" icon="arrow_forward">{actionLabel}</Button></Link> : null}</div> : null}
  </div>
);

export default EmptyState;
