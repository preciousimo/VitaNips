// src/schemas/appointmentSchema.ts
import { z } from 'zod';

export const appointmentBookingSchema = z.object({
  doctor: z.number().positive('Please select a valid doctor'),
  
  date: z.string()
    .min(1, 'Please select an appointment date')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, {
      message: 'Appointment date cannot be in the past',
    }),
  
  start_time: z.string()
    .min(1, 'Please select an appointment time')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters long')
    .max(500, 'Reason must not exceed 500 characters'),
  
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
});

export type AppointmentBookingFormData = z.infer<typeof appointmentBookingSchema>;
