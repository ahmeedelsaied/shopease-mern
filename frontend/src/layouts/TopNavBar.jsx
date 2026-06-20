import { Link, NavLink } from 'react-router-dom';
import { cn, components } from '../styles/designSystem';

const navLinkClass = ({ isActive }) =>
  cn(
    'text-label-md font-label-md transition-colors hover:opacity-70',
    isActive
      ? 'text-primary font-semibold border-b border-primary pb-1'
      : 'text-on-surface-variant hover:text-primary'
  );

const TopNavBar = () => {
  return (
    <nav className="fixed top-0 w-full z-[100] bg-surface/80 backdrop-blur-3xl border-b-[0.5px] border-outline-variant/30">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center h-16">
        <Link
          to="/"
          className="text-headline-md font-headline-md font-bold tracking-tighter text-primary"
        >
          ShopEase
        </Link>

        <ul className="hidden md:flex gap-8 items-center">
          <li>
            <NavLink to="/" className={navLinkClass} end>
              Shop
            </NavLink>
          </li>
          <li>
            <NavLink to="/" className={navLinkClass}>
              Featured
            </NavLink>
          </li>
          <li>
            <NavLink to="/" className={navLinkClass}>
              Discover
            </NavLink>
          </li>
        </ul>

        <div className="flex gap-4 text-primary">
          <Link to="/cart" aria-label="Shopping bag" className={components.button.icon}>
            <span className="material-symbols-outlined">shopping_bag</span>
          </Link>
          <Link to="/login" aria-label="Account" className={components.button.icon}>
            <span className="material-symbols-outlined">person</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
