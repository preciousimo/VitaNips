// src/features/insurance/components/ClaimSubmissionForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { InsuranceClaimPayload } from '../../../types/insuranceClaims';
import { UserInsurance } from '../../../types/insurance';
import { getUserInsurances } from '../../../api/insurance';
import toast from 'react-hot-toast';

interface ClaimSubmissionFormProps {
    onSubmit: (payload: InsuranceClaimPayload) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const ClaimSubmissionForm: React.FC<ClaimSubmissionFormProps> = ({
    onSubmit,
    onCancel,
    isSubmitting: propIsSubmitting,
}) => {
    const [formData, setFormData] = useState<Partial<InsuranceClaimPayload>>({
        user_insurance_id: undefined,
        claim_number: '',
        service_date: '',
        provider_name: '',
        service_description: '',
        claimed_amount: '',
        date_submitted: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [userInsurancePlans, setUserInsurancePlans] = useState<UserInsurance[]>([]);
    const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);

    useEffect(() => {
        setLoadingPlans(true);
        getUserInsurances()
            .then(response => {
                setUserInsurancePlans(response.results.filter(plan => plan.plan));
            })
            .catch(err => {
                console.error("Failed to load user insurance plans:", err);
                setError("Could not load your insurance plans. Please add one first.");
                toast.error("Could not load your insurance plans.");
            })
            .finally(() => setLoadingPlans(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' || name === 'user_insurance_id'
                ? (value === '' ? undefined : Number(value))
                : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsFormSubmitting(true);

        if (!formData.user_insurance_id || !formData.claim_number?.trim() || !formData.service_date ||
            !formData.provider_name?.trim() || !formData.service_description?.trim() || !formData.claimed_amount || !formData.date_submitted) {
            setError('All fields marked with * are required.');
            setIsFormSubmitting(false);
            toast.error('Please fill all required fields.');
            return;
        }
        if (isNaN(parseFloat(formData.claimed_amount)) || parseFloat(formData.claimed_amount) <= 0) {
            setError('Claimed amount must be a positive number.');
            setIsFormSubmitting(false);
            toast.error('Invalid claimed amount.');
            return;
        }

        const payload: InsuranceClaimPayload = {
            user_insurance_id: formData.user_insurance_id as number,
            claim_number: formData.claim_number.trim(),
            service_date: formData.service_date,
            provider_name: formData.provider_name.trim(),
            service_description: formData.service_description.trim(),
            claimed_amount: String(parseFloat(formData.claimed_amount).toFixed(2)),
            date_submitted: formData.date_submitted,
            notes: formData.notes?.trim() ? formData.notes.trim() : undefined,
        };

        try {
            await onSubmit(payload);
            toast.success('Claim submitted successfully!');
        } catch (err: any) {
            const errorData = err.response?.data;
            let errorMessage = "Failed to submit claim.";
            if (errorData && typeof errorData === 'object') {
                const messages = Object.entries(errorData)
                    .map(([key, val]) => `${key === 'detail' ? '' : key + ': '}${Array.isArray(val) ? val.join(', ') : val}`)
                    .join(' \n');
                errorMessage = messages || errorMessage;
            }
            else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            toast.error(errorMessage, { duration: 5000 });
        } finally {
            setIsFormSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Submit New Insurance Claim</h3>
            {error && <pre className="text-red-500 text-sm bg-red-50 p-3 rounded-md whitespace-pre-wrap">{error}</pre>}

            <div>
                <label htmlFor="user_insurance_id" className="block text-sm font-medium text-gray-700">Select Insurance Plan *</label>
                <select name="user_insurance_id" id="user_insurance_id" required
                    value={formData.user_insurance_id || ''} onChange={handleChange}
                    disabled={loadingPlans || userInsurancePlans.length === 0}
                    className="input-field mt-1 disabled:bg-gray-100">
                    <option value="" disabled>{loadingPlans ? "Loading plans..." : (userInsurancePlans.length === 0 ? "No plans available" : "-- Select Your Plan --")}</option>
                    {userInsurancePlans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                            {plan.plan.provider.name} - {plan.plan.name} (Policy: {plan.policy_number})
                        </option>
                    ))}
                </select>
                {userInsurancePlans.length === 0 && !loadingPlans && (
                    <p className="text-xs text-red-500 mt-1">You need to add an insurance plan to your profile first.</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="claim_number" className="block text-sm font-medium text-gray-700">Claim/Reference Number *</label>
                    <input type="text" name="claim_number" id="claim_number" required value={formData.claim_number || ''} onChange={handleChange} className="input-field mt-1" placeholder="Provided by insurer or self" />
                </div>
                <div>
                    <label htmlFor="claimed_amount" className="block text-sm font-medium text-gray-700">Amount Claimed (NGN) *</label>
                    <input type="number" name="claimed_amount" id="claimed_amount" required step="0.01" min="0" value={formData.claimed_amount || ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., 15000.00" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="service_date" className="block text-sm font-medium text-gray-700">Date of Service *</label>
                    <input type="date" name="service_date" id="service_date" required value={formData.service_date || ''} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="date_submitted" className="block text-sm font-medium text-gray-700">Date of Submission *</label>
                    <input type="date" name="date_submitted" id="date_submitted" required value={formData.date_submitted || ''} onChange={handleChange} className="input-field mt-1" />
                </div>
            </div>

            <div>
                <label htmlFor="provider_name" className="block text-sm font-medium text-gray-700">Medical Provider Name *</label>
                <input type="text" name="provider_name" id="provider_name" required value={formData.provider_name || ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., St. Nicholas Hospital" />
            </div>

            <div>
                <label htmlFor="service_description" className="block text-sm font-medium text-gray-700">Description of Service/Treatment *</label>
                <textarea name="service_description" id="service_description" rows={3} required value={formData.service_description || ''} onChange={handleChange} className="input-field mt-1" placeholder="Briefly describe the medical service received"></textarea>
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
                <textarea name="notes" id="notes" rows={2} value={formData.notes || ''} onChange={handleChange} className="input-field mt-1" placeholder="Any other relevant information"></textarea>
            </div>

            <div className="mt-4">
                <p className="text-xs text-gray-500">
                    For supporting documents (receipts, reports), please upload them via the "Medical Documents" section. You can reference this claim by its number once submitted.
                </p>
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isFormSubmitting || propIsSubmitting || loadingPlans} className="btn-primary disabled:opacity-50">
                    {isFormSubmitting || propIsSubmitting ? 'Submitting...' : 'Submit Claim'}
                </button>
            </div>
        </form>
    );
};
export default ClaimSubmissionForm;