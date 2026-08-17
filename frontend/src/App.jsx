import { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import { isHomePage, isHomeSection } from './utils/navigation';

function ScrollRestoration() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return undefined;

    const previousMode = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previousMode;
    };
  }, []);

  useEffect(() => {
    const sectionId = hash.replace(/^#/, '');
    const hasValidHomeHash = isHomePage(pathname) && isHomeSection(sectionId);

    // Let the existing HomePage hash hook perform the intentional section scroll.
    if (hasValidHomeHash) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollRestoration />
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <CartProvider>
              <WishlistProvider>
                <RecentlyViewedProvider>
                  <AppRoutes />
                </RecentlyViewedProvider>
              </WishlistProvider>
            </CartProvider>
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
