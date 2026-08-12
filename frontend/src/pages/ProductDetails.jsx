import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import SEO from '../components/SEO';
import { getSiteUrl } from '../seo/seoDefaults';
import { buildProductJsonLd } from '../seo/productJsonLd';
import { buildBreadcrumbJsonLd, combineJsonLd } from '../seo/websiteJsonLd';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/EmptyState';
import ProductGallery from '../components/product/ProductGallery';
import { ProductDetailsSkeleton } from '../components/ui/Skeleton';
import { useCart } from '../context/CartContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useToast } from '../context/ToastContext';
import ProductReviews from '../components/ProductReviews';
import RatingStars from '../components/RatingStars';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [reviewSummary, setReviewSummary] = useState(null);
  const { addToCart } = useCart();
  const { addRecentlyViewed } = useRecentlyViewed();
  const toast = useToast();

  const productJsonLd = useMemo(
    () => buildProductJsonLd(product, { siteUrl: getSiteUrl() }),
    [product]
  );

  useEffect(() => {
    let isCurrent = true;

    const loadProduct = async () => {
      setLoading(true);
      setError('');
      setNotFound(false);
      setProduct(null);
      setReviewSummary(null);

      try {
        const response = await api.get(`/products/${id}`);
        const productData = response.data?.data ?? null;

        if (!isCurrent) return;

        if (!productData) {
          setNotFound(true);
          return;
        }

        setProduct(productData);
        addRecentlyViewed(productData);
        setReviewSummary({
          averageRating: productData.averageRating ?? productData.rating ?? 0,
          reviewsCount: productData.reviewsCount ?? 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      } catch (fetchError) {
        if (!isCurrent) return;

        if (fetchError?.response?.status === 404) {
          setNotFound(true);
          return;
        }

        setError(
          fetchError?.response?.data?.message ||
            'Unable to load product details. Please try again.'
        );
      } finally {
        if (isCurrent) setLoading(false);
      }
    }; 

    if (!id) {
      setNotFound(true);
      setLoading(false);
      return undefined;
    }

    loadProduct();
    return () => {
      isCurrent = false;
    };
  }, [id, addRecentlyViewed]);

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (notFound) {
    return (
      <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
        <EmptyState
          icon="search_off"
          title="Product not found"
          description="This product is no longer available or the link is invalid."
          actionLabel="Browse products"
          actionTo="/"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
        <div className="max-w-container-max mx-auto rounded-3xl border border-error/20 bg-error-container p-10 text-center">
          <p className="text-body-lg font-body-lg text-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
        <EmptyState
          icon="error"
          title="Product unavailable"
          description="We could not display this product. Please return to the catalogue and try again."
          actionLabel="Browse products"
          actionTo="/"
        />
      </div>
    );
  }

  const numericPrice = Number(product.price);
  const price = Number.isFinite(numericPrice) && numericPrice >= 0 ? numericPrice : 0;
  const numericStock = Number(product.stock);
  const stock = Number.isFinite(numericStock) && numericStock > 0 ? numericStock : 0;
  const rawRating = Number(reviewSummary?.averageRating ?? product.averageRating ?? product.rating ?? 0);
  const averageRating = Number.isFinite(rawRating) ? Math.min(Math.max(rawRating, 0), 5) : 0;
  const rawReviewsCount = Number(reviewSummary?.reviewsCount ?? product.reviewsCount ?? 0);
  const reviewsCount = Number.isFinite(rawReviewsCount) && rawReviewsCount > 0 ? rawReviewsCount : 0;
  const productId = product._id ?? product.id ?? id;
  const name = product.name || 'Product';
  const description = product.description || 'No description is available for this product.';
  const category = product.category || 'Uncategorised';
  const image = product.image || (Array.isArray(product.images) ? product.images.find(Boolean) : undefined);
  const formattedPrice = `$${price.toFixed(2)}`;
  const stockLabel = stock > 0 ? `${stock} in stock` : 'Out of stock';

  const canonical = `${getSiteUrl()}/products/${productId}`;

  // Compose the Product graph (built once at the top of the component from the
  // real product doc) with a BreadcrumbList (Home -> category -> product name).
  // Both feed real product/_id values only; combineJsonLd drops any null so the
  // JSON-LD is simply omitted when the data is unavailable.
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    siteUrl: getSiteUrl(),
    items: [
      { name: 'Home', path: '/' },
      { name: category, path: `/?category=${encodeURIComponent(category)}` },
      { name, path: `/products/${productId}` },
    ],
  });
  const combinedJsonLd = combineJsonLd([productJsonLd, breadcrumbJsonLd]);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
      <SEO
        title={name}
        description={description}
        canonical={canonical}
        image={image}
        type="product"
        jsonLd={combinedJsonLd}
      />
      <div className="max-w-container-max mx-auto space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
            {category}
          </p>
          <h1 className="text-headline-lg font-headline-lg text-primary">
            {name}
          </h1>
          <p className="max-w-2xl mx-auto text-body-lg font-body-lg text-on-surface-variant">
            {description}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] items-start">
          <ProductGallery product={product} />

          <Card variant="panel" className="space-y-8 p-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-display-lg font-display-lg text-primary">
                  {formattedPrice}
                </span>
                <span className="rounded-full bg-surface-container px-4 py-2 text-label-sm font-label-sm text-on-surface-variant">
                  {stockLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-on-surface-variant">
                <span className="text-label-sm font-label-sm uppercase tracking-[0.2em]">
                  Rating
                </span>
                <RatingStars value={averageRating} readonly size="sm" />
                <span className="text-body-md font-body-md">
                  {averageRating.toFixed(1)} ({reviewsCount} review{reviewsCount === 1 ? '' : 's'})
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                className="w-full disabled:cursor-not-allowed disabled:opacity-60"
                disabled={stock === 0}
                onClick={() => {
                  if (stock > 0) {
                    addToCart(product);
                    toast.success('Product added to cart');
                  }
                }}
              >
                {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>

            <div className="space-y-3 text-body-md font-body-md text-on-surface-variant">
              <p>{description}</p>
              <p>
                <span className="font-semibold text-on-surface">Category:</span>{' '}
                {category}
              </p>
              <p>
                <span className="font-semibold text-on-surface">Featured:</span>{' '}
                {product.featured ? 'Yes' : 'No'}
              </p>
            </div>
          </Card>
        </div>

        <ProductReviews
          productId={productId}
          initialSummary={reviewSummary}
          onSummaryChange={setReviewSummary}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
