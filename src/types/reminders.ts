// src/types/reminders.ts
import { Medication } from './pharmacy'; // Assuming Medication type is in pharmacy types

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface MedicationReminder {
    id: number;
    user: number;
    medication_display: Medication; // Changed from 'medication' to match refined serializer
    prescription_item_id: number | null; // Changed from prescription_item to match refined serializer
    // prescription_item_display: PrescriptionItem | null; // If you add this to serializer for GET
    start_date: string; // YYYY-MM-DD
    end_date: string | null; // YYYY-MM-DD
    time_of_day: string; // HH:MM:SS or HH:MM
    frequency: ReminderFrequency;
    custom_frequency: string | null;
    dosage: string;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MedicationReminderPayload {
    medication_name_input: string; // User types this. Backend resolves to Medication FK.
    prescription_item_id?: number | null;
    start_date: string; // YYYY-MM-DD
    end_date?: string | null; // YYYY-MM-DD
    time_of_day: string; // HH:MM
    frequency: ReminderFrequency;
    custom_frequency?: string | null;
    dosage: string;
    notes?: string | null;
    is_active?: boolean;
}