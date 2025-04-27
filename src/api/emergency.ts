// src/api/emergency.ts
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

// ... other emergency API functions (contacts, alerts) ...