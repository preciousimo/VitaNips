// src/api/prescriptions.ts
import axiosInstance from './axiosInstance';
import { Prescription } from '../types/prescriptions';
import { PaginatedResponse } from '../types/common'; // Import common type

type PrescriptionListParams = { page?: number; ordering?: string };

/**
 * Fetches prescriptions for the logged-in user, handling pagination.
 */
export const getUserPrescriptions = async (
     paramsOrUrl: PrescriptionListParams | string | null = null
): Promise<PaginatedResponse<Prescription>> => { // <-- Updated return type
    const endpoint = '/doctors/prescriptions/';
    try {
         let response;
         if (typeof paramsOrUrl === 'string') {
             const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Prescription>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<Prescription>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user prescriptions:', error);
        throw error;
    }
};

/**
 * Fetches details for a single prescription.
 */
export const getPrescriptionDetails = async (id: number): Promise<Prescription> => {
    try {
        // Detail views typically aren't paginated
        const response = await axiosInstance.get<Prescription>(`/doctors/prescriptions/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch prescription details for ID ${id}:`, error);
        throw error;
    }
};

// Add function for forwarding/creating order later
// export const forwardPrescriptionToPharmacy = async (...) => { ... }