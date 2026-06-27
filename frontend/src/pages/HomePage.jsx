import { useEffect, useState } from 'react';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get('/products');
        const allProducts = response.data?.data ?? [];
        const uniqueCategories = Array.from(
          new Set(allProducts.map((product) => product.category))
        ).sort();

        setCategories(['All', ...uniqueCategories]);
      } catch (fetchError) {
        // Keep default categories when category load fails
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const params = {};

        if (searchQuery) {
          params.search = searchQuery;
        }

        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }

        const response = await api.get('/products', { params });

        setProducts(response.data?.data ?? []);
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message ||
            'Unable to load products. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory]);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
      <div className="max-w-container-max mx-auto space-y-10">
        <section className="flex flex-col items-center text-center gap-stack-sm">
          <div>
            <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg-mobile md:font-display-lg text-primary tracking-tight">
              ShopEase
            </h1>
            <p className="mt-stack-sm text-body-lg font-body-lg text-on-surface-variant">
              Discover premium products with elegant search and filtering.
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-surface-container-low p-gutter md:p-10 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:w-[48%]">
              <SearchBar
                searchQuery={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
            <div className="w-full lg:w-[48%]">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
                Product listing
              </p>
              <h2 className="text-headline-lg font-headline-lg text-primary">
                Browse our curated catalog
              </h2>
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant">
              {loading
                ? 'Loading products...'
                : `${products.length} product${products.length === 1 ? '' : 's'} found`}
            </p>
          </div>

          <ProductGrid products={products} loading={loading} error={error} />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
