import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_SEO, getSiteUrl } from '../seo/seoDefaults';

/**
 * Head tag descriptors built once. Each entry declares the tag's selector key,
 * how to find/create it, and the property that carries the value at runtime.
 * Keeping the descriptors static (arrays of plain objects) lets the imperative
 * effect below own only the snapshot/update sequence — there is no per-tag
 * branching obfuscating the cleanup contract.
 */
const STANDARD_META = [
  { selector: 'meta[name="description"]', attr: 'name', key: 'description', content: (s) => s.description },
  { selector: 'meta[name="robots"]', attr: 'name', key: 'robots', content: (s) => s.robots },
];

const OG_META = [
  { selector: 'meta[property="og:title"]', attr: 'property', key: 'og:title', content: (s) => s.ogTitle },
  { selector: 'meta[property="og:description"]', attr: 'property', key: 'og:description', content: (s) => s.ogDescription },
  { selector: 'meta[property="og:type"]', attr: 'property', key: 'og:type', content: (s) => s.type },
  { selector: 'meta[property="og:url"]', attr: 'property', key: 'og:url', content: (s) => s.canonical },
  { selector: 'meta[property="og:image"]', attr: 'property', key: 'og:image', content: (s) => s.image },
  { selector: 'meta[property="og:site_name"]', attr: 'property', key: 'og:site_name', content: (s) => s.siteName },
  { selector: 'meta[property="og:locale"]', attr: 'property', key: 'og:locale', content: (s) => s.locale },
];

const TWITTER_META = [
  { selector: 'meta[name="twitter:card"]', attr: 'name', key: 'twitter:card', content: (s) => s.twitterCard },
  { selector: 'meta[name="twitter:title"]', attr: 'name', key: 'twitter:title', content: (s) => s.ogTitle },
  { selector: 'meta[name="twitter:description"]', attr: 'name', key: 'twitter:description', content: (s) => s.ogDescription },
  { selector: 'meta[name="twitter:image"]', attr: 'name', key: 'twitter:image', content: (s) => s.image },
];

const ALL_META = [...STANDARD_META, ...OG_META, ...TWITTER_META];

/**
 * Strip HTML so a malicious or db-stored title cannot inject markup into the
 * `<title>` element. The DOM will escape the text on assignment, but the
 * suffix join below must operate on already-clean text so a value like
 * `<script>` can't slip into a `| ShopEase` title string.
 */
const stripTags = (value) => (value ? String(value).replace(/<[^>]*>/g, '') : '');

/**
 * SEO – dependency-free runtime head manager for the ShopEase SPA. Imperatively
 * writes `<title>`, the description/robots meta, Open Graph + Twitter tags, the
 * canonical link, and an optional JSON-LD `<script type="application/ld+json">`.
 * No `dangerouslySetInnerHTML` is used: the JSON-LD string is set via React's
 * own `<script>` child render which escapes its text content safely.
 *
 * On mount the component snapshots anything it will overwrite so the static
 * `<title>ShopEase</title>` and any pre-existing meta tags defined in
 * `index.html` are restored verbatim when the route navigates away, preventing
 * stale meta from leaking across SPA transitions.
 *
 * @param {object} props
 * @param {string} [props.title]        - Page title; empty string falls back to the site default (no suffix).
 * @param {string} [props.description]  - Page description; falls back to the site default when omitted.
 * @param {string} [props.canonical]     - Absolute canonical URL; derived from the current route when omitted.
 * @param {string} [props.robots]        - Robots directive; defaults to `index, follow`.
 * @param {string} [props.type]          - Open Graph type, default `website` (use `product` for product pages).
 * @param {string} [props.image]         - Open Graph / Twitter share image.
 * @param {object|array} [props.jsonLd]  - JSON-LD payload; rendered as a `<script type="application/ld+json">` element.
 */
const SEO = ({
  title,
  description,
  canonical,
  robots = DEFAULT_SEO.robots,
  type = DEFAULT_SEO.type,
  image,
  jsonLd,
}) => {
  const location = useLocation();
  const snapshot = useRef(null);

  const state = useMemo(() => {
    const displayTitle = title ? `${stripTags(title)} | ${DEFAULT_SEO.siteName}` : DEFAULT_SEO.title;
    const ogTitle = title ? stripTags(title) : DEFAULT_SEO.title;
    const ogDescription = description ?? DEFAULT_SEO.description;
    const resolvedCanonical = canonical || `${getSiteUrl()}${location.pathname}`;
    return {
      title: displayTitle,
      ogTitle,
      ogDescription,
      description: ogDescription,
      canonical: resolvedCanonical,
      robots,
      type,
      image: image || undefined,
      siteName: DEFAULT_SEO.siteName,
      locale: DEFAULT_SEO.locale,
      twitterCard: DEFAULT_SEO.twitterCard,
    };
  }, [title, description, canonical, robots, type, image, location.pathname]);

  useEffect(() => {
    if (!snapshot.current) {
      // First mount for this SEO instance: capture the static <title> and any
      // pre-existing meta tags we are about to control so they can be restored
      // on unmount. Only tags already in index.html get snapshotted; tags we
      // create wholesale are simply removed on cleanup.
      const existingMeta = new Map();
      ALL_META.forEach((descriptor) => {
        const element = document.head.querySelector(descriptor.selector);
        if (element) existingMeta.set(descriptor.selector, element.getAttribute('content'));
      });
      snapshot.current = {
        title: document.title,
        meta: existingMeta,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
      };
    }

    document.title = state.title;

    ALL_META.forEach((descriptor) => {
      const value = descriptor.content(state);
      if (value === undefined || value === null || value === '') return;
      let element = document.head.querySelector(descriptor.selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(descriptor.attr, descriptor.key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    });

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', state.canonical);

    return () => {
      // Restore the snapshot taken on mount so navigation between routes does
      // not leave the previous page's title/description/OG tags bleed through.
      document.title = snapshot.current.title || DEFAULT_SEO.title;
      ALL_META.forEach((descriptor) => {
        const element = document.head.querySelector(descriptor.selector);
        if (!element) return;
        if (snapshot.current.meta.has(descriptor.selector)) {
          element.setAttribute('content', snapshot.current.meta.get(descriptor.selector));
        } else {
          element.parentNode.removeChild(element);
        }
      });
      if (snapshot.current.canonical !== null) {
        const existing = document.head.querySelector('link[rel="canonical"]');
        if (existing) existing.setAttribute('href', snapshot.current.canonical);
      } else {
        const existing = document.head.querySelector('link[rel="canonical"]');
        if (existing) existing.parentNode.removeChild(existing);
      }
    };
  }, [state]);

  // No dangerouslySetInnerHTML anywhere. React renders the script's text child
  // via a DOM text node, so the JSON string is safe against the database-sourced
  // product fields — but a string that contains the literal `</script>` would
  // break the script element if a crawler later re-parses the serialized DOM.
  // Escape `<` and `>` to their JSON `\u003c` / `\u003e` escapes (still valid
  // JSON, parses to the same string) so the substring `</script>` can never
  // appear inside the script's text. This is the standard JSON-LD HTML-escape.
  if (jsonLd) {
    const safeJsonLd = JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
    return <script type="application/ld+json">{safeJsonLd}</script>;
  }
  return null;
};

SEO.displayName = 'SEO';

export default SEO;
