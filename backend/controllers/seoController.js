import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * SEO controllers for crawlable, server-generated infrastructure files.
 *
 * Sprint 7B Part 2 replaces the static Part 1 sitemap stub with a backend-driven
 * sitemap that enumerates real product and category URLs. The site origin is
 * intentionally env-driven via `PUBLIC_SITE_URL` (mirroring the frontend's
 * `VITE_SITE_URL` strategy): there is no production domain in the codebase, and
 * inventing one would publish fake canonical / sitemap URLs. When unset it falls
 * back to the Vite dev server origin so the sitemap is always valid relative to
 * the running environment.
 *
 * Both endpoints are public — sitemaps and robots.txt must be reachable by
 * crawlers — so no auth/admin middleware is attached.
 */

/** Private/personal path segments that must never be indexed (mirrors frontend robots.txt). */
const DISALLOWED_PATHS = [
  '/admin',
  '/cart',
  '/wishlist',
  '/recently-viewed',
  '/orders',
  '/profile',
  '/login',
  '/register',
  '/checkout',
  '/order-success',
];

/** Resolve the public site origin, trailing slash stripped, env-driven. */
const getSiteOrigin = () => {
  const configured = process.env.PUBLIC_SITE_URL;
  const value = configured && configured.trim().length > 0 ? configured : 'http://localhost:5173';
  return value.replace(/\/$/, '');
};

/**
 * Escape the five XML special characters for safe inclusion in text/attribute
 * values. Each entity is built by concatenation so the `&` prefix is preserved
 * literally in source (avoids any tool re-interpreting `<` etc.).
 */
const XML_ENTITIES = {
  '&': '&a' + 'mp;',
  '<': '&l' + 't;',
  '>': '&g' + 't;',
  '"': '&q' + 'uot;',
  "'": '&a' + 'pos;',
};
const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => XML_ENTITIES[ch]);

/**
 * Encode a category name for use as a `?category=` query value. Uses the standard
 * URLSearchParams encoding so spaces, ampersands, etc. survive the round-trip
 * back into the catalog filter on the home page.
 */
const encodeCategory = (category) => encodeURIComponent(String(category));

/** Format a Date (or Mongo date) as an ISO 8601 string, or return null when absent/invalid. */
const formatLastmod = (date) => {
  if (!date) return null;
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const buildUrlEntry = ({ loc, lastmod, changefreq, priority }) => {
  const parts = [`    <loc>${escapeXml(loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority !== undefined) parts.push(`    <priority>${priority}</priority>`);
  return `  <url>\n${parts.join('\n')}\n  </url>`;
};

/**
 * GET /sitemap.xml
 * Serves a sitemap.org 0.9 urlset enumerating the home page, every real category
 * filter state (as `/?category=<encoded>` — the catalog's actual filter route),
 * and every real product URL (`/products/:id`). Only product IDs and categories
 * that exist in the database are emitted — no fabricated URLs, no fake lastmod.
 */
const getSitemap = asyncHandler(async (req, res) => {
  const origin = getSiteOrigin();

  // Fetch only the fields the sitemap needs; sort newest-first so a truncated
  // or rate-limited crawl still sees the most-recently-added products. lean()
  // returns plain objects (faster, no Mongoose overhead) since we only read.
  const [products, categories] = await Promise.all([
    Product.find().select('_id category updatedAt').sort({ createdAt: -1 }).lean(),
    Product.distinct('category'),
  ]);

  const sortCategories = [...categories].sort();

  const urlEntries = [
    buildUrlEntry({ loc: `${origin}/`, changefreq: 'daily', priority: '1.0' }),
    ...sortCategories.map((category) =>
      buildUrlEntry({
        loc: `${origin}/?category=${encodeCategory(category)}`,
        changefreq: 'weekly',
        priority: '0.6',
      })
    ),
    ...products.map((product) =>
      buildUrlEntry({
        loc: `${origin}/products/${product._id}`,
        lastmod: formatLastmod(product.updatedAt),
        changefreq: 'weekly',
        priority: '0.7',
      })
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`;

  res.set('Content-Type', 'application/xml; charset=utf-8');
  // Sitemaps are stable per-deploy but change as products are added, so allow
  // edge caches to hold the file briefly without marking it immutable.
  res.set('Cache-Control', 'public, max-age=3600');
  res.status(200).send(xml);
});

/**
 * GET /robots.txt
 * Canonical robots.txt: allow the public storefront, disallow the same private
 * paths the frontend static file already lists, and emit a Sitemap directive
 * with an absolute URL derived from PUBLIC_SITE_URL so crawlers can discover
 * the backend-generated sitemap from the robots origin.
 */
const getRobots = asyncHandler(async (req, res) => {
  const origin = getSiteOrigin();

  const lines = [
    '# ShopEase robots.txt (generated)',
    '# Allow the public storefront; block private account areas and the admin console.',
    '',
    'User-agent: *',
    '',
    '# Public, indexable storefront',
    'Allow: /',
    '',
    '# Private / personal — not for search engines',
    ...DISALLOWED_PATHS.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ];

  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.status(200).send(lines.join('\n'));
});

export { getSitemap, getRobots };
