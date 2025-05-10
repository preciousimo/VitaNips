// src/api/notifications.ts
import axiosInstance from './axiosInstance';
import axios from 'axios';
import { PaginatedResponse } from '../types/common';
import { Notification, UnreadNotificationCount } from '../types/notifications';

export type DeviceType = 'web' | 'ios' | 'android';

export interface DeviceRegistrationPayload {
    registration_id: string;
    type: DeviceType;
}

export const registerDevice = async (payload: DeviceRegistrationPayload): Promise<{ detail: string }> => {
    try {
        const response = await axiosInstance.post<{ detail: string }>(
            '/notifications/devices/register/',
            payload
        );
        return response.data;
    } catch (error: any) {
        console.error('Failed to register device:', error);
        const errorMsg = axios.isAxiosError(error) && error.response?.data?.error
            ? error.response.data.error
            : "Could not register device with server.";
        throw new Error(errorMsg);
    }
};

interface GetNotificationsParams {
    page?: number;
    unread?: boolean;
}

export const getNotifications = async (
    paramsOrUrl: GetNotificationsParams | string | null = null
): Promise<PaginatedResponse<Notification>> => {
    const endpoint = '/notifications/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Notification>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<Notification>>(endpoint, { params: paramsOrUrl });
        }
        if (!response.data || !Array.isArray(response.data.results)) {
            console.warn("Invalid paginated structure received for notifications:", response.data);
            return { count: 0, next: null, previous: null, results: [] };
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        if (axios.isAxiosError(error) && error.response?.status === 404 && typeof paramsOrUrl === 'string') {
             return { count: 0, next: null, previous: paramsOrUrl, results: [] };
        }
        return { count: 0, next: null, previous: null, results: [] };
    }
};

export const getUnreadNotificationCount = async (): Promise<UnreadNotificationCount> => {
     try {
        const response = await axiosInstance.get<UnreadNotificationCount>('/notifications/unread_count/');
        return response.data ?? { unread_count: 0 };
    } catch (error) {
        console.error('Failed to fetch notification count:', error);
         return { unread_count: 0 };
    }
};

export const markNotificationRead = async (notificationId: number): Promise<Notification> => {
    try {
        const response = await axiosInstance.post<Notification>(`/notifications/${notificationId}/read/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to mark notification ${notificationId} as read:`, error);
        throw error;
    }
};

export const markAllNotificationsRead = async (): Promise<{ status: string }> => {
    try {
        const response = await axiosInstance.post<{ status: string }>('/notifications/read_all/');
        return response.data;
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        throw error;
    }
};