// src/api/doctorPortal.ts
import axiosInstance from './axiosInstance';
import { PaginatedResponse } from '../types/common';
import { Appointment } from '../types/appointments'; // User-facing Appointment type
import { Prescription as UserPrescription } from '../types/prescriptions'; // User-facing Prescription type

// Type for appointments listed for doctors to write prescriptions
export interface EligibleAppointmentForPrescription {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    reason: string;
    status: string; // Should be 'completed'
    user: number; // patient ID
    patient_email: string;
    patient_name: string;
    has_existing_prescription: boolean;
}

export interface DoctorPrescriptionItemPayload {
    medication_name_input: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    // medication_id?: number; // Optional if linking to existing medication
}

export interface DoctorPrescriptionPayload {
    appointment_id: number;
    diagnosis: string;
    notes?: string | null;
    items: DoctorPrescriptionItemPayload[];
}

// Using UserPrescription type for now for what doctor receives back, can be refined
export const getDoctorEligibleAppointments = async (
    paramsOrUrl: { page?: number } | string | null = null
): Promise<PaginatedResponse<EligibleAppointmentForPrescription>> => {
    const endpoint = '/doctors/portal/eligible-appointments-for-prescription/';
    let response;
    if (typeof paramsOrUrl === 'string') {
        const url = new URL(paramsOrUrl);
        const pathWithQuery = (url.pathname + url.search).replace(axiosInstance.defaults.baseURL || '', '');
        response = await axiosInstance.get<PaginatedResponse<EligibleAppointmentForPrescription>>(pathWithQuery);
    } else {
        response = await axiosInstance.get<PaginatedResponse<EligibleAppointmentForPrescription>>(endpoint, { params: paramsOrUrl });
    }
    return response.data;
};

export const createDoctorPrescription = async (payload: DoctorPrescriptionPayload): Promise<UserPrescription> => {
    try {
        const response = await axiosInstance.post<UserPrescription>('/doctors/portal/prescriptions/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to create prescription by doctor:', error);
        throw error;
    }
};

export const getDoctorPrescriptions = async (
    paramsOrUrl: { page?: number } | string | null = null
): Promise<PaginatedResponse<UserPrescription>> => { // Assuming UserPrescription structure is suitable
    const endpoint = '/doctors/portal/prescriptions/';
    let response;
    if (typeof paramsOrUrl === 'string') {
        const url = new URL(paramsOrUrl);
        const pathWithQuery = (url.pathname + url.search).replace(axiosInstance.defaults.baseURL || '', '');
        response = await axiosInstance.get<PaginatedResponse<UserPrescription>>(pathWithQuery);
    } else {
        response = await axiosInstance.get<PaginatedResponse<UserPrescription>>(endpoint, { params: paramsOrUrl });
    }
    return response.data;
};

// Add getDoctorPrescriptionDetail, update, delete later if needed for full management