// src/api/emergencyContacts.ts
import axiosInstance from './axiosInstance';
import { EmergencyContact, EmergencyContactPayload } from '../types/user';
import { PaginatedResponse } from '../types/common'; // Import common type

// Define specific parameters if needed
type ContactListParams = { page?: number; ordering?: string };

/**
 * Fetches the logged-in user's emergency contacts, handling pagination.
 */
export const getUserEmergencyContacts = async (
    paramsOrUrl: ContactListParams | string | null = null
): Promise<PaginatedResponse<EmergencyContact>> => { // <-- Updated return type
    const endpoint = '/emergency/contacts/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<EmergencyContact>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<EmergencyContact>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch emergency contacts:', error);
        throw error;
    }
};

// --- Functions for single items or actions remain the same ---

/**
 * Adds a new emergency contact for the logged-in user.
 */
export const addEmergencyContact = async (payload: EmergencyContactPayload): Promise<EmergencyContact> => {
    try {
        const response = await axiosInstance.post<EmergencyContact>('/emergency/contacts/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to add emergency contact:', error);
        throw error;
    }
};

/**
 * Updates an existing emergency contact.
 */
export const updateEmergencyContact = async (id: number, payload: Partial<EmergencyContactPayload>): Promise<EmergencyContact> => {
    try {
        const response = await axiosInstance.patch<EmergencyContact>(`/emergency/contacts/${id}/`, payload);
        return response.data;
    } catch (error) {
        console.error(`Failed to update emergency contact ${id}:`, error);
        throw error;
    }
};

/**
 * Deletes an emergency contact.
 */
export const deleteEmergencyContact = async (id: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/emergency/contacts/${id}/`);
    } catch (error) {
        console.error(`Failed to delete emergency contact ${id}:`, error);
        throw error;
    }
};