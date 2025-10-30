// src/components/routing/SmartDashboardRedirect.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardRoute } from '../../utils/routing';

/**
 * Smart redirect component that checks user role and redirects to appropriate dashboard
 * If user is a patient (default role), shows the patient dashboard
 * Otherwise redirects to role-specific dashboard
 */
const SmartDashboardRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  // Get the appropriate dashboard route for this user
  const dashboardRoute = getDashboardRoute(user);

  // If user should go to a different dashboard (admin, doctor, pharmacy), redirect
  if (dashboardRoute !== '/dashboard') {
    return <Navigate to={dashboardRoute} replace />;
  }

  // User is a patient, show the patient dashboard
  return <>{children}</>;
};

export default SmartDashboardRedirect;
