import { cn, components } from '../../styles/designSystem';

const variantMap = {
  primary: cn(components.button.base, components.button.primary, components.button.sizes.default),
  'primary-solid': cn(components.button.base, components.button.primarySolid, components.button.sizes.compact),
  'primary-bag': cn(components.button.base, components.button.primarySolid, components.button.sizes.bag, 'w-full gap-2'),
  secondary: cn(components.button.base, components.button.secondary, components.button.sizes.default),
  outline: cn(components.button.base, components.button.secondary, components.button.sizes.compact),
  ghost: cn(components.button.base, components.button.ghost, components.button.sizes.compact, 'w-full'),
  checkout: cn(components.button.base, components.button.primarySolid, components.button.sizes.checkout, 'w-full'),
  chip: cn(components.button.chip, components.button.chipInactive),
  'chip-active': cn(components.button.chip, components.button.chipActive),
  icon: components.button.icon,
};

const sizeMap = {
  sm: 'px-3 py-2 min-h-9 text-sm',
  md: '',
  lg: 'px-6 py-4 min-h-12',
};

const Button = ({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  icon,
  loading = false,
  disabled = false,
  size = 'md',
  ...props
}) => {
  const isDisabled = disabled || loading;
  const classes = cn(variantMap[variant] || variantMap.primary, sizeMap[size] || '', className);

  if (variant === 'icon') {
    return (
      <button type={type} className={classes} disabled={isDisabled} {...props}>
        {loading ? (
          <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
        ) : icon ? (
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        ) : (
          children
        )}
      </button>
    );
  }

  return (
    <button type={type} className={classes} disabled={isDisabled} {...props}>
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
