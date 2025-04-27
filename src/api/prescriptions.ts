// src/api/prescriptions.ts
import axiosInstance from './axiosInstance';
import { Prescription } from '../types/prescriptions';
import { PaginatedResponse } from '../types/common';
import { MedicationOrder } from '../types/pharmacy';

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

/**
 * Creates a MedicationOrder from a Prescription for a specific Pharmacy.
 */
export const createOrderFromPrescription = async (
    prescriptionId: number,
    pharmacyId: number
): Promise<MedicationOrder> => { // Returns the created order
    try {
        const response = await axiosInstance.post<MedicationOrder>(
            `/doctors/prescriptions/${prescriptionId}/create_order/`, // Matches backend URL
            { pharmacy_id: pharmacyId } // Send pharmacy_id in request body
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to create order for prescription ${prescriptionId}:`, error);
        // TODO: Extract specific validation errors from error.response.data if possible
        throw error;
    }
};