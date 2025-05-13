// src/features/health/components/VitalSignForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { VitalSignLog, VitalSignPayload } from '../../../types/healthLogs';
import toast from 'react-hot-toast';

interface VitalSignFormProps {
    initialData?: VitalSignLog | null;
    onSubmit: (payload: VitalSignPayload, id?: number) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const VitalSignForm: React.FC<VitalSignFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting: propIsSubmitting,
}) => {
    const getDefaultDateTime = () => new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM

    const [formData, setFormData] = useState<Partial<VitalSignPayload>>({
        date_recorded: getDefaultDateTime(),
        heart_rate: undefined,
        systolic_pressure: undefined,
        diastolic_pressure: undefined,
        respiratory_rate: undefined,
        temperature: undefined,
        oxygen_saturation: undefined,
        blood_glucose: undefined,
        weight: undefined,
        notes: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                date_recorded: initialData.date_recorded ? initialData.date_recorded.slice(0, 16) : getDefaultDateTime(),
                heart_rate: initialData.heart_rate ?? undefined,
                systolic_pressure: initialData.systolic_pressure ?? undefined,
                diastolic_pressure: initialData.diastolic_pressure ?? undefined,
                respiratory_rate: initialData.respiratory_rate ?? undefined,
                temperature: initialData.temperature ?? undefined,
                oxygen_saturation: initialData.oxygen_saturation ?? undefined,
                blood_glucose: initialData.blood_glucose ?? undefined,
                weight: initialData.weight ?? undefined,
                notes: initialData.notes || '',
            });
        } else {
            setFormData({
                date_recorded: getDefaultDateTime(),
                heart_rate: undefined, systolic_pressure: undefined, diastolic_pressure: undefined,
                respiratory_rate: undefined, temperature: undefined, oxygen_saturation: undefined,
                blood_glucose: undefined, weight: undefined, notes: '',
            });
        }
        setError(null);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsFormSubmitting(true);

        if (!formData.date_recorded) {
            setError('Date and Time Recorded are required.');
            setIsFormSubmitting(false);
            return;
        }

        const payload: VitalSignPayload = {
            date_recorded: new Date(formData.date_recorded).toISOString(), // Ensure full ISO string
            heart_rate: formData.heart_rate ?? null,
            systolic_pressure: formData.systolic_pressure ?? null,
            diastolic_pressure: formData.diastolic_pressure ?? null,
            respiratory_rate: formData.respiratory_rate ?? null,
            temperature: formData.temperature ?? null,
            oxygen_saturation: formData.oxygen_saturation ?? null,
            blood_glucose: formData.blood_glucose ?? null,
            weight: formData.weight ?? null,
            notes: formData.notes?.trim() ? formData.notes : null,
        };

        try {
            await onSubmit(payload, initialData?.id);
            toast.success(`Vitals ${initialData ? 'updated' : 'logged'} successfully!`);
        } catch (err: any) {
            const errorData = err.response?.data;
            let errorMessage = `Failed to ${initialData ? 'update' : 'log'} vitals.`;
            if (errorData && typeof errorData === 'object') {
                const messages = Object.entries(errorData)
                    .map(([key, val]) => `${key === 'detail' ? '' : key + ': '}${Array.isArray(val) ? val.join(', ') : val}`)
                    .join('\n');
                errorMessage = messages || errorMessage;
            }
            else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            toast.error(errorMessage, { duration: 4000 });
        } finally {
            setIsFormSubmitting(false);
        }
    };

    const numberInputProps = (name: keyof VitalSignPayload, placeholder: string, step = "any") => ({
        type: "number", name, id: name,
        value: formData[name] === undefined || formData[name] === null ? '' : String(formData[name]),
        onChange: handleChange,
        className: "input-field mt-1", placeholder, step
    });

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
                {initialData ? 'Edit Vital Signs' : 'Log New Vital Signs'}
            </h3>
            {error && <pre className="text-red-500 text-sm bg-red-50 p-3 rounded-md whitespace-pre-wrap">{error}</pre>}

            <div>
                <label htmlFor="date_recorded" className="block text-sm font-medium text-gray-700">Date & Time Recorded *</label>
                <input type="datetime-local" name="date_recorded" id="date_recorded" required
                    value={formData.date_recorded} onChange={handleChange} className="input-field mt-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="heart_rate" className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
                    <input {...numberInputProps('heart_rate', "e.g., 70")} />
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input {...numberInputProps('weight', "e.g., 65.5", "0.1")} />
                </div>
                <div>
                    <label htmlFor="systolic_pressure" className="block text-sm font-medium text-gray-700">Systolic Pressure (mmHg)</label>
                    <input {...numberInputProps('systolic_pressure', "e.g., 120")} />
                </div>
                <div>
                    <label htmlFor="diastolic_pressure" className="block text-sm font-medium text-gray-700">Diastolic Pressure (mmHg)</label>
                    <input {...numberInputProps('diastolic_pressure', "e.g., 80")} />
                </div>
                <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
                    <input {...numberInputProps('temperature', "e.g., 36.6", "0.1")} />
                </div>
                <div>
                    <label htmlFor="oxygen_saturation" className="block text-sm font-medium text-gray-700">Oxygen Saturation (%)</label>
                    <input {...numberInputProps('oxygen_saturation', "e.g., 98")} />
                </div>
                <div>
                    <label htmlFor="respiratory_rate" className="block text-sm font-medium text-gray-700">Respiratory Rate (breaths/min)</label>
                    <input {...numberInputProps('respiratory_rate', "e.g., 16")} />
                </div>
                <div>
                    <label htmlFor="blood_glucose" className="block text-sm font-medium text-gray-700">Blood Glucose (mg/dL)</label>
                    <input {...numberInputProps('blood_glucose', "e.g., 90")} />
                </div>
            </div>

            <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea name="notes" id="notes" rows={3} value={formData.notes || ''}
                    onChange={handleChange} className="input-field mt-1"
                    placeholder="Any additional notes or context..." />
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" disabled={isFormSubmitting || propIsSubmitting} className="btn-primary inline-flex justify-center px-4 py-2 text-sm font-medium disabled:opacity-50">
                    {isFormSubmitting || propIsSubmitting ? 'Saving...' : (initialData ? 'Update Vitals' : 'Log Vitals')}
                </button>
            </div>
        </form>
    );
};

export default VitalSignForm;