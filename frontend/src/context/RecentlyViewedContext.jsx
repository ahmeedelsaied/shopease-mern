import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const RecentlyViewedContext = createContext(null);

const LOCAL_KEY = 'shopease_recently_viewed';
const MAX_ITEMS = 12;

const getProductId = (product) => product?._id || product?.id || '';

const normalizeProduct = (product) => {
  if (!product) return null;
  const id = getProductId(product);
  if (!id) return null;
  return { ...product, _id: id, id };
};

/**
 * RecentlyViewedContext – tracks the products a user has opened on the details
 * page. Strictly client-side (localStorage); no server sync, unlike wishlist.
 *
 * Invariants maintained on every write:
 *  - duplicates removed (existing entry moves to the front)
 *  - newest first
 *  - capped at MAX_ITEMS
 */
export const RecentlyViewedProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setItems(parsed);
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors (quota, private mode)
    }
  }, [hydrated, items]);

  const addRecentlyViewed = useCallback((product) => {
    const normalized = normalizeProduct(product);
    if (!normalized) return;

    const id = getProductId(normalized);
    setItems((prev) => {
      const withoutExisting = prev.filter((item) => getProductId(item) !== id);
      return [normalized, ...withoutExisting].slice(0, MAX_ITEMS);
    });
  }, []);

  const removeFromRecentlyViewed = useCallback((product) => {
    const id = getProductId(product);
    if (!id) return;
    setItems((prev) => prev.filter((item) => getProductId(item) !== id));
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      recentlyViewedItems: items,
      itemCount: items.length,
      hydrated,
      addRecentlyViewed,
      removeFromRecentlyViewed,
      clearRecentlyViewed,
    }),
    [items, hydrated, addRecentlyViewed, removeFromRecentlyViewed, clearRecentlyViewed],
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};

export default RecentlyViewedContext;
