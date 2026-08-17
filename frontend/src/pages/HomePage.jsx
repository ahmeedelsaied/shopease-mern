import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import SEO from '../components/SEO';
import { DEFAULT_SEO, getSiteUrl } from '../seo/seoDefaults';
import { buildWebsiteJsonLd } from '../seo/websiteJsonLd';
import ProductCard from '../components/ProductCard';
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
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
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

const formatPrice = (value) => `$${(Number(value) || 0).toFixed(2)}`;

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogMeta, setCatalogMeta] = useState({ totalProducts: 0, totalPages: 1, currentPage: 1, pageSize: DEFAULT_PAGE_SIZE, hasNextPage: false, hasPreviousPage: false });
  const [initialLoading, setInitialLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? searchParams.get('q') ?? '');
  const syncingSearchFromUrl = useRef(true);
  const hasMountedCatalogRef = useRef(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { recentlyViewedItems: recentProducts, hydrated: recentHydrated, itemCount: recentCount } = useRecentlyViewed();
  const websiteJsonLd = useMemo(() => buildWebsiteJsonLd({ siteUrl: getSiteUrl() }), []);
  const [debouncedSearch] = useDebounce(searchInput, 300);

  const priceBounds = useMemo(() => {
    if (!allProducts.length) return { min: 0, max: 1000 };
    const prices = allProducts.map((product) => Number(product.price) || 0);
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return { min, max: Math.max(max, min + 1) };
  }, [allProducts]);

  const filters = useMemo(() => {
    const rawSearch = searchParams.get('search') ?? searchParams.get('q') ?? '';
    const rawCategory = searchParams.get('category') ?? DEFAULT_CATEGORY;
    const rawSort = searchParams.get('sort') ?? DEFAULT_SORT;
    const rawPage = parseNumber(searchParams.get('page'), 1);
    const rawLimit = parseNumber(searchParams.get('limit'), DEFAULT_PAGE_SIZE);
    const rawRating = searchParams.get('rating') ?? DEFAULT_RATING;
    const minPriceValue = searchParams.get('minPrice') === null ? priceBounds.min : parseNumber(searchParams.get('minPrice'), priceBounds.min);
    const maxPriceValue = searchParams.get('maxPrice') === null ? priceBounds.max : parseNumber(searchParams.get('maxPrice'), priceBounds.max);
    const minPrice = Math.max(priceBounds.min, Math.min(minPriceValue, priceBounds.max));
    const maxPrice = Math.max(minPrice, Math.min(maxPriceValue, priceBounds.max));
    return { search: rawSearch, category: rawCategory, sort: rawSort, minPrice, maxPrice, rating: rawRating, featured: parseBoolean(searchParams.get('featured')), inStock: parseBoolean(searchParams.get('inStock')), page: Math.max(1, Math.floor(rawPage)), limit: Math.max(1, Math.floor(rawLimit)) };
  }, [priceBounds.max, priceBounds.min, searchParams]);

  const activeQuery = searchParams.toString();
  const categoriesForFilter = useMemo(() => categories.filter((category) => category !== DEFAULT_CATEGORY), [categories]);
  const { activeChips, sortOptions } = useProductFilters(filters, priceBounds, categoriesForFilter);
  const featuredProducts = useMemo(() => allProducts.filter((product) => product.featured).slice(0, 3), [allProducts]);
  const newArrivals = useMemo(() => [...allProducts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4), [allProducts]);
  const dealProducts = useMemo(() => allProducts.filter((product) => Number(product.price) < 180).slice(0, 4), [allProducts]);
  const categoryCards = useMemo(() => categoriesForFilter.slice(0, 6).map((category, index) => ({ name: category, description: `${category} picks curated for modern living.`, accent: ['from-primary to-primary-container', 'from-secondary to-rose-400', 'from-amber-500 to-orange-400', 'from-tertiary to-cyan-500', 'from-fuchsia-500 to-secondary', 'from-violet-700 to-indigo-500'][index] })), [categoriesForFilter]);

  const updateSearchParams = useCallback((updates, { replace = false } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') next.delete(key);
      else next.set(key, String(value));
      if (key === 'search') next.delete('q');
    });
    setSearchParams(next, { replace });
  }, [searchParams, setSearchParams]);

  useScrollToSection(location.pathname, location.hash);

  useEffect(() => {
    const loadAllProducts = async () => {
      setInitialLoading(true);
      setError('');
      try {
        const response = await api.get('/products');
        const products = response.data?.products ?? response.data?.data ?? [];
        setAllProducts(products);
        const responseCategories = response.data?.categories?.length ? response.data.categories : Array.from(new Set(products.map((product) => product.category))).sort();
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
    const legacySearch = searchParams.get('q');
    const canonicalSearch = searchParams.get('search');
    if (legacySearch && !canonicalSearch) {
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      next.set('search', legacySearch);
      setSearchParams(next, { replace: true });
      return;
    }
    syncingSearchFromUrl.current = true;
    setSearchInput(filters.search);
  }, [filters.search, searchParams, setSearchParams]);

  useEffect(() => {
    if (activeQuery) return undefined;
    setCatalogLoading(false);
    const pageSize = Math.min(DEFAULT_PAGE_SIZE, Math.max(allProducts.length, 1));
    setCatalogProducts(allProducts.slice(0, pageSize));
    setCatalogMeta({ totalProducts: allProducts.length, totalPages: Math.max(1, Math.ceil(allProducts.length / pageSize)), currentPage: 1, pageSize, hasNextPage: allProducts.length > pageSize, hasPreviousPage: false });
    return undefined;
  }, [activeQuery, allProducts]);

  useEffect(() => {
    if (!activeQuery) return undefined;
    const loadCatalog = async () => {
      setCatalogLoading(true);
      setError('');
      try {
        const response = await api.get('/products', { params: buildApiParams(filters) });
        const products = response.data?.products ?? response.data?.data ?? [];
        setCatalogProducts(products);
        setCatalogMeta({ totalProducts: response.data?.totalProducts ?? products.length, totalPages: response.data?.totalPages ?? 1, currentPage: response.data?.currentPage ?? filters.page, pageSize: response.data?.pageSize ?? filters.limit, hasNextPage: Boolean(response.data?.hasNextPage), hasPreviousPage: Boolean(response.data?.hasPreviousPage) });
        if (response.data?.categories?.length) setCategories(response.data.categories);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Unable to load products. Please try again.');
      } finally {
        setCatalogLoading(false);
      }
    };
    loadCatalog();
  }, [activeQuery, filters]);

  useEffect(() => {
    if (!hasMountedCatalogRef.current) {
      hasMountedCatalogRef.current = true;
      return undefined;
    }

    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return undefined;
  }, [filters.page]);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (syncingSearchFromUrl.current) {
      if (trimmed !== filters.search) return;
      syncingSearchFromUrl.current = false;
      return;
    }
    if (trimmed !== filters.search) updateSearchParams({ search: trimmed || undefined, page: 1 }, { replace: true });
  }, [debouncedSearch, filters.search, updateSearchParams]);

  const handleCategorySelect = useCallback((category) => {
    updateSearchParams({ category, page: 1 });
    setMobileFiltersOpen(false);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [updateSearchParams]);
  const handleSortChange = useCallback((sort) => updateSearchParams({ sort, page: 1 }), [updateSearchParams]);
  const handleMinPriceChange = useCallback((value) => updateSearchParams({ minPrice: Math.min(value, filters.maxPrice), maxPrice: Math.max(value, filters.maxPrice), page: 1 }), [filters.maxPrice, updateSearchParams]);
  const handleMaxPriceChange = useCallback((value) => updateSearchParams({ minPrice: Math.min(value, filters.minPrice), maxPrice: Math.max(value, filters.minPrice), page: 1 }), [filters.minPrice, updateSearchParams]);
  const handleRatingChange = useCallback((rating) => updateSearchParams({ rating, page: 1 }), [updateSearchParams]);
  const handleToggleChange = useCallback((key, value) => updateSearchParams({ [key]: value ? 'true' : undefined, page: 1 }), [updateSearchParams]);
  const handlePageChange = useCallback((page) => updateSearchParams({ page }), [updateSearchParams]);
  const handleClearFilters = useCallback(() => {
    syncingSearchFromUrl.current = true;
    setSearchInput('');
    updateSearchParams({ search: undefined, category: undefined, sort: undefined, minPrice: undefined, maxPrice: undefined, rating: undefined, featured: undefined, inStock: undefined, page: undefined, limit: undefined }, { replace: false });
  }, [updateSearchParams]);
  const handleClearSingleFilter = useCallback((key) => {
    switch (key) {
      case 'search': setSearchInput(''); updateSearchParams({ search: undefined, page: 1 }); break;
      case 'category': updateSearchParams({ category: DEFAULT_CATEGORY, page: 1 }); break;
      case 'price': updateSearchParams({ minPrice: undefined, maxPrice: undefined, page: 1 }); break;
      case 'rating': updateSearchParams({ rating: DEFAULT_RATING, page: 1 }); break;
      case 'featured': updateSearchParams({ featured: undefined, page: 1 }); break;
      case 'inStock': updateSearchParams({ inStock: undefined, page: 1 }); break;
      default: break;
    }
  }, [updateSearchParams]);

  const totalProducts = catalogMeta.totalProducts;
  const totalPages = catalogMeta.totalPages;
  const currentPage = catalogMeta.currentPage;

  return (
    <div className="page-shell">
      <SEO title="" description={DEFAULT_SEO.description} jsonLd={websiteJsonLd} />
      <div className="space-y-20 sm:space-y-24">
        <section id="hero" data-reveal className="reveal relative overflow-hidden rounded-[2.6rem] bg-primary text-on-primary shadow-xl">
          <div className="absolute inset-0 soft-grid opacity-20" aria-hidden="true" />
          <div className="absolute -right-28 -top-36 h-80 w-80 rounded-full bg-secondary/25 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-12 p-7 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-16">
            <div data-reveal className="reveal-stagger max-w-2xl space-y-7">
              <span className="editorial-kicker"><span className="h-1.5 w-1.5 rounded-full bg-secondary" /> The considered edit of everyday essentials</span>
              <div className="space-y-5">
                <h1 className="max-w-xl font-display-lg-mobile text-display-lg-mobile tracking-[-0.045em] text-on-primary md:text-display-lg">Good things, chosen with intention.</h1>
                <p className="max-w-lg text-body-lg text-primary-fixed/75">Discover pieces that earn their place in your day. A calmer way to shop, from first browse to front door.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => navigateToSection({ sectionId: HOME_SECTIONS.SHOP, navigate, pathname: location.pathname })} className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-3.5 text-sm font-bold text-on-secondary shadow-[0_12px_24px_rgba(200,107,73,0.22)] transition-all hover:-translate-y-0.5 hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/30">Shop the edit <span className="material-symbols-outlined text-[18px]">arrow_forward</span></button>
                <Link to="/wishlist" className="inline-flex items-center gap-2 rounded-full border border-primary-fixed/20 bg-primary-fixed/10 px-5 py-3.5 text-sm font-semibold text-on-primary transition-all hover:-translate-y-0.5 hover:bg-primary-fixed/15">Saved picks <span className="material-symbols-outlined text-[18px]">favorite</span></Link>
              </div>
              <div className="flex flex-wrap gap-6 border-t border-primary-fixed/15 pt-6 text-xs font-semibold text-primary-fixed/65"><span>Thoughtful selection</span><span>Fast, clear delivery</span><span>Human support</span></div>
            </div>

            <div data-reveal className="reveal relative min-h-[360px] lg:min-h-[430px]">
              <div className="absolute right-0 top-0 h-48 w-48 rounded-[2rem] bg-secondary/80 p-5 text-on-secondary shadow-2xl rotate-3 sm:h-56 sm:w-56"><p className="text-[10px] font-bold uppercase tracking-[0.18em]">This week</p><p className="mt-16 font-display-lg text-3xl leading-none">New, not noisy.</p></div>
              <div className="hero-float absolute bottom-0 left-0 h-64 w-[76%] overflow-hidden rounded-[2rem] border border-primary-fixed/20 bg-primary-container shadow-2xl -rotate-3 sm:h-72">
                {featuredProducts[0]?.image ? <ImageWithSkeleton src={featuredProducts[0].image} alt={featuredProducts[0].name} wrapperClassName="h-full w-full" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col justify-between bg-gradient-to-br from-primary-container via-primary to-secondary/70 p-6"><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-fixed/60">ShopEase / 01</span><div><div className="h-24 w-24 rounded-full border border-primary-fixed/20 bg-primary-fixed/10" /><p className="mt-5 font-display-lg text-4xl leading-none">The good edit.</p></div></div>}
              </div>
              {featuredProducts[1]?.image && <div className="absolute bottom-10 right-0 h-36 w-32 overflow-hidden rounded-[1.5rem] border-4 border-primary shadow-2xl sm:h-44 sm:w-40"><ImageWithSkeleton src={featuredProducts[1].image} alt={featuredProducts[1].name} wrapperClassName="h-full w-full" className="h-full w-full object-cover" /></div>}
              <div className="absolute bottom-4 left-6 rounded-full bg-primary-fixed px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary shadow-lg">Curated essentials</div>
            </div>
          </div>
        </section>

        <div data-reveal className="reveal-stagger grid gap-3 sm:grid-cols-3">
          {[
            ['local_shipping', 'Free delivery', 'On orders over $75'],
            ['verified', 'Considered quality', 'Pieces made to last'],
            ['support_agent', 'Here to help', 'Real support, no scripts'],
          ].map(([icon, title, description]) => <div key={title} className="flex items-center gap-3 border-b border-outline-variant/40 pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5 last:border-0"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container/45 text-secondary"><span className="material-symbols-outlined text-[19px]">{icon}</span></span><div><p className="text-sm font-bold text-primary">{title}</p><p className="mt-0.5 text-xs text-on-surface-variant">{description}</p></div></div>)}
        </div>

        <section id="categories" data-reveal className="reveal space-y-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Browse the edit</p><h2 className="section-heading mt-2">Find your next favorite.</h2></div><button type="button" onClick={() => navigateToSection({ sectionId: HOME_SECTIONS.SHOP, navigate, pathname: location.pathname })} className="inline-flex items-center gap-2 self-start text-sm font-bold text-secondary transition-colors hover:text-primary sm:self-end">View all categories <span className="material-symbols-outlined text-[18px]">arrow_forward</span></button></div>
          {initialLoading ? <CategorySkeleton /> : categoryCards.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categoryCards.map((category, index) => <button key={category.name} type="button" onClick={() => handleCategorySelect(category.name)} className="group relative min-h-[190px] overflow-hidden rounded-[1.6rem] border border-outline-variant/35 bg-surface-container-lowest p-5 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/20"><div className={`absolute inset-0 bg-gradient-to-br ${category.accent} opacity-[0.88] transition-transform duration-500 group-hover:scale-105`} /><div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" /><div className="relative flex h-full flex-col justify-between text-on-primary"><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-fixed/75">0{index + 1}</span><div><h3 className="font-display-lg text-3xl">{category.name}</h3><p className="mt-1 max-w-[220px] text-xs text-primary-fixed/75">{category.description}</p></div></div></button>)}</div> : <div className="surface-card-muted p-8 text-center text-sm text-on-surface-variant">Categories will appear here once the catalog is available.</div>}
        </section>

        <section id="featured" data-reveal className="reveal space-y-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">The short list</p><h2 className="section-heading mt-2">Signature picks.</h2></div><button type="button" onClick={() => navigateToSection({ sectionId: HOME_SECTIONS.SHOP, navigate, pathname: location.pathname })} className="inline-flex items-center gap-2 self-start text-sm font-bold text-secondary transition-colors hover:text-primary sm:self-end">Shop all <span className="material-symbols-outlined text-[18px]">arrow_forward</span></button></div>
          {initialLoading ? <div className="grid gap-5 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <ProductCardSkeleton key={index} />)}</div> : featuredProducts.length ? <div className="grid gap-5 md:grid-cols-3">{featuredProducts.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <div className="surface-card-muted p-8 text-center text-sm text-on-surface-variant">Featured products will appear here once the catalog is available.</div>}
        </section>

        <section id="deals" data-reveal className="reveal overflow-hidden rounded-[2.2rem] bg-secondary-container/55 p-6 sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end"><div><p className="eyebrow text-on-secondary-container">A little extra</p><h2 className="mt-3 max-w-md font-display-lg text-4xl leading-[1.02] text-on-secondary-container sm:text-5xl">Good finds, gentler prices.</h2><p className="mt-4 max-w-md text-sm leading-6 text-on-secondary-container/75">A rotating edit of pieces that make the everyday feel more considered.</p></div><div className="grid gap-3 sm:grid-cols-2">{initialLoading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="rounded-[1.25rem] border border-on-secondary-container/10 bg-surface-container-lowest/45 p-4"><Skeleton className="h-4 w-28 bg-on-secondary-container/10" /><Skeleton className="mt-3 h-3 w-16 bg-on-secondary-container/10" /></div>) : dealProducts.length ? dealProducts.map((product) => <Link key={product._id} to={`/products/${product._id}`} className="group flex items-center justify-between gap-3 rounded-[1.25rem] border border-on-secondary-container/10 bg-surface-container-lowest/55 p-4 transition-all hover:-translate-y-0.5 hover:bg-surface-container-lowest"><div className="min-w-0"><p className="truncate text-sm font-bold text-on-secondary-container">{product.name}</p><p className="mt-1 text-xs text-on-secondary-container/65">{product.category}</p></div><span className="shrink-0 text-sm font-bold text-secondary">{formatPrice(product.price)}</span></Link>) : <div className="sm:col-span-2 rounded-[1.25rem] bg-surface-container-lowest/45 p-5 text-sm text-on-secondary-container/70">Deals will appear when the catalog is available.</div>}</div></div>
        </section>

        <section id="new-arrivals" data-reveal className="reveal space-y-7"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Just in</p><h2 className="section-heading mt-2">Fresh from the edit.</h2></div><button type="button" onClick={() => navigateToSection({ sectionId: HOME_SECTIONS.SHOP, navigate, pathname: location.pathname })} className="inline-flex items-center gap-2 self-start text-sm font-bold text-secondary transition-colors hover:text-primary sm:self-end">Discover more <span className="material-symbols-outlined text-[18px]">arrow_forward</span></button></div>{initialLoading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)}</div> : newArrivals.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{newArrivals.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <div className="surface-card-muted p-8 text-center text-sm text-on-surface-variant">New arrivals will appear when the catalog is available.</div>}</section>

        {recentHydrated && recentCount > 0 && <section id="recently-viewed" data-reveal className="reveal space-y-7"><div className="flex items-end justify-between gap-3"><div><p className="eyebrow">Pick up where you left off</p><h2 className="section-heading mt-2">Recently viewed.</h2></div><Link to="/recently-viewed" className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary">View all <span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{recentProducts.slice(0, 4).map((product) => <ProductCard key={product._id || product.id} product={product} />)}</div></section>}

        <section id="brands" data-reveal className="reveal border-y border-outline-variant/45 py-10"><div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div className="max-w-md"><p className="eyebrow">Good company</p><h2 className="mt-2 font-display-lg text-4xl leading-tight text-primary">A little less noise. A lot more signal.</h2></div><div className="flex max-w-2xl flex-wrap gap-2">{['Apple', 'Nike', 'Stripe', 'Vercel', 'Notion', 'Figma'].map((brand) => <button key={brand} type="button" onClick={() => handleCategorySelect(brand === 'Nike' ? 'Shoes' : brand === 'Figma' ? 'Fashion' : brand === 'Accessories')} className="rounded-full border border-outline-variant/55 bg-surface-container-lowest px-4 py-2.5 text-sm font-bold text-primary transition-all hover:-translate-y-0.5 hover:border-secondary/50 hover:bg-secondary-container/25">{brand}</button>)}</div></div></section>

        <section id="about" data-reveal className="reveal grid gap-8 rounded-[2.2rem] bg-primary p-7 text-on-primary sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:p-14"><div><p className="eyebrow text-primary-fixed">Why ShopEase</p><div className="mt-5 h-px w-16 bg-secondary" /></div><div><h2 className="max-w-2xl font-display-lg text-4xl leading-[1.05] text-on-primary sm:text-5xl">Shopping should feel like a point of view, not a chore.</h2><p className="mt-6 max-w-2xl text-body-lg text-primary-fixed/70">We bring the good stuff closer: products with purpose, useful details, and a calmer path from discovery to delivery. Every section is built to keep the experience focused, polished, and easy to navigate.</p></div></section>

        <section id="products" data-reveal className="reveal space-y-7"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">The full catalog</p><h2 className="section-heading mt-2">Browse everything.</h2></div><p className="text-sm text-on-surface-variant">{catalogLoading || initialLoading ? 'Loading the edit...' : `${totalProducts} product${totalProducts === 1 ? '' : 's'} found`}</p></div><div className="surface-card-muted p-4 sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="w-full lg:max-w-xl"><SearchBar searchQuery={searchInput} onChange={setSearchInput} /></div><div className="flex flex-wrap items-center gap-2"><div className="min-w-52"><SortDropdown options={sortOptions} value={filters.sort} onChange={handleSortChange} /></div><Button type="button" variant="secondary" className="xl:hidden" onClick={() => setMobileFiltersOpen(true)} icon="tune">Filters</Button><Button type="button" variant="secondary" size="sm" className="hidden xl:inline-flex" onClick={handleClearFilters}>Clear filters</Button></div></div></div><div className="grid min-w-0 gap-8 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-start"><ProductFiltersPanel categories={categoriesForFilter} filters={filters} priceBounds={priceBounds} onCategoryChange={handleCategorySelect} onMinPriceChange={handleMinPriceChange} onMaxPriceChange={handleMaxPriceChange} onRatingChange={handleRatingChange} onFeaturedChange={(checked) => handleToggleChange('featured', checked)} onInStockChange={(checked) => handleToggleChange('inStock', checked)} onClearFilters={handleClearFilters} mobileOpen={mobileFiltersOpen} onMobileClose={() => setMobileFiltersOpen(false)} /><div className="min-w-0 space-y-4"><FilterChips chips={activeChips} onClear={handleClearSingleFilter} onClearAll={handleClearFilters} /><ProductResultsBar currentPage={currentPage} totalPages={totalPages} pageSize={catalogMeta.pageSize} total={totalProducts} /><div key={activeQuery} className="animate-content-in"><ProductGrid products={catalogProducts} loading={catalogLoading || initialLoading} error={error} searchTerm={filters.search} onClearFilters={handleClearFilters} /></div><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /></div></div></section>

        <section id="contact" data-reveal className="reveal grid gap-8 border-t border-outline-variant/45 pt-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><div><p className="eyebrow">Need a hand?</p><h2 className="mt-3 font-display-lg text-4xl leading-tight text-primary">Good service is part of the product.</h2><p className="mt-4 max-w-md text-sm leading-6 text-on-surface-variant">Reach out for order help, shipping updates, or a second opinion on your next pick.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['mail', 'support@shopease.com'], ['call', '+1 (800) 555-0188'], ['location_on', '123 Market Street'], ['schedule', 'Mon–Fri · 8am–8pm']].map(([icon, text]) => <div key={text} className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-4 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-[19px] text-secondary">{icon}</span><span>{text}</span></div>)}</div></section>
      </div>
      <div className="sr-only" aria-live="polite">{mobileFiltersOpen ? 'Filters open' : 'Filters closed'}</div>
    </div>
  );
};

export default HomePage;
