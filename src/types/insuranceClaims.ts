// src/types/insuranceClaims.ts
import { UserInsurance } from './insurance';

export type ClaimStatus =
    | 'submitted'
    | 'in_review'
    | 'additional_info'
    | 'approved'
    | 'partially_approved'
    | 'denied'
    | 'paid';

export interface InsuranceClaim {
    id: number;
    user: number;
    user_insurance_id: number;
    user_insurance_display: UserInsurance;
    claim_number: string;
    service_date: string;
    provider_name: string;
    service_description: string;
    claimed_amount: string;
    approved_amount: string | null;
    patient_responsibility: string | null;
    status: ClaimStatus;
    date_submitted: string;
    date_processed: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    // documents: InsuranceDocument[]; // If you were to include linked documents directly
}

export interface InsuranceClaimPayload {
    user_insurance_id: number;
    claim_number: string;
    service_date: string;
    provider_name: string;
    service_description: string;
    claimed_amount: string;
    date_submitted: string;
    notes?: string | null;
    // File uploads for documents would be handled separately or as a later enhancement
}