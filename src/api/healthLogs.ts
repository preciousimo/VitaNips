// src/api/healthLogs.ts
import axiosInstance from './axiosInstance';
import { PaginatedResponse } from '../types/common';
import {
    VitalSignLog, VitalSignPayload,
    SymptomLog, SymptomPayload,
    FoodLog, FoodPayload,
    ExerciseLog, ExercisePayload,
    SleepLog, SleepPayload
} from '../types/healthLogs'; // We'll define these next

// --- Vital Signs ---
export const getVitalSigns = async (paramsOrUrl: { page?: number } | string | null = null): Promise<PaginatedResponse<VitalSignLog>> => {
    const endpoint = '/health/vital-signs/';
    let response;
    if (typeof paramsOrUrl === 'string') {
        const url = new URL(paramsOrUrl);
        const pathWithQuery = (url.pathname + url.search).replace(axiosInstance.defaults.baseURL || '', '');
        response = await axiosInstance.get<PaginatedResponse<VitalSignLog>>(pathWithQuery);
    } else {
        response = await axiosInstance.get<PaginatedResponse<VitalSignLog>>(endpoint, { params: paramsOrUrl });
    }
    return response.data;
};
export const createVitalSign = async (payload: VitalSignPayload): Promise<VitalSignLog> => {
    return (await axiosInstance.post<VitalSignLog>('/health/vital-signs/', payload)).data;
};
export const updateVitalSign = async (id: number, payload: Partial<VitalSignPayload>): Promise<VitalSignLog> => {
    return (await axiosInstance.patch<VitalSignLog>(`/health/vital-signs/${id}/`, payload)).data;
};
export const deleteVitalSign = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/health/vital-signs/${id}/`);
};

// --- Symptom Logs ---
export const getSymptomLogs = async (paramsOrUrl: { page?: number } | string | null = null): Promise<PaginatedResponse<SymptomLog>> => {
    const endpoint = '/health/symptoms/';
    let response;
    if (typeof paramsOrUrl === 'string') {
        const url = new URL(paramsOrUrl);
        const pathWithQuery = (url.pathname + url.search).replace(axiosInstance.defaults.baseURL || '', '');
        response = await axiosInstance.get<PaginatedResponse<SymptomLog>>(pathWithQuery);
    } else {
        response = await axiosInstance.get<PaginatedResponse<SymptomLog>>(endpoint, { params: paramsOrUrl });
    }
    return response.data;
};
export const createSymptomLog = async (payload: SymptomPayload): Promise<SymptomLog> => {
    return (await axiosInstance.post<SymptomLog>('/health/symptoms/', payload)).data;
};
export const updateSymptomLog = async (id: number, payload: Partial<SymptomPayload>): Promise<SymptomLog> => {
    return (await axiosInstance.patch<SymptomLog>(`/health/symptoms/${id}/`, payload)).data;
};
export const deleteSymptomLog = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/health/symptoms/${id}/`);
};

// --- Food Logs ---
export const getFoodLogs = async (paramsOrUrl: { page?: number } | string | null = null): Promise<PaginatedResponse<FoodLog>> => {
    const endpoint = '/health/food-logs/';
    let response;
    if (typeof paramsOrUrl === 'string') {
        const url = new URL(paramsOrUrl);
        const pathWithQuery = (url.pathname + url.search).replace(axiosInstance.defaults.baseURL || '', '');
        response = await axiosInstance.get<PaginatedResponse<FoodLog>>(pathWithQuery);
    } else {
        response = await axiosInstance.get<PaginatedResponse<FoodLog>>(endpoint, { params: paramsOrUrl });
    }
    return response.data;
};
export const createFoodLog = async (payload: FoodPayload): Promise<FoodLog> => {
    return (await axiosInstance.post<FoodLog>('/health/food-logs/', payload)).data;
};
export const updateFoodLog = async (id: number, payload: Partial<FoodPayload>): Promise<FoodLog> => {
    return (await axiosInstance.patch<FoodLog>(`/health/food-logs/${id}/`, payload)).data;
};
export const deleteFoodLog = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/health/food-logs/${id}/`);
};

// --- Exercise Logs ---
export const getExerciseLogs = async (paramsOrUrl: { page?: number } | string | null = null): Promise<PaginatedResponse<ExerciseLog>> => {
    const endpoint = '/health/exercise-logs/';
    let response;
    if (typeof paramsOrUrl === 'string') {
        const url = new URL(paramsOrUrl);
        const pathWithQuery = (url.pathname + url.search).replace(axiosInstance.defaults.baseURL || '', '');
        response = await axiosInstance.get<PaginatedResponse<ExerciseLog>>(pathWithQuery);
    } else {
        response = await axiosInstance.get<PaginatedResponse<ExerciseLog>>(endpoint, { params: paramsOrUrl });
    }
    return response.data;
};
export const createExerciseLog = async (payload: ExercisePayload): Promise<ExerciseLog> => {
    return (await axiosInstance.post<ExerciseLog>('/health/exercise-logs/', payload)).data;
};
export const updateExerciseLog = async (id: number, payload: Partial<ExercisePayload>): Promise<ExerciseLog> => {
    return (await axiosInstance.patch<ExerciseLog>(`/health/exercise-logs/${id}/`, payload)).data;
};
export const deleteExerciseLog = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/health/exercise-logs/${id}/`);
};

// --- Sleep Logs ---
export const getSleepLogs = async (paramsOrUrl: { page?: number } | string | null = null): Promise<PaginatedResponse<SleepLog>> => {
    const endpoint = '/health/sleep-logs/';
    let response;
    if (typeof paramsOrUrl === 'string') {
        const url = new URL(paramsOrUrl);
        const pathWithQuery = (url.pathname + url.search).replace(axiosInstance.defaults.baseURL || '', '');
        response = await axiosInstance.get<PaginatedResponse<SleepLog>>(pathWithQuery);
    } else {
        response = await axiosInstance.get<PaginatedResponse<SleepLog>>(endpoint, { params: paramsOrUrl });
    }
    return response.data;
};
export const createSleepLog = async (payload: SleepPayload): Promise<SleepLog> => {
    return (await axiosInstance.post<SleepLog>('/health/sleep-logs/', payload)).data;
};
export const updateSleepLog = async (id: number, payload: Partial<SleepPayload>): Promise<SleepLog> => {
    return (await axiosInstance.patch<SleepLog>(`/health/sleep-logs/${id}/`, payload)).data;
};
export const deleteSleepLog = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/health/sleep-logs/${id}/`);
};