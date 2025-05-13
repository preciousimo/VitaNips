// src/types/reminders.ts
import { Medication } from './pharmacy'; // Assuming Medication type is in pharmacy types

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface MedicationReminder {
    id: number;
    user: number; // Read-only, set by backend
    medication: Medication; // For display (read-only from serializer)
    prescription_item: number | null; // FK to PrescriptionItem
    start_date: string; // YYYY-MM-DD
    end_date: string | null; // YYYY-MM-DD
    time_of_day: string; // HH:MM:SS or HH:MM
    frequency: ReminderFrequency;
    custom_frequency: string | null; // e.g., "every 3 days", or cron (needs backend parsing)
    dosage: string;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MedicationReminderPayload {
    // For MVP, user types medication name. Backend handles finding/creating Medication object.
    // If backend expects medication_id, this needs to change.
    medication_name: string; // User types this. Backend resolves to Medication FK.
    prescription_item_id?: number | null; // Optional: PK for PrescriptionItem
    start_date: string; // YYYY-MM-DD
    end_date?: string | null; // YYYY-MM-DD
    time_of_day: string; // HH:MM
    frequency: ReminderFrequency;
    custom_frequency?: string | null;
    dosage: string;
    notes?: string | null;
    is_active?: boolean;
}