// src/api/prescriptions.ts
import axiosInstance from './axiosInstance';
import { Prescription } from '../types/prescriptions';
import { PaginatedResponse } from '../types/common';
import { MedicationOrder } from '../types/pharmacy';

type PrescriptionListParams = { page?: number; ordering?: string };

export const getUserPrescriptions = async (
     paramsOrUrl: PrescriptionListParams | string | null = null
): Promise<PaginatedResponse<Prescription>> => {
    const endpoint = '/doctors/prescriptions/';
    try {
         let response;
         if (typeof paramsOrUrl === 'string') {
             const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Prescription>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<Prescription>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user prescriptions:', error);
        throw error;
    }
};

export const getPrescriptionDetails = async (id: number): Promise<Prescription> => {
    try {
        const response = await axiosInstance.get<Prescription>(`/doctors/prescriptions/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch prescription details for ID ${id}:`, error);
        throw error;
    }
};

export const createOrderFromPrescription = async (
    prescriptionId: number,
    pharmacyId: number
): Promise<MedicationOrder> => {
    try {
        const response = await axiosInstance.post<MedicationOrder>(
            `/doctors/prescriptions/${prescriptionId}/create_order/`,
            { pharmacy_id: pharmacyId }
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to create order for prescription ${prescriptionId}:`, error);
        throw error;
    }
};