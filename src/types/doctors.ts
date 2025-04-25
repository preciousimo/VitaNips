// src/types/doctors.ts

export interface Specialty {
    id: number;
    name: string;
    description: string | null;
}

export interface Doctor {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    specialties: Specialty[]; // Array of Specialty objects
    profile_picture: string | null; // URL or null
    gender: 'M' | 'F';
    years_of_experience: number;
    education: string;
    bio: string;
    languages_spoken: string;
    consultation_fee: string | null; // Comes as string from DecimalField
    is_available_for_virtual: boolean;
    is_verified: boolean;
    average_rating: number; // Comes as number
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

export interface DoctorReview {
    id: number;
    doctor: number; // Doctor ID
    user: number; // User ID (or maybe user details if serializer nests them)
    rating: number; // 1-5
    comment: string | null;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    // Add user details if your serializer provides them (e.g., user_email: string)
}

// Based on DoctorAvailabilitySerializer
export interface DoctorAvailability {
    id: number;
    doctor: number; // Doctor ID
    day_of_week: number; // 0=Monday, 1=Tuesday, etc.
    start_time: string; // "HH:MM:SS"
    end_time: string; // "HH:MM:SS"
    is_available: boolean;
}

// Optional: Type for the API response if it includes pagination
export interface DoctorListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Doctor[];
}