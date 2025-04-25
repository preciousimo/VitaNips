import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserIcon, ArrowLeftOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="VitaNips Logo" className="h-10 w-auto" /> {/* Use logo from public folder */}
             {/* Optional: Add text logo if needed */}
             {/* <span className="text-xl font-bold text-primary">VitaNips</span> */}
          </Link>

          {/* Navigation / User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Add other navigation links here if needed */}
                <Link to="/doctors" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Doctors</Link>
                <Link to="/pharmacies" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Pharmacies</Link>

                <span className="text-muted hidden sm:block">
                   Welcome, {user?.first_name || user?.username || 'User'}!
                 </span>
                <div className="relative">
                  {/* Simple Dropdown Example */}
                  <button className="flex items-center text-muted hover:text-primary focus:outline-none">
                    {/* Profile Pic or Icon */}
                    {user?.profile_picture ? (
                       <img src={user.profile_picture} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                       <UserIcon className="h-7 w-7" />
                    )}
                  </button>
                  {/* Dropdown Menu (implement with a library or custom) */}
                   {/* Example structure:
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-focus:block">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                  */}
                   {/* For simplicity, just add profile and logout */}
                    <Link to="/profile" title="Profile" className="text-muted hover:text-primary p-2">
                        <Cog6ToothIcon className="h-6 w-6" />
                    </Link>
                   <button onClick={handleLogout} title="Logout" className="text-red-500 hover:text-red-700 p-2">
                     <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                   </button>
                </div>
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