// src/api/doctors.ts
import axiosInstance from './axiosInstance';
import { Doctor, DoctorReview, DoctorAvailability } from '../types/doctors';
import { PaginatedResponse } from '../types/common';

interface GetDoctorsParams {
    search?: string;
    specialty?: number;
    page?: number;
}

export const getDoctors = async (
    paramsOrUrl: GetDoctorsParams | string | null = null
): Promise<PaginatedResponse<Doctor>> => {
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Doctor>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<Doctor>>('/doctors/', { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch doctors:', error);
        throw error;
    }
};

export const getDoctorById = async (doctorId: number): Promise<Doctor> => {
    try {
        const response = await axiosInstance.get<Doctor>(`/doctors/${doctorId}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch doctor ${doctorId}:`, error);
        throw error;
    }
};

export const getDoctorReviews = async (
    doctorId: number,
    paramsOrUrl: { page?: number } | string | null = null
): Promise<PaginatedResponse<DoctorReview>> => {
    try {
        const basePath = `/doctors/${doctorId}/reviews/`;
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
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

export const getDoctorAvailability = async (
    doctorId: number,
    params: { page?: number } | null = null
): Promise<PaginatedResponse<DoctorAvailability>> => {
    try {
        const response = await axiosInstance.get<PaginatedResponse<DoctorAvailability>>(
            `/doctors/${doctorId}/availability/`,
            { params }
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch availability for doctor ${doctorId}:`, error);
        throw error;
    }
};

export interface PostReviewPayload {
    rating: number;
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
