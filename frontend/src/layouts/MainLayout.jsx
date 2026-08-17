import { Outlet } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import Footer from './Footer';

const MainLayout = () => (
  <div className="flex min-h-screen flex-col bg-surface text-on-surface antialiased selection:bg-secondary selection:text-on-secondary transition-colors duration-300 dark:bg-inverse-surface dark:text-inverse-on-surface">
    <TopNavBar />
    <main className="flex-grow"><Outlet /></main>
    <Footer />
  </div>
);

export default MainLayout;
