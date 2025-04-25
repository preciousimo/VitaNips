// src/types/appointments.ts
import { Doctor } from './doctors'; // Assuming Doctor type is defined here

export interface Appointment {
    id: number;
    user: number; // User ID
    doctor: number; // Doctor ID - Serializer only provides ID
    // Optional: Add full doctor details if fetched separately or serializer is updated
    // doctor_details?: Doctor;
    date: string; // YYYY-MM-DD
    start_time: string; // HH:MM:SS
    end_time: string; // HH:MM:SS
    appointment_type: 'in_person' | 'virtual';
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    reason: string;
    notes: string | null;
    followup_required: boolean;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

// Type for creating an appointment
export interface AppointmentPayload {
    doctor: number; // Doctor ID is required
    date: string; // YYYY-MM-DD
    start_time: string; // HH:MM format might be easier from input, backend expects HH:MM:SS? Check serializer validation
    end_time: string; // HH:MM format might be easier
    appointment_type: 'in_person' | 'virtual';
    reason: string;
    notes?: string | null;
}