import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import Footer from './Footer';

const MainLayout = () => {
  const location = useLocation();

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!targets.length) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface antialiased selection:bg-secondary selection:text-on-secondary transition-colors duration-300 dark:bg-inverse-surface dark:text-inverse-on-surface">
      <TopNavBar />
      <main className="flex-grow"><Outlet /></main>
      <Footer />
    </div>
  );
};

export default MainLayout;
