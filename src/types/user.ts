// src/types/user.ts

// --- Main User Profile Structure ---
// (Moved from auth.ts and updated based on backend model)
export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone_number?: string | null;
    date_of_birth?: string | null; // YYYY-MM-DD
    profile_picture?: string | null; // URL

    // Health-related fields from backend User model
    blood_group?: string | null;
    allergies?: string | null;
    chronic_conditions?: string | null;
    weight?: number | null; // Float (kg)
    height?: number | null; // Float (cm)

    // Primary emergency contact fields (if kept directly on User model)
    // Consider removing if exclusively using the separate EmergencyContact model
    emergency_contact_name?: string | null;
    emergency_contact_relationship?: string | null;
    emergency_contact_phone?: string | null;

    // Optional: Add timestamps if included in your UserSerializer output
    // created_at?: string;
    // updated_at?: string;
}


// --- Emergency Contact Structure ---
// (Added during Emergency Contacts feature implementation)
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

// Type for the payload when adding/editing Emergency Contacts
export type EmergencyContactPayload = Omit<EmergencyContact, 'id' | 'user' | 'created_at' | 'updated_at'>;