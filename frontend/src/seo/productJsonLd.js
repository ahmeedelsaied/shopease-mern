/**
 * buildProductJsonLd – pure helper that turns a Mongoose Product document into a
 * Schema.org Product JSON-LD object. Only fields that genuinely exist on `product`
 * are emitted; aggregateRating is gated behind real rating + review counts so we
 * never publish a fake 0 / 0 aggregateScore. Returns `null` when there is no
 * product (e.g. still loading, fetch failed) so the caller can skip the script.
 *
 * @param {object|null} product - The product doc returned by GET /api/products/:id.
 * @param {object} options
 * @param {string} options.siteUrl - Absolute site origin (no trailing slash) used to
 *                                   resolve relative image URLs and build the canonical URL.
 * @returns {object|null}
 */
const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

const resolveUrl = (value, siteUrl) => {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (isAbsoluteUrl(trimmed)) return trimmed;
  return `${siteUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

const buildProductJsonLd = (product, { siteUrl } = {}) => {
  if (!product) return null;
  const origin = (siteUrl || '').replace(/\/$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
  };

  if (product.name) jsonLd.name = product.name;
  if (product.description) jsonLd.description = product.description;

  const image = resolveUrl(product.image, origin);
  if (image) jsonLd.image = image;

  if (origin && product._id) {
    jsonLd.url = `${origin}/products/${product._id}`;
  }

  if (product.category && String(product.category).trim().length > 0) {
    jsonLd.category = product.category;
  }

  if (Number.isFinite(Number(product.price)) && Number(product.price) >= 0) {
    jsonLd.offers = {
      '@type': 'Offer',
      price: Number(product.price),
      priceCurrency: 'USD',
      availability:
        Number(product.stock) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    };
  }

  const rating = Number(product.averageRating ?? product.rating ?? 0);
  const reviewCount = Number(product.reviewsCount ?? 0);
  if (rating > 0 && reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(rating.toFixed(1)),
      reviewCount,
    };
  }

  return jsonLd;
};

export { buildProductJsonLd };
