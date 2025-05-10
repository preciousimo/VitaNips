// src/components/layout/Header.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserIcon, ArrowLeftOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="VitaNips Logo" className="h-10 w-auto" />
             <span className="text-xl font-bold text-primary">VitaNips</span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                {!user?.is_pharmacy_staff && (
                    <>
                         <Link to="/doctors" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium hidden sm:block">Doctors</Link>
                         <Link to="/pharmacies" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium hidden sm:block">Pharmacies</Link>
                     </>
                 )}
                 {user?.is_pharmacy_staff && (
                     <Link to="/portal/dashboard" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium hidden sm:block">Portal Dashboard</Link>
                 )}

                 <NotificationBell />

                 <Link to="/profile" title="Profile & Settings" className="text-muted hover:text-primary p-1 sm:p-2">
                    {user?.profile_picture ? (
                       <img src={user.profile_picture} alt="Profile" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                       <UserIcon className="h-6 w-6" />
                    )}
                 </Link>
                 <button onClick={handleLogout} title="Logout" className="text-red-500 hover:text-red-700 p-1 sm:p-2">
                    <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                 </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;