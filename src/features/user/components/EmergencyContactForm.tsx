// src/features/user/components/EmergencyContactForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { EmergencyContact, EmergencyContactPayload } from '../../../types/user';

interface EmergencyContactFormProps {
    initialData?: EmergencyContact | null;
    onSubmit: (payload: EmergencyContactPayload, id?: number) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting
}) => {
    const [formData, setFormData] = useState<EmergencyContactPayload>({
        name: '',
        relationship: '',
        phone_number: '',
        email: null,
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                relationship: initialData.relationship || '',
                phone_number: initialData.phone_number || '',
                email: initialData.email || null,
            });
        } else {
            setFormData({ name: '', relationship: '', phone_number: '', email: null });
        }
        setError(null);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let processedValue: string | null = value;
         if (name === 'email' && value === '') {
            processedValue = null;
         }
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name || !formData.relationship || !formData.phone_number) {
            setError("Name, Relationship, and Phone Number are required.");
            return;
        }
        try {
             const payload: EmergencyContactPayload = {
                ...formData,
                email: formData.email || null,
             };
            await onSubmit(payload, initialData?.id);
        } catch (err: any) {
            console.error("Form submission error:", err);
            setError(err.message || "Failed to save emergency contact.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {initialData ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </h3>
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="space-y-3">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="input-field" />
                </div>
                 <div>
                    <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">Relationship *</label>
                    <input type="text" name="relationship" id="relationship" required value={formData.relationship} onChange={handleChange} className="input-field" />
                </div>
                <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                    <input type="tel" name="phone_number" id="phone_number" required value={formData.phone_number} onChange={handleChange} className="input-field" placeholder="e.g., +1234567890" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address (Optional)</label>
                    <input type="email" name="email" id="email" value={formData.email ?? ''} onChange={handleChange} className="input-field" />
                </div>
             </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary inline-flex justify-center px-4 py-2 text-sm font-medium disabled:opacity-50">
                    {isSubmitting ? 'Saving...' : (initialData ? 'Update Contact' : 'Add Contact')}
                </button>
            </div>
        </form>
    );
};

export default EmergencyContactForm;