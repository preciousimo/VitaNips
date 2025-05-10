// src/features/health/components/VaccinationForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { Vaccination, VaccinationPayload } from '../../../types/health';

interface VaccinationFormProps {
    initialData?: Vaccination | null;
    onSubmit: (payload: VaccinationPayload, id?: number) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const VaccinationForm: React.FC<VaccinationFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting
}) => {
    const [formData, setFormData] = useState<VaccinationPayload>({
        vaccine_name: '',
        date_administered: '',
        dose_number: 1,
        next_dose_date: null,
        administered_at: null,
        batch_number: null,
        notes: null,
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                vaccine_name: initialData.vaccine_name || '',
                date_administered: initialData.date_administered ? initialData.date_administered.split('T')[0] : '',
                dose_number: initialData.dose_number || 1,
                next_dose_date: initialData.next_dose_date ? initialData.next_dose_date.split('T')[0] : null,
                administered_at: initialData.administered_at || null,
                batch_number: initialData.batch_number || null,
                notes: initialData.notes || null,
            });
        } else {
             setFormData({
                vaccine_name: '', date_administered: '', dose_number: 1,
                next_dose_date: null, administered_at: null, batch_number: null, notes: null,
            });
        }
        setError(null);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

         let processedValue: string | number | null = value;
         if (type === 'number') {
            processedValue = value ? parseInt(value, 10) : 1;
         } else if ((name === 'next_dose_date' || name === 'administered_at' || name === 'batch_number' || name === 'notes') && value === '') {
            processedValue = null;
         }

        setFormData((prev: VaccinationPayload) => ({
            ...prev,
            [name]: processedValue,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.vaccine_name || !formData.date_administered || formData.dose_number < 1) {
            setError("Vaccine Name, Date Administered, and Dose Number (>=1) are required.");
            return;
        }

        try {
             const payload: VaccinationPayload = {
                ...formData,
                next_dose_date: formData.next_dose_date || null,
                administered_at: formData.administered_at || null,
                batch_number: formData.batch_number || null,
                notes: formData.notes || null,
             };
            await onSubmit(payload, initialData?.id);
        } catch (err: any) {
            console.error("Form submission error:", err);
            setError(err.message || "Failed to save vaccination record.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {initialData ? 'Edit Vaccination Record' : 'Add New Vaccination Record'}
            </h3>
            {error && <p className="text-red-600 text-sm">{error}</p>}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="vaccine_name" className="block text-sm font-medium text-gray-700">Vaccine Name *</label>
                    <input type="text" name="vaccine_name" id="vaccine_name" required value={formData.vaccine_name} onChange={handleChange} className="input-field" />
                </div>
                 <div>
                    <label htmlFor="date_administered" className="block text-sm font-medium text-gray-700">Date Administered *</label>
                    <input type="date" name="date_administered" id="date_administered" required value={formData.date_administered} onChange={handleChange} className="input-field" />
                </div>
                 <div>
                    <label htmlFor="dose_number" className="block text-sm font-medium text-gray-700">Dose Number *</label>
                    <input type="number" name="dose_number" id="dose_number" required min="1" value={formData.dose_number} onChange={handleChange} className="input-field" />
                </div>
                <div>
                    <label htmlFor="next_dose_date" className="block text-sm font-medium text-gray-700">Next Dose Due</label>
                    <input type="date" name="next_dose_date" id="next_dose_date" value={formData.next_dose_date ?? ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="administered_at" className="block text-sm font-medium text-gray-700">Location Administered</label>
                    <input type="text" name="administered_at" id="administered_at" value={formData.administered_at ?? ''} onChange={handleChange} className="input-field" />
                </div>
                 <div>
                    <label htmlFor="batch_number" className="block text-sm font-medium text-gray-700">Batch Number</label>
                    <input type="text" name="batch_number" id="batch_number" value={formData.batch_number ?? ''} onChange={handleChange} className="input-field" />
                </div>
                 <div className="md:col-span-2">
                     <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                     <textarea name="notes" id="notes" rows={3} value={formData.notes ?? ''} onChange={handleChange} className="input-field"></textarea>
                </div>
             </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary inline-flex justify-center px-4 py-2 text-sm font-medium disabled:opacity-50">
                    {isSubmitting ? 'Saving...' : (initialData ? 'Update Record' : 'Add Record')}
                </button>
            </div>
        </form>
    );
};

export default VaccinationForm;