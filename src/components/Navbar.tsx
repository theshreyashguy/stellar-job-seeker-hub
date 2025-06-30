
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, BarChart3, Mail } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/analysis', label: 'Analysis', icon: BarChart3 },
    { path: '/gmail', label: 'Gmail', icon: Mail },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-stellar-purple to-stellar-cyan animate-glow"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-stellar-purple to-stellar-cyan bg-clip-text text-transparent">
              Stellar Jobs
            </span>
          </div>
          
          <div className="flex space-x-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === path
                    ? 'bg-stellar-purple/20 text-stellar-purple border border-stellar-purple/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
