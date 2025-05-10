// src/types/notifications.ts
import { PaginatedResponse } from './common';

export interface Notification {
    id: number;
    actor_username: string | null;
    verb: string;
    level: string;
    unread: boolean;
    timestamp: string;
    target_url: string | null;
}

export interface UnreadNotificationCount {
    unread_count: number;
}

export type PaginatedNotificationResponse = PaginatedResponse<Notification>;