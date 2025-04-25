import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import MainLayout from '../components/layout/MainLayout';

// Pages (Import your actual page components)
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage'; // Example dashboard
// import NotFoundPage from '../pages/NotFoundPage';
import DoctorListPage from '../pages/DoctorListPage';
import DoctorDetailPage from '../pages/DoctorDetailPage';
import ProfilePage from '../pages/ProfilePage'; // Example
// Import other page components...

// Protected Route Component
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show a loading spinner or skeleton screen while checking auth state
    return (
       <div className="flex justify-center items-center h-screen">
         <div>Loading...</div> {/* Replace with a proper loading component */}
       </div>
     );
  }

  return isAuthenticated ? (
      <MainLayout> {/* Wrap protected pages with the main layout */}
         <Outlet /> {/* Renders the nested child route's element */}
      </MainLayout>
   ) : (
     <Navigate to="/login" replace />
   );
};

// Public Route Component (Optional: Redirects if already logged in)
const PublicRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>; // Or a loading indicator
    }

    // If authenticated and trying to access login/register, redirect to dashboard
    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};


const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/doctors" element={<DoctorListPage />} />
          <Route path="/doctors/:doctorId" element={<DoctorDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Add other protected routes here inside MainLayout */}
          {/* e.g., <Route path="/pharmacy" element={<PharmacyPage />} /> */}
          {/* e.g., <Route path="/appointments" element={<AppointmentsPage />} /> */}
        </Route>

        {/* Catch-all Not Found Route */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRouter;