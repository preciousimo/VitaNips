// src/components/layout/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
    UserIcon, 
    ArrowLeftOnRectangleIcon, 
    BellAlertIcon,
    ChevronDownIcon,
    HeartIcon,
    ShieldExclamationIcon,
    ShoppingBagIcon,
    CalendarDaysIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import NotificationCenter from '../notifications/NotificationCenter';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navigationItems = [
    { name: 'Appointments', href: '/appointments', icon: CalendarDaysIcon },
    { name: 'Prescriptions', href: '/prescriptions', icon: DocumentTextIcon },
    { name: 'Doctors', href: '/doctors', icon: UserIcon },
    { name: 'Pharmacies', href: '/pharmacies', icon: ShoppingBagIcon },
    { name: 'Health Tracking', href: '/health/vitals', icon: HeartIcon },
    { name: 'Emergency', href: '/emergency-contacts', icon: ShieldExclamationIcon },
  ];

  return (
    <header className="glass-header sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="VitaNips Logo" className="h-10 w-auto drop-shadow-sm" />
            <span className="text-xl font-bold gradient-text">VitaNips</span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-4">
                  {!user?.is_pharmacy_staff && (
                    <>
                      {navigationItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="nav-link px-3 py-2 rounded-md text-sm font-medium flex items-center hover:opacity-90"
                        >
                          <item.icon className="h-4 w-4 mr-1" />
                          {item.name}
                        </Link>
                      ))}
                    </>
                  )}
                  {user?.is_pharmacy_staff && (
                    <Link 
                      to="/portal/dashboard" 
                      className="nav-link px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Portal Dashboard
                    </Link>
                  )}
                </div>

                <NotificationCenter />

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 nav-link p-2 rounded-md focus:outline-none focus:ring-2 ring-primary"
                    aria-haspopup="menu"
                    aria-expanded={isDropdownOpen}
                    aria-controls="header-profile-menu"
                  >
                    {user?.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover border-2 border-white/70 shadow-sm" 
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.first_name || user?.username}
                    </span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div
                      id="header-profile-menu"
                      role="menu"
                      aria-labelledby="header-profile-button"
                      className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur rounded-xl shadow-xl ring-1 ring-black/5 z-50"
                    >
                      <div className="py-1">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <Link
                          to="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-light/60 transition-colors duration-200"
                          role="menuitem"
                        >
                          <UserIcon className="h-4 w-4 mr-3" />
                          Profile & Settings
                        </Link>

                        <Link
                          to="/settings/notifications"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-light/60 transition-colors duration-200"
                          role="menuitem"
                        >
                          <BellAlertIcon className="h-4 w-4 mr-3" />
                          Notification Settings
                        </Link>

                        <Link
                          to="/medication-reminders"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-light/60 transition-colors duration-200"
                          role="menuitem"
                        >
                          <BellAlertIcon className="h-4 w-4 mr-3" />
                          Medication Reminders
                        </Link>

                        <Link
                          to="/insurance"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-light/60 transition-colors duration-200"
                          role="menuitem"
                        >
                          <ShieldExclamationIcon className="h-4 w-4 mr-3" />
                          Insurance
                        </Link>

                        <Link
                          to="/map-locator"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-light/60 transition-colors duration-200"
                          role="menuitem"
                        >
                          <ShoppingBagIcon className="h-4 w-4 mr-3" />
                          Find Services
                        </Link>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-1"></div>

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                          role="menuitem"
                        >
                          <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Landing page navigation for unauthenticated users */}
                <div className="hidden md:flex items-center space-x-6">
                  <a href="#features" className="nav-link">
                    Features
                  </a>
                  <a href="#testimonials" className="nav-link">
                    Testimonials
                  </a>
                  <a href="#pricing" className="nav-link">
                    Pricing
                  </a>
                </div>
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/login" 
                    className="nav-link px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary text-sm"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && !user?.is_pharmacy_staff && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="flex space-x-4 overflow-x-auto">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center nav-link px-2 py-1 rounded text-sm font-medium whitespace-nowrap"
                >
                  <item.icon className="h-4 w-4 mr-1" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;