// src/api/appointments.ts
import axiosInstance from './axiosInstance';
import { Appointment, AppointmentPayload } from '../types/appointments';
import { PaginatedResponse } from '../types/common'; // Import common type

// Define specific parameters if needed, otherwise use a generic object
type AppointmentListParams = { page?: number; ordering?: string /* Add other filters */ };

/**
 * Fetches the logged-in user's appointments, handling pagination.
 */
export const getUserAppointments = async (
    paramsOrUrl: AppointmentListParams | string | null = null
): Promise<PaginatedResponse<Appointment>> => { // <-- Updated return type
    const endpoint = '/doctors/appointments/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            // Fetching next/previous page using the full URL
            const url = new URL(paramsOrUrl);
            // Use only path + query string, as baseURL is handled by axiosInstance
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Appointment>>(pathWithQuery);
        } else {
            // Initial fetch with parameters
            response = await axiosInstance.get<PaginatedResponse<Appointment>>(endpoint, { params: paramsOrUrl });
        }
        return response.data; // response.data is the PaginatedResponse object
    } catch (error) {
        console.error('Failed to fetch appointments:', error);
        throw error;
    }
};

// --- Functions for single items or actions remain the same ---

/**
 * Fetches details for a single appointment.
 */
export const getAppointmentDetails = async (id: number): Promise<Appointment> => {
    try {
        const response = await axiosInstance.get<Appointment>(`/doctors/appointments/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch appointment ${id}:`, error);
        throw error;
    }
};

/**
 * Creates a new appointment.
 */
export const createAppointment = async (payload: AppointmentPayload): Promise<Appointment> => {
    try {
        const response = await axiosInstance.post<Appointment>('/doctors/appointments/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to create appointment:', error);
        throw error;
    }
};

/**
 * Updates an existing appointment (e.g., change status, notes).
 */
export const updateAppointment = async (id: number, payload: Partial<AppointmentPayload | { status: Appointment['status'] }>): Promise<Appointment> => {
    try {
        const response = await axiosInstance.patch<Appointment>(`/doctors/appointments/${id}/`, payload);
        return response.data;
    } catch (error) {
        console.error(`Failed to update appointment ${id}:`, error);
        throw error;
    }
};

/**
 * Cancels an appointment (using PATCH).
 */
export const cancelAppointment = async (id: number): Promise<Appointment> => {
    try {
        const response = await axiosInstance.patch<Appointment>(`/doctors/appointments/${id}/`, { status: 'cancelled' });
        return response.data;
    } catch (error) {
        console.error(`Failed to cancel appointment ${id}:`, error);
        throw error;
    }
};