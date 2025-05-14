// src/types/user.ts
import { UserInsurance } from './insurance';
import { Vaccination } from './health';

export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone_number?: string | null;
    date_of_birth?: string | null;
    profile_picture?: string | null;
    address?: string | null;
    medical_history_summary?: string | null;

    blood_group?: string | null;
    genotype?: string | null;
    allergies?: string | null;
    chronic_conditions?: string | null;
    weight?: number | null;
    height?: number | null;

    is_pharmacy_staff?: boolean;
    works_at_pharmacy?: number | null;

    is_doctor: boolean;
    doctor_id?: number | null;

    notify_appointment_reminder_email?: boolean;
    notify_appointment_reminder_sms?: boolean;
    notify_refill_reminder_email?: boolean;
    notify_appointment_reminder_push?: boolean;
    notify_appointment_confirmation_email?: boolean;
    notify_appointment_cancellation_email?: boolean;
    notify_prescription_update_email?: boolean;
    notify_order_update_email?: boolean;
    notify_general_updates_email?: boolean;


    insurance_details?: UserInsurance[];
    emergency_contacts?: EmergencyContact[];
    vaccinations?: Vaccination[];

    created_at?: string;
    updated_at?: string;
}

export interface EmergencyContact {
    id: number;
    user: number;
    name: string;
    relationship: string;
    phone_number: string;
    alternative_phone?: string | null;
    email?: string | null;
    address?: string | null;
    is_primary: boolean;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

export type EmergencyContactPayload = Omit<EmergencyContact, 'id' | 'user' | 'created_at' | 'updated_at'>;

export type UserProfileUpdatePayload = Partial<Omit<User, 'id' | 'email' | 'username' | 'is_doctor' | 'doctor_id' | 'is_pharmacy_staff' | 'works_at_pharmacy' | 'insurance_details' | 'emergency_contacts' | 'vaccinations' | 'created_at' | 'updated_at' >>;