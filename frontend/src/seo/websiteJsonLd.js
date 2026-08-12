import { DEFAULT_SEO } from './seoDefaults';

/**
 * Pure helpers that build additional Schema.org JSON-LD graphs for ShopEase,
 * complementing the per-product graph in `productJsonLd.js`. Like that helper,
 * they only ever emit real data (the site name and description already defined
 * in `seoDefaults.js`, plus caller-supplied breadcrumb labels) and return
 * `null` when there is nothing meaningful to publish, so the caller can skip
 * the JSON-LD entirely rather than emit a hollow graph.
 *
 * The site URL is the existing `getSiteUrl()` origin (env-driven via
 * `VITE_SITE_URL`); no production domain is invented.
 */

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeOrigin = (siteUrl) => (siteUrl || '').replace(/\/$/, '');

/**
 * Build a Schema.org `WebSite` + `Organization` graph for the storefront home
 * page. Reuses `DEFAULT_SEO` for the canonical site name/description so the
 * structured data never drifts from the visible meta. Only fields that are
 * genuinely known are published; no invented logo, social profile, founder,
 * or contact point is emitted.
 *
 * @param {object} options
 * @param {string} options.siteUrl - Absolute site origin (no trailing slash).
 * @returns {object|null} Graph object suitable for `SEO` `jsonLd`, or null.
 */
const buildWebsiteJsonLd = ({ siteUrl } = {}) => {
  const origin = normalizeOrigin(siteUrl);
  if (!origin) return null;

  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: origin,
      name: DEFAULT_SEO.siteName,
      description: DEFAULT_SEO.description,
      inLanguage: 'en',
      publisher: { '@id': `${origin}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: DEFAULT_SEO.siteName,
      url: origin,
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
};

/**
 * Build a Schema.org `BreadcrumbList` for a route's "you are here" trail.
 * Each item is `{ name, path }` where `path` is a site-relative URL (e.g. `/`
 * for Home, `/products/:id` for a product). `path` is resolved against the
 * supplied site origin so the breadcrumb URLs are absolute, matching the
 * canonical URL strategy used by `SEO`.
 *
 * @param {object} options
 * @param {string} options.siteUrl - Absolute site origin (no trailing slash).
 * @param {Array<{name: string, path: string}>} options.items - Ordered crumbs (root → current).
 * @returns {object|null} BreadcrumbList JSON-LD, or null when no valid items.
 */
const buildBreadcrumbJsonLd = ({ siteUrl, items } = {}) => {
  const origin = normalizeOrigin(siteUrl);
  if (!origin || !Array.isArray(items) || items.length === 0) return null;

  const itemListElement = items
    .map((item, index) => {
      if (!item || !isNonEmptyString(item.name)) return null;
      const path = isNonEmptyString(item.path) ? item.path : '/';
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${origin}${normalizedPath}`,
      };
    })
    .filter(Boolean);

  if (itemListElement.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
};

/**
 * Combine one or more single-graph JSON-LD objects (each with their own
 * `@context`) into a single `@graph` payload so a page can publish multiple
 * distinct schemas (e.g. Product + BreadcrumbList) under one
 * `<script type="application/ld+json">` element. `null`/undefined inputs are
 * dropped. Returns a single object unchanged if only one valid graph remains,
 * `null` if none — so the caller can skip the script entirely when there is
 * nothing to publish rather than emit an empty graph.
 *
 * The input graphs' individual `@context` keys are stripped; the merged object
 * carries a single `@context` and `@graph` array per schema.org conventions.
 *
 * @param {Array<object|null>} graphs - JSON-LD single-graph objects.
 * @returns {object|null}
 */
const combineJsonLd = (graphs) => {
  if (!Array.isArray(graphs)) return null;
  const clean = graphs
    .filter((graph) => graph && typeof graph === 'object')
    .map((graph) => {
      const { '@context': _omit, ...rest } = graph;
      return rest;
    });
  if (clean.length === 0) return null;
  if (clean.length === 1) return { '@context': 'https://schema.org', ...clean[0] };
  return { '@context': 'https://schema.org', '@graph': clean };
};

export { buildWebsiteJsonLd, combineJsonLd, buildBreadcrumbJsonLd };
