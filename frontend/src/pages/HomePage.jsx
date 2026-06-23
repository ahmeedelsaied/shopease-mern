import { useEffect, useMemo, useState } from 'react';
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
              E-Commerce Platform
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-surface-container-low p-gutter md:p-10 shadow-soft">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-1/2">
              <SearchBar
                searchQuery={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
            <div className="w-full md:w-1/2">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>
          </div>
        </section>

        <section>
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
          />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
