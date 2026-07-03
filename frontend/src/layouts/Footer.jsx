import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-stack-xl w-full border-t border-outline-variant/40 bg-surface-container-low/80 py-stack-xl backdrop-blur-xl dark:bg-inverse-surface/80 dark:border-outline-variant/40">
      <div className="mx-auto grid max-w-container-max gap-8 px-margin-mobile md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] md:px-margin-desktop">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3 text-primary transition-colors hover:text-secondary">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest/70 shadow-sm">
              <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
                <path d="M16 18c0-4 3-7 7-7h18c4 0 7 3 7 7v2c0 6-4 10-8 13l-4 3v4h8v4H20v-4h8v-4l-4-3c-4-3-8-7-8-13v-2Z" fill="currentColor" />
                <path d="M25 24h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-headline-sm font-headline-sm font-semibold tracking-[-0.03em]">ShopEase</span>
          </Link>
          <p className="max-w-sm text-body-md text-on-surface-variant">
            Premium essentials for the modern shopper, designed to feel effortless from discovery to delivery.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-label-lg font-label-lg uppercase tracking-[0.22em] text-on-surface">Company</h3>
          <ul className="space-y-2 text-body-md text-on-surface-variant">
            <li><Link to="/#about" className="transition-colors hover:text-primary">About</Link></li>
            <li><Link to="/#brands" className="transition-colors hover:text-primary">Brands</Link></li>
            <li><Link to="/#contact" className="transition-colors hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-label-lg font-label-lg uppercase tracking-[0.22em] text-on-surface">Support</h3>
          <ul className="space-y-2 text-body-md text-on-surface-variant">
            <li><Link to="/#deals" className="transition-colors hover:text-primary">Deals</Link></li>
            <li><Link to="/orders" className="transition-colors hover:text-primary">Orders</Link></li>
            <li><Link to="/profile" className="transition-colors hover:text-primary">Account</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-label-lg font-label-lg uppercase tracking-[0.22em] text-on-surface">Stay in touch</h3>
          <form className="flex flex-col gap-3 rounded-[1.5rem] border border-outline-variant/40 bg-surface-container-lowest/80 p-4 shadow-sm">
            <label htmlFor="newsletter" className="text-sm text-on-surface-variant">Join our newsletter for launches and offers.</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id="newsletter" type="email" placeholder="Email address" className="w-full rounded-full border border-outline-variant/50 bg-transparent px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
              <button type="button" className="rounded-full bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition-transform hover:-translate-y-0.5">Subscribe</button>
            </div>
          </form>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-container-max flex-col gap-4 border-t border-outline-variant/40 px-margin-mobile pt-6 text-sm text-on-surface-variant md:flex-row md:items-center md:justify-between md:px-margin-desktop">
        <p>© 2024 ShopEase. All rights reserved.</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/" className="transition-colors hover:text-primary">Privacy</Link>
          <Link to="/" className="transition-colors hover:text-primary">Terms</Link>
          <Link to="/" className="transition-colors hover:text-primary">Shipping</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
