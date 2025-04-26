// src/types/health.ts
import { PaginatedResponse } from './common';

// Based on MedicalDocumentSerializer
export interface MedicalDocument {
    id: number;
    user: number; // User ID (owner/patient)
    uploaded_by: number; // User ID (who uploaded)
    // uploaded_by_email?: string; // Optional if added to serializer
    appointment: number | null; // Appointment ID or null
    file: string; // Original file path/name (often not directly useful)
    file_url: string | null; // Public URL or signed URL to access the file
    filename: string | null; // Base filename
    description: string | null;
    document_type: string | null; // e.g., Lab Result, Scan, Report
    uploaded_at: string; // ISO date string
}

// Payload for upload (excluding the file itself)
export interface MedicalDocumentUploadPayload {
    description?: string | null;
    document_type?: string | null;
    appointment?: number | null; // Optional: Link to appointment during upload
}

// Add other health types (Vaccination, etc.) if they are in this file

// Based on VaccinationSerializer
export interface Vaccination {
    id: number;
    user: number; // User ID
    vaccine_name: string;
    date_administered: string; // Expect YYYY-MM-DD string
    dose_number: number;
    next_dose_date: string | null; // Expect YYYY-MM-DD string or null
    administered_at: string | null; // Location
    batch_number: string | null;
    notes: string | null;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

export type VaccinationPayload = Omit<Vaccination, 'id' | 'user' | 'created_at' | 'updated_at'>;

// Add other health types here later (VitalSign, SymptomLog, etc.)