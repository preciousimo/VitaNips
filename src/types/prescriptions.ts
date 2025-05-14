// src/types/prescriptions.ts
import { Medication } from './pharmacy';

export interface PrescriptionItem {
    id: number;
    prescription: number;
    medication_name: string;
    medication_id: number | null;
    medication_details?: Medication | null;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export interface Prescription {
    id: number;
    appointment: number;
    user: number;
    doctor: number;
    date_prescribed: string;
    diagnosis: string;
    notes: string | null;
    items: PrescriptionItem[];
    created_at: string;
    updated_at: string;
}