// src/api/doctors.ts
import axiosInstance from './axiosInstance';
import {
    Doctor,
    DoctorListResponse,
    DoctorReview, // Add this type import
    DoctorAvailability // Add this type import
} from '../types/doctors';

interface GetDoctorsParams {
    search?: string;
    specialty?: number; // Filter by specialty ID
    // Add other filter params as needed (e.g., virtual, rating)
}

/**
 * Fetches a list of doctors, possibly filtered.
 * Adjust the return type if your backend doesn't use pagination (e.g., Promise<Doctor[]>)
 */
export const getDoctors = async (params?: GetDoctorsParams): Promise<Doctor[]> => {
    try {
      // CHANGE THIS LINE: Adjust the expected response type VVVVVV
      const response = await axiosInstance.get<Doctor[]>('/doctors/', { params });
      return response.data; // response.data is now the Doctor array directly
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      throw error;
    }
  };

/**
 * Fetches details for a single doctor.
 */
export const getDoctorById = async (doctorId: number): Promise<Doctor> => {
    try {
        const response = await axiosInstance.get<Doctor>(`/doctors/${doctorId}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch doctor ${doctorId}:`, error);
        throw error;
    }
};

/**
 * Fetches reviews for a specific doctor.
 */
export const getDoctorReviews = async (doctorId: number): Promise<DoctorReview[]> => {
    try {
        // Assumes backend returns a list directly, not paginated. Adjust if needed.
        const response = await axiosInstance.get<DoctorReview[]>(`/doctors/${doctorId}/reviews/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch reviews for doctor ${doctorId}:`, error);
        throw error;
    }
};

/**
 * Fetches availability slots for a specific doctor.
 */
export const getDoctorAvailability = async (doctorId: number): Promise<DoctorAvailability[]> => {
    try {
        // Assumes backend returns a list directly. Adjust if needed.
        const response = await axiosInstance.get<DoctorAvailability[]>(`/doctors/${doctorId}/availability/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch availability for doctor ${doctorId}:`, error);
        throw error;
    }
};

// Add function to post a review (Example structure)
export interface PostReviewPayload {
    rating: number; // 1-5
    comment?: string;
  }
  export const postDoctorReview = async (doctorId: number, payload: PostReviewPayload): Promise<DoctorReview> => {
      try {
          const response = await axiosInstance.post<DoctorReview>(`/doctors/${doctorId}/reviews/`, payload);
          return response.data;
      } catch (error) {
          console.error(`Failed to post review for doctor ${doctorId}:`, error);
          throw error;
      }
  };

// Add other API functions: book appointment, etc.