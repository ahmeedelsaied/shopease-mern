import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import ProductResultsBar from '../components/ProductResultsBar';
import Pagination from '../components/Pagination';
import ProductFiltersPanel from '../components/ProductFiltersPanel';
import { SortDropdown, FilterChips } from '../components/filters';
import Button from '../components/ui/Button';
import ImageWithSkeleton from '../components/ui/ImageWithSkeleton';
import { CategorySkeleton, ProductCardSkeleton, Skeleton } from '../components/ui/Skeleton';
import useScrollToSection from '../hooks/useScrollToSection';
import useProductFilters from '../hooks/useProductFilters';
import useDebounce from '../hooks/useDebounce';
import { navigateToSection, HOME_SECTIONS } from '../utils/navigation';

const DEFAULT_PAGE_SIZE = 9;
const DEFAULT_SORT = 'newest';
const DEFAULT_CATEGORY = 'All';
const DEFAULT_RATING = '0';

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value) => value === 'true' || value === '1';

const buildApiParams = (filters) => ({
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.category !== DEFAULT_CATEGORY ? { category: filters.category } : {}),
  minPrice: filters.minPrice,
  maxPrice: filters.maxPrice,
  ...(filters.rating !== DEFAULT_RATING ? { rating: filters.rating } : {}),
  ...(filters.featured ? { featured: 'true' } : {}),
  ...(filters.inStock ? { inStock: 'true' } : {}),
  sort: filters.sort,
  page: filters.page,
  limit: filters.limit,
});

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogMeta, setCatalogMeta] = useState({
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // URL is the source of truth for the active search; the input box owns only
  // the ephemeral keystroke buffer. We debounce that buffer before pushing it
  // into the URL so the product list refreshes once per pause, not per keystroke.
  const [debouncedSearch] = useDebounce(searchInput, 300);

  const priceBounds = useMemo(() => {
    if (!allProducts.length) {
      return { min: 0, max: 1000 };
    }

    const prices = allProducts.map((product) => Number(product.price) || 0);
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));

    return {
      min,
      max: Math.max(max, min + 1),
    };
  }, [allProducts]);

  const filters = useMemo(() => {
    const rawSearch = searchParams.get('search') ?? searchParams.get('q') ?? '';
    const rawCategory = searchParams.get('category') ?? DEFAULT_CATEGORY;
    const rawSort = searchParams.get('sort') ?? DEFAULT_SORT;
    const rawPage = parseNumber(searchParams.get('page'), 1);
    const rawLimit = parseNumber(searchParams.get('limit'), DEFAULT_PAGE_SIZE);
    const rawRating = searchParams.get('rating') ?? DEFAULT_RATING;
    const rawMinPrice = searchParams.get('minPrice');
    const rawMaxPrice = searchParams.get('maxPrice');

    const minPriceValue = rawMinPrice === null ? priceBounds.min : parseNumber(rawMinPrice, priceBounds.min);
    const maxPriceValue = rawMaxPrice === null ? priceBounds.max : parseNumber(rawMaxPrice, priceBounds.max);
    const minPrice = Math.max(priceBounds.min, Math.min(minPriceValue, priceBounds.max));
    const maxPrice = Math.max(minPrice, Math.min(maxPriceValue, priceBounds.max));

    return {
      search: rawSearch,
      category: rawCategory,
      sort: rawSort,
      minPrice,
      maxPrice,
      rating: rawRating,
      featured: parseBoolean(searchParams.get('featured')),
      inStock: parseBoolean(searchParams.get('inStock')),
      page: Math.max(1, Math.floor(rawPage)),
      limit: Math.max(1, Math.floor(rawLimit)),
    };
  }, [priceBounds.max, priceBounds.min, searchParams]);

  const activeQuery = searchParams.toString();

  const categoriesForFilter = useMemo(
    () => categories.filter((category) => category !== DEFAULT_CATEGORY),
    [categories]
  );

  const { activeChips, sortOptions } = useProductFilters(
    filters,
    priceBounds,
    categoriesForFilter,
  );

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
    const values = categoriesForFilter.slice(0, 6);
    return values.map((category, index) => ({
      name: category,
      description: `${category} picks curated for modern living.`,
      accent: [
        'from-inverse-surface to-primary',
        'from-secondary to-primary',
        'from-amber-500 to-orange-500',
        'from-emerald-500 to-teal-600',
        'from-fuchsia-500 to-rose-500',
        'from-violet-600 to-indigo-500',
      ][index],
    }));
  }, [categoriesForFilter]);

  const updateSearchParams = useCallback(
    (updates, { replace = false } = {}) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      setSearchParams(next, { replace });
    },
    [searchParams, setSearchParams]
  );

  /* Scroll to section when navigating with a hash (e.g. from /cart → /#featured) */
  useScrollToSection(location.pathname, location.hash);

  useEffect(() => {
    const loadAllProducts = async () => {
      setInitialLoading(true);
      setError('');

      try {
        const response = await api.get('/products');
        const products = response.data?.products ?? response.data?.data ?? [];
        setAllProducts(products);

        const responseCategories = response.data?.categories?.length
          ? response.data.categories
          : Array.from(new Set(products.map((product) => product.category))).sort();
        setCategories(responseCategories);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Unable to load products. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadAllProducts();
  }, []);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (activeQuery) {
      return undefined;
    }

    setCatalogLoading(false);

    const pageSize = Math.min(DEFAULT_PAGE_SIZE, Math.max(allProducts.length, 1));
    const seededProducts = allProducts.slice(0, pageSize);

    setCatalogProducts(seededProducts);
    setCatalogMeta({
      totalProducts: allProducts.length,
      totalPages: Math.max(1, Math.ceil(allProducts.length / pageSize)),
      currentPage: 1,
      pageSize,
      hasNextPage: allProducts.length > pageSize,
      hasPreviousPage: false,
    });

    return undefined;
  }, [activeQuery, allProducts]);

  useEffect(() => {
    if (!activeQuery) {
      return undefined;
    }

    const loadCatalog = async () => {
      setCatalogLoading(true);
      setError('');

      try {
        const response = await api.get('/products', { params: buildApiParams(filters) });
        const products = response.data?.products ?? response.data?.data ?? [];

        setCatalogProducts(products);
        setCatalogMeta({
          totalProducts: response.data?.totalProducts ?? products.length,
          totalPages: response.data?.totalPages ?? 1,
          currentPage: response.data?.currentPage ?? filters.page,
          pageSize: response.data?.pageSize ?? filters.limit,
          hasNextPage: Boolean(response.data?.hasNextPage),
          hasPreviousPage: Boolean(response.data?.hasPreviousPage),
        });

        if (response.data?.categories?.length) {
          setCategories(response.data.categories);
        }
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Unable to load products. Please try again.');
      } finally {
        setCatalogLoading(false);
      }
    };

    loadCatalog();
  }, [activeQuery, filters]);

  useEffect(() => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [filters.page]);

  // Push the debounced search term into the URL (the single source of truth).
  // Going from URL → input is handled by the sync effect above; this effect
  // owns only input → URL, so we skip the write when they already match.
  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed !== filters.search) {
      updateSearchParams({ search: trimmed || undefined, page: 1 }, { replace: true });
    }
  }, [debouncedSearch, filters.search, updateSearchParams]);

  const handleCategorySelect = useCallback(
    (category) => {
      updateSearchParams({ category, page: 1 });
      setMobileFiltersOpen(false);

      const productsSection = document.getElementById('products');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [updateSearchParams]
  );

  const handleSortChange = useCallback(
    (sort) => {
      updateSearchParams({ sort, page: 1 });
    },
    [updateSearchParams]
  );

  const handleMinPriceChange = useCallback(
    (value) => {
      const nextMin = Math.min(value, filters.maxPrice);
      const nextMax = Math.max(value, filters.maxPrice);
      updateSearchParams({ minPrice: nextMin, maxPrice: nextMax, page: 1 });
    },
    [filters.maxPrice, updateSearchParams]
  );

  const handleMaxPriceChange = useCallback(
    (value) => {
      const nextMin = Math.min(value, filters.minPrice);
      const nextMax = Math.max(value, filters.minPrice);
      updateSearchParams({ minPrice: nextMin, maxPrice: nextMax, page: 1 });
    },
    [filters.minPrice, updateSearchParams]
  );

  const handleRatingChange = useCallback(
    (rating) => {
      updateSearchParams({ rating, page: 1 });
    },
    [updateSearchParams]
  );

  const handleToggleChange = useCallback(
    (key, value) => {
      updateSearchParams({ [key]: value ? 'true' : undefined, page: 1 });
    },
    [updateSearchParams]
  );

  const handlePageChange = useCallback(
    (page) => {
      updateSearchParams({ page });
    },
    [updateSearchParams]
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    updateSearchParams(
      {
        search: undefined,
        category: DEFAULT_CATEGORY,
        sort: DEFAULT_SORT,
        minPrice: undefined,
        maxPrice: undefined,
        rating: DEFAULT_RATING,
        featured: undefined,
        inStock: undefined,
        page: undefined,
        limit: undefined,
      },
      { replace: false }
    );
  }, [updateSearchParams]);

  // Maps a chip key (from useProductFilters.activeChips) back to the URL
  // params that must be reset to clear that single filter.
  const handleClearSingleFilter = useCallback(
    (key) => {
      switch (key) {
        case 'search':
          setSearchInput('');
          updateSearchParams({ search: undefined, page: 1 });
          break;
        case 'category':
          updateSearchParams({ category: DEFAULT_CATEGORY, page: 1 });
          break;
        case 'price':
          updateSearchParams({ minPrice: undefined, maxPrice: undefined, page: 1 });
          break;
        case 'rating':
          updateSearchParams({ rating: DEFAULT_RATING, page: 1 });
          break;
        case 'featured':
          updateSearchParams({ featured: undefined, page: 1 });
          break;
        case 'inStock':
          updateSearchParams({ inStock: undefined, page: 1 });
          break;
        default:
          break;
      }
    },
    [updateSearchParams]
  );

  const totalProducts = catalogMeta.totalProducts;
  const totalPages = catalogMeta.totalPages;
  const currentPage = catalogMeta.currentPage;

  return (
    <div className="px-margin-mobile py-6 sm:py-8 md:px-margin-desktop lg:py-10">
      <div className="mx-auto max-w-container-max space-y-6 sm:space-y-8 lg:space-y-10">
        <section
          id="hero"
          className="relative overflow-hidden rounded-[2.5rem] border border-outline-variant/30 bg-gradient-to-br from-inverse-surface via-primary to-secondary p-8 text-on-primary shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-10 lg:p-14"
        >
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex rounded-full border border-outline-variant/15 bg-surface-container-low/10 px-4 py-2 text-sm font-medium backdrop-blur-md">
                Premium arrivals - Fast delivery - Curated essentials
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
                <button
                  type="button"
                  onClick={() => navigateToSection({ sectionId: HOME_SECTIONS.FEATURED, navigate, pathname: location.pathname })}
                  className="rounded-full bg-surface-container-lowest px-5 py-3 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                >
                  Explore featured
                </button>
                <Link
                  to="/cart"
                  className="rounded-full border border-outline-variant/20 bg-surface-container-low/10 px-5 py-3 text-sm font-semibold text-on-primary backdrop-blur-md transition-transform hover:-translate-y-0.5"
                >
                  View cart
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-low/10 p-5 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-surface-container-lowest/90 p-5 text-on-surface">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                    This week
                  </p>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-600">
                    Free shipping
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-[1.25rem] bg-inverse-surface p-5 text-inverse-on-surface">
                    <p className="text-sm text-inverse-on-surface/70">Trending</p>
                    <p className="mt-2 text-xl font-semibold">Launch collection</p>
                    <p className="mt-2 text-sm text-inverse-on-surface/80">
                      Designed to feel effortless from first click to checkout.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-outline-variant/40 bg-surface-container-low p-4">
                      <p className="text-sm text-on-surface-variant">Categories</p>
                      <p className="mt-1 text-2xl font-semibold text-primary">{categories.length}</p>
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full lg:max-w-2xl">
              <SearchBar searchQuery={searchInput} onChange={setSearchInput} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-56">
                <SortDropdown
                  options={sortOptions}
                  value={filters.sort}
                  onChange={handleSortChange}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                className="xl:hidden"
                onClick={() => setMobileFiltersOpen(true)}
                icon="tune"
              >
                Filters
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="hidden xl:inline-flex"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            </div>
          </div>
        </section>

        <section id="categories" className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
                Curated categories
              </p>
              <h2 className="text-headline-lg font-headline-lg text-primary">Browse by mood and need</h2>
            </div>
            <Link to="/" className="text-sm font-semibold text-secondary transition-colors hover:text-primary">
              View all
            </Link>
          </div>
          {initialLoading ? (
            <CategorySkeleton />
          ) : (
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
          )}
        </section>

        <section id="featured" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
                  Featured
                </p>
                <h2 className="text-headline-lg font-headline-lg text-primary">Signature picks</h2>
              </div>
              <Link
                to="/"
                className="rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-high"
              >
                Shop now
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {initialLoading ? Array.from({ length: 3 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              )) : featuredProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="group rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-low p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <ImageWithSkeleton
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    wrapperClassName="aspect-square w-full rounded-[1rem]"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-semibold text-primary">{product.name}</p>
                    <p className="text-sm text-on-surface-variant">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div id="deals" className="rounded-[2rem] border border-outline-variant/30 bg-gradient-to-br from-primary to-secondary p-6 text-on-primary shadow-soft">
            <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-primary/70">
              Limited offer
            </p>
            <h3 className="mt-3 text-headline-lg font-headline-lg">Save on the latest arrivals</h3>
            <p className="mt-3 max-w-md text-body-md text-on-primary/80">
              Upgrade your setup with premium essentials and enjoy complimentary delivery on select pieces.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {initialLoading ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[1.25rem] border border-outline-variant/30 bg-surface-container-low/10 p-3 backdrop-blur-lg"
                >
                  <Skeleton className="h-5 w-32 bg-surface-container-low/30" />
                  <Skeleton className="mt-2 h-4 w-20 bg-surface-container-low/30" />
                </div>
              )) : dealProducts.map((product) => (
                <div
                  key={product._id}
                  className="rounded-[1.25rem] border border-outline-variant/30 bg-surface-container-low/10 p-3 backdrop-blur-lg"
                >
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
              <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
                New arrivals
              </p>
              <h2 className="text-headline-lg font-headline-lg text-primary">Freshly released this week</h2>
            </div>
            <Link to="/" className="text-sm font-semibold text-secondary transition-colors hover:text-primary">
              Discover more
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {initialLoading ? Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            )) : newArrivals.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="overflow-hidden rounded-[1.75rem] border border-outline-variant/30 bg-surface-container-lowest shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <ImageWithSkeleton
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  wrapperClassName="aspect-[4/5] w-full"
                />
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
              <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
                Trending now
              </p>
              <h2 className="text-headline-lg font-headline-lg text-primary">
                Built with beloved brands and modern essentials.
              </h2>
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
            <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
              Why ShopEase
            </p>
            <h2 className="text-headline-lg font-headline-lg text-primary">
              A premium experience from first glance to last mile.
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Thoughtful product discovery, elegant motion, and dependable flows make every visit feel premium and effortless. Every section is designed to keep the shopping experience focused, polished, and easy to navigate.
            </p>
          </div>
        </section>

        <section id="contact" className="space-y-6 rounded-[2rem] border border-outline-variant/30 bg-surface-container-low/80 p-6 shadow-soft backdrop-blur-xl">
          <div className="space-y-5 rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
                    Product catalog
                  </p>
                  <h3 className="text-headline-lg font-headline-lg text-primary">Browse our curated catalog</h3>
                </div>
                <p className="text-body-md text-on-surface-variant">
                  {catalogLoading || initialLoading
                    ? 'Loading products...'
                    : `${totalProducts} product${totalProducts === 1 ? '' : 's'} found`}
                </p>
              </div>

              <div className="grid min-w-0 gap-6 xl:grid-cols-[300px_minmax(0,1fr)] xl:items-start">
                <ProductFiltersPanel
                  categories={categoriesForFilter}
                  filters={filters}
                  priceBounds={priceBounds}
                  onCategoryChange={handleCategorySelect}
                  onMinPriceChange={handleMinPriceChange}
                  onMaxPriceChange={handleMaxPriceChange}
                  onRatingChange={handleRatingChange}
                  onFeaturedChange={(checked) => handleToggleChange('featured', checked)}
                  onInStockChange={(checked) => handleToggleChange('inStock', checked)}
                  onClearFilters={handleClearFilters}
                  mobileOpen={mobileFiltersOpen}
                  onMobileClose={() => setMobileFiltersOpen(false)}
                />

                <div className="space-y-4" id="products">
                  <FilterChips
                    chips={activeChips}
                    onClear={handleClearSingleFilter}
                    onClearAll={handleClearFilters}
                  />
                  <ProductResultsBar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={catalogMeta.pageSize}
                    total={totalProducts}
                  />

                  <div key={activeQuery} className="animate-content-in">
                    <ProductGrid
                      products={catalogProducts}
                      loading={catalogLoading || initialLoading}
                      error={error}
                      searchTerm={filters.search}
                      onClearFilters={handleClearFilters}
                    />
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>

          <div className="space-y-4">
            <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
              Contact
            </p>
            <h2 className="text-headline-lg font-headline-lg text-primary">Need help with your order?</h2>
            <p className="max-w-3xl text-body-md text-on-surface-variant">
              Reach out to our support team for expert guidance, shipping updates, and product recommendations.
            </p>
            <div className="grid gap-3 rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
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
                <span className="text-body-md text-on-surface-variant">Mon-Fri - 8am-8pm</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="sr-only" aria-live="polite">
        {mobileFiltersOpen ? 'Filters open' : 'Filters closed'}
      </div>
    </div>
  );
};

export default HomePage;
