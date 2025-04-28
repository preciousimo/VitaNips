// src/types/notifications.ts
import { PaginatedResponse } from './common'; // Assuming common types exist

// Based on NotificationSerializer
export interface Notification {
    id: number;
    actor_username: string | null; // Or nested actor object if serializer changes
    verb: string;
    level: string; // 'info', 'success', 'warning', 'error', 'appointment', etc.
    unread: boolean;
    timestamp: string; // ISO date-time string
    target_url: string | null;
}

// Type for the response of the unread count endpoint
export interface UnreadNotificationCount {
    unread_count: number;
}

// Type for the paginated list response
export type PaginatedNotificationResponse = PaginatedResponse<Notification>;