// src/features/health/components/SymptomLogForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { SymptomLog, SymptomPayload, SymptomSeverity } from '../../../types/healthLogs';
import toast from 'react-hot-toast';

interface SymptomLogFormProps {
    initialData?: SymptomLog | null;
    onSubmit: (payload: SymptomPayload, id?: number) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const SEVERITY_OPTIONS: { value: SymptomSeverity; label: string }[] = [
    { value: 1, label: '1 - Mild' },
    { value: 2, label: '2 - Moderate' },
    { value: 3, label: '3 - Severe' },
    { value: 4, label: '4 - Very Severe' },
];

const SymptomLogForm: React.FC<SymptomLogFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting: propIsSubmitting,
}) => {
    const getDefaultDateTime = () => new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM

    const [formData, setFormData] = useState<SymptomPayload>({
        symptom: '',
        date_experienced: getDefaultDateTime(),
        severity: 1, // Default to Mild
        duration: '',
        notes: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                symptom: initialData.symptom || '',
                date_experienced: initialData.date_experienced ? initialData.date_experienced.slice(0, 16) : getDefaultDateTime(),
                severity: initialData.severity || 1,
                duration: initialData.duration || '',
                notes: initialData.notes || '',
            });
        } else {
            setFormData({
                symptom: '', date_experienced: getDefaultDateTime(), severity: 1,
                duration: '', notes: '',
            });
        }
        setError(null);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' || name === 'severity' ? parseInt(value, 10) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsFormSubmitting(true);

        if (!formData.symptom || !formData.date_experienced) {
            setError('Symptom and Date/Time Experienced are required.');
            setIsFormSubmitting(false);
            return;
        }

        const payload: SymptomPayload = {
            symptom: formData.symptom.trim(),
            date_experienced: new Date(formData.date_experienced).toISOString(),
            severity: formData.severity as SymptomSeverity,
            duration: formData.duration?.trim() ? formData.duration : null,
            notes: formData.notes?.trim() ? formData.notes : null,
        };

        try {
            await onSubmit(payload, initialData?.id);
            toast.success(`Symptom log ${initialData ? 'updated' : 'added'} successfully!`);
        } catch (err: any) {
            const errorData = err.response?.data;
            let errorMessage = `Failed to ${initialData ? 'update' : 'add'} symptom log.`;
            if (errorData && typeof errorData === 'object') {
                const messages = Object.entries(errorData)
                    .map(([key, val]) => `${key === 'detail' ? '' : `${key}: `}${Array.isArray(val) ? val.join(', ') : val}`)
                    .join('\n');

                errorMessage = messages || errorMessage;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            toast.error(errorMessage, { duration: 4000 });
        } finally {
            setIsFormSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
                {initialData ? 'Edit Symptom Log' : 'Log New Symptom'}
            </h3>
            {error && <pre className="text-red-500 text-sm bg-red-50 p-3 rounded-md whitespace-pre-wrap">{error}</pre>}

            <div>
                <label htmlFor="symptom" className="block text-sm font-medium text-gray-700">Symptom *</label>
                <input type="text" name="symptom" id="symptom" required value={formData.symptom} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Headache, Sore throat" />
            </div>
            <div>
                <label htmlFor="date_experienced" className="block text-sm font-medium text-gray-700">Date & Time Experienced *</label>
                <input type="datetime-local" name="date_experienced" id="date_experienced" required value={formData.date_experienced} onChange={handleChange} className="input-field mt-1" />
            </div>
            <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severity *</label>
                <select name="severity" id="severity" required value={formData.severity} onChange={handleChange} className="input-field mt-1">
                    {SEVERITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (Optional)</label>
                <input type="text" name="duration" id="duration" value={formData.duration || ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Approx 2 hours, All day" />
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
                <textarea name="notes" id="notes" rows={3} value={formData.notes || ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Worsens after meals, relieved by rest"></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" disabled={isFormSubmitting || propIsSubmitting} className="btn-primary inline-flex justify-center px-4 py-2 text-sm font-medium disabled:opacity-50">
                    {isFormSubmitting || propIsSubmitting ? 'Saving...' : (initialData ? 'Update Log' : 'Add Log')}
                </button>
            </div>
        </form>
    );
};
export default SymptomLogForm;