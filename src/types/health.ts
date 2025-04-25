// src/types/health.ts

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