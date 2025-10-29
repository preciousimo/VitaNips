// src/schemas/emergencyContactSchema.ts
import { z } from 'zod';

const phoneRegex = /^\+?1?\d{9,15}$/;

export const emergencyContactSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must not exceed 100 characters'),
  
  relationship: z.string()
    .min(1, 'Relationship is required')
    .max(50, 'Relationship must not exceed 50 characters'),
  
  phone_number: z.string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Please enter a valid phone number in format: +1234567890'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  
  address: z.string()
    .max(200, 'Address must not exceed 200 characters')
    .optional(),
  
  is_primary: z.boolean().default(false),
});

export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;
