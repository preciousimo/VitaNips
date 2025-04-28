// src/api/emergency.ts
import axios from 'axios';
import axiosInstance from './axiosInstance';
import { PaginatedResponse } from '../types/common';
// Define EmergencyService type based on your emergency/serializers.py
export interface EmergencyService {
    id: number;
    name: string;
    service_type: string; // Consider using specific literals: 'hospital' | 'ambulance' | ...
    address: string;
    phone_number: string;
    latitude: number;
    longitude: number;
    // Add other fields from serializer
    is_24_hours: boolean;
    has_emergency_room?: boolean;
    provides_ambulance?: boolean;
}

interface GetEmergencyServicesParams {
  page?: number;
  lat?: number;
  lon?: number;
  radius?: number;
  service_type?: string; // Filter by type
}

/**
 * Fetches emergency services, handling pagination and location filtering.
 */
export const getEmergencyServices = async (
    paramsOrUrl: GetEmergencyServicesParams | string | null = null
): Promise<PaginatedResponse<EmergencyService>> => {
    const endpoint = '/emergency/services/'; // Matches emergency/urls.py
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

/**
 * Triggers the SOS alert process on the backend.
 */
export const triggerSOS = async (payload: SOSTriggerPayload): Promise<{ status: string }> => { // Expects {status: "..."} on 202
    try {
        const response = await axiosInstance.post<{ status: string }>(
            '/emergency/trigger_sos/', // Matches emergency/urls.py
            payload
        );
        return response.data; // Should contain { status: "SOS signal received..." }
    } catch (error) {
        console.error('Failed to trigger SOS:', error);
        // Attempt to extract backend error message
        if (axios.isAxiosError(error) && error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw error; // Re-throw original or generic error
    }
};

// ... other emergency API functions (contacts, alerts) ...