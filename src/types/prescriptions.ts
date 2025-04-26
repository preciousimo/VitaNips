// src/types/prescriptions.ts

// Based on PrescriptionItemSerializer
export interface PrescriptionItem {
    id: number;
    prescription: number; // Prescription ID
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

// Based on PrescriptionSerializer
export interface Prescription {
    id: number;
    appointment: number; // Appointment ID (link to appointment details?)
    user: number; // User ID
    doctor: number; // Doctor ID (link to doctor profile)
    // Optional: Add fetched doctor details if needed later
    // doctor_details?: { full_name: string; /* other needed fields */ };
    date_prescribed: string; // Date string (YYYY-MM-DD)
    diagnosis: string;
    notes: string | null;
    items: PrescriptionItem[]; // Nested prescription items
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}