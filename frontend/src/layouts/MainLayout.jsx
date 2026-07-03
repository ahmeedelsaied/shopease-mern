import { Outlet } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-surface-container-lowest text-on-surface antialiased selection:bg-primary selection:text-on-primary transition-colors duration-300 dark:bg-inverse-surface dark:text-inverse-on-surface">
      <TopNavBar />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
