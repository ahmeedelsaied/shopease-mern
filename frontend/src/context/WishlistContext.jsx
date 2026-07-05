import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { ToastContainer } from '../components/ui/Toast';

const WishlistContext = createContext(null);

const LOCAL_KEY = 'shopease_wishlist';

const getProductId = (product) => product?._id || product?.id || '';

const normalizeProduct = (product) => {
  if (!product) return null;
  const id = getProductId(product);
  return {
    ...product,
    _id: id,
    id,
  };
};

const normalizeProducts = (products = []) => {
  const unique = [];
  const seen = new Set();

  products.forEach((product) => {
    const normalized = normalizeProduct(product);
    if (!normalized) return;
    const productId = getProductId(normalized);
    if (!productId || seen.has(productId)) return;
    seen.add(productId);
    unique.push(normalized);
  });

  return unique;
};

export const WishlistProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toastList, setToastList] = useState([]);
  const authSyncedRef = useRef(false);
  const serverReadyRef = useRef(false);
  const itemsRef = useRef([]);

  const pushToast = useCallback((message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToastList((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToastList((prev) => prev.filter((entry) => entry.id !== id));
    }, 2600);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setWishlistItems(normalizeProducts(parsed));
    } catch (error) {
      setWishlistItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    itemsRef.current = wishlistItems;
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      // ignore storage errors
    }
  }, [wishlistItems]);

  const syncToServer = useCallback(async (products = itemsRef.current) => {
    if (!user || !token) return;

    const payload = normalizeProducts(products).map((product) => getProductId(product));

    try {
      await api.post('/wishlist/sync', { productIds: payload });
    } catch (error) {
      // keep local wishlist as source of truth for the client
    }
  }, [token, user]);

  const loadFromServer = useCallback(async () => {
    if (!user || !token) return;

    setLoading(true);
    try {
      const response = await api.get('/wishlist');
      const serverProducts = normalizeProducts(response.data?.data || []);
      const merged = normalizeProducts([
        ...serverProducts,
        ...itemsRef.current,
      ]);

      setWishlistItems(merged);
      await syncToServer(merged);
    } catch (error) {
      setLoading(false);
      return;
    } finally {
      serverReadyRef.current = true;
      setLoading(false);
    }
  }, [syncToServer, token, user]);

  useEffect(() => {
    if (!hydrated) return;

    if (!user || !token) {
      authSyncedRef.current = false;
      serverReadyRef.current = false;
      return;
    }

    if (!authSyncedRef.current) {
      authSyncedRef.current = true;
      serverReadyRef.current = false;
      void loadFromServer();
      return;
    }

    void syncToServer();
  }, [hydrated, loadFromServer, syncToServer, token, user]);

  useEffect(() => {
    if (!hydrated || !user || !token || !authSyncedRef.current || !serverReadyRef.current) return;
    void syncToServer(wishlistItems);
  }, [hydrated, syncToServer, token, user, wishlistItems]);

  const addToWishlist = useCallback((product) => {
    const normalized = normalizeProduct(product);
    if (!normalized) return false;

    const productId = getProductId(normalized);
    if (!productId) return false;

    setWishlistItems((prev) => {
      const exists = prev.some((item) => getProductId(item) === productId);
      if (exists) return prev;
      const next = [normalized, ...prev];
      itemsRef.current = next;
      return next;
    });

    pushToast('Added to wishlist');
    return true;
  }, [pushToast]);

  const removeFromWishlist = useCallback((product) => {
    const normalized = normalizeProduct(product);
    const productId = getProductId(normalized);

    if (!productId) return false;

    setWishlistItems((prev) => {
      const next = prev.filter((item) => getProductId(item) !== productId);
      itemsRef.current = next;
      return next;
    });

    pushToast('Removed from wishlist');
    return true;
  }, [pushToast]);

  const toggleWishlist = useCallback((product) => {
    const normalized = normalizeProduct(product);
    if (!normalized) return false;

    const productId = getProductId(normalized);
    if (!productId) return false;
    const exists = itemsRef.current.some((item) => getProductId(item) === productId);

    setWishlistItems((prev) => {
      const next = exists
        ? prev.filter((item) => getProductId(item) !== productId)
        : [normalized, ...prev];
      itemsRef.current = next;
      return next;
    });

    pushToast(exists ? 'Removed from wishlist' : 'Added to wishlist');
    return true;
  }, [pushToast]);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
    itemsRef.current = [];
    pushToast('Wishlist cleared');
  }, [pushToast]);

  const isInWishlist = useCallback((product) => {
    const productId = getProductId(product);
    return wishlistItems.some((item) => getProductId(item) === productId);
  }, [wishlistItems]);

  const value = useMemo(() => ({
    wishlistItems,
    itemCount: wishlistItems.length,
    loading,
    hydrated,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
  }), [addToWishlist, clearWishlist, hydrated, isInWishlist, loading, removeFromWishlist, toggleWishlist, wishlistItems]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toastList} />
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
