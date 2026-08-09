/**
 * Site-wide SEO defaults for ShopEase. Consumed by `components/SEO.jsx` and any
 * page that needs the canonical site description/favicon/share metadata.
 *
 * The site URL is intentionally env-driven: there is no production domain in
 * the codebase, and inventing one would publish a fake canonical / OG URL.
 * `VITE_SITE_URL` falls back to the Vite dev server origin so canonical and
 * Open Graph URLs are valid relative to whichever environment the build is in.
 */

const DEFAULT_SEO = {
  title: 'ShopEase — Modern E-Commerce Store',
  description:
    'ShopEase is a modern e-commerce store offering a curated catalogue of products with fast search, secure checkout, and reliable order tracking.',
  siteName: 'ShopEase',
  locale: 'en_US',
  type: 'website',
  twitterCard: 'summary_large_image',
  robots: 'index, follow',
};

/** Robots directives for routes that must never be indexed (admin console). */
const NOINDEX_FOLLOW_ROBOTS = 'noindex, nofollow';

/** Robots directives for personal-account routes — noindex but still follow. */
const NOINDEX_ROBOTS = 'noindex';

const getSiteUrl = () => {
  const configured = import.meta.env.VITE_SITE_URL;
  if (configured && configured.length > 0) return configured.replace(/\/$/, '');
  return 'http://localhost:5173';
};

export { DEFAULT_SEO, NOINDEX_FOLLOW_ROBOTS, NOINDEX_ROBOTS, getSiteUrl };
