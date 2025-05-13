// src/api/medicationReminders.ts
import axiosInstance from './axiosInstance';
import { PaginatedResponse } from '../types/common';
import { MedicationReminder, MedicationReminderPayload } from '../types/reminders';

type ReminderListParams = { page?: number; ordering?: string };

export const getMedicationReminders = async (
    paramsOrUrl: ReminderListParams | string | null = null
): Promise<PaginatedResponse<MedicationReminder>> => {
    const endpoint = '/pharmacy/reminders/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            // Ensure we use only path + search if axiosInstance.defaults.baseURL is already set
            const pathWithQuery = (url.pathname + url.search).replace(axiosInstance.defaults.baseURL || '', '');
            response = await axiosInstance.get<PaginatedResponse<MedicationReminder>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<MedicationReminder>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch medication reminders:', error);
        throw error;
    }
};

export const createMedicationReminder = async (payload: MedicationReminderPayload): Promise<MedicationReminder> => {
    try {
        const response = await axiosInstance.post<MedicationReminder>('/pharmacy/reminders/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to create medication reminder:', error);
        throw error;
    }
};

export const updateMedicationReminder = async (id: number, payload: Partial<MedicationReminderPayload>): Promise<MedicationReminder> => {
    try {
        const response = await axiosInstance.patch<MedicationReminder>(`/pharmacy/reminders/${id}/`, payload);
        return response.data;
    } catch (error) {
        console.error(`Failed to update medication reminder ${id}:`, error);
        throw error;
    }
};

export const deleteMedicationReminder = async (id: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/pharmacy/reminders/${id}/`);
    } catch (error) {
        console.error(`Failed to delete medication reminder ${id}:`, error);
        throw error;
    }
};