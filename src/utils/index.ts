// src/utils/index.ts
/**
 * Central export for all utility functions
 * This file re-exports utilities from other modules and includes legacy functions
 */

// Re-export from new utility modules
export * from './dateTime';
export * from './validation';
export * from './formatting';
export * from './errorMessages';
export * from './accessibility';

/**
 * Format a date string to a readable format with smart detection for today/tomorrow
 */
export const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'N/A';
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const itemDate = new Date(dateStr + 'T00:00:00Z');
        itemDate.setHours(0, 0, 0, 0);

        if (itemDate.getTime() === today.getTime()) return 'Today';
        
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        if (itemDate.getTime() === tomorrow.getTime()) return 'Tomorrow';

        return itemDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    } catch { 
        return 'Invalid Date'; 
    }
};

/**
 * Format a date string to include the year
 */
export const formatDateWithYear = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'N/A';
    try {
        const date = new Date(dateStr + 'T00:00:00Z');
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch { 
        return 'Invalid Date'; 
    }
};

/**
 * Format a datetime string to a readable format
 */
export const formatDateTime = (dateTimeStr: string | null | undefined): string => {
    if (!dateTimeStr) return 'N/A';
    try {
        const date = new Date(dateTimeStr);
        return date.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch { 
        return 'Invalid Date'; 
    }
};

/**
 * Calculate the difference between two dates in days
 */
export const getDaysDifference = (date1: string, date2: string): number => {
    try {
        const d1 = new Date(date1 + 'T00:00:00Z');
        const d2 = new Date(date2 + 'T00:00:00Z');
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
        return 0;
    }
};

/**
 * Check if a date is today
 */
export const isToday = (dateStr: string): boolean => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const itemDate = new Date(dateStr + 'T00:00:00Z');
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === today.getTime();
    } catch {
        return false;
    }
};

/**
 * Check if a date is in the past
 */
export const isPast = (dateStr: string): boolean => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const itemDate = new Date(dateStr + 'T00:00:00Z');
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() < today.getTime();
    } catch {
        return false;
    }
};

/**
 * Format a phone number for display
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return '';
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
};

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

/**
 * Capitalize the first letter of each word
 */
export const capitalizeWords = (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

/**
 * Generate initials from a name
 */
export const getInitials = (firstName: string, lastName: string): string => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last;
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Debounce function to limit how often a function can be called
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};

/**
 * Check if a string is a valid email
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Check if a string is a valid phone number
 */
export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Get the appropriate status color for different statuses
 */
export const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'active':
        case 'confirmed':
        case 'completed':
            return 'text-green-600 bg-green-100';
        case 'pending':
        case 'scheduled':
            return 'text-blue-600 bg-blue-100';
        case 'cancelled':
        case 'failed':
            return 'text-red-600 bg-red-100';
        case 'warning':
        case 'expired':
            return 'text-yellow-600 bg-yellow-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
};

/**
 * Get the appropriate status icon for different statuses
 */
export const getStatusIcon = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'active':
        case 'confirmed':
        case 'completed':
            return 'check-circle';
        case 'pending':
        case 'scheduled':
            return 'clock';
        case 'cancelled':
        case 'failed':
            return 'x-circle';
        case 'warning':
        case 'expired':
            return 'exclamation-triangle';
        default:
            return 'question-mark-circle';
    }
};

/**
 * Format a timestamp to relative time (e.g., "2 hours ago", "just now")
 */
export const formatRelativeTime = (dateTimeStr: string): string => {
    try {
        const date = new Date(dateTimeStr);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        const years = Math.floor(months / 12);
        return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    } catch {
        return 'Unknown';
    }
}; 