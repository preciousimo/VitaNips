// src/types/pharmacy.ts

export interface Pharmacy {
    id: number;
    name: string;
    address: string;
    phone_number: string;
    email: string | null;
    latitude: number | null;
    longitude: number | null;
    operating_hours: string; // Consider parsing this if it has a strict format
    is_24_hours: boolean;
    offers_delivery: boolean;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
  }
  
  // Add other pharmacy-related types here later (Medication, Order, etc.)
  export interface Medication {
    id: number;
    name: string;
    generic_name: string | null;
    description: string;
    dosage_form: string;
    strength: string;
    manufacturer: string | null;
    requires_prescription: boolean;
    side_effects: string | null;
    contraindications: string | null;
    storage_instructions: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface PrescriptionItem {
      id: number;
      prescription: number; // Prescription ID
      medication_name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
  }
  
  export interface Prescription {
      id: number;
      appointment: number; // Appointment ID
      user: number; // User ID
      doctor: number; // Doctor ID
      date_prescribed: string; // Date string
      diagnosis: string;
      notes: string | null;
      items: PrescriptionItem[]; // Nested items
      created_at: string;
      updated_at: string;
  }