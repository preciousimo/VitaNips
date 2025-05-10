// src/api/pharmacy.ts
import axiosInstance from './axiosInstance';
import { Pharmacy, Medication, MedicationOrder, MedicationOrderUpdatePayload } from '../types/pharmacy';
import { PaginatedResponse } from '../types/common';

interface GetPharmaciesParams {
    search?: string;
    page?: number;
    lat?: number;
    lon?: number;
    radius?: number;
    offers_delivery?: boolean;
    is_24_hours?: boolean;
}

interface GetMedicationsParams {
    search?: string;
    page?: number;
}

export const getPharmacies = async (
    paramsOrUrl: GetPharmaciesParams | string | null = null
): Promise<PaginatedResponse<Pharmacy>> => {
    const endpoint = '/pharmacy/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Pharmacy>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<Pharmacy>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch pharmacies:', error);
        throw error;
    }
};

export const getPharmacyById = async (pharmacyId: number): Promise<Pharmacy> => {
    try {
        const response = await axiosInstance.get<Pharmacy>(`/pharmacy/${pharmacyId}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch pharmacy ${pharmacyId}:`, error);
        throw error;
    }
};

export const getMedications = async (
    paramsOrUrl: GetMedicationsParams | string | null = null
): Promise<PaginatedResponse<Medication>> => {
    const endpoint = '/pharmacy/medications/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<Medication>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<Medication>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch medications:', error);
        throw error;
    }
};

export const getMedicationById = async (medicationId: number): Promise<Medication> => {
    try {
        const response = await axiosInstance.get<Medication>(`/pharmacy/medications/${medicationId}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch medication ${medicationId}:`, error);
        throw error;
    }
};

interface GetPharmacyOrdersParams {
    page?: number;
    status?: string;
    ordering?: string;
    is_delivery?: boolean;
  }

  export const getPharmacyOrders = async (
      paramsOrUrl: GetPharmacyOrdersParams | string | null = null
  ): Promise<PaginatedResponse<MedicationOrder>> => {
      const endpoint = '/pharmacy/portal/orders/';
      try {
          let response;
          if (typeof paramsOrUrl === 'string') {
              const url = new URL(paramsOrUrl);
              const pathWithQuery = url.pathname + url.search;
              response = await axiosInstance.get<PaginatedResponse<MedicationOrder>>(pathWithQuery);
          } else {
              response = await axiosInstance.get<PaginatedResponse<MedicationOrder>>(endpoint, { params: paramsOrUrl });
          }
          if (!response.data || !Array.isArray(response.data.results)) {
               console.warn("Invalid paginated structure received for pharmacy orders:", response.data);
               return { count: 0, next: null, previous: null, results: [] };
          }
          return response.data;
      } catch (error) {
          console.error('Failed to fetch pharmacy orders:', error);
          throw error;
      }
  };

  export const getPharmacyOrderDetail = async (orderId: number): Promise<MedicationOrder> => {
      try {
          const response = await axiosInstance.get<MedicationOrder>(`/pharmacy/portal/orders/${orderId}/`);
          return response.data;
      } catch (error) {
          console.error(`Failed to fetch pharmacy order detail ${orderId}:`, error);
          throw error;
      }
  };

  export const updatePharmacyOrder = async (
      orderId: number,
      payload: Partial<MedicationOrderUpdatePayload>
  ): Promise<MedicationOrder> => {
      try {
          const response = await axiosInstance.patch<MedicationOrder>(
              `/pharmacy/portal/orders/${orderId}/`,
              payload
          );
          return response.data;
      } catch (error) {
          console.error(`Failed to update pharmacy order ${orderId}:`, error);
          throw error;
      }
  };