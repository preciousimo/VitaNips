// src/api/insurance.ts
import axiosInstance from './axiosInstance';
import { UserInsurance, UserInsurancePayload, InsurancePlan } from '../types/insurance';
import { PaginatedResponse } from '../types/common'; // Import common type

type InsuranceListParams = { page?: number; is_primary?: boolean };
type PlanListParams = { page?: number; provider?: number };

/**
 * Fetches the logged-in user's insurance records, handling pagination.
 */
export const getUserInsurances = async (
    paramsOrUrl: InsuranceListParams | string | null = null
): Promise<PaginatedResponse<UserInsurance>> => { // <-- Updated return type
    const endpoint = '/insurance/user-insurance/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<UserInsurance>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<UserInsurance>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user insurances:', error);
        throw error;
    }
};

/**
 * Fetches a list of all available (active) insurance plans.
 * NOTE: Assuming this list MIGHT be long and COULD be paginated by DRF defaults.
 * If it's guaranteed to be short and unpaginated, revert to Promise<InsurancePlan[]>.
 */
export const getAvailablePlans = async (
    paramsOrUrl: PlanListParams | string | null = null
): Promise<PaginatedResponse<InsurancePlan>> => { // <-- Updated return type (assuming pagination)
    const endpoint = '/insurance/plans/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
             const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<InsurancePlan>>(pathWithQuery);
        } else {
            // Ensure backend filters for active=True if needed, or add param here
            response = await axiosInstance.get<PaginatedResponse<InsurancePlan>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch available insurance plans:', error);
        throw error;
    }
};

// --- Functions for single items or actions remain the same ---

/**
 * Adds a new insurance record for the user.
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

// Add API functions for Claims and Documents later (will likely need pagination too)