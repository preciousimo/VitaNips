// src/api/emergencyContacts.ts
import axiosInstance from './axiosInstance';
import { EmergencyContact, EmergencyContactPayload } from '../types/user';

/**
 * Fetches the logged-in user's emergency contacts.
 * Assumes backend returns a direct array.
 */
export const getUserEmergencyContacts = async (): Promise<EmergencyContact[]> => {
    try {
        // Endpoint from emergency/urls.py
        const response = await axiosInstance.get<EmergencyContact[]>('/emergency/contacts/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch emergency contacts:', error);
        throw error;
    }
};

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