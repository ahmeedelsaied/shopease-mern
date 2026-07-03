import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';

const HomePage = () => {
  const location = useLocation();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const queryParam = new URLSearchParams(location.search).get('q') ?? '';
    setSearchQuery(queryParam);
  }, [location.search]);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!hash) return;

    const element = document.getElementById(hash);
    if (element) {
      window.requestAnimationFrame(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [location.hash]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/products');
        const products = response.data?.data ?? [];
        setAllProducts(products);

        const uniqueCategories = Array.from(new Set(products.map((product) => product.category))).sort();
        setCategories(['All', ...uniqueCategories]);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Unable to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allProducts.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [allProducts, searchQuery, selectedCategory]);

  const featuredProducts = useMemo(
    () => allProducts.filter((product) => product.featured).slice(0, 3),
    [allProducts]
  );
  const newArrivals = useMemo(
    () => [...allProducts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4),
    [allProducts]
  );
  const dealProducts = useMemo(
    () => allProducts.filter((product) => product.price < 180).slice(0, 4),
    [allProducts]
  );
  const categoryCards = useMemo(() => {
    const values = categories.filter((category) => category !== 'All').slice(0, 6);
    return values.map((category, index) => ({
      name: category,
      description: `${category} picks curated for modern living.`,
      accent: ['from-inverse-surface to-primary', 'from-secondary to-primary', 'from-amber-500 to-orange-500', 'from-emerald-500 to-teal-600', 'from-fuchsia-500 to-rose-500', 'from-violet-600 to-indigo-500'][index],
    }));
  }, [categories]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="px-margin-mobile py-6 sm:py-8 md:px-margin-desktop lg:py-10">
      <div className="mx-auto max-w-container-max space-y-6 sm:space-y-8 lg:space-y-10">
        <section id="hero" className="relative overflow-hidden rounded-[2.5rem] border border-outline-variant/30 bg-gradient-to-br from-inverse-surface via-primary to-secondary p-8 text-on-primary shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-10 lg:p-14">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex rounded-full border border-outline-variant/15 bg-surface-container-low/10 px-4 py-2 text-sm font-medium backdrop-blur-md">
                Premium arrivals • Fast delivery • Curated essentials
              </div>
              <div className="space-y-4">
                <h1 className="text-display-lg-mobile font-display-lg-mobile tracking-[-0.03em] md:text-display-lg md:font-display-lg">
                  Elevated shopping for everyday luxury.
                </h1>
                <p className="max-w-xl text-lg text-on-primary/80">
                  Discover refined products, elegant search, and a storefront experience that feels as polished as the products themselves.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/#featured" className="rounded-full bg-surface-container-lowest px-5 py-3 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5">Explore featured</Link>
                <Link to="/cart" className="rounded-full border border-outline-variant/20 bg-surface-container-low/10 px-5 py-3 text-sm font-semibold text-on-primary backdrop-blur-md transition-transform hover:-translate-y-0.5">View cart</Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-low/10 p-5 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-surface-container-lowest/90 p-5 text-on-surface">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-on-surface-variant">This week</p>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-600">Free shipping</span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-[1.25rem] bg-inverse-surface p-5 text-inverse-on-surface">
                    <p className="text-sm text-inverse-on-surface/70">Trending</p>
                    <p className="mt-2 text-xl font-semibold">Launch collection</p>
                    <p className="mt-2 text-sm text-inverse-on-surface/80">Designed to feel effortless from first click to checkout.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-outline-variant/40 bg-surface-container-low p-4">
                      <p className="text-sm text-on-surface-variant">Categories</p>
                      <p className="mt-1 text-2xl font-semibold text-primary">{categories.length - 1}</p>
                    </div>
                    <div className="rounded-[1rem] border border-outline-variant/40 bg-surface-container-low p-4">
                      <p className="text-sm text-on-surface-variant">Stocked</p>
                      <p className="mt-1 text-2xl font-semibold text-primary">{allProducts.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-outline-variant/30 bg-surface-container-low/80 p-6 shadow-soft backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:w-[48%]">
              <SearchBar searchQuery={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="w-full lg:w-[48%]">
              <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
            </div>
          </div>
        </section>

        <section id="categories" className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Curated categories</p>
              <h2 className="text-headline-lg font-headline-lg text-primary">Browse by mood and need</h2>
            </div>
            <Link to="/" className="text-sm font-semibold text-secondary transition-colors hover:text-primary">View all</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categoryCards.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => handleCategorySelect(category.name)}
                className="group overflow-hidden rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest p-6 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
              >
                <div className={`h-24 rounded-[1.25rem] bg-gradient-to-br ${category.accent}`} />
                <div className="mt-5 space-y-2">
                  <h3 className="text-headline-md font-headline-md text-primary">{category.name}</h3>
                  <p className="text-body-md text-on-surface-variant">{category.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section id="featured" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Featured</p>
                <h2 className="text-headline-lg font-headline-lg text-primary">Signature picks</h2>
              </div>
              <Link to="/" className="rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-high">Shop now</Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {featuredProducts.map((product) => (
                <Link key={product._id} to={`/products/${product._id}`} className="group rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="aspect-square w-full rounded-[1rem] object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-semibold text-primary">{product.name}</p>
                    <p className="text-sm text-on-surface-variant">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

            <div id="deals" className="rounded-[2rem] border border-outline-variant/30 bg-gradient-to-br from-primary to-secondary p-6 text-on-primary shadow-soft">
            <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-primary/70">Limited offer</p>
            <h3 className="mt-3 text-headline-lg font-headline-lg">Save on the latest arrivals</h3>
            <p className="mt-3 max-w-md text-body-md text-on-primary/80">Upgrade your setup with premium essentials and enjoy complimentary delivery on select pieces.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {dealProducts.map((product) => (
                <div key={product._id} className="rounded-[1.25rem] border border-outline-variant/30 bg-surface-container-low/10 p-3 backdrop-blur-lg">
                  <p className="text-sm font-semibold">{product.name}</p>
                  <p className="mt-1 text-sm text-on-primary/70">${product.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="new-arrivals" className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">New arrivals</p>
              <h2 className="text-headline-lg font-headline-lg text-primary">Freshly released this week</h2>
            </div>
            <Link to="/" className="text-sm font-semibold text-secondary transition-colors hover:text-primary">Discover more</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {newArrivals.map((product) => (
              <Link key={product._id} to={`/products/${product._id}`} className="overflow-hidden rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover" />
                <div className="space-y-2 p-5">
                  <p className="text-sm font-semibold text-secondary">{product.category}</p>
                  <h3 className="text-headline-sm font-headline-sm text-primary">{product.name}</h3>
                  <p className="text-body-md text-on-surface-variant">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="brands" className="rounded-[2rem] border border-outline-variant/30 bg-surface-container-low/80 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Trending now</p>
              <h2 className="text-headline-lg font-headline-lg text-primary">Built with beloved brands and modern essentials.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Apple', category: 'Electronics' },
                { label: 'Nike', category: 'Shoes' },
                { label: 'Stripe', category: 'Accessories' },
                { label: 'Vercel', category: 'Electronics' },
                { label: 'Notion', category: 'Accessories' },
                { label: 'Figma', category: 'Fashion' },
              ].map((brand) => (
                <button
                  key={brand.label}
                  type="button"
                  onClick={() => handleCategorySelect(brand.category)}
                  className="rounded-full border border-outline-variant/40 bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface-variant shadow-sm transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                >
                  {brand.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="rounded-[2rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
          <div className="max-w-3xl space-y-4">
            <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Why ShopEase</p>
            <h2 className="text-headline-lg font-headline-lg text-primary">A premium experience from first glance to last mile.</h2>
            <p className="text-body-md text-on-surface-variant">Thoughtful product discovery, elegant motion, and dependable flows make every visit feel premium and effortless. Every section is designed to keep the shopping experience focused, polished, and easy to navigate.</p>
          </div>
        </section>

        <section id="contact" className="rounded-[2rem] border border-outline-variant/30 bg-surface-container-low/80 p-6 shadow-soft backdrop-blur-xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div className="space-y-4">
              <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Contact</p>
              <h2 className="text-headline-lg font-headline-lg text-primary">Need help with your order?</h2>
              <p className="text-body-md text-on-surface-variant">Reach out to our support team for expert guidance, shipping updates, and product recommendations.</p>
              <div className="space-y-3 rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-secondary">mail</span>
                  <span className="text-body-md text-on-surface-variant">support@shopease.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-secondary">call</span>
                  <span className="text-body-md text-on-surface-variant">+1 (800) 555-0188</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-secondary">location_on</span>
                  <span className="text-body-md text-on-surface-variant">123 Market Street, San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-secondary">schedule</span>
                  <span className="text-body-md text-on-surface-variant">Mon–Fri • 8am–8pm</span>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Product catalog</p>
                  <h3 className="text-headline-lg font-headline-lg text-primary">Browse our curated catalog</h3>
                </div>
                <p className="text-body-md text-on-surface-variant">
                  {loading ? 'Loading products...' : `${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} found`}
                </p>
              </div>
              <div id="products" className="mt-6">
                <ProductGrid products={filteredProducts} loading={loading} error={error} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
