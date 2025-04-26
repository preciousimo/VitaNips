// src/api/pharmacy.ts
import axiosInstance from './axiosInstance';
import { Pharmacy, Medication } from '../types/pharmacy';

interface GetPharmaciesParams {
  search?: string;
  // Add other filters if backend supports them (e.g., offers_delivery)
}

/**
 * Fetches a list of pharmacies.
 * Assumes the backend returns a direct array (no pagination).
 */
export const getPharmacies = async (params?: GetPharmaciesParams): Promise<Pharmacy[]> => {
  try {
    const response = await axiosInstance.get<Pharmacy[]>('/pharmacy/', { params });
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
        // Assuming an endpoint like /api/pharmacy/{id}/ exists or will be created
        const response = await axiosInstance.get<Pharmacy>(`/pharmacy/${pharmacyId}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch pharmacy ${pharmacyId}:`, error);
        throw error;
    }
};


/**
 * Fetches a list of all medications.
 */
export const getMedications = async (search?: string): Promise<Medication[]> => {
    try {
        const params = search ? { search } : {};
        // Assuming endpoint from pharmacy/urls.py and it returns a direct array
        const response = await axiosInstance.get<Medication[]>('/pharmacy/medications/', { params });
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
        // Assuming an endpoint like /api/pharmacy/medications/{id}/ exists or will be created
        const response = await axiosInstance.get<Medication>(`/pharmacy/medications/${medicationId}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch medication ${medicationId}:`, error);
        throw error;
    }
};


// Add other pharmacy/medication related API functions:
// - getPharmacyInventory(pharmacyId, medicationId?)
// - createMedicationOrder(...)
// - getMedicationReminders() / createMedicationReminder() / etc.