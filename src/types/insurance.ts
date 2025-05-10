// src/types/insurance.ts
export interface InsuranceProvider {
    id: number;
    name: string;
    description: string | null;
    logo: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    website: string | null;
    created_at: string;
    updated_at: string;
  }

  export interface InsurancePlan {
    id: number;
    provider: InsuranceProvider;
    name: string;
    plan_type: 'HMO' | 'PPO' | 'EPO' | 'POS' | 'HDHP' | 'other';
    description: string;
    monthly_premium: string;
    annual_deductible: string;
    out_of_pocket_max: string;
    coverage_details: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface UserInsurance {
    id: number;
    user: number;
    plan: InsurancePlan;
    policy_number: string;
    group_number: string | null;
    member_id: string;
    start_date: string;
    end_date: string | null;
    is_primary: boolean;
    insurance_card_front: string | null;
    insurance_card_back: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface UserInsurancePayload {
      plan: number;
      policy_number: string;
      group_number?: string | null;
      member_id: string;
      start_date: string;
      end_date?: string | null;
      is_primary?: boolean;
  }
