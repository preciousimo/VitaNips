// src/api/vaccinations.ts
import axiosInstance from './axiosInstance';
import { Vaccination, VaccinationPayload } from '../types/health';

// Type for the payload when creating/updating (omit read-only fields)
// export type VaccinationPayload = Omit<Vaccination, 'id' | 'user' | 'created_at' | 'updated_at'>;

/**
 * Fetches vaccinations for the logged-in user.
 * Assumes backend returns a direct array.
 */
export const getUserVaccinations = async (): Promise<Vaccination[]> => {
    try {
        // Endpoint from users/urls.py
        const response = await axiosInstance.get<Vaccination[]>('/users/vaccinations/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch vaccinations:', error);
        throw error;
    }
};

/**
 * Adds a new vaccination record for the logged-in user.
 */
export const addVaccination = async (payload: VaccinationPayload): Promise<Vaccination> => {
    try {
        const response = await axiosInstance.post<Vaccination>('/users/vaccinations/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to add vaccination:', error);
        // Consider checking for validation errors (e.g., error.response.data)
        throw error;
    }
};

/**
 * Updates an existing vaccination record.
 */
export const updateVaccination = async (id: number, payload: Partial<VaccinationPayload>): Promise<Vaccination> => {
    try {
        // Using PATCH for partial updates
        const response = await axiosInstance.patch<Vaccination>(`/users/vaccinations/${id}/`, payload);
        return response.data;
    } catch (error) {
        console.error(`Failed to update vaccination ${id}:`, error);
        throw error;
    }
};

/**
 * Deletes a vaccination record.
 */
export const deleteVaccination = async (id: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/users/vaccinations/${id}/`);
    } catch (error) {
        console.error(`Failed to delete vaccination ${id}:`, error);
        throw error;
    }
};