// src/api/user.ts
import axiosInstance from './axiosInstance';
import { User } from '../types/user';

export type UserProfileUpdatePayload = Partial<{
  first_name: string;
  last_name: string;
  phone_number: string | null;
  date_of_birth: string | null;
  address: string | null;
  // profile_picture: File | null; // File uploads handled separately
  blood_group: string | null;
  genotype: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  weight: number | null;
  height: number | null;
  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string | null;
  notify_appointment_reminder_email?: boolean;
  notify_appointment_reminder_sms?: boolean;
  notify_refill_reminder_email?: boolean;
  notify_appointment_reminder_push?: boolean;
}>;

export const getUserProfile = async (): Promise<User> => {
    try {
        const response = await axiosInstance.get<User>('/users/profile/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        throw error;
    }
};

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
