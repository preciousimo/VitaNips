// src/api/appointments.ts
import axiosInstance from './axiosInstance';
import { Appointment, AppointmentPayload, TwilioTokenResponse } from '../types/appointments';
import { PaginatedResponse } from '../types/common';
import axios from 'axios';

type AppointmentListParams = { page?: number; ordering?: string };

export const getUserAppointments = async (
    paramsOrUrl: AppointmentListParams | string | null = null
): Promise<PaginatedResponse<Appointment>> => {
    const endpoint = '/doctors/appointments/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Appointment>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<Appointment>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch appointments:', error);
        throw error;
    }
};

export const getAppointmentDetails = async (id: number): Promise<Appointment> => {
    try {
        const response = await axiosInstance.get<Appointment>(`/doctors/appointments/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch appointment ${id}:`, error);
        throw error;
    }
};

export const createAppointment = async (payload: AppointmentPayload): Promise<Appointment> => {
    try {
        const response = await axiosInstance.post<Appointment>('/doctors/appointments/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to create appointment:', error);
        throw error;
    }
};

export const updateAppointment = async (id: number, payload: Partial<AppointmentPayload | { status: Appointment['status'] }>): Promise<Appointment> => {
    try {
        const response = await axiosInstance.patch<Appointment>(`/doctors/appointments/${id}/`, payload);
        return response.data;
    } catch (error) {
        console.error(`Failed to update appointment ${id}:`, error);
        throw error;
    }
};

export const cancelAppointment = async (id: number): Promise<Appointment> => {
    try {
        const response = await axiosInstance.patch<Appointment>(`/doctors/appointments/${id}/`, { status: 'cancelled' });
        return response.data;
    } catch (error) {
        console.error(`Failed to cancel appointment ${id}:`, error);
        throw error;
    }
};

export const getTwilioToken = async (appointmentId: number): Promise<TwilioTokenResponse> => {
    try {
        const response = await axiosInstance.get<TwilioTokenResponse>(
            `/doctors/appointments/${appointmentId}/video_token/`
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to get Twilio token for appointment ${appointmentId}:`, error);
        if (axios.isAxiosError(error) && error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
};

export type { TwilioTokenResponse };
