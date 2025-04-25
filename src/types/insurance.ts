// src/types/insurance.ts

// Based on InsuranceProviderSerializer
export interface InsuranceProvider {
    id: number;
    name: string;
    description: string | null;
    logo: string | null; // URL or null
    contact_phone: string | null;
    contact_email: string | null;
    website: string | null;
    created_at: string;
    updated_at: string;
  }
  
  // Based on InsurancePlanSerializer
  export interface InsurancePlan {
    id: number;
    provider: InsuranceProvider; // Nested provider details
    name: string;
    plan_type: 'HMO' | 'PPO' | 'EPO' | 'POS' | 'HDHP' | 'other'; // Use specific types if possible
    description: string;
    monthly_premium: string; // Decimal as string
    annual_deductible: string; // Decimal as string
    out_of_pocket_max: string; // Decimal as string
    coverage_details: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  // Based on UserInsuranceSerializer
  export interface UserInsurance {
    id: number;
    user: number; // User ID
    plan: InsurancePlan; // Nested plan details
    policy_number: string;
    group_number: string | null;
    member_id: string;
    start_date: string; // YYYY-MM-DD
    end_date: string | null; // YYYY-MM-DD or null
    is_primary: boolean;
    insurance_card_front: string | null; // URL or null
    insurance_card_back: string | null; // URL or null
    created_at: string;
    updated_at: string;
  }
  
  // Type for the payload when adding/editing UserInsurance
  // We need plan ID, not the full nested object for creation/update
  export interface UserInsurancePayload {
      plan: number; // Send Plan ID
      policy_number: string;
      group_number?: string | null;
      member_id: string;
      start_date: string; // YYYY-MM-DD
      end_date?: string | null; // YYYY-MM-DD or null
      is_primary?: boolean;
      // Handle file uploads separately (not typically part of JSON payload)
      // insurance_card_front?: File | null;
      // insurance_card_back?: File | null;
  }
  
  // Add Claim/Document types later if needed