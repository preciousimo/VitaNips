// src/utils/errorMessages.ts
// User-friendly error messages for API errors

export interface ApiError {
  response?: {
    status?: number;
    data?: unknown;
  };
  message?: string;
}

/**
 * Maps backend error responses to user-friendly messages
 */
export const getErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError;

  // Handle network errors
  if (!apiError.response) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  const status = apiError.response.status;
  const data = apiError.response.data;

  // Handle HTTP status codes
  switch (status) {
    case 400:
      return parseDetailError(data) || "The information provided is invalid. Please check your input.";
    
    case 401:
      return "Your session has expired. Please log in again.";
    
    case 403:
      return "You don't have permission to perform this action.";
    
    case 404:
      return "The requested resource could not be found. It may have been deleted or moved.";
    
    case 409:
      return "This action conflicts with existing data. Please try something different.";
    
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    
    case 500:
      return "The server encountered an error. Please try again later.";
    
    case 502:
    case 503:
      return "The service is temporarily unavailable. Please try again in a few minutes.";
    
    case 504:
      return "The request took too long to process. Please try again.";
    
    default:
      return parseDetailError(data) || "An unexpected error occurred. Please try again.";
  }
};

/**
 * Extract detail message from backend error response
 */
function parseDetailError(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Check for common error message fields
  const errorData = data as Record<string, unknown>;
  
  // Direct detail field
  if (typeof errorData.detail === 'string') {
    return errorData.detail;
  }

  // Error field
  if (typeof errorData.error === 'string') {
    return errorData.error;
  }

  // Message field
  if (typeof errorData.message === 'string') {
    return errorData.message;
  }

  // Validation errors (field-specific errors)
  if (typeof errorData === 'object') {
    const fieldErrors: string[] = [];
    Object.entries(errorData).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        const messages = value.filter(v => typeof v === 'string');
        if (messages.length > 0) {
          fieldErrors.push(`${formatFieldName(field)}: ${messages.join(', ')}`);
        }
      } else if (typeof value === 'string') {
        fieldErrors.push(`${formatFieldName(field)}: ${value}`);
      }
    });
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join(' | ');
    }
  }

  return null;
}

/**
 * Format field name for display (e.g., 'phone_number' -> 'Phone Number')
 */
function formatFieldName(field: string): string {
  if (field === 'non_field_errors') {
    return 'Error';
  }
  
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Specific error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  // Authentication
  LOGIN_FAILED: "Invalid email or password. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  
  // Appointments
  APPOINTMENT_NOT_AVAILABLE: "This appointment slot is no longer available. Please choose another time.",
  APPOINTMENT_CONFLICT: "You already have an appointment at this time.",
  APPOINTMENT_PAST_DATE: "Cannot book appointments in the past.",
  
  // Prescriptions
  PRESCRIPTION_NOT_FOUND: "This prescription could not be found. It may have been deleted.",
  PRESCRIPTION_EXPIRED: "This prescription has expired. Please contact your doctor.",
  
  // Pharmacy
  PHARMACY_NOT_FOUND: "The selected pharmacy could not be found.",
  OUT_OF_STOCK: "This medication is currently out of stock at the selected pharmacy.",
  
  // Documents
  FILE_TOO_LARGE: "The file is too large. Please upload a file smaller than 5MB.",
  INVALID_FILE_TYPE: "Invalid file type. Please upload a valid image or PDF file.",
  
  // Emergency
  SOS_FAILED: "Failed to send SOS alert. Please try again or call emergency services directly.",
  LOCATION_UNAVAILABLE: "Unable to determine your location. Please enable location services.",
  
  // Network
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  TIMEOUT: "The request timed out. Please try again.",
  
  // Generic
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  GENERIC_ERROR: "Something went wrong. Please try again later.",
} as const;

/**
 * Get error message for specific error codes from backend
 */
export const getSpecificErrorMessage = (errorCode: string): string => {
  const codeMap: Record<string, string> = {
    'appointment_not_available': ERROR_MESSAGES.APPOINTMENT_NOT_AVAILABLE,
    'appointment_conflict': ERROR_MESSAGES.APPOINTMENT_CONFLICT,
    'prescription_expired': ERROR_MESSAGES.PRESCRIPTION_EXPIRED,
    'out_of_stock': ERROR_MESSAGES.OUT_OF_STOCK,
    'file_too_large': ERROR_MESSAGES.FILE_TOO_LARGE,
    'invalid_file_type': ERROR_MESSAGES.INVALID_FILE_TYPE,
    'sos_failed': ERROR_MESSAGES.SOS_FAILED,
  };

  return codeMap[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  const apiError = error as ApiError;
  return !apiError.response && !!apiError.message;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  const apiError = error as ApiError;
  return apiError.response?.status === 401;
};

export default getErrorMessage;
