import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data?.data ?? null);
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
        <div className="max-w-container-max mx-auto rounded-3xl bg-surface-container-low p-10 text-center">
          <Loader variant="spinner" className="text-[32px]" />
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
                <span className="text-body-md font-body-md">
                  {product.rating?.toFixed(1) ?? '0.0'} ★
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                className="w-full disabled:cursor-not-allowed disabled:opacity-60"
                disabled={product.stock === 0}
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
      </div>
    </div>
  );
};

export default ProductDetails;
