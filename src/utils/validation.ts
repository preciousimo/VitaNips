// src/utils/validation.ts
/**
 * Utility functions for form validation
 */

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format (international format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?1?\d{9,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
};

/**
 * Validates password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
};

/**
 * Gets password strength level
 */
export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} => {
  if (password.length < 8) {
    return { strength: 'weak', message: 'Password must be at least 8 characters' };
  }
  
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (score < 3) {
    return { strength: 'weak', message: 'Add uppercase, lowercase, and numbers' };
  }
  if (score === 3) {
    return { strength: 'medium', message: 'Good, but could be stronger' };
  }
  return { strength: 'strong', message: 'Strong password!' };
};

/**
 * Validates required field
 */
export const isRequired = (value: unknown): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
};

/**
 * Validates number range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validates date is not in the past
 */
export const isNotPastDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};
