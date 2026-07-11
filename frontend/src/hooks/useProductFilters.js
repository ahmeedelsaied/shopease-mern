import { useMemo } from 'react';

/**
 * useProductFilters – Centralises filter state derived from the catalog
 * `filters` object: the active-filter chip list and the sort option list.
 *
 * This hook does NOT own URL-search-param synchronisation – it works with a
 * plain `filters` object so consumers can decide their own persistence
 * strategy (URL params, local storage, context, …).
 */

const DEFAULT_CATEGORY = 'All';
const DEFAULT_RATING = '0';
const DEFAULT_SORT = 'newest';

/**
 * Single source of truth for sort options. Matches the backend
 * `sortMap` in productController.js – do not add a key here without
 * backend support, or the API will silently fall back to `newest`.
 */
const SORT_LABELS = {
  newest: 'Newest',
  oldest: 'Oldest',
  price_asc: 'Price: Low → High',
  price_desc: 'Price: High → Low',
  rating: 'Highest Rated',
  name_asc: 'Alphabetical A-Z',
  name_desc: 'Alphabetical Z-A',
};

export default function useProductFilters(filters, priceBounds, categories) {
  /* ------------------------------------------------------------------ */
  /*  Active filter chips                                                 */
  /* ------------------------------------------------------------------ */
  const activeChips = useMemo(() => {
    const chips = [];

    if (filters.search) {
      chips.push({ key: 'search', label: `Search: "${filters.search}"` });
    }

    if (filters.category && filters.category !== DEFAULT_CATEGORY) {
      chips.push({ key: 'category', label: `Category: ${filters.category}` });
    }

    if (filters.minPrice !== priceBounds.min || filters.maxPrice !== priceBounds.max) {
      chips.push({
        key: 'price',
        label: `$${filters.minPrice} – $${filters.maxPrice}`,
      });
    }

    if (filters.rating && filters.rating !== DEFAULT_RATING) {
      const ratingNum = Number(filters.rating);
      chips.push({ key: 'rating', label: `${ratingNum}★ & up` });
    }

    if (filters.featured) {
      chips.push({ key: 'featured', label: 'Featured' });
    }

    if (filters.inStock) {
      chips.push({ key: 'inStock', label: 'In Stock' });
    }

    return chips;
  }, [filters, priceBounds]);

  /* ------------------------------------------------------------------ */
  /*  Sort options                                                        */
  /* ------------------------------------------------------------------ */
  const sortOptions = useMemo(
    () => Object.entries(SORT_LABELS).map(([value, label]) => ({ value, label })),
    [],
  );

  return { activeChips, sortOptions };
}
