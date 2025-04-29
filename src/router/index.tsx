// src/router/index.tsx
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation, // Import useLocation
} from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import MainLayout from '../components/layout/MainLayout';

// Pages
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import DoctorListPage from '../pages/DoctorListPage';
import DoctorDetailPage from '../pages/DoctorDetailPage';
import ProfilePage from '../pages/ProfilePage';
import PharmacyListPage from '../pages/PharmacyListPage';
import VaccinationsPage from '../pages/VaccinationsPage';
import UserInsurancePage from '../pages/UserInsurancePage';
import EmergencyContactsPage from '../pages/EmergencyContactsPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import AppointmentDetailPage from '../pages/AppointmentDetailPage';
import PrescriptionsPage from '../pages/PrescriptionsPage';
import MedicalDocumentsPage from '../pages/MedicalDocumentsPage';
import MapLocatorPage from '../pages/MapLocatorPage';
import PharmacyDashboardPage from '../pages/pharmacy/PharmacyDashboardPage';
import PharmacyOrderListPage from '../pages/pharmacy/PharmacyOrderListPage';
import PharmacyOrderDetailPage from '../pages/pharmacy/PharmacyOrderDetailPage';
import VideoCallPage from '../pages/VideoCallPage';
// import NotFoundPage from '../pages/NotFoundPage';


// --- Loading Component Placeholder ---
const LoadingScreen: React.FC = () => (
    <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading...</p>
        {/* Replace with a proper spinner */}
    </div>
);

// --- Route Guards ---

// Public Route: Redirects logged-in users away from login/register
const PublicRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <LoadingScreen />;

    // Redirect to intended destination or dashboard if logged in
    const from = location.state?.from?.pathname || "/"; // Default to patient dashboard
    return isAuthenticated ? <Navigate to={from} replace /> : <Outlet />;
};

// Standard Protected Route (For Patients/General Users)
const ProtectedRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    // Redirect to login, saving the intended location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // **NEW:** If user is authenticated BUT is pharmacy staff, redirect them to their portal
  if (user?.is_pharmacy_staff) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  // If authenticated and NOT pharmacy staff, allow access
  return (
      <MainLayout>
         <Outlet />
      </MainLayout>
  );
};

// Pharmacy Portal Route Guard
const PharmacyRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Debugging log (keep during testing)
  console.log("PharmacyRoute Check:", { isAuthenticated, isLoading, isStaff: user?.is_pharmacy_staff, user });


  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in, but NOT pharmacy staff
  if (!user?.is_pharmacy_staff) {
      // Redirect non-staff to the main patient dashboard
      return <Navigate to="/" replace />;
  }

  // If authenticated AND pharmacy staff, allow access
  return (
      <MainLayout> {/* Or a dedicated PharmacyLayout */}
         <Outlet />
      </MainLayout>
   );
};


// --- App Router ---
const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Pharmacy Portal Routes (Guard checks for staff role) */}
        <Route element={<PharmacyRoute />}>
            <Route path="/portal/dashboard" element={<PharmacyDashboardPage />} />
            <Route path="/portal/orders" element={<PharmacyOrderListPage />} />
            <Route path="/portal/orders/:orderId" element={<PharmacyOrderDetailPage />} />
            {/* Add other portal routes here */}
        </Route>

        {/* Regular Protected User Routes (Guard now redirects staff away) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/doctors" element={<DoctorListPage />} />
          <Route path="/doctors/:doctorId" element={<DoctorDetailPage />} />
          <Route path="/pharmacies" element={<PharmacyListPage />} />
          <Route path="/vaccinations" element={<VaccinationsPage />} />
          <Route path="/insurance" element={<UserInsurancePage />} />
          <Route path="/emergency-contacts" element={<EmergencyContactsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/appointments/:appointmentId" element={<AppointmentDetailPage />} />
          <Route path="/appointments/:appointmentId/call" element={<VideoCallPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/medical-documents" element={<MedicalDocumentsPage />} />
          <Route path="/map-locator" element={<MapLocatorPage />} />
          {/* Add other patient routes here */}
        </Route>

        {/* Catch-all Not Found Route */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRouter;