// src/api/video.ts
import axiosInstance from './axiosInstance';

export interface VideoTokenResponse {
    token: string;
    room_name: string;
    identity: string;
    session_status: string;
    appointment: {
        id: number;
        doctor_name: string;
        patient_name: string;
        date: string;
        time: string;
    };
}

export interface EndSessionResponse {
    message: string;
    session: {
        id: number;
        status: string;
        duration_minutes: number | null;
    };
}

export const generateVideoToken = async (appointmentId: number): Promise<VideoTokenResponse> => {
    try {
        const response = await axiosInstance.post<VideoTokenResponse>(
            `/doctors/appointments/${appointmentId}/video/token/`
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to generate video token for appointment ${appointmentId}:`, error);
        throw error;
    }
};

export const endVideoSession = async (appointmentId: number): Promise<EndSessionResponse> => {
    try {
        const response = await axiosInstance.post<EndSessionResponse>(
            `/doctors/appointments/${appointmentId}/video/end/`
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to end video session for appointment ${appointmentId}:`, error);
        throw error;
    }
};
