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
    specialties: Specialty[];
    profile_picture: string | null;
    gender: 'M' | 'F';
    years_of_experience: number;
    education: string;
    bio: string;
    languages_spoken: string;
    consultation_fee: string | null;
    is_available_for_virtual: boolean;
    is_verified: boolean;
    average_rating: number;
    created_at: string;
    updated_at: string;
}

export interface DoctorReview {
    id: number;
    doctor: number;
    user: number;
    rating: number;
    comment: string | null;
    created_at: string;
    updated_at: string;
}

export interface DoctorAvailability {
    id: number;
    doctor: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
}

export interface DoctorListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Doctor[];
}