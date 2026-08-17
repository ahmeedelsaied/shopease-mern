import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn, components } from '../styles/designSystem';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { HOME_SECTIONS, NAV_ITEMS, navigateToSection } from '../utils/navigation';

const BrandMark = ({ className = '' }) => (
  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_8px_18px_rgba(31,48,41,0.2)]', className)} aria-hidden="true">
    <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
      <path d="M10 15.5c0-3 2.4-5.5 5.5-5.5h9c3.1 0 5.5 2.5 5.5 5.5v1.2c0 4.1-2.7 7.1-6.1 9.4l-1.6 1.1v2.1h4.2v2.1H13.5v-2.1h4.2v-2.1l-1.6-1.1c-3.4-2.3-6.1-5.3-6.1-9.4v-1.2Z" fill="currentColor" />
      <path d="M15.5 16h9" stroke="#c86b49" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </span>
);

const TopNavBar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const toast = useToast();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [searchValue, setSearchValue] = useState('');
  const [activeSection, setActiveSection] = useState(HOME_SECTIONS.HERO);
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
      if (!menuEl?.contains(event.target) && !dropdownEl?.contains(event.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setAccountOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection(null);
      return undefined;
    }

    const sections = Object.values(HOME_SECTIONS)
      .map((sectionId) => document.getElementById(sectionId))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-22% 0px -62% 0px', threshold: [0, 0.15, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [location.pathname]);

  const handleLogout = () => {
    setAccountOpen(false);
    logout();
    toast.info('Signed out successfully');
    navigate('/login', { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    navigate(query ? `/?search=${encodeURIComponent(query)}` : '/');
    setSearchValue('');
    setTimeout(() => document.getElementById('product-search')?.focus(), 120);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    window.localStorage.setItem('shopease-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.style.colorScheme = nextTheme;
  };

  const handleSectionNav = useCallback((sectionId) => {
    setMobileMenuOpen(false);
    setActiveSection(sectionId);
    navigateToSection({ sectionId, navigate, pathname: location.pathname });
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (!accountOpen) return undefined;
    const update = () => {
      const button = accountMenuRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setDropdownPos({ top: Math.round(rect.bottom + 10), left: Math.max(12, Math.round(rect.right - 248)) });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [accountOpen]);

  const navLinks = NAV_ITEMS.map((item) => (
    <button
      key={item.label}
      type="button"
      onClick={() => handleSectionNav(item.sectionId)}
      aria-current={activeSection === item.sectionId ? 'page' : undefined}
      className={cn(
        'relative rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/20',
        activeSection === item.sectionId ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary',
      )}
    >
      {item.label}
    </button>
  ));

  return (
    <nav className="sticky top-0 z-[1000] w-full border-b border-outline-variant/40 bg-surface/90 backdrop-blur-2xl dark:bg-inverse-surface/90" aria-label="Main navigation">
      <div className="border-b border-outline-variant/25 bg-primary px-margin-mobile py-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-primary-fixed md:px-margin-desktop">
        Complimentary delivery on orders over $75 <span className="mx-2 text-secondary">•</span> Curated for the everyday
      </div>

      <div className="mx-auto flex max-w-container-max items-center gap-3 px-margin-mobile py-3.5 md:px-margin-desktop md:py-4">
        <Link to="/" aria-label="ShopEase – go to home" className="flex min-w-0 items-center gap-3 rounded-full text-primary focus-visible:outline-none">
          <BrandMark />
          <span className="hidden text-[17px] font-semibold tracking-[-0.04em] sm:inline">ShopEase</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden min-w-0 flex-1 md:block">
          <label htmlFor="nav-search" className="sr-only">Search products</label>
          <div className="mx-auto flex max-w-[530px] items-center gap-3 rounded-full border border-outline-variant/60 bg-surface-container-lowest/70 px-4 py-2.5 transition-all focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
            <span className="material-symbols-outlined text-[19px] text-secondary" aria-hidden="true">search</span>
            <input id="nav-search" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search products, categories, or brands" className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/65" />
            <span className="hidden rounded-full bg-surface-container px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant lg:inline">Enter</span>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={toggleTheme} className={cn(components.button.icon, 'hidden sm:inline-flex')} aria-label="Toggle color theme">
            <span className="material-symbols-outlined text-[19px]">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
          </button>
          <Link to="/cart" aria-label="Shopping bag" className={cn(components.button.icon, 'relative')}>
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            {totalItems > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-on-secondary">{totalItems}</span>}
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className={cn(components.button.icon, 'relative')}>
            <span className="material-symbols-outlined text-[20px]">favorite</span>
            {wishlistCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-on-secondary">{wishlistCount}</span>}
          </Link>
          <div className="relative" ref={accountMenuRef}>
            <button type="button" aria-label="Account menu" className={components.button.icon} onClick={() => setAccountOpen((prev) => !prev)} aria-expanded={accountOpen}>
              <span className="material-symbols-outlined text-[20px]">person</span>
            </button>
            {accountOpen && createPortal(
              <div ref={dropdownRef} style={{ position: 'fixed', top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px`, zIndex: 1200 }} className="w-60 rounded-[1.4rem] border border-outline-variant/50 bg-surface-container-lowest p-2 shadow-xl">
                {user ? (
                  <>
                    <div className="border-b border-outline-variant/25 px-3 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">Signed in as</p><p className="mt-1 truncate text-sm font-semibold text-primary">{user.name}</p></div>
                    <Link to="/profile" className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-surface-container-high" onClick={() => setAccountOpen(false)}>Profile</Link>
                    <Link to="/orders" className="block rounded-xl px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-surface-container-high" onClick={() => setAccountOpen(false)}>Orders</Link>
                    {user?.role === 'admin' && <Link to="/admin" className="block rounded-xl px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-surface-container-high" onClick={() => setAccountOpen(false)}>Admin dashboard</Link>}
                    <button type="button" className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm text-secondary transition-colors hover:bg-secondary-container/35" onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block rounded-xl px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-surface-container-high" onClick={() => setAccountOpen(false)}>Login</Link>
                    <Link to="/register" className="block rounded-xl px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-surface-container-high" onClick={() => setAccountOpen(false)}>Register</Link>
                  </>
                )}
              </div>, document.body,
            )}
          </div>
          <button type="button" className={cn(components.button.icon, 'md:hidden')} aria-label="Toggle navigation menu" onClick={() => setMobileMenuOpen((prev) => !prev)} aria-expanded={mobileMenuOpen}>
            <span className="material-symbols-outlined text-[21px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      <div className="hidden border-t border-outline-variant/25 px-margin-mobile py-2.5 md:block md:px-margin-desktop" role="navigation" aria-label="ShopEase sections">
        <div className="mx-auto flex max-w-container-max items-center justify-center gap-1 overflow-x-auto no-scrollbar">{navLinks}</div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-outline-variant/30 bg-surface-container-lowest px-margin-mobile py-4 shadow-lg md:hidden" role="navigation" aria-label="Mobile navigation menu">
          <form onSubmit={handleSearch} className="mb-4 flex items-center gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low px-4 py-3">
            <span className="material-symbols-outlined text-secondary" aria-hidden="true">search</span>
            <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search the catalog" className="w-full bg-transparent text-sm outline-none" aria-label="Search products" />
          </form>
          <div className="grid gap-1">{navLinks}</div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-outline-variant/25 pt-3">
            <Link to="/wishlist" className="rounded-xl bg-surface-container px-3 py-2 text-center text-xs font-semibold" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
            <Link to="/cart" className="rounded-xl bg-surface-container px-3 py-2 text-center text-xs font-semibold" onClick={() => setMobileMenuOpen(false)}>Cart</Link>
            <Link to="/profile" className="rounded-xl bg-surface-container px-3 py-2 text-center text-xs font-semibold" onClick={() => setMobileMenuOpen(false)}>Account</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNavBar;
