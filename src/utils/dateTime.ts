// src/utils/dateTime.ts
/**
 * Utility functions for date and time formatting
 */

/**
 * Formats a date string to a readable format
 * @param dateStr - ISO date string or date-only string (YYYY-MM-DD)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  dateStr: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
): string => {
  if (!dateStr) return 'N/A';
  try {
    // Handle date-only strings by appending time to avoid timezone issues
    const date = dateStr.includes('T') 
      ? new Date(dateStr) 
      : new Date(dateStr + 'T00:00:00Z');
    
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', options);
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Formats a time string to readable format
 * @param timeStr - Time string (HH:MM:SS or HH:MM)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export const formatTime = (
  timeStr: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }
): string => {
  if (!timeStr) return 'N/A';
  try {
    // Create a date object with the time
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    if (isNaN(date.getTime())) return 'Invalid Time';
    return date.toLocaleTimeString('en-US', options);
  } catch {
    return 'Invalid Time';
  }
};

/**
 * Formats a datetime string to readable format
 * @param dateTimeStr - ISO datetime string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted datetime string
 */
export const formatDateTime = (
  dateTimeStr: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }
): string => {
  if (!dateTimeStr) return 'N/A';
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return 'Invalid DateTime';
    return date.toLocaleString('en-US', options);
  } catch {
    return 'Invalid DateTime';
  }
};

/**
 * Gets relative time from now (e.g., "2 hours ago", "in 3 days")
 * @param dateTimeStr - ISO datetime string
 * @returns Relative time string
 */
export const getRelativeTime = (dateTimeStr: string | null | undefined): string => {
  if (!dateTimeStr) return 'N/A';
  
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (Math.abs(diffMins) < 1) return 'just now';
    if (Math.abs(diffMins) < 60) {
      return diffMins > 0 ? `in ${diffMins} min` : `${Math.abs(diffMins)} min ago`;
    }
    if (Math.abs(diffHours) < 24) {
      return diffHours > 0 ? `in ${diffHours} hr` : `${Math.abs(diffHours)} hr ago`;
    }
    if (Math.abs(diffDays) < 7) {
      return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
    }
    
    return formatDate(dateTimeStr, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Checks if a date is in the past
 * @param dateStr - Date string
 * @returns boolean
 */
export const isPastDate = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;
  try {
    const date = new Date(dateStr);
    return date < new Date();
  } catch {
    return false;
  }
};

/**
 * Checks if a date is today
 * @param dateStr - Date string
 * @returns boolean
 */
export const isToday = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;
  try {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch {
    return false;
  }
};

/**
 * Combines date and time strings into ISO datetime
 * @param dateStr - Date string (YYYY-MM-DD)
 * @param timeStr - Time string (HH:MM)
 * @returns ISO datetime string
 */
export const combineDateAndTime = (dateStr: string, timeStr: string): string => {
  return `${dateStr}T${timeStr}:00`;
};
