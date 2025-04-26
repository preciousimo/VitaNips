// src/api/doctors.ts
import axiosInstance from './axiosInstance';
import { Doctor, DoctorReview, DoctorAvailability } from '../types/doctors';
import { PaginatedResponse } from '../types/common'; // Import the generic type

interface GetDoctorsParams {
    search?: string;
    specialty?: number; // Filter by specialty ID
    page?: number; // Add page parameter for explicit page fetching if needed
    // Add other filter params as needed (e.g., virtual, rating)
}

/**
 * Fetches a list of doctors. Handles pagination.
 * Can accept query parameters OR a full URL for next/prev page fetching.
 */
export const getDoctors = async (
    paramsOrUrl: GetDoctorsParams | string | null = null
): Promise<PaginatedResponse<Doctor>> => { // <--- Updated return type
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            // Fetching next/previous page using the full URL provided by the API
            // Need to strip base URL if axiosInstance adds it automatically
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Doctor>>(pathWithQuery);
        } else {
            // Initial fetch with parameters
            response = await axiosInstance.get<PaginatedResponse<Doctor>>('/doctors/', { params: paramsOrUrl });
        }
        return response.data; // <--- response.data now matches PaginatedResponse<Doctor>
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
 * Fetches reviews for a specific doctor. (Assuming it might be paginated too)
 */
export const getDoctorReviews = async (
    doctorId: number,
    paramsOrUrl: { page?: number } | string | null = null // Example for pagination
): Promise<PaginatedResponse<DoctorReview>> => { // <--- Updated return type
    try {
        const basePath = `/doctors/${doctorId}/reviews/`;
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search; // Use full path from API
            response = await axiosInstance.get<PaginatedResponse<DoctorReview>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<DoctorReview>>(basePath, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch reviews for doctor ${doctorId}:`, error);
        throw error;
    }
};

/**
 * Fetches availability slots for a specific doctor.
 */
export const getDoctorAvailability = async (
    doctorId: number,
    // Optional: Add paramsOrUrl if you anticipate needing > 1 page, but unlikely for availability
    params: { page?: number } | null = null
): Promise<PaginatedResponse<DoctorAvailability>> => { // <--- Updated return type
    try {
        // Assuming first page is sufficient unless pagination controls are added later
        const response = await axiosInstance.get<PaginatedResponse<DoctorAvailability>>(
            `/doctors/${doctorId}/availability/`,
            { params } // Send params if provided (e.g., page=1)
        );
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