// src/api/health.ts
import axiosInstance from './axiosInstance';
import { PaginatedResponse } from '../types/common';
import {
    MedicalDocument,
    MedicalDocumentUploadPayload,
    // Import other health types/payloads if needed (VitalSign, SymptomLog etc.)
} from '../types/health';

type DocumentListParams = { page?: number; ordering?: string };

/**
 * Fetches the logged-in user's medical documents, handling pagination.
 */
export const getUserMedicalDocuments = async (
    paramsOrUrl: DocumentListParams | string | null = null
): Promise<PaginatedResponse<MedicalDocument>> => {
    const endpoint = '/health/documents/'; // Ensure this matches your health/urls.py
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = url.pathname + url.search;
            response = await axiosInstance.get<PaginatedResponse<MedicalDocument>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<MedicalDocument>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch medical documents:', error);
        throw error;
    }
};

/**
 * Uploads a medical document.
 * Requires FormData.
 */
export const uploadMedicalDocument = async (
    payload: MedicalDocumentUploadPayload,
    file: File
): Promise<MedicalDocument> => {
    const formData = new FormData();
    formData.append('file', file); // Key 'file' must match DRF FileField name

    // Append other optional fields if they have values
    if (payload.description) {
        formData.append('description', payload.description);
    }
    if (payload.document_type) {
        formData.append('document_type', payload.document_type);
    }
    if (payload.appointment) {
        formData.append('appointment', payload.appointment.toString());
    }

    try {
        const response = await axiosInstance.post<MedicalDocument>(
            '/health/documents/', // Ensure this matches your health/urls.py
            formData,
            {
                headers: {
                    // Axios usually sets this automatically for FormData, but doesn't hurt to be explicit
                    'Content-Type': 'multipart/form-data',
                },
                // Optional: Add progress tracking
                // onUploadProgress: progressEvent => { ... }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to upload medical document:', error);
        // TODO: Extract specific validation errors from error.response.data if possible
        throw error;
    }
};

/**
 * Deletes a specific medical document.
 */
export const deleteMedicalDocument = async (id: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/health/documents/${id}/`); // Ensure this matches your health/urls.py
    } catch (error) {
        console.error(`Failed to delete medical document ${id}:`, error);
        throw error;
    }
};


// --- Add other health API functions below ---
// e.g., getVitalSigns, addSymptomLog, etc. (handling pagination where needed)