import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

  const productJsonLd = useMemo(() => buildProductJsonLd(product, { siteUrl: getSiteUrl() }), [product]);

  useEffect(() => {
    let isCurrent = true;
    const loadProduct = async () => {
      setLoading(true); setError(''); setNotFound(false); setProduct(null); setReviewSummary(null);
      try {
        const response = await api.get(`/products/${id}`);
        const productData = response.data?.data ?? null;
        if (!isCurrent) return;
        if (!productData) { setNotFound(true); return; }
        setProduct(productData);
        addRecentlyViewed(productData);
        setReviewSummary({ averageRating: productData.averageRating ?? productData.rating ?? 0, reviewsCount: productData.reviewsCount ?? 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      } catch (fetchError) {
        if (!isCurrent) return;
        if (fetchError?.response?.status === 404) { setNotFound(true); return; }
        setError(fetchError?.response?.data?.message || 'Unable to load product details. Please try again.');
      } finally { if (isCurrent) setLoading(false); }
    };
    if (!id) { setNotFound(true); setLoading(false); return undefined; }
    loadProduct();
    return () => { isCurrent = false; };
  }, [id, addRecentlyViewed]);

  if (loading) return <ProductDetailsSkeleton />;
  if (notFound) return <div className="page-shell"><EmptyState icon="search_off" title="Product not found" description="This product is no longer available or the link is invalid." actionLabel="Browse products" actionTo="/" /></div>;
  if (error) return <div className="page-shell"><div className="mx-auto max-w-container-max rounded-[1.6rem] border border-error/25 bg-error-container p-10 text-center"><p className="text-body-lg font-body-lg text-error">{error}</p></div></div>;
  if (!product) return <div className="page-shell"><EmptyState icon="error" title="Product unavailable" description="We could not display this product. Please return to the catalogue and try again." actionLabel="Browse products" actionTo="/" /></div>;

  const price = Math.max(0, Number(product.price) || 0);
  const stock = Math.max(0, Number(product.stock) || 0);
  const rawRating = Number(reviewSummary?.averageRating ?? product.averageRating ?? product.rating ?? 0);
  const averageRating = Number.isFinite(rawRating) ? Math.min(Math.max(rawRating, 0), 5) : 0;
  const rawReviewsCount = Number(reviewSummary?.reviewsCount ?? product.reviewsCount ?? 0);
  const reviewsCount = Number.isFinite(rawReviewsCount) && rawReviewsCount > 0 ? rawReviewsCount : 0;
  const productId = product._id ?? product.id ?? id;
  const name = product.name || 'Product';
  const description = product.description || 'No description is available for this product.';
  const category = product.category || 'Uncategorised';
  const image = product.image || (Array.isArray(product.images) ? product.images.find(Boolean) : undefined);
  const canonical = `${getSiteUrl()}/products/${productId}`;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({ siteUrl: getSiteUrl(), items: [{ name: 'Home', path: '/' }, { name: category, path: `/?category=${encodeURIComponent(category)}` }, { name, path: `/products/${productId}` }] });
  const combinedJsonLd = combineJsonLd([productJsonLd, breadcrumbJsonLd]);

  return (
    <div className="page-shell">
      <SEO title={name} description={description} canonical={canonical} image={image} type="product" jsonLd={combinedJsonLd} />
      <div className="mx-auto max-w-container-max space-y-12">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-on-surface-variant"><Link to="/" className="transition-colors hover:text-secondary">ShopEase</Link><span className="material-symbols-outlined text-[15px]">chevron_right</span><span>{category}</span><span className="material-symbols-outlined text-[15px]">chevron_right</span><span className="truncate text-primary">{name}</span></div>
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-4"><div className="flex items-center justify-between"><p className="eyebrow">{category}</p><span className="rounded-full bg-surface-container px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">{stock > 0 ? 'Available now' : 'Out of stock'}</span></div><ProductGallery product={product} /></div>
          <Card variant="panel" className="sticky top-36 space-y-7 p-6 sm:p-8">
            <div className="space-y-4"><h1 className="font-display-lg text-4xl leading-[1.05] tracking-[-0.04em] text-primary sm:text-5xl">{name}</h1><p className="max-w-xl text-body-md text-on-surface-variant">{description}</p></div>
            <div className="flex flex-wrap items-end justify-between gap-4 border-y border-outline-variant/30 py-5"><span className="text-4xl font-bold tracking-[-0.05em] text-primary">${price.toFixed(2)}</span><div className="text-right"><div className="flex items-center justify-end gap-2"><RatingStars value={averageRating} readonly size="sm" /><span className="text-sm font-bold text-primary">{averageRating.toFixed(1)}</span></div><span className="mt-1 block text-xs text-on-surface-variant">{reviewsCount} review{reviewsCount === 1 ? '' : 's'}</span></div></div>
            <div className="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3 text-sm"><span className="flex items-center gap-2 font-semibold text-primary"><span className="material-symbols-outlined text-[18px] text-secondary">inventory_2</span>{stock > 0 ? `${stock} in stock` : 'Out of stock'}</span><span className="text-xs text-on-surface-variant">Fast delivery</span></div>
            <Button type="button" variant="primary" className="w-full" disabled={stock === 0} onClick={() => { if (stock > 0) { addToCart(product); toast.success('Product added to cart'); } }} icon="shopping_bag">{stock > 0 ? 'Add to bag' : 'Out of stock'}</Button>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-on-surface-variant"><div className="rounded-2xl border border-outline-variant/35 p-3"><span className="material-symbols-outlined mb-2 text-[18px] text-secondary">local_shipping</span><p>Clear delivery</p><span className="font-normal">Reliable updates</span></div><div className="rounded-2xl border border-outline-variant/35 p-3"><span className="material-symbols-outlined mb-2 text-[18px] text-secondary">verified</span><p>Considered quality</p><span className="font-normal">Made to last</span></div></div>
            <div className="space-y-3 border-t border-outline-variant/30 pt-5 text-sm leading-6 text-on-surface-variant"><p>{description}</p><p><span className="font-bold text-primary">Category:</span> {category}</p><p><span className="font-bold text-primary">Featured:</span> {product.featured ? 'Yes' : 'No'}</p></div>
          </Card>
        </div>
        <ProductReviews productId={productId} initialSummary={reviewSummary} onSummaryChange={setReviewSummary} />
      </div>
    </div>
  );
};

export default ProductDetails;
