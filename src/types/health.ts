// src/types/health.ts
import { PaginatedResponse } from './common';

export interface MedicalDocument {
    id: number;
    user: number;
    uploaded_by: number;
    appointment: number | null;
    file: string;
    file_url: string | null;
    filename: string | null;
    description: string | null;
    document_type: string | null;
    uploaded_at: string;
}

export interface MedicalDocumentUploadPayload {
    description?: string | null;
    document_type?: string | null;
    appointment?: number | null;
}

export interface Vaccination {
    id: number;
    user: number;
    vaccine_name: string;
    date_administered: string;
    dose_number: number;
    next_dose_date: string | null;
    administered_at: string | null;
    batch_number: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export type VaccinationPayload = Omit<Vaccination, 'id' | 'user' | 'created_at' | 'updated_at'>;
