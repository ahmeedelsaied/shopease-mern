import { cn, components } from '../../styles/designSystem';

const Input = ({
  variant = 'underline',
  label,
  id,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  if (variant === 'floating') {
    return (
      <div className={cn('relative group', wrapperClassName)}>
        <input
          id={id}
          className={cn(components.input.floating, className)}
          placeholder={label}
          {...props}
        />
        <label
          htmlFor={id}
          className={components.input.floatingLabel}
        >
          {label}
        </label>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-unit', wrapperClassName)}>
      {label && (
        <label htmlFor={id} className={components.input.label}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(components.input.underline, className)}
        {...props}
      />
    </div>
  );
};

export default Input;
