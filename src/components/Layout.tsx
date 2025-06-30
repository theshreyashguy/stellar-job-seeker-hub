
import React from 'react';
import Navbar from './Navbar';
import StarField from './StarField';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative">
      <StarField />
      <Navbar />
      <main className="relative z-10 pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;
