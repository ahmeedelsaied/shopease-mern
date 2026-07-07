import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { Skeleton, SkeletonText } from '../components/ui/Skeleton';
import { useCart } from '../context/CartContext';
import ProductReviews from '../components/ProductReviews';
import RatingStars from '../components/RatingStars';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [reviewSummary, setReviewSummary] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/products/${id}`);
        const productData = response.data?.data ?? null;
        setProduct(productData);
        setReviewSummary({
          averageRating: productData?.averageRating ?? productData?.rating ?? 0,
          reviewsCount: productData?.reviewsCount ?? 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message ||
            'Unable to load product details. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }; 

    if (id) {
      loadProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
        <div className="max-w-container-max mx-auto space-y-8">
          <div className="space-y-3 text-center">
            <Skeleton className="mx-auto h-4 w-24" />
            <Skeleton className="mx-auto h-8 w-56" />
            <SkeletonText lines={3} className="mx-auto max-w-2xl" />
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <Skeleton className="h-[520px] w-full" />
            <div className="space-y-4 rounded-3xl border border-outline-variant/20 bg-surface-container-low p-8 shadow-soft">
              <Skeleton className="h-10 w-40" />
              <SkeletonText lines={4} />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
          </div>
        </div>
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
    return null;
  }

  const formattedPrice = `$${product.price.toFixed(2)}`;
  const stockLabel = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
  const averageRating = reviewSummary?.averageRating ?? product.averageRating ?? product.rating ?? 0;
  const reviewsCount = reviewSummary?.reviewsCount ?? product.reviewsCount ?? 0;

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
      <div className="max-w-container-max mx-auto space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
            {product.category}
          </p>
          <h1 className="text-headline-lg font-headline-lg text-primary">
            {product.name}
          </h1>
          <p className="max-w-2xl mx-auto text-body-lg font-body-lg text-on-surface-variant">
            {product.description}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] items-start">
          <Card variant="product" className="overflow-hidden shadow-soft">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-[520px] object-cover"
            />
          </Card>

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
                disabled={product.stock === 0}
                onClick={() => {
                  if (product.stock > 0) {
                    addToCart(product);
                    setShowToast(true);
                  }
                }}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>

            <div className="space-y-3 text-body-md font-body-md text-on-surface-variant">
              <p>{product.description}</p>
              <p>
                <span className="font-semibold text-on-surface">Category:</span>{' '}
                {product.category}
              </p>
              <p>
                <span className="font-semibold text-on-surface">Featured:</span>{' '}
                {product.featured ? 'Yes' : 'No'}
              </p>
            </div>
          </Card>
        </div>

        <ProductReviews
          productId={product._id}
          initialSummary={reviewSummary}
          onSummaryChange={setReviewSummary}
        />
      </div>
      <Toast
        message="Product added to cart"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ProductDetails;
