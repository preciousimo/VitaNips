// src/schemas/authSchema.ts
import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration Schema
export const registrationSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(150, 'Username must not exceed 150 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  email: z.string()
    .email('Please enter a valid email address'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  password_confirm: z.string()
    .min(1, 'Please confirm your password'),
  
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters'),
  
  phone_number: z.string()
    .regex(/^\+?1?\d{9,15}$/, 'Please enter a valid phone number (e.g., +1234567890)')
    .optional()
    .or(z.literal('')),
  
  date_of_birth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 && age <= 150;
    }, {
      message: 'You must be at least 13 years old to register',
    }),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Password Reset Request Schema
export const passwordResetRequestSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
});

export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>;

// Password Reset Confirm Schema
export const passwordResetConfirmSchema = z.object({
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  confirm_password: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export type PasswordResetConfirmFormData = z.infer<typeof passwordResetConfirmSchema>;

// Change Password Schema
export const changePasswordSchema = z.object({
  current_password: z.string()
    .min(1, 'Current password is required'),
  
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  confirm_new_password: z.string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: "Passwords don't match",
  path: ["confirm_new_password"],
}).refine((data) => data.current_password !== data.new_password, {
  message: "New password must be different from current password",
  path: ["new_password"],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
