// src/schemas/medicationSchema.ts
import { z } from 'zod';

// Medication Reminder Schema
export const medicationReminderSchema = z.object({
  medication: z.number()
    .positive('Please select a medication'),
  
  time_of_day: z.string()
    .min(1, 'Please select a time')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  
  frequency: z.enum(['daily', 'weekly', 'monthly', 'as_needed'], {
    message: 'Please select a valid frequency',
  }),
  
  dosage: z.string()
    .min(1, 'Dosage is required')
    .max(100, 'Dosage must not exceed 100 characters'),
  
  instructions: z.string()
    .max(500, 'Instructions must not exceed 500 characters')
    .optional(),
  
  start_date: z.string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const startDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return startDate >= today;
    }, {
      message: 'Start date cannot be in the past',
    }),
  
  end_date: z.string()
    .optional()
    .or(z.literal('')),
  
  is_active: z.boolean().default(true),
}).refine((data) => {
  if (!data.end_date) return true;
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  return end >= start;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

export type MedicationReminderFormData = z.infer<typeof medicationReminderSchema>;

// Prescription Order Schema
export const prescriptionOrderSchema = z.object({
  prescription: z.number()
    .positive('Please select a prescription'),
  
  pharmacy: z.number()
    .positive('Please select a pharmacy'),
  
  delivery_method: z.enum(['pickup', 'delivery'], {
    message: 'Please select a delivery method',
  }),
  
  delivery_address: z.string()
    .max(300, 'Address must not exceed 300 characters')
    .optional(),
  
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
  
  preferred_date: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const preferredDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return preferredDate >= today;
    }, {
      message: 'Preferred date cannot be in the past',
    }),
}).refine((data) => {
  // Validate delivery address when delivery method is 'delivery'
  if (data.delivery_method === 'delivery' && (!data.delivery_address || data.delivery_address.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Delivery address is required for delivery orders',
  path: ['delivery_address'],
});

export type PrescriptionOrderFormData = z.infer<typeof prescriptionOrderSchema>;
