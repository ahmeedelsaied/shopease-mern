import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn, components } from '../styles/designSystem';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  cn(
    "text-label-md font-label-md transition-colors hover:opacity-70",
    isActive
      ? "text-primary font-semibold border-b border-primary pb-1"
      : "text-on-surface-variant hover:text-primary",
  );

const TopNavBar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

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
          <div className="relative">
            <Link
              to="/cart"
              aria-label="Shopping bag"
              className={components.button.icon}
            >
              <span className="material-symbols-outlined">shopping_bag</span>
            </Link>

            <CartBadge />
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Account menu"
              className={components.button.icon}
              onClick={() => setOpen((prev) => !prev)}
            >
              <span className="material-symbols-outlined">person</span>
            </button>

            {open ? (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-2 shadow-lg">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-on-surface-variant">Hello, {user.name}</div>
                    <Link to="/profile" className="block rounded-xl px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high" onClick={() => setOpen(false)}>
                      Profile
                    </Link>
                    <Link to="/orders" className="block rounded-xl px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high" onClick={() => setOpen(false)}>
                      Orders
                    </Link>
                    {user?.role === 'admin' ? (
                      <Link to="/admin" className="block rounded-xl px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high" onClick={() => setOpen(false)}>
                        Admin Dashboard
                      </Link>
                    ) : null}
                    <button type="button" className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container-high" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block rounded-xl px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high" onClick={() => setOpen(false)}>
                      Login
                    </Link>
                    <Link to="/register" className="block rounded-xl px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high" onClick={() => setOpen(false)}>
                      Register
                    </Link>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

const CartBadge = () => {
  const { totalItems } = useCart();

  if (!totalItems) return null;

  return (
    <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-on-primary text-[12px] font-semibold">
      {totalItems}
    </span>
  );
};

export default TopNavBar;
