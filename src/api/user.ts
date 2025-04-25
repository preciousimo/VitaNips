// src/api/user.ts
import axiosInstance from './axiosInstance';
import { User } from '../types/user';

// Type for the update payload - based on UserUpdateSerializer fields
export type UserProfileUpdatePayload = Partial<{
  first_name: string;
  last_name: string;
  phone_number: string | null;
  date_of_birth: string | null; // YYYY-MM-DD
  // profile_picture: File | null; // File uploads handled separately
  blood_group: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  weight: number | null;
  height: number | null;
  // Add emergency contact fields if they are editable via this endpoint
  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string | null;
}>;


/**
 * Fetches the profile for the currently authenticated user.
 */
export const getUserProfile = async (): Promise<User> => {
    try {
        const response = await axiosInstance.get<User>('/users/profile/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        throw error;
    }
};


/**
 * Updates the profile for the currently authenticated user.
 * Uses PATCH for partial updates.
 * Note: File uploads (profile picture) often require separate handling with FormData.
 */
export const updateUserProfile = async (payload: UserProfileUpdatePayload): Promise<User> => {
    try {
        // Your UserProfileView handles PUT/PATCH for updates
        const response = await axiosInstance.patch<User>('/users/profile/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to update user profile:', error);
        // Consider extracting detailed validation errors from error.response.data
        throw error;
    }
};

// Add function for profile picture upload separately if needed
// export const uploadProfilePicture = async (file: File): Promise<User> => { ... }