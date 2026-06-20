import { cn, components } from '../../styles/designSystem';

const variantMap = {
  primary: cn(
    components.button.base,
    components.button.primary,
    components.button.sizes.default
  ),
  'primary-solid': cn(
    components.button.base,
    components.button.primarySolid,
    components.button.sizes.compact
  ),
  'primary-bag': cn(
    components.button.base,
    components.button.primarySolid,
    components.button.sizes.bag,
    'w-full gap-2'
  ),
  secondary: cn(
    components.button.base,
    components.button.secondary,
    components.button.sizes.default
  ),
  ghost: cn(
    components.button.base,
    components.button.ghost,
    components.button.sizes.compact,
    'w-full'
  ),
  checkout: cn(
    components.button.base,
    components.button.primarySolid,
    components.button.sizes.checkout,
    'w-full'
  ),
  chip: cn(components.button.chip, components.button.chipInactive),
  'chip-active': cn(components.button.chip, components.button.chipActive),
  icon: components.button.icon,
};

const Button = ({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  icon,
  ...props
}) => {
  const classes = cn(variantMap[variant] || variantMap.primary, className);

  if (variant === 'icon') {
    return (
      <button type={type} className={classes} {...props}>
        {icon ? (
          <span className="material-symbols-outlined">{icon}</span>
        ) : (
          children
        )}
      </button>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {icon && (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button;
