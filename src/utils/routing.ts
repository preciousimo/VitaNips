// src/utils/routing.ts
import { User } from '../types/user';

/**
 * Determines the appropriate dashboard route based on user role
 * Priority: Admin > Doctor > Pharmacy > Patient
 */
export const getDashboardRoute = (user: User | null): string => {
  if (!user) {
    return '/dashboard';
  }

  // Admin users get admin dashboard
  if (user.is_staff || user.is_superuser) {
    return '/admin/dashboard';
  }

  // Doctors get doctor dashboard
  if (user.doctor_id) {
    return '/doctor/dashboard';
  }

  // Pharmacy staff get pharmacy dashboard
  if (user.is_pharmacy_staff && user.works_at_pharmacy) {
    return '/portal/dashboard';
  }

  // Default to patient dashboard
  return '/dashboard';
};
