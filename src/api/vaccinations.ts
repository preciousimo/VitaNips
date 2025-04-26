// src/api/vaccinations.ts
import axiosInstance from './axiosInstance';
import { Vaccination, VaccinationPayload } from '../types/health';
import { PaginatedResponse } from '../types/common'; // Import common type

type VaccinationListParams = { page?: number; ordering?: string };

/**
 * Fetches vaccinations for the logged-in user, handling pagination.
 */
export const getUserVaccinations = async (
    paramsOrUrl: VaccinationListParams | string | null = null
): Promise<PaginatedResponse<Vaccination>> => { // <-- Updated return type
    const endpoint = '/users/vaccinations/';
    try {
        let response;
         if (typeof paramsOrUrl === 'string') {
             const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Vaccination>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<Vaccination>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch vaccinations:', error);
        throw error;
    }
};

// --- Functions for single items or actions remain the same ---

/**
 * Adds a new vaccination record for the logged-in user.
 */
export const addVaccination = async (payload: VaccinationPayload): Promise<Vaccination> => {
    try {
        const response = await axiosInstance.post<Vaccination>('/users/vaccinations/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to add vaccination:', error);
        throw error;
    }
};

/**
 * Updates an existing vaccination record.
 */
export const updateVaccination = async (id: number, payload: Partial<VaccinationPayload>): Promise<Vaccination> => {
    try {
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