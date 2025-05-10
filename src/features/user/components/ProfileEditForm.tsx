// src/features/user/components/ProfileEditForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { User } from '../../../types/user';
import { UserProfileUpdatePayload } from '../../../api/user';

interface ProfileEditFormProps {
    initialData: User | null;
    onSubmit: (payload: UserProfileUpdatePayload) => Promise<User | void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting
}) => {
    const [formData, setFormData] = useState<UserProfileUpdatePayload>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                first_name: initialData.first_name || '',
                last_name: initialData.last_name || '',
                phone_number: initialData.phone_number || null,
                date_of_birth: initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : null,
                blood_group: initialData.blood_group || null,
                allergies: initialData.allergies || null,
                chronic_conditions: initialData.chronic_conditions || null,
                weight: initialData.weight || null,
                height: initialData.height || null,
                emergency_contact_name: initialData.emergency_contact_name || null,
                emergency_contact_relationship: initialData.emergency_contact_relationship || null,
                emergency_contact_phone: initialData.emergency_contact_phone || null,
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        let processedValue: string | number | boolean | null = value;

        if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        }
        else if (value === '' && ['phone_number', 'date_of_birth', 'blood_group', 'allergies', 'chronic_conditions', 'weight', 'height', 'emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phone'].includes(name)) {
            processedValue = null;
        } else if ((type === 'number') && name !== 'height' && name !== 'weight') {
            processedValue = value ? parseFloat(value) : null;
        } else if (name === 'height' || name === 'weight') {
            processedValue = value ? parseFloat(value) : null;
            if (isNaN(processedValue as number)) processedValue = null;
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.first_name || !formData.last_name) {
            setError("First Name and Last Name are required.");
            return;
        }

        const payload: UserProfileUpdatePayload = {
            ...formData,
            weight: formData.weight ? Number(formData.weight) : null,
            height: formData.height ? Number(formData.height) : null,
        };


        try {
            await onSubmit(payload);
        } catch (err: any) {
            console.error("Profile update error:", err);
            const errorData = err.response?.data;
            if (typeof errorData === 'object' && errorData !== null) {
                const messages = Object.entries(errorData).map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`);
                setError(messages.join(' '));
            } else {
                setError(err.message || "Failed to update profile.");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name *</label>
                    <input type="text" name="first_name" id="first_name" required value={formData.first_name ?? ''} onChange={handleChange} className="input-field" />
                </div>
                <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name *</label>
                    <input type="text" name="last_name" id="last_name" required value={formData.last_name ?? ''} onChange={handleChange} className="input-field" />
                </div>
                <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" name="phone_number" id="phone_number" value={formData.phone_number ?? ''} onChange={handleChange} className="input-field" />
                </div>
                <div>
                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input type="date" name="date_of_birth" id="date_of_birth" value={formData.date_of_birth ?? ''} onChange={handleChange} className="input-field" />
                </div>

                <div>
                    <label htmlFor="blood_group" className="block text-sm font-medium text-gray-700">Blood Group</label>
                    <select name="blood_group" id="blood_group" value={formData.blood_group ?? ''} onChange={handleChange} className="input-field">
                        <option value="">-- Select --</option>
                        {bloodGroups.map(group => <option key={group} value={group}>{group}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Allergies</label>
                    <textarea name="allergies" id="allergies" rows={3} value={formData.allergies ?? ''} onChange={handleChange} className="input-field" placeholder="e.g., Penicillin, Peanuts, Pollen"></textarea>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="chronic_conditions" className="block text-sm font-medium text-gray-700">Chronic Conditions</label>
                    <textarea name="chronic_conditions" id="chronic_conditions" rows={3} value={formData.chronic_conditions ?? ''} onChange={handleChange} className="input-field" placeholder="e.g., Hypertension, Diabetes Type 2, Asthma"></textarea>
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input type="number" step="0.1" name="weight" id="weight" value={formData.weight ?? ''} onChange={handleChange} className="input-field" placeholder="e.g., 70.5" />
                </div>
                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (cm)</label>
                    <input type="number" step="0.1" name="height" id="height" value={formData.height ?? ''} onChange={handleChange} className="input-field" placeholder="e.g., 175.0" />
                </div>

                <hr className="md:col-span-2 my-2" />
                <h4 className="md:col-span-2 text-md font-semibold text-gray-700">Primary Emergency Contact</h4>
                <div>
                    <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <input type="text" name="emergency_contact_name" id="emergency_contact_name" value={formData.emergency_contact_name ?? ''} onChange={handleChange} className="input-field" />
                </div>
                <div>
                    <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
                    <input type="tel" name="emergency_contact_phone" id="emergency_contact_phone" value={formData.emergency_contact_phone ?? ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="emergency_contact_relationship" className="block text-sm font-medium text-gray-700">Relationship</label>
                    <input type="text" name="emergency_contact_relationship" id="emergency_contact_relationship" value={formData.emergency_contact_relationship ?? ''} onChange={handleChange} className="input-field" />
                </div>

            </div>

            <hr className="md:col-span-2 my-2" />
            <h4 className="md:col-span-2 text-md font-semibold text-gray-700">Notification Preferences</h4>

            <div className="md:col-span-2 space-y-2">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="notify_appointment_reminder_email"
                        name="notify_appointment_reminder_email"
                        checked={formData.notify_appointment_reminder_email ?? false}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="notify_appointment_reminder_email" className="ml-2 block text-sm text-gray-900">
                        Reminders via Email
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="notify_appointment_reminder_sms"
                        name="notify_appointment_reminder_sms"
                        checked={formData.notify_appointment_reminder_sms ?? false}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="notify_appointment_reminder_sms" className="ml-2 block text-sm text-gray-900">
                        Reminders via SMS
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="notify_appointment_reminder_push"
                        name="notify_appointment_reminder_push"
                        checked={formData.notify_appointment_reminder_push ?? false}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="notify_appointment_reminder_push" className="ml-2 block text-sm text-gray-900">
                        Reminders via Push Notification (Browser/App)
                    </label>
                </div>

                <div className="flex items-center">
                    <input type="checkbox" id="notify_refill_reminder_email" name="notify_refill_reminder_email" checked={formData.notify_refill_reminder_email ?? false} onChange={handleChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                    <label htmlFor="notify_refill_reminder_email" className="ml-2 block text-sm text-gray-900">Receive Medication Refill Reminders via Email</label>
                </div>

            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary inline-flex justify-center px-4 py-2 text-sm font-medium disabled:opacity-50">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default ProfileEditForm;