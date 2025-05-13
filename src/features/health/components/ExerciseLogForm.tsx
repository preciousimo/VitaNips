// src/features/health/components/ExerciseLogForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { ExerciseLog, ExercisePayload } from '../../../types/healthLogs';
import toast from 'react-hot-toast';

interface ExerciseLogFormProps {
    initialData?: ExerciseLog | null;
    onSubmit: (payload: ExercisePayload, id?: number) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const ExerciseLogForm: React.FC<ExerciseLogFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting: propIsSubmitting,
}) => {
    const getDefaultDateTime = () => new Date().toISOString().slice(0, 16);
    const [formData, setFormData] = useState<Partial<ExercisePayload>>({
        activity_type: '',
        datetime: getDefaultDateTime(),
        duration: undefined, // minutes
        calories_burned: undefined,
        distance: undefined, // km
        notes: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                activity_type: initialData.activity_type || '',
                datetime: initialData.datetime ? initialData.datetime.slice(0, 16) : getDefaultDateTime(),
                duration: initialData.duration ?? undefined,
                calories_burned: initialData.calories_burned ?? undefined,
                distance: initialData.distance ?? undefined,
                notes: initialData.notes || '',
            });
        } else {
            setFormData({
                activity_type: '', datetime: getDefaultDateTime(), duration: undefined,
                calories_burned: undefined, distance: undefined, notes: '',
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

        if (!formData.activity_type || !formData.datetime || formData.duration === undefined || formData.duration <= 0) {
            setError('Activity Type, Date/Time, and a valid Duration (minutes > 0) are required.');
            setIsFormSubmitting(false);
            return;
        }

        const payload: ExercisePayload = {
            activity_type: formData.activity_type.trim(),
            datetime: new Date(formData.datetime).toISOString(),
            duration: Number(formData.duration),
            calories_burned: formData.calories_burned ?? null,
            distance: formData.distance ?? null,
            notes: formData.notes?.trim() ? formData.notes : null,
        };

        try {
            await onSubmit(payload, initialData?.id);
            toast.success(`Exercise log ${initialData ? 'updated' : 'added'} successfully!`);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || err.message || "Failed to save exercise log.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsFormSubmitting(false);
        }
    };

    const numberInputProps = (name: keyof ExercisePayload, placeholder: string, step = "any", min = "0") => ({
        type: "number", name, id: name, min,
        value: formData[name] === undefined || formData[name] === null ? '' : String(formData[name]),
        onChange: handleChange,
        className: "input-field mt-1", placeholder, step
    });

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
                {initialData ? 'Edit Exercise Log' : 'Log New Exercise'}
            </h3>
            {error && <pre className="text-red-500 text-sm bg-red-50 p-3 rounded-md whitespace-pre-wrap">{error}</pre>}

            <div>
                <label htmlFor="activity_type" className="block text-sm font-medium text-gray-700">Activity Type *</label>
                <input type="text" name="activity_type" id="activity_type" required value={formData.activity_type || ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Running, Swimming, Gym workout" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">Date & Time *</label>
                    <input type="datetime-local" name="datetime" id="datetime" required value={formData.datetime} onChange={handleChange} className="input-field mt-1"/>
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (minutes) *</label>
                    <input {...numberInputProps('duration', "e.g., 30", "1", "1")} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="calories_burned" className="block text-sm font-medium text-gray-700">Calories Burned (kcal)</label>
                    <input {...numberInputProps('calories_burned', "e.g., 300")} />
                </div>
                <div>
                    <label htmlFor="distance" className="block text-sm font-medium text-gray-700">Distance (km)</label>
                    <input {...numberInputProps('distance', "e.g., 5", "0.1")} />
                </div>
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea name="notes" id="notes" rows={3} value={formData.notes || ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Felt energetic, Track conditions"></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                <button type="submit" disabled={isFormSubmitting || propIsSubmitting} className="btn-primary disabled:opacity-50">
                    {isFormSubmitting || propIsSubmitting ? 'Saving...' : (initialData ? 'Update Log' : 'Add Log')}
                </button>
            </div>
        </form>
    );
};
export default ExerciseLogForm;