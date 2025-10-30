// src/utils/errors.ts
import { AxiosError } from 'axios';

type DRFErrorData = {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: unknown;
};

export const apiErrorToMessage = (
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  // AxiosError narrowing (no any)
  const axiosErr = err as AxiosError<DRFErrorData> | undefined;
  const status = axiosErr?.response?.status;
  const data = axiosErr?.response?.data as DRFErrorData | undefined;

  // DRF common shapes
  if (data && typeof data === 'object') {
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return String(data.non_field_errors[0]);
    }
    // Field errors: return the first string we find
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (Array.isArray(val) && val.length > 0) return String(val[0]);
      if (typeof val === 'string') return val;
    }
  }

  if (status === 401) return 'Invalid credentials. Please check your email and password.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'Resource not found.';
  if (status && status >= 500) return 'The server experienced an error. Please try again later.';

  return fallback;
};
