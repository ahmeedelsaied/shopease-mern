import { cn, components } from '../../styles/designSystem';

const variantMap = {
  product: components.card.product,
  panel: components.card.panel,
  summary: components.card.summary,
  login: cn(components.card.login, 'shadow-invisible'),
  featured: components.card.featured,
};

const Card = ({ children, variant = 'panel', className = '', as: Component = 'div', ...props }) => (
  <Component className={cn(variantMap[variant] || variantMap.panel, className)} {...props}>{children}</Component>
);

export default Card;
