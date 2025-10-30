// src/api/documents.ts
import axiosInstance from './axiosInstance';
import { PaginatedResponse } from '../types/common';

export interface MedicalDocument {
    id: number;
    user: number;
    uploaded_by: number;
    appointment?: number | null;
    file: string;
    file_url: string;
    filename: string;
    description?: string | null;
    document_type?: string | null;
    uploaded_at: string;
}

export interface DocumentUploadPayload {
    file: File;
    description?: string;
    document_type?: string;
    appointment?: number;
}

export const getMedicalDocuments = async (
    paramsOrUrl: { page?: number } | string | null = null
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

export const getMedicalDocumentById = async (id: number): Promise<MedicalDocument> => {
    try {
        const response = await axiosInstance.get<MedicalDocument>(`/health/documents/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch document ${id}:`, error);
        throw error;
    }
};

export const uploadMedicalDocument = async (payload: DocumentUploadPayload): Promise<MedicalDocument> => {
    try {
        const formData = new FormData();
        formData.append('file', payload.file);
        
        if (payload.description) {
            formData.append('description', payload.description);
        }
        if (payload.document_type) {
            formData.append('document_type', payload.document_type);
        }
        if (payload.appointment) {
            formData.append('appointment', payload.appointment.toString());
        }

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
        console.error('Failed to upload document:', error);
        throw error;
    }
};

export const deleteMedicalDocument = async (id: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/health/documents/${id}/`);
    } catch (error) {
        console.error(`Failed to delete document ${id}:`, error);
        throw error;
    }
};

export const updateMedicalDocument = async (
    id: number,
    payload: Partial<Omit<DocumentUploadPayload, 'file'>>
): Promise<MedicalDocument> => {
    try {
        const response = await axiosInstance.patch<MedicalDocument>(
            `/health/documents/${id}/`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to update document ${id}:`, error);
        throw error;
    }
};
