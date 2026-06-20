import { Outlet } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface antialiased selection:bg-primary selection:text-on-primary flex flex-col">
      <TopNavBar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
