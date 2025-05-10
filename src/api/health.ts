// src/api/health.ts
import axiosInstance from './axiosInstance';
import { PaginatedResponse } from '../types/common';
import {
    MedicalDocument,
    MedicalDocumentUploadPayload,
} from '../types/health';

type DocumentListParams = { page?: number; ordering?: string };

export const getUserMedicalDocuments = async (
    paramsOrUrl: DocumentListParams | string | null = null
): Promise<PaginatedResponse<MedicalDocument>> => {
    const endpoint = '/health/documents/';
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

export const uploadMedicalDocument = async (
    payload: MedicalDocumentUploadPayload,
    file: File
): Promise<MedicalDocument> => {
    const formData = new FormData();
    formData.append('file', file);
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
            '/health/documents/',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to upload medical document:', error);
        throw error;
    }
};

export const deleteMedicalDocument = async (id: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/health/documents/${id}/`);
    } catch (error) {
        console.error(`Failed to delete medical document ${id}:`, error);
        throw error;
    }
};
