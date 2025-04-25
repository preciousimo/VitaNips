import React, { ReactNode } from 'react';
import Header from './Header';
// import Footer from './Footer'; // Optional Footer component

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children} {/* Page content is rendered here */}
      </main>
      {/* Optional Footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;