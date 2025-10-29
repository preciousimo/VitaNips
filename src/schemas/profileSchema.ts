// src/schemas/profileSchema.ts
import { z } from 'zod';

const phoneRegex = /^\+?1?\d{9,15}$/;

export const profileUpdateSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters'),
  
  email: z.string()
    .email('Please enter a valid email address'),
  
  phone_number: z.string()
    .regex(phoneRegex, 'Please enter a valid phone number (e.g., +1234567890)')
    .optional()
    .or(z.literal('')),
  
  date_of_birth: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 150;
    }, {
      message: 'Please enter a valid date of birth',
    }),
  
  address: z.string()
    .max(200, 'Address must not exceed 200 characters')
    .optional(),
  
  blood_group: z.string()
    .max(5)
    .optional()
    .or(z.literal('')),
  
  genotype: z.string()
    .max(5)
    .optional()
    .or(z.literal('')),
  
  allergies: z.string()
    .max(1000, 'Allergies description must not exceed 1000 characters')
    .optional(),
  
  chronic_conditions: z.string()
    .max(1000, 'Chronic conditions description must not exceed 1000 characters')
    .optional(),
  
  weight: z.number()
    .min(0, 'Weight must be positive')
    .max(500, 'Please enter a valid weight')
    .optional()
    .or(z.null()),
  
  height: z.number()
    .min(0, 'Height must be positive')
    .max(300, 'Please enter a valid height')
    .optional()
    .or(z.null()),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
