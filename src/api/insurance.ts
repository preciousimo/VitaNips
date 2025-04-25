// src/api/insurance.ts
import axiosInstance from './axiosInstance';
import { UserInsurance, UserInsurancePayload, InsurancePlan } from '../types/insurance';

/**
 * Fetches the logged-in user's insurance records.
 * Assumes backend returns a direct array.
 */
export const getUserInsurances = async (): Promise<UserInsurance[]> => {
    try {
        // Endpoint from insurance/urls.py
        const response = await axiosInstance.get<UserInsurance[]>('/insurance/user-insurance/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user insurances:', error);
        throw error;
    }
};

/**
 * Fetches a list of all available (active) insurance plans.
 * Used for populating dropdowns when adding/editing user insurance.
 * Assumes backend returns a direct array.
 */
export const getAvailablePlans = async (): Promise<InsurancePlan[]> => {
     try {
        // Endpoint from insurance/urls.py (assuming it filters for active=True)
        const response = await axiosInstance.get<InsurancePlan[]>('/insurance/plans/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch available insurance plans:', error);
        throw error;
    }
};


/**
 * Adds a new insurance record for the user.
 * Note: File uploads (card images) usually require FormData and potentially a separate endpoint or handling.
 * This function handles the core data submission.
 */
export const addUserInsurance = async (payload: UserInsurancePayload): Promise<UserInsurance> => {
    try {
        const response = await axiosInstance.post<UserInsurance>('/insurance/user-insurance/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to add user insurance:', error);
        throw error;
    }
};

/**
 * Updates an existing user insurance record.
 * Note: File uploads handled separately. This updates core data.
 */
export const updateUserInsurance = async (id: number, payload: Partial<UserInsurancePayload>): Promise<UserInsurance> => {
    try {
        const response = await axiosInstance.patch<UserInsurance>(`/insurance/user-insurance/${id}/`, payload);
        return response.data;
    } catch (error) {
        console.error(`Failed to update user insurance ${id}:`, error);
        throw error;
    }
};

/**
 * Deletes a user insurance record.
 */
export const deleteUserInsurance = async (id: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/insurance/user-insurance/${id}/`);
    } catch (error) {
        console.error(`Failed to delete user insurance ${id}:`, error);
        throw error;
    }
};

// --- TODO: File Upload Logic ---
// Separate functions might be needed to upload card images using FormData
// e.g., uploadInsuranceCard(userInsuranceId, cardSide, file)
// These would typically hit a dedicated endpoint or the standard update endpoint
// configured to handle multipart/form-data. For simplicity, we'll omit
// direct file upload in the form submission here.

// Add API functions for Claims and Documents later