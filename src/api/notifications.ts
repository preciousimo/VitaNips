// src/api/notifications.ts
import axiosInstance from './axiosInstance';
import axios from 'axios';
import { PaginatedResponse } from '../types/common';
import { Notification, UnreadNotificationCount } from '../types/notifications';

export type DeviceType = 'web' | 'ios' | 'android';

export interface DeviceRegistrationPayload {
    registration_id: string; // The FCM token or APNS token
    type: DeviceType; // Type of the device
}

/**
 * Registers the user's device token with the backend.
 */
export const registerDevice = async (payload: DeviceRegistrationPayload): Promise<{ detail: string }> => {
    try {
        const response = await axiosInstance.post<{ detail: string }>(
            '/notifications/devices/register/',
            payload
        );
        return response.data;
    } catch (error: any) {
        console.error('Failed to register device:', error);
        // Throw a more specific error message if possible
        const errorMsg = axios.isAxiosError(error) && error.response?.data?.error
            ? error.response.data.error
            : "Could not register device with server.";
        throw new Error(errorMsg);
    }
};

// Define parameter types for fetching notifications
interface GetNotificationsParams {
    page?: number;
    unread?: boolean;
}

/**
 * Fetches notifications for the logged-in user, handling pagination.
 */
export const getNotifications = async (
    paramsOrUrl: GetNotificationsParams | string | null = null
): Promise<PaginatedResponse<Notification>> => {
    const endpoint = '/notifications/'; // Matches notifications/urls.py
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            // Fetching next/previous page using the full URL
            const url = new URL(paramsOrUrl);
            // Use only path + query string, as baseURL is handled by axiosInstance
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Notification>>(pathWithQuery);
        } else {
            // Initial fetch with parameters object
            response = await axiosInstance.get<PaginatedResponse<Notification>>(endpoint, { params: paramsOrUrl });
        }
        // Defensive check (backend should return correct structure, but good practice)
        if (!response.data || !Array.isArray(response.data.results)) {
            console.warn("Invalid paginated structure received for notifications:", response.data);
            return { count: 0, next: null, previous: null, results: [] };
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        // Return empty structure on error to prevent crashes downstream
        if (axios.isAxiosError(error) && error.response?.status === 404 && typeof paramsOrUrl === 'string') {
            // If fetching next page returned 404, it likely means no more pages
             return { count: 0, next: null, previous: paramsOrUrl, results: [] }; // Adjust count/prev if needed
        }
        // For other errors, return empty
        return { count: 0, next: null, previous: null, results: [] };
        // Or re-throw if pages should handle the error explicitly:
        // throw error;
    }
};

/**
 * Fetches the count of unread notifications for the logged-in user.
 */
export const getUnreadNotificationCount = async (): Promise<UnreadNotificationCount> => {
     try {
        const response = await axiosInstance.get<UnreadNotificationCount>('/notifications/unread_count/'); // Matches notifications/urls.py
        return response.data ?? { unread_count: 0 }; // Default if data is null/undefined
    } catch (error) {
        console.error('Failed to fetch notification count:', error);
         return { unread_count: 0 }; // Return 0 on error
        // Or re-throw:
        // throw error;
    }
};

/**
 * Marks a specific notification as read.
 * Returns the updated notification.
 */
export const markNotificationRead = async (notificationId: number): Promise<Notification> => {
    try {
        // Assuming the backend returns the updated notification object on POST
        const response = await axiosInstance.post<Notification>(`/notifications/${notificationId}/read/`); // Matches notifications/urls.py
        return response.data;
    } catch (error) {
        console.error(`Failed to mark notification ${notificationId} as read:`, error);
        throw error;
    }
};

/**
 * Marks all unread notifications as read for the logged-in user.
 */
export const markAllNotificationsRead = async (): Promise<{ status: string }> => { // Backend returns { status: "X notifications marked..." }
    try {
        const response = await axiosInstance.post<{ status: string }>('/notifications/read_all/'); // Matches notifications/urls.py
        return response.data;
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        throw error;
    }
};