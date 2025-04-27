// src/api/pharmacy.ts
import axiosInstance from './axiosInstance';
import { Pharmacy, Medication, MedicationOrder, MedicationOrderUpdatePayload } from '../types/pharmacy';
import { PaginatedResponse } from '../types/common'; // Import common type

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

/**
 * Fetches a list of pharmacies, handling pagination.
 */
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

/**
 * Fetches details for a single pharmacy (if needed later).
 */
export const getPharmacyById = async (pharmacyId: number): Promise<Pharmacy> => {
    try {
        const response = await axiosInstance.get<Pharmacy>(`/pharmacy/${pharmacyId}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch pharmacy ${pharmacyId}:`, error);
        throw error;
    }
};

/**
 * Fetches a list of all medications, handling pagination.
 * (Assuming this list could be long)
 */
export const getMedications = async (
    paramsOrUrl: GetMedicationsParams | string | null = null
): Promise<PaginatedResponse<Medication>> => { // <-- Updated return type
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

/**
 * Fetches details for a single medication (if needed later).
 */
export const getMedicationById = async (medicationId: number): Promise<Medication> => {
    try {
        const response = await axiosInstance.get<Medication>(`/pharmacy/medications/${medicationId}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch medication ${medicationId}:`, error);
        throw error;
    }
};

// Define parameter types for pharmacy order list
interface GetPharmacyOrdersParams {
    page?: number;
    status?: string; // Filter by status
    ordering?: string; // e.g., '-order_date'
    is_delivery?: boolean;
    // Add other filters as needed
  }
  
  /**
   * Fetches medication orders for the logged-in pharmacy staff's pharmacy.
   */
  export const getPharmacyOrders = async (
      paramsOrUrl: GetPharmacyOrdersParams | string | null = null
  ): Promise<PaginatedResponse<MedicationOrder>> => {
      // Ensure this URL matches your backend pharmacy portal endpoint
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
          // Add client-side check as fallback (backend should ideally return correct structure)
          if (!response.data || !Array.isArray(response.data.results)) {
               console.warn("Invalid paginated structure received for pharmacy orders:", response.data);
               // Return a default structure to prevent frontend crashes
               return { count: 0, next: null, previous: null, results: [] };
          }
          return response.data;
      } catch (error) {
          console.error('Failed to fetch pharmacy orders:', error);
          throw error;
      }
  };
  
  /**
   * Fetches details for a single medication order for the pharmacy portal.
   */
  export const getPharmacyOrderDetail = async (orderId: number): Promise<MedicationOrder> => {
      try {
          // Ensure this URL matches your backend pharmacy portal endpoint
          const response = await axiosInstance.get<MedicationOrder>(`/pharmacy/portal/orders/${orderId}/`);
          return response.data;
      } catch (error) {
          console.error(`Failed to fetch pharmacy order detail ${orderId}:`, error);
          throw error;
      }
  };
  
  /**
   * Updates a medication order (e.g., status, notes) by pharmacy staff.
   */
  export const updatePharmacyOrder = async (
      orderId: number,
      payload: Partial<MedicationOrderUpdatePayload> // Use Partial as we might only update status
  ): Promise<MedicationOrder> => {
      try {
          // Ensure this URL matches your backend pharmacy portal endpoint
          const response = await axiosInstance.patch<MedicationOrder>(
              `/pharmacy/portal/orders/${orderId}/`,
              payload
          );
          return response.data;
      } catch (error) {
          console.error(`Failed to update pharmacy order ${orderId}:`, error);
           // TODO: Extract specific validation errors from error.response.data
          throw error;
      }
  };