// src/types/healthLogs.ts

// --- Vital Signs ---
export interface VitalSignLog {
    id: number;
    user: number;
    date_recorded: string; // ISO DateTime string
    heart_rate?: number | null;
    systolic_pressure?: number | null;
    diastolic_pressure?: number | null;
    respiratory_rate?: number | null;
    temperature?: number | null; // Celsius
    oxygen_saturation?: number | null;
    blood_glucose?: number | null;
    weight?: number | null; // kg
    notes?: string | null;
    created_at: string;
}
export type VitalSignPayload = Omit<VitalSignLog, 'id' | 'user' | 'created_at'>;

// --- Symptom Log ---
export type SymptomSeverity = 1 | 2 | 3 | 4; // Mild, Moderate, Severe, Very Severe

export interface SymptomLog {
    id: number;
    user: number;
    symptom: string;
    date_experienced: string; // ISO DateTime string
    severity: SymptomSeverity;
    duration?: string | null; // e.g., "2 hours", "all day"
    notes?: string | null;
    created_at: string;
}
export type SymptomPayload = Omit<SymptomLog, 'id' | 'user' | 'created_at'>;

// --- Food Log ---
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodLog {
    id: number;
    user: number;
    food_item: string;
    meal_type: MealType;
    datetime: string; // ISO DateTime string
    calories?: number | null;
    carbohydrates?: number | null; // grams
    proteins?: number | null; // grams
    fats?: number | null; // grams
    notes?: string | null;
    created_at: string;
}
export type FoodPayload = Omit<FoodLog, 'id' | 'user' | 'created_at'>;

// --- Exercise Log ---
export interface ExerciseLog {
    id: number;
    user: number;
    activity_type: string;
    datetime: string; // ISO DateTime string
    duration: number; // minutes
    calories_burned?: number | null;
    distance?: number | null; // kilometers
    notes?: string | null;
    created_at: string;
}
export type ExercisePayload = Omit<ExerciseLog, 'id' | 'user' | 'created_at'>;

// --- Sleep Log ---
export type SleepQuality = 1 | 2 | 3 | 4; // Poor, Fair, Good, Excellent

export interface SleepLog {
    id: number;
    user: number;
    sleep_time: string; // ISO DateTime string
    wake_time: string; // ISO DateTime string
    quality: SleepQuality;
    interruptions?: number;
    notes?: string | null;
    duration?: number; // Read-only, calculated on backend (hours)
    created_at: string;
}
export type SleepPayload = Omit<SleepLog, 'id' | 'user' | 'duration' | 'created_at'>;