import { cn, components } from '../../styles/designSystem';

const variantMap = {
  product: components.card.product,
  panel: components.card.panel,
  summary: components.card.summary,
  login: cn(components.card.login, 'shadow-invisible'),
  featured: components.card.featured,
};

const Card = ({
  children,
  variant = 'panel',
  className = '',
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component
      className={cn(variantMap[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
