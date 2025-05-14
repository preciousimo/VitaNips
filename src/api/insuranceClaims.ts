// src/api/insuranceClaims.ts
import axiosInstance from './axiosInstance';
import { PaginatedResponse } from '../types/common';
import { InsuranceClaim, InsuranceClaimPayload } from '../types/insuranceClaims';

type ClaimListParams = { page?: number; ordering?: string; status?: string };

export const getUserClaims = async (
    paramsOrUrl: ClaimListParams | string | null = null
): Promise<PaginatedResponse<InsuranceClaim>> => {
    const endpoint = '/insurance/claims/';
    try {
        let response;
        if (typeof paramsOrUrl === 'string') {
            const url = new URL(paramsOrUrl);
            const pathWithQuery = (url.pathname + url.search).replace(axiosInstance.defaults.baseURL || '', '');
            response = await axiosInstance.get<PaginatedResponse<InsuranceClaim>>(pathWithQuery);
        } else {
            response = await axiosInstance.get<PaginatedResponse<InsuranceClaim>>(endpoint, { params: paramsOrUrl });
        }
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user claims:', error);
        throw error;
    }
};

export const createInsuranceClaim = async (payload: InsuranceClaimPayload): Promise<InsuranceClaim> => {
    try {
        const response = await axiosInstance.post<InsuranceClaim>('/insurance/claims/', payload);
        return response.data;
    } catch (error) {
        console.error('Failed to create insurance claim:', error);
        throw error;
    }
};

export const getInsuranceClaimDetail = async (id: number): Promise<InsuranceClaim> => {
    try {
        const response = await axiosInstance.get<InsuranceClaim>(`/insurance/claims/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch insurance claim detail ${id}:`, error);
        throw error;
    }
};