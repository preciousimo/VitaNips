// src/utils/date.ts

export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return timeStr;
  }
};

export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'N/A';
  try {
    // Ensure timezone consistency; interpret as UTC midnight
    return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};
