// src/api/pharmacy.ts
import axiosInstance from './axiosInstance';
import { Pharmacy, Medication } from '../types/pharmacy';
import { PaginatedResponse } from '../types/common'; // Import common type

interface GetPharmaciesParams {
  search?: string;
  page?: number;
  // Add other filters if backend supports them (e.g., offers_delivery)
}

interface GetMedicationsParams {
  search?: string;
  page?: number;
}

/**
 * Fetches a list of pharmacies, handling pagination.
 */
export const getPharmacies = async (
    paramsOrUrl: GetPharmaciesParams | string | null = null
): Promise<PaginatedResponse<Pharmacy>> => { // <-- Updated return type
    const endpoint = '/pharmacy/';
    try {
        let response;
         if (typeof paramsOrUrl === 'string') {
             const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Pharmacy>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<Pharmacy>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch pharmacies:', error);
        throw error;
    }
};

/**
 * Fetches details for a single pharmacy (if needed later).
 */
export const getPharmacyById = async (pharmacyId: number): Promise<Pharmacy> => {
    try {
        const response = await axiosInstance.get<Pharmacy>(`/pharmacy/${pharmacyId}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch pharmacy ${pharmacyId}:`, error);
        throw error;
    }
};

/**
 * Fetches a list of all medications, handling pagination.
 * (Assuming this list could be long)
 */
export const getMedications = async (
    paramsOrUrl: GetMedicationsParams | string | null = null
): Promise<PaginatedResponse<Medication>> => { // <-- Updated return type
    const endpoint = '/pharmacy/medications/';
     try {
        let response;
         if (typeof paramsOrUrl === 'string') {
             const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Medication>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<Medication>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch medications:', error);
        throw error;
    }
};

/**
 * Fetches details for a single medication (if needed later).
 */
export const getMedicationById = async (medicationId: number): Promise<Medication> => {
    try {
        const response = await axiosInstance.get<Medication>(`/pharmacy/medications/${medicationId}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch medication ${medicationId}:`, error);
        throw error;
    }
};

// Add other pharmacy/medication related API functions later
// - getPharmacyInventory (might need pagination if many items per pharmacy)
// - createMedicationOrder / getMedicationOrders (list likely needs pagination)
// - getMedicationReminders / createMedicationReminder (list likely needs pagination)