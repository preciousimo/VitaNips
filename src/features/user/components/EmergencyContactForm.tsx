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
        alternative_phone: null,
        email: null,
        address: null,
        is_primary: false,
        notes: null,
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                relationship: initialData.relationship || '',
                phone_number: initialData.phone_number || '',
                alternative_phone: initialData.alternative_phone || null,
                email: initialData.email || null,
                address: initialData.address || null,
                is_primary: initialData.is_primary || false,
                notes: initialData.notes || null,
            });
        } else {
            // Reset for new entry
            setFormData({
                name: '',
                relationship: '',
                phone_number: '',
                alternative_phone: null,
                email: null,
                address: null,
                is_primary: false,
                notes: null,
            });
        }
        setError(null);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        let processedValue: string | boolean | null = value;

        if (type === 'checkbox') {
            processedValue = checked;
        } else if (['alternative_phone', 'email', 'address', 'notes'].includes(name) && value === '') {
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
                name: formData.name,
                relationship: formData.relationship,
                phone_number: formData.phone_number,
                alternative_phone: formData.alternative_phone || null,
                email: formData.email || null,
                address: formData.address || null,
                is_primary: formData.is_primary || false,
                notes: formData.notes || null,
            };
            await onSubmit(payload, initialData?.id);
        } catch (err: any) {
            console.error("Form submission error:", err);
            setError(err.message || "Failed to save emergency contact. Please check details.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {initialData ? 'Edit Emergency Contact' : 'Add New Emergency Contact'}
            </h3>
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md mb-3">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">Relationship *</label>
                    <input type="text" name="relationship" id="relationship" required value={formData.relationship} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Primary Phone *</label>
                    <input type="tel" name="phone_number" id="phone_number" required value={formData.phone_number} onChange={handleChange} className="input-field mt-1" placeholder="e.g., +1234567890" />
                </div>
                <div>
                    <label htmlFor="alternative_phone" className="block text-sm font-medium text-gray-700">Alternative Phone</label>
                    <input type="tel" name="alternative_phone" id="alternative_phone" value={formData.alternative_phone ?? ''} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" name="email" id="email" value={formData.email ?? ''} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea name="address" id="address" rows={2} value={formData.address ?? ''} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea name="notes" id="notes" rows={3} value={formData.notes ?? ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Knows about medical conditions, best way to reach..." />
                </div>
                <div className="md:col-span-2 flex items-center">
                    <input
                        type="checkbox"
                        name="is_primary"
                        id="is_primary"
                        checked={formData.is_primary ?? false}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="is_primary" className="ml-2 block text-sm font-medium text-gray-700">Set as primary contact</label>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t mt-6">
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