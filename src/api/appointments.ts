// src/api/appointments.ts
import axiosInstance from './axiosInstance';
import { Appointment, AppointmentPayload } from '../types/appointments';

/**
 * Fetches the logged-in user's appointments.
 * Assumes backend returns a direct array.
 */
export const getUserAppointments = async (): Promise<Appointment[]> => {
    try {
        // Endpoint from doctors/urls.py
        const response = await axiosInstance.get<Appointment[]>('/doctors/appointments/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch appointments:', error);
        throw error;
    }
};

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
        // Extract validation errors if possible: error.response?.data
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
 * Cancels (deletes) an appointment.
 * Consider if you want DELETE or PATCH with status='cancelled'. Let's use PATCH.
 */
export const cancelAppointment = async (id: number): Promise<Appointment> => {
     try {
         // Using PATCH to update status to 'cancelled'
        const response = await axiosInstance.patch<Appointment>(`/doctors/appointments/${id}/`, { status: 'cancelled' });
        return response.data;
        // Or use DELETE if backend is set up for that:
        // await axiosInstance.delete(`/doctors/appointments/${id}/`);
    } catch (error) {
        console.error(`Failed to cancel appointment ${id}:`, error);
        throw error;
    }
};