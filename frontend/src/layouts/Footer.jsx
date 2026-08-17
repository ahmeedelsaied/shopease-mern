import { Link, useLocation, useNavigate } from 'react-router-dom';
import { navigateToSection, HOME_SECTIONS } from '../utils/navigation';

const BrandMark = () => (
  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary" aria-hidden="true">
    <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none"><path d="M10 15.5c0-3 2.4-5.5 5.5-5.5h9c3.1 0 5.5 2.5 5.5 5.5v1.2c0 4.1-2.7 7.1-6.1 9.4l-1.6 1.1v2.1h4.2v2.1H13.5v-2.1h4.2v-2.1l-1.6-1.1c-3.4-2.3-6.1-5.3-6.1-9.4v-1.2Z" fill="currentColor" /><path d="M15.5 16h9" stroke="#c86b49" strokeWidth="2" strokeLinecap="round" /></svg>
  </span>
);

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleSectionClick = (sectionId) => (event) => {
    event.preventDefault();
    navigateToSection({ sectionId, navigate, pathname: location.pathname });
  };

  return (
    <footer className="mt-16 border-t border-outline-variant/35 bg-primary text-primary-fixed">
      <div className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_0.75fr_0.75fr_1.2fr]">
          <div className="max-w-sm space-y-5">
            <Link to="/" aria-label="ShopEase – go to home" className="inline-flex items-center gap-3 text-on-primary">
              <BrandMark />
              <span className="text-[19px] font-semibold tracking-[-0.04em]">ShopEase</span>
            </Link>
            <p className="text-sm leading-7 text-primary-fixed/70">A considered edit of everyday essentials, delivered with clarity from first browse to front door.</p>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-fixed/55"><span className="h-px w-8 bg-secondary" /> Curated, not crowded</div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">Explore</h3>
            <ul className="space-y-3 text-sm text-primary-fixed/70" role="list">
              <li><Link to={`/#${HOME_SECTIONS.ABOUT}`} onClick={handleSectionClick(HOME_SECTIONS.ABOUT)} className="transition-colors hover:text-on-primary">About</Link></li>
              <li><Link to={`/#${HOME_SECTIONS.BRANDS}`} onClick={handleSectionClick(HOME_SECTIONS.BRANDS)} className="transition-colors hover:text-on-primary">Brands</Link></li>
              <li><Link to={`/#${HOME_SECTIONS.CONTACT}`} onClick={handleSectionClick(HOME_SECTIONS.CONTACT)} className="transition-colors hover:text-on-primary">Contact</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">Support</h3>
            <ul className="space-y-3 text-sm text-primary-fixed/70" role="list">
              <li><Link to={`/#${HOME_SECTIONS.DEALS}`} onClick={handleSectionClick(HOME_SECTIONS.DEALS)} className="transition-colors hover:text-on-primary">Deals</Link></li>
              <li><Link to="/orders" className="transition-colors hover:text-on-primary">Orders</Link></li>
              <li><Link to="/recently-viewed" className="transition-colors hover:text-on-primary">Recently viewed</Link></li>
              <li><Link to="/profile" className="transition-colors hover:text-on-primary">Account</Link></li>
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-primary-fixed/15 bg-primary-container/55 p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">The edit, delivered</h3>
            <p className="mt-3 text-sm leading-6 text-primary-fixed/75">Get thoughtful drops and quiet offers. No noise, just the good stuff.</p>
            <form className="mt-4 space-y-2">
              <label htmlFor="newsletter" className="sr-only">Email address</label>
              <div className="flex items-center gap-2 rounded-full bg-primary-fixed/10 p-1.5 ring-1 ring-primary-fixed/15 focus-within:ring-secondary">
                <input id="newsletter" type="email" placeholder="Email address" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-on-primary outline-none placeholder:text-primary-fixed/45" />
                <button type="button" className="rounded-full bg-secondary px-4 py-2.5 text-xs font-bold text-on-secondary transition-transform hover:-translate-y-0.5 active:scale-[0.97]">Join</button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-primary-fixed/15 pt-5 text-xs text-primary-fixed/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2024 ShopEase. All rights reserved.</p>
          <div className="flex flex-wrap gap-4"><Link to="/" className="transition-colors hover:text-on-primary">Privacy</Link><Link to="/" className="transition-colors hover:text-on-primary">Terms</Link><Link to="/" className="transition-colors hover:text-on-primary">Shipping</Link></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
