import { cn, components } from '../../styles/designSystem';

const Input = ({
  variant = 'underline',
  label,
  id,
  className = '',
  wrapperClassName = '',
  error = '',
  helperText = '',
  ...props
}) => {
  const inputClassName = cn(
    components.input.underline,
    error && 'border-error focus:border-error focus:ring-error/10',
    className
  );

  if (variant === 'floating') {
    return (
      <div className={cn('group relative', wrapperClassName)}>
        <input
          id={id}
          className={cn(components.input.floating, className)}
          placeholder={label}
          {...props}
        />
        {label ? (
          <label htmlFor={id} className={components.input.floatingLabel}>
            {label}
          </label>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', wrapperClassName)}>
      {label ? (
        <label htmlFor={id} className={components.input.label}>
          {label}
        </label>
      ) : null}
      <input id={id} className={inputClassName} {...props} />
      {error || helperText ? (
        <p className={cn('text-sm', error ? 'text-error' : 'text-on-surface-variant')}>
          {error || helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
