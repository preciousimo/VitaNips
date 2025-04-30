// src/types/user.ts
// Assuming EmergencyContact types are also here or imported

// --- Main User Profile Structure ---
export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone_number?: string | null;
    date_of_birth?: string | null; // YYYY-MM-DD
    profile_picture?: string | null; // URL

    // Health-related fields
    blood_group?: string | null;
    allergies?: string | null;
    chronic_conditions?: string | null;
    weight?: number | null; // Float (kg)
    height?: number | null; // Float (cm)

    // Primary emergency contact fields (consider removing if using separate model exclusively)
    emergency_contact_name?: string | null;
    emergency_contact_relationship?: string | null;
    emergency_contact_phone?: string | null;

    // --- ADD PHARMACY STAFF FIELDS ---
    is_pharmacy_staff?: boolean; // Flag indicating pharmacy role
    works_at_pharmacy?: number | null; // ID of the pharmacy they belong to, or null
    
    // --- ADD Notification Preferences ---
    notify_appointment_reminder_email?: boolean;
    notify_appointment_reminder_sms?: boolean;
    notify_refill_reminder_email?: boolean;
    
    // Timestamps if included in serializer
    // created_at?: string;
    // updated_at?: string;
}

// --- Emergency Contact Structure ---
export interface EmergencyContact {
    id: number;
    user: number; // User ID
    name: string;
    relationship: string;
    phone_number: string;
    email: string | null;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

// Payload for adding/editing Emergency Contacts
export type EmergencyContactPayload = Omit<EmergencyContact, 'id' | 'user' | 'created_at' | 'updated_at'>;