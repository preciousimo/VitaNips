// src/api/emergency.ts
import axios from 'axios';
import axiosInstance from './axiosInstance';
import { PaginatedResponse } from '../types/common';
export interface EmergencyService {
    id: number;
    name: string;
    service_type: string;
    address: string;
    phone_number: string;
    latitude: number;
    longitude: number;
    is_24_hours: boolean;
    has_emergency_room?: boolean;
    provides_ambulance?: boolean;
}

interface GetEmergencyServicesParams {
  page?: number;
  lat?: number;
  lon?: number;
  radius?: number;
  service_type?: string;
}

export const getEmergencyServices = async (
    paramsOrUrl: GetEmergencyServicesParams | string | null = null
): Promise<PaginatedResponse<EmergencyService>> => {
    const endpoint = '/emergency/services/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<EmergencyService>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<EmergencyService>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch emergency services:', error);
        throw error;
    }
};

interface SOSTriggerPayload {
    latitude: number;
    longitude: number;
    message?: string | null;
}

export const triggerSOS = async (payload: SOSTriggerPayload): Promise<{ status: string }> => {
    try {
        const response = await axiosInstance.post<{ status: string }>(
            '/emergency/trigger_sos/',
            payload
        );
        return response.data;
    } catch (error) {
        console.error('Failed to trigger SOS:', error);
        if (axios.isAxiosError(error) && error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
};
