// src/features/pharmacy/components/MedicationReminderForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { MedicationReminder, MedicationReminderPayload, ReminderFrequency } from '../../../types/reminders';

interface MedicationReminderFormProps {
    initialData?: MedicationReminder | null; // For editing
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
    isSubmitting,
}) => {
    const [formData, setFormData] = useState<MedicationReminderPayload>({
        medication_name: '',
        dosage: '',
        start_date: new Date().toISOString().split('T')[0], // Default to today
        end_date: null,
        time_of_day: '08:00', // Default time
        frequency: 'daily',
        custom_frequency: null,
        notes: null,
        is_active: true,
        prescription_item_id: null,
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                medication_name: initialData.medication.name || '', // Assuming medication object has name
                dosage: initialData.dosage || '',
                start_date: initialData.start_date ? initialData.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
                end_date: initialData.end_date ? initialData.end_date.split('T')[0] : null,
                time_of_day: initialData.time_of_day ? initialData.time_of_day.substring(0, 5) : '08:00', // HH:MM format
                frequency: initialData.frequency || 'daily',
                custom_frequency: initialData.custom_frequency || null,
                notes: initialData.notes || null,
                is_active: initialData.is_active === undefined ? true : initialData.is_active,
                prescription_item_id: initialData.prescription_item || null,
            });
        } else {
            // Reset for new entry
            setFormData({
                medication_name: '', dosage: '',
                start_date: new Date().toISOString().split('T')[0], end_date: null,
                time_of_day: '08:00', frequency: 'daily', custom_frequency: null,
                notes: null, is_active: true, prescription_item_id: null,
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

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Ensure time is in HH:MM format if necessary for backend
        setFormData(prev => ({ ...prev, time_of_day: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!formData.medication_name || !formData.dosage || !formData.start_date || !formData.time_of_day) {
            setError('Medication Name, Dosage, Start Date, and Time of Day are required.');
            return;
        }
        if (formData.frequency === 'custom' && !formData.custom_frequency) {
            setError('Please specify custom frequency details.');
            return;
        }

        // Ensure optional fields are null if empty, and boolean is present
        const payload: MedicationReminderPayload = {
            ...formData,
            end_date: formData.end_date || null,
            custom_frequency: formData.frequency === 'custom' ? (formData.custom_frequency || null) : null,
            notes: formData.notes || null,
            prescription_item_id: formData.prescription_item_id ? Number(formData.prescription_item_id) : null,
            is_active: formData.is_active === undefined ? true : formData.is_active,
        };

        try {
            await onSubmit(payload, initialData?.id);
        } catch (err: any) {
            console.error("Form submission error:", err);
            const errorData = err.response?.data;
            if (errorData && typeof errorData === 'object') {
                const messages = Object.entries(errorData).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`);
                setError(messages.join(' ') || "Failed to save reminder.");
            } else {
                setError(err.message || "Failed to save reminder.");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-1"> {/* Removed padding for modal usage */}
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {initialData ? 'Edit Medication Reminder' : 'Add New Medication Reminder'}
            </h3>
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md mb-3">{error}</p>}

            <div>
                <label htmlFor="medication_name" className="block text-sm font-medium text-gray-700">Medication Name *</label>
                <input type="text" name="medication_name" id="medication_name" required value={formData.medication_name} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Amoxicillin 250mg" />
            </div>
            <div>
                <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">Dosage *</label>
                <input type="text" name="dosage" id="dosage" required value={formData.dosage} onChange={handleChange} className="input-field mt-1" placeholder="e.g., 1 tablet, 10ml" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date *</label>
                    <input type="date" name="start_date" id="start_date" required value={formData.start_date} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                    <input type="date" name="end_date" id="end_date" value={formData.end_date ?? ''} onChange={handleChange} className="input-field mt-1" />
                </div>
            </div>

            <div>
                <label htmlFor="time_of_day" className="block text-sm font-medium text-gray-700">Time of Day *</label>
                <input type="time" name="time_of_day" id="time_of_day" required value={formData.time_of_day} onChange={handleTimeChange} className="input-field mt-1" />
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
                    <input type="text" name="custom_frequency" id="custom_frequency" required={formData.frequency === 'custom'} value={formData.custom_frequency ?? ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Every 3 days, Mon & Fri" />
                    <p className="text-xs text-muted mt-1">Note: Backend needs to parse this. For 'every X days', just enter the number.</p>
                </div>
            )}
            <div>
                <label htmlFor="prescription_item_id" className="block text-sm font-medium text-gray-700">Prescription Item ID (Optional)</label>
                <input type="number" name="prescription_item_id" id="prescription_item_id" value={formData.prescription_item_id ?? ''} onChange={handleChange} className="input-field mt-1" placeholder="Link to a specific prescription item"/>
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea name="notes" id="notes" rows={3} value={formData.notes ?? ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Take with food"></textarea>
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active ?? true}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Reminder Active</label>
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary inline-flex justify-center px-4 py-2 text-sm font-medium disabled:opacity-50">
                    {isSubmitting ? 'Saving...' : (initialData ? 'Update Reminder' : 'Add Reminder')}
                </button>
            </div>
        </form>
    );
};

export default MedicationReminderForm;