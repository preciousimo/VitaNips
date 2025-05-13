// src/features/pharmacy/components/MedicationReminderForm.tsx

import React, { useState, useEffect, FormEvent } from 'react';
import { MedicationReminder, MedicationReminderPayload, ReminderFrequency } from '../../../types/reminders';
import toast from 'react-hot-toast';

interface MedicationReminderFormProps {
    initialData?: MedicationReminder | null;
    onSubmit: (payload: MedicationReminderPayload, id?: number) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const FREQUENCY_OPTIONS: { value: ReminderFrequency; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' },
];

const MedicationReminderForm: React.FC<MedicationReminderFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting: propIsSubmitting,
}) => {
    const [formData, setFormData] = useState<MedicationReminderPayload>({
        medication_name_input: '',
        dosage: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        time_of_day: '08:00',
        frequency: 'daily',
        custom_frequency: '',
        notes: '',
        is_active: true,
        prescription_item_id: undefined,
    });
    const [error, setError] = useState<string | null>(null);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                medication_name_input: initialData.medication_display?.name || '',
                dosage: initialData.dosage || '',
                start_date: initialData.start_date ? initialData.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
                end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
                time_of_day: initialData.time_of_day ? initialData.time_of_day.substring(0, 5) : '08:00',
                frequency: initialData.frequency || 'daily',
                custom_frequency: initialData.custom_frequency || '',
                notes: initialData.notes || '',
                is_active: initialData.is_active === undefined ? true : initialData.is_active,
                prescription_item_id: initialData.prescription_item_id || undefined,
            });
        } else {
            setFormData({
                medication_name_input: '',
                dosage: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                time_of_day: '08:00',
                frequency: 'daily',
                custom_frequency: '',
                notes: '',
                is_active: true,
                prescription_item_id: undefined,
            });
        }
        setError(null);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsFormSubmitting(true);

        if (!formData.medication_name_input || !formData.dosage || !formData.start_date || !formData.time_of_day) {
            setError('Medication Name, Dosage, Start Date, and Time of Day are required.');
            setIsFormSubmitting(false);
            return;
        }

        if (formData.frequency === 'custom' && !formData.custom_frequency?.trim()) {
            setError('Please specify custom frequency details or choose another frequency.');
            setIsFormSubmitting(false);
            return;
        }

        const payload: MedicationReminderPayload = {
            medication_name_input: formData.medication_name_input.trim(),
            dosage: formData.dosage.trim(),
            start_date: formData.start_date,
            end_date: formData.end_date?.trim() ? formData.end_date : undefined,
            time_of_day: formData.time_of_day,
            frequency: formData.frequency,
            custom_frequency: formData.frequency === 'custom' ? (formData.custom_frequency?.trim() || undefined) : undefined,
            notes: formData.notes?.trim() || undefined,
            prescription_item_id: formData.prescription_item_id ? Number(formData.prescription_item_id) : undefined,
            is_active: formData.is_active,
        };

        try {
            await onSubmit(payload, initialData?.id);
            toast.success(`Reminder ${initialData ? 'updated' : 'added'} successfully!`);
        } catch (err: any) {
            console.error("Form submission error from form:", err);
            const errorData = err.response?.data;
            let errorMessage = `Failed to ${initialData ? 'update' : 'add'} reminder.`;

            if (errorData && typeof errorData === 'object') {
                const messages = Object.entries(errorData)
                    .map(([key, val]) =>
                        `${key === 'detail' ? '' : key + ': '}${Array.isArray(val) ? val.join(', ') : val}`
                    )
                    .join('\n');
                errorMessage = messages || errorMessage;
            } else if (err.message) {
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
            <h3 className="text-xl font-semibold text-gray-800">
                {initialData ? 'Edit Medication Reminder' : 'Add New Medication Reminder'}
            </h3>

            {error && (
                <pre className="text-red-500 text-sm bg-red-50 p-3 rounded-md whitespace-pre-wrap">
                    {error}
                </pre>
            )}

            <div>
                <label htmlFor="medication_name_input" className="block text-sm font-medium text-gray-700">Medication Name *</label>
                <input type="text" name="medication_name_input" id="medication_name_input" required value={formData.medication_name_input} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Lisinopril 10mg" />
            </div>

            <div>
                <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">Dosage *</label>
                <input type="text" name="dosage" id="dosage" required value={formData.dosage} onChange={handleChange} className="input-field mt-1" placeholder="e.g., 1 tablet, 2 puffs" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date *</label>
                    <input type="date" name="start_date" id="start_date" required value={formData.start_date} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                    <input type="date" name="end_date" id="end_date" value={formData.end_date || ''} onChange={handleChange} className="input-field mt-1" />
                </div>
            </div>

            <div>
                <label htmlFor="time_of_day" className="block text-sm font-medium text-gray-700">Time of Day * (HH:MM)</label>
                <input type="time" name="time_of_day" id="time_of_day" required value={formData.time_of_day} onChange={handleChange} className="input-field mt-1" />
            </div>

            <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequency *</label>
                <select name="frequency" id="frequency" required value={formData.frequency} onChange={handleChange} className="input-field mt-1">
                    {FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {formData.frequency === 'custom' && (
                <div>
                    <label htmlFor="custom_frequency" className="block text-sm font-medium text-gray-700">Custom Frequency Details *</label>
                    <input type="text" name="custom_frequency" id="custom_frequency" required={formData.frequency === 'custom'} value={formData.custom_frequency || ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Every 3 days" />
                    <p className="text-xs text-muted mt-1">Example: "Every 2 days", "Mon,Wed,Fri". Backend parsing logic will determine supported formats.</p>
                </div>
            )}

            <div>
                <label htmlFor="prescription_item_id" className="block text-sm font-medium text-gray-700">Link to Prescription Item ID (Optional)</label>
                <input type="number" name="prescription_item_id" id="prescription_item_id" value={formData.prescription_item_id || ''} onChange={handleChange} className="input-field mt-1" placeholder="Enter ID if known" />
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea name="notes" id="notes" rows={3} value={formData.notes || ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Take with food, after breakfast"></textarea>
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Reminder Active</label>
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isFormSubmitting || propIsSubmitting}
                    className={`px-4 py-2 rounded-md text-sm font-medium text-white ${isFormSubmitting || propIsSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}
                >
                    {isFormSubmitting || propIsSubmitting ? 'Saving...' : (initialData ? 'Update Reminder' : 'Create Reminder')}
                </button>
            </div>
        </form>
    );
};

export default MedicationReminderForm;