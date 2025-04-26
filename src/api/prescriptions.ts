// src/api/prescriptions.ts
import axiosInstance from './axiosInstance';
import { Prescription } from '../types/prescriptions';

/**
 * Fetches prescriptions for the logged-in user.
 * Assumes backend returns a direct array.
 */
export const getUserPrescriptions = async (): Promise<Prescription[]> => {
    try {
        const response = await axiosInstance.get<Prescription[]>('/doctors/prescriptions/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user prescriptions:', error);
        throw error;
    }
};

/**
 * Fetches details for a single prescription.
 * Uses the new backend endpoint.
 */
export const getPrescriptionDetails = async (id: number): Promise<Prescription> => {
     try {
        const response = await axiosInstance.get<Prescription>(`/doctors/prescriptions/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch prescription details for ID ${id}:`, error);
        throw error;
    }
};