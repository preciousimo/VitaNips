// src/api/prescriptions.ts
import axiosInstance from './axiosInstance';
import { Prescription } from '../types/prescriptions';

/**
 * Fetches prescriptions for the logged-in user.
 * Assumes backend returns a direct array.
 */
export const getUserPrescriptions = async (): Promise<Prescription[]> => {
    try {
        // Endpoint from doctors/urls.py
        const response = await axiosInstance.get<Prescription[]>('/doctors/prescriptions/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user prescriptions:', error);
        throw error;
    }
};

/**
 * Fetches details for a single prescription.
 * ASSUMPTION: Requires backend endpoint like /api/doctors/prescriptions/{id}/
 */
export const getPrescriptionDetails = async (id: number): Promise<Prescription> => {
     try {
        // ** NOTE: Ensure this endpoint exists or is added to your backend doctors/urls.py **
        // Example backend view: generics.RetrieveAPIView using PrescriptionSerializer
        const response = await axiosInstance.get<Prescription>(`/doctors/prescriptions/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch prescription details for ID ${id}:`, error);
        throw error;
    }
};

// Add other prescription-related functions later if needed
// e.g., forwardPrescriptionToPharmacy(...)