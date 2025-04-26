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
  