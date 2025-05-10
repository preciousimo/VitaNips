// src/types/pharmacy.ts
import { PrescriptionItem } from './prescriptions';

export interface Pharmacy {
    id: number;
    name: string;
    address: string;
    phone_number: string;
    email: string | null;
    latitude: number | null;
    longitude: number | null;
    operating_hours: string;
    is_24_hours: boolean;
    offers_delivery: boolean;
    created_at: string;
    updated_at: string;
}

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

export interface MedicationOrderItem {
    id: number;
    order: number;
    prescription_item: number | null;
    medication?: Medication | null;
    medication_name: string;
    dosage: string;
    quantity: number;
    price_per_unit: string | null;
    total_price: string | null;
}

export interface MedicationOrder {
    id: number;
    user: number;
    pharmacy: number;
    prescription: number | null;
    status: 'pending' | 'processing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
    is_delivery: boolean;
    delivery_address: string | null;
    total_amount: string | null;
    order_date: string;
    pickup_or_delivery_date: string | null;
    notes: string | null;
    items: MedicationOrderItem[];
}

export interface MedicationOrderUpdatePayload {
  status?: 'pending' | 'processing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  notes?: string | null;
  pickup_or_delivery_date?: string | null;
  total_amount?: string | null;
}