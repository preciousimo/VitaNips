// src/schemas/healthSchema.ts
import { z } from 'zod';

// Vital Signs Schema
export const vitalSignsSchema = z.object({
  systolic_pressure: z.number()
    .min(60, 'Systolic pressure must be at least 60 mmHg')
    .max(250, 'Systolic pressure must not exceed 250 mmHg')
    .optional()
    .or(z.null()),
  
  diastolic_pressure: z.number()
    .min(40, 'Diastolic pressure must be at least 40 mmHg')
    .max(150, 'Diastolic pressure must not exceed 150 mmHg')
    .optional()
    .or(z.null()),
  
  heart_rate: z.number()
    .min(30, 'Heart rate must be at least 30 bpm')
    .max(250, 'Heart rate must not exceed 250 bpm')
    .optional()
    .or(z.null()),
  
  temperature: z.number()
    .min(30, 'Temperature must be at least 30°C')
    .max(45, 'Temperature must not exceed 45°C')
    .optional()
    .or(z.null()),
  
  weight: z.number()
    .min(0.5, 'Weight must be at least 0.5 kg')
    .max(500, 'Weight must not exceed 500 kg')
    .optional()
    .or(z.null()),
  
  height: z.number()
    .min(20, 'Height must be at least 20 cm')
    .max(300, 'Height must not exceed 300 cm')
    .optional()
    .or(z.null()),
  
  date_recorded: z.string()
    .min(1, 'Date is required'),
  
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
}).refine((data) => {
  // At least one vital sign must be provided
  return data.systolic_pressure !== null && data.systolic_pressure !== undefined ||
         data.diastolic_pressure !== null && data.diastolic_pressure !== undefined ||
         data.heart_rate !== null && data.heart_rate !== undefined ||
         data.temperature !== null && data.temperature !== undefined ||
         data.weight !== null && data.weight !== undefined ||
         data.height !== null && data.height !== undefined;
}, {
  message: 'Please provide at least one vital sign measurement',
  path: ['systolic_pressure'],
}).refine((data) => {
  // If systolic is provided, diastolic should be provided and vice versa
  const hasSystolic = data.systolic_pressure !== null && data.systolic_pressure !== undefined;
  const hasDiastolic = data.diastolic_pressure !== null && data.diastolic_pressure !== undefined;
  if (hasSystolic && !hasDiastolic) return false;
  if (hasDiastolic && !hasSystolic) return false;
  return true;
}, {
  message: 'Both systolic and diastolic pressure are required for blood pressure measurement',
  path: ['diastolic_pressure'],
});

export type VitalSignsFormData = z.infer<typeof vitalSignsSchema>;

// Symptom Log Schema
export const symptomLogSchema = z.object({
  symptom_name: z.string()
    .min(1, 'Symptom name is required')
    .min(2, 'Symptom name must be at least 2 characters')
    .max(100, 'Symptom name must not exceed 100 characters'),
  
  severity: z.enum(['mild', 'moderate', 'severe'], {
    message: 'Please select a severity level',
  }),
  
  description: z.string()
    .min(10, 'Please provide more details (at least 10 characters)')
    .max(1000, 'Description must not exceed 1000 characters'),
  
  date_started: z.string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const startDate = new Date(date);
      const today = new Date();
      return startDate <= today;
    }, {
      message: 'Start date cannot be in the future',
    }),
  
  date_ended: z.string()
    .optional()
    .or(z.literal('')),
  
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
}).refine((data) => {
  if (!data.date_ended) return true;
  const start = new Date(data.date_started);
  const end = new Date(data.date_ended);
  return end >= start;
}, {
  message: 'End date must be after start date',
  path: ['date_ended'],
});

export type SymptomLogFormData = z.infer<typeof symptomLogSchema>;

// Food Journal Schema
export const foodJournalSchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
    message: 'Please select a meal type',
  }),
  
  food_items: z.string()
    .min(3, 'Please describe what you ate (at least 3 characters)')
    .max(500, 'Food items description must not exceed 500 characters'),
  
  portion_size: z.string()
    .max(100, 'Portion size must not exceed 100 characters')
    .optional(),
  
  calories: z.number()
    .min(0, 'Calories must be non-negative')
    .max(10000, 'Calories value seems too high')
    .optional()
    .or(z.null()),
  
  date_time: z.string()
    .min(1, 'Date and time are required'),
  
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
});

export type FoodJournalFormData = z.infer<typeof foodJournalSchema>;

// Exercise Log Schema
export const exerciseLogSchema = z.object({
  exercise_type: z.string()
    .min(1, 'Exercise type is required')
    .min(2, 'Exercise type must be at least 2 characters')
    .max(100, 'Exercise type must not exceed 100 characters'),
  
  duration_minutes: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration cannot exceed 24 hours'),
  
  intensity: z.enum(['low', 'medium', 'high'], {
    message: 'Please select an intensity level',
  }),
  
  calories_burned: z.number()
    .min(0, 'Calories burned must be non-negative')
    .max(5000, 'Calories burned value seems too high')
    .optional()
    .or(z.null()),
  
  date_time: z.string()
    .min(1, 'Date and time are required'),
  
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
});

export type ExerciseLogFormData = z.infer<typeof exerciseLogSchema>;

// Sleep Log Schema
export const sleepLogSchema = z.object({
  date: z.string()
    .min(1, 'Date is required'),
  
  bedtime: z.string()
    .min(1, 'Bedtime is required')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  
  wake_time: z.string()
    .min(1, 'Wake time is required')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  
  quality: z.enum(['poor', 'fair', 'good', 'excellent'], {
    message: 'Please rate your sleep quality',
  }),
  
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
});

export type SleepLogFormData = z.infer<typeof sleepLogSchema>;
