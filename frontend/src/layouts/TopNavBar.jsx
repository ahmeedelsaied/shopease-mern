import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { cn, components } from '../styles/designSystem';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

const navItems = [
  { label: 'Home', to: 'hero' },
  { label: 'Shop', to: 'products' },
  { label: 'Categories', to: 'categories' },
  { label: 'Featured', to: 'featured' },
  { label: 'Deals', to: 'deals' },
  { label: 'New Arrivals', to: 'new-arrivals' },
  { label: 'Brands', to: 'brands' },
  { label: 'About', to: 'about' },
  { label: 'Contact', to: 'contact' },
];

const TopNavBar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const toast = useToast();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [searchValue, setSearchValue] = useState('');
  const accountMenuRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('shopease-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    document.documentElement.style.colorScheme = savedTheme;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuEl = accountMenuRef.current;
      const dropdownEl = dropdownRef.current;
      const clickedInsideMenu = menuEl && menuEl.contains(event.target);
      const clickedInsideDropdown = dropdownEl && dropdownEl.contains(event.target);
      if (!clickedInsideMenu && !clickedInsideDropdown) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setAccountOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  const handleLogout = () => {
    setAccountOpen(false);
    logout();
    toast.info('Signed out successfully');
    navigate('/login', { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    const nextPath = query ? `/?q=${encodeURIComponent(query)}` : '/';
    navigate(nextPath);
    setSearchValue('');
    setTimeout(() => {
      const field = document.getElementById('product-search');
      if (field) {
        field.focus();
      }
    }, 120);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    window.localStorage.setItem('shopease-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.style.colorScheme = nextTheme;
  };

  // compute dropdown position when opening
  useEffect(() => {
    if (!accountOpen) return;

    const update = () => {
      const btn = accountMenuRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const dropdownWidth = 240; // w-60 -> 15rem -> 240px
      let left = rect.right - dropdownWidth;
      if (left < 8) left = Math.max(8, rect.left);
      const top = rect.bottom + 8; // small offset
      setDropdownPos({ top: Math.round(top), left: Math.round(left) });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [accountOpen]);

  return (
    <nav className="sticky top-0 z-[1000] w-full border-b border-outline-variant/30 bg-surface/80 backdrop-blur-3xl dark:bg-inverse-surface/80 dark:border-outline-variant/30">
      <div className="mx-auto flex max-w-container-max flex-wrap items-center justify-between gap-3 px-margin-mobile py-3 md:px-margin-desktop">
        <Link to="/" className="flex items-center gap-3 rounded-full px-2 py-1 text-primary transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest/70 shadow-sm">
            <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
              <path d="M16 18c0-4 3-7 7-7h18c4 0 7 3 7 7v2c0 6-4 10-8 13l-4 3v4h8v4H20v-4h8v-4l-4-3c-4-3-8-7-8-13v-2Z" fill="currentColor" />
              <path d="M25 24h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-headline-sm font-headline-sm font-semibold tracking-[-0.03em]">ShopEase</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 items-center justify-center px-4 md:flex">
          <label htmlFor="nav-search" className="sr-only">
            Search products
          </label>
          <div className="flex w-full max-w-xl items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container-low/80 px-4 py-2 shadow-sm backdrop-blur-lg">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
            <input
              id="nav-search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search the catalog"
              className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleTheme} className={cn(components.button.icon, 'hidden sm:inline-flex')} aria-label="Toggle color theme">
            <span className="material-symbols-outlined text-[18px]">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
          </button>

          <Link to="/cart" aria-label="Shopping bag" className={cn(components.button.icon, 'relative')}>
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            {totalItems > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-on-primary">
                {totalItems}
              </span>
            ) : null}
          </Link>

          <Link to="/wishlist" aria-label="Wishlist" className={cn(components.button.icon, 'relative')}>
            <span className="material-symbols-outlined text-[18px]">favorite</span>
            {wishlistCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white">
                {wishlistCount}
              </span>
            ) : null}
          </Link>

          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              aria-label="Account menu"
              className={components.button.icon}
              onClick={() => setAccountOpen((prev) => !prev)}
              aria-expanded={accountOpen}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
            {accountOpen &&
              createPortal(
                <div
                  ref={dropdownRef}
                  style={{ position: 'fixed', top: dropdownPos.top + 'px', left: dropdownPos.left + 'px', zIndex: 1200 }}
                  className="w-60 rounded-[1.5rem] border border-outline-variant/40 bg-surface-container-lowest/95 p-2 shadow-xl backdrop-blur-xl"
                >
                  {user ? (
                    <>
                      <div className="px-3 py-2 text-sm text-on-surface-variant">Hello, {user.name}</div>
                      <Link to="/profile" className="block rounded-xl px-3 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10" onClick={() => setAccountOpen(false)}>
                        Profile
                      </Link>
                      <Link to="/orders" className="block rounded-xl px-3 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10" onClick={() => setAccountOpen(false)}>
                        Orders
                      </Link>
                      {user?.role === 'admin' ? (
                        <Link to="/admin" className="block rounded-xl px-3 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10" onClick={() => setAccountOpen(false)}>
                          Admin Dashboard
                        </Link>
                      ) : null}
                      <button type="button" className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10" onClick={handleLogout}>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block rounded-xl px-3 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10" onClick={() => setAccountOpen(false)}>
                        Login
                      </Link>
                      <Link to="/register" className="block rounded-xl px-3 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10" onClick={() => setAccountOpen(false)}>
                        Register
                      </Link>
                    </>
                  )}
                </div>,
                document.body
              )}
          </div>

          <button type="button" className={cn(components.button.icon, 'md:hidden')} aria-label="Toggle navigation menu" onClick={() => setMobileMenuOpen((prev) => !prev)}>
            <span className="material-symbols-outlined text-[18px]">menu</span>
          </button>
        </div>
      </div>

      <div className="border-t border-outline-variant/20 bg-surface-container-low/70 px-margin-mobile py-3 backdrop-blur-xl md:px-margin-desktop">
        <div className="mx-auto flex max-w-container-max flex-wrap items-center justify-center gap-2 md:gap-3">
          {navItems.map((item) => (
            <ScrollLink
              key={item.label}
              to={item.to}
              spy={true}
              smooth={true}
              offset={-100}
              duration={500}
              className="cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
            >
              {item.label}
            </ScrollLink>
          ))}
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-outline-variant/20 bg-surface-container-lowest/95 px-margin-mobile py-4 shadow-xl backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-container-max flex-col gap-2">
            {navItems.map((item) => (
              <ScrollLink key={item.label} to={item.to} spy={true} smooth={true} offset={-100} duration={500} className="cursor-pointer rounded-2xl px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </ScrollLink>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default TopNavBar;
