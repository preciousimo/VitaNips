// src/api/admin.ts
import axiosInstance from './axiosInstance';

export interface AdminStats {
  users: {
    total: number;
    active: number;
    new_this_month: number;
    inactive: number;
  };
  doctors: {
    total: number;
    verified: number;
    pending_verification: number;
  };
  pharmacies: {
    total: number;
    active: number;
    inactive: number;
  };
  appointments: {
    total: number;
    this_month: number;
    today: number;
  };
  orders: {
    total: number;
    pending: number;
  };
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_pharmacy_staff: boolean;
  is_doctor: boolean;
  doctor_id: number | null;
  created_at: string;
}

export interface AdminDoctor {
  id: number;
  user: {
    id: number;
    email: string;
    username: string;
  };
  first_name: string;
  last_name: string;
  gender: string;
  years_of_experience: number;
  is_verified: boolean;
  education: string;
  bio: string;
  consultation_fee: string;
  specialties: Array<{ id: number; name: string }>;
  created_at: string;
}

export interface AdminPharmacy {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  operating_hours: string;
  is_24_hours: boolean;
  offers_delivery: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AdminAnalytics {
  user_growth: Array<{ month: string; count: number }>;
  appointments_by_status: Array<{ status: string; count: number }>;
  top_specialties: Array<{ specialties__name: string; count: number }>;
}

// Get admin dashboard stats
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await axiosInstance.get('/admin/stats/');
  return response.data;
};

// Get all users with filters
export const getAdminUsers = async (filters?: {
  role?: 'admin' | 'doctor' | 'pharmacy' | 'patient';
  is_active?: boolean;
  search?: string;
}): Promise<{ count: number; results: AdminUser[] }> => {
  const params = new URLSearchParams();
  if (filters?.role) params.append('role', filters.role);
  if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
  if (filters?.search) params.append('search', filters.search);
  
  const response = await axiosInstance.get(`/admin/users/?${params.toString()}`);
  return response.data;
};

// Get specific user
export const getAdminUser = async (userId: number): Promise<AdminUser> => {
  const response = await axiosInstance.get(`/admin/users/${userId}/`);
  return response.data;
};

// Update user (activate/deactivate, change roles)
export const updateAdminUser = async (
  userId: number,
  data: {
    is_active?: boolean;
    is_staff?: boolean;
    is_superuser?: boolean;
    is_pharmacy_staff?: boolean;
  }
): Promise<AdminUser> => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/`, data);
  return response.data;
};

// Get all doctors with filters
export const getAdminDoctors = async (filters?: {
  verified?: boolean;
  search?: string;
}): Promise<{ count: number; results: AdminDoctor[] }> => {
  const params = new URLSearchParams();
  if (filters?.verified !== undefined) params.append('verified', filters.verified.toString());
  if (filters?.search) params.append('search', filters.search);
  
  const response = await axiosInstance.get(`/admin/doctors/?${params.toString()}`);
  return response.data;
};

// Verify or unverify doctor
export const verifyDoctor = async (
  doctorId: number,
  isVerified: boolean
): Promise<{ message: string; doctor: AdminDoctor }> => {
  const response = await axiosInstance.patch(`/admin/doctors/${doctorId}/verify/`, {
    is_verified: isVerified,
  });
  return response.data;
};

// Get all pharmacies with filters
export const getAdminPharmacies = async (filters?: {
  is_active?: boolean;
  search?: string;
}): Promise<{ count: number; results: AdminPharmacy[] }> => {
  const params = new URLSearchParams();
  if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
  if (filters?.search) params.append('search', filters.search);
  
  const response = await axiosInstance.get(`/admin/pharmacies/?${params.toString()}`);
  return response.data;
};

// Update pharmacy status
export const updateAdminPharmacy = async (
  pharmacyId: number,
  data: { is_active?: boolean }
): Promise<AdminPharmacy> => {
  const response = await axiosInstance.patch(`/admin/pharmacies/${pharmacyId}/`, data);
  return response.data;
};

// Get analytics data
export const getAdminAnalytics = async (): Promise<AdminAnalytics> => {
  const response = await axiosInstance.get('/admin/analytics/');
  return response.data;
};
