// src/features/insurance/components/UserInsuranceForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { UserInsurance, UserInsurancePayload, InsurancePlan } from '../../../types/insurance';
import { getAvailablePlans } from '../../../api/insurance';

interface UserInsuranceFormProps {
    initialData?: UserInsurance | null;
    onSubmit: (payload: UserInsurancePayload, id?: number) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const UserInsuranceForm: React.FC<UserInsuranceFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting
}) => {
    const [formData, setFormData] = useState<Partial<UserInsurancePayload>>({
        plan: undefined, // Plan ID
        policy_number: '',
        group_number: null,
        member_id: '',
        start_date: '',
        end_date: null,
        is_primary: false,
    });
    const [availablePlans, setAvailablePlans] = useState<InsurancePlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch available plans for the dropdown
    useEffect(() => {
        setLoadingPlans(true);
        getAvailablePlans()
            .then(response => {
                if (response && Array.isArray(response.results)) {
                    setAvailablePlans(response.results);
                } else {
                    console.warn("Received unexpected available plans structure:", response);
                    setError("Failed to process available insurance plans.");
                    setAvailablePlans([]);
                }
            })
            .catch((err) => {
                console.error("Error fetching available plans:", err)
                setError("Failed to load available insurance plans.");
                setAvailablePlans([]);
            })
            .finally(() => setLoadingPlans(false));
    }, []);

    // Pre-fill form if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                plan: initialData.plan.id, // Use plan ID
                policy_number: initialData.policy_number || '',
                group_number: initialData.group_number || null,
                member_id: initialData.member_id || '',
                start_date: initialData.start_date ? initialData.start_date.split('T')[0] : '',
                end_date: initialData.end_date ? initialData.end_date.split('T')[0] : null,
                is_primary: initialData.is_primary || false,
            });
        } else {
             // Reset form for adding
             setFormData({
                plan: undefined, policy_number: '', group_number: null, member_id: '',
                start_date: '', end_date: null, is_primary: false,
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let processedValue: string | number | boolean | null = value;
        if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        } else if (name === 'plan') {
            processedValue = value ? parseInt(value, 10) : null;
        } else if ((name === 'end_date' || name === 'group_number') && value === '') {
             processedValue = null;
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.plan || !formData.policy_number || !formData.member_id || !formData.start_date) {
             setError("Insurance Plan, Policy Number, Member ID, and Start Date are required.");
             return;
        }

        // Assert formData.plan is number because we checked it
        const payload: UserInsurancePayload = {
            plan: formData.plan as number,
            policy_number: formData.policy_number,
            group_number: formData.group_number || null,
            member_id: formData.member_id,
            start_date: formData.start_date,
            end_date: formData.end_date || null,
            is_primary: formData.is_primary || false,
        };

        try {
            await onSubmit(payload, initialData?.id);
        } catch (err: any) {
            console.error("Form submission error:", err);
            setError(err.message || "Failed to save insurance record.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {initialData ? 'Edit Insurance Plan' : 'Add Insurance Plan'}
            </h3>
            {error && <p className="text-red-600 text-sm">{error}</p>}

             {/* Form Fields */}
             <div className="grid grid-cols-1 gap-4">
                 <div>
                    <label htmlFor="plan" className="block text-sm font-medium text-gray-700">Insurance Plan *</label>
                    <select
                        name="plan" id="plan" required
                        value={formData.plan ?? ''} onChange={handleChange}
                        disabled={loadingPlans}
                        className="input-field disabled:bg-gray-100"
                     >
                        <option value="" disabled>{loadingPlans ? 'Loading plans...' : '-- Select a Plan --'}</option>
                        {availablePlans.map(plan => (
                             <option key={plan.id} value={plan.id}>
                                {plan.provider.name} - {plan.name}
                             </option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="member_id" className="block text-sm font-medium text-gray-700">Member ID *</label>
                    <input type="text" name="member_id" id="member_id" required value={formData.member_id ?? ''} onChange={handleChange} className="input-field" />
                </div>
                <div>
                    <label htmlFor="policy_number" className="block text-sm font-medium text-gray-700">Policy Number *</label>
                    <input type="text" name="policy_number" id="policy_number" required value={formData.policy_number ?? ''} onChange={handleChange} className="input-field" />
                </div>
                <div>
                    <label htmlFor="group_number" className="block text-sm font-medium text-gray-700">Group Number</label>
                    <input type="text" name="group_number" id="group_number" value={formData.group_number ?? ''} onChange={handleChange} className="input-field" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date *</label>
                        <input type="date" name="start_date" id="start_date" required value={formData.start_date ?? ''} onChange={handleChange} className="input-field" />
                     </div>
                     <div>
                         <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
                         <input type="date" name="end_date" id="end_date" value={formData.end_date ?? ''} onChange={handleChange} className="input-field" />
                     </div>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="is_primary" id="is_primary" checked={formData.is_primary ?? false} onChange={handleChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                    <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-900">Set as Primary Plan</label>
                </div>
                 {/* TODO: Add File input for card images - requires different handling */}
                 {/* <div><label>Card Front:</label><input type="file" name="card_front" /></div> */}
                 {/* <div><label>Card Back:</label><input type="file" name="card_back" /></div> */}
             </div>


            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting || loadingPlans} className="btn-primary inline-flex justify-center px-4 py-2 text-sm font-medium disabled:opacity-50">
                    {isSubmitting ? 'Saving...' : (initialData ? 'Update Plan' : 'Add Plan')}
                </button>
            </div>
        </form>
    );
};

export default UserInsuranceForm;