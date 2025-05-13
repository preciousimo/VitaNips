// src/features/health/components/SleepLogForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { SleepLog, SleepPayload, SleepQuality } from '../../../types/healthLogs';
import toast from 'react-hot-toast';

interface SleepLogFormProps {
    initialData?: SleepLog | null;
    onSubmit: (payload: SleepPayload, id?: number) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const QUALITY_OPTIONS: { value: SleepQuality; label: string }[] = [
    { value: 1, label: '1 - Poor' },
    { value: 2, label: '2 - Fair' },
    { value: 3, label: '3 - Good' },
    { value: 4, label: '4 - Excellent' },
];

const SleepLogForm: React.FC<SleepLogFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting: propIsSubmitting,
}) => {
    const getDefaultTime = (hoursOffset = 0) => {
        const d = new Date();
        d.setHours(d.getHours() + hoursOffset);
        return d.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState<Partial<SleepPayload>>({
        sleep_time: getDefaultTime(-8), // Default sleep time e.g. 8 hours ago
        wake_time: getDefaultTime(),   // Default wake time now
        quality: 3, // Default to Good
        interruptions: 0,
        notes: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                sleep_time: initialData.sleep_time ? initialData.sleep_time.slice(0, 16) : getDefaultTime(-8),
                wake_time: initialData.wake_time ? initialData.wake_time.slice(0, 16) : getDefaultTime(),
                quality: initialData.quality || 3,
                interruptions: initialData.interruptions ?? 0,
                notes: initialData.notes || '',
            });
        } else {
            setFormData({
                sleep_time: getDefaultTime(-8), wake_time: getDefaultTime(), quality: 3,
                interruptions: 0, notes: '',
            });
        }
        setError(null);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' || name === 'quality' || name === 'interruptions' ? (value === '' ? undefined : parseInt(value, 10)) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsFormSubmitting(true);

        if (!formData.sleep_time || !formData.wake_time || formData.quality === undefined) {
            setError('Sleep Time, Wake Time, and Quality are required.');
            setIsFormSubmitting(false);
            return;
        }
        if (new Date(formData.wake_time) <= new Date(formData.sleep_time)) {
            setError('Wake time must be after sleep time.');
            setIsFormSubmitting(false);
            return;
        }

        const payload: SleepPayload = {
            sleep_time: new Date(formData.sleep_time).toISOString(),
            wake_time: new Date(formData.wake_time).toISOString(),
            quality: formData.quality as SleepQuality,
            interruptions: Number(formData.interruptions) || 0,
            notes: formData.notes?.trim() ? formData.notes : null,
        };

        try {
            await onSubmit(payload, initialData?.id);
            toast.success(`Sleep log ${initialData ? 'updated' : 'added'} successfully!`);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || err.message || "Failed to save sleep log.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsFormSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
                {initialData ? 'Edit Sleep Log' : 'Log New Sleep Entry'}
            </h3>
            {error && <pre className="text-red-500 text-sm bg-red-50 p-3 rounded-md whitespace-pre-wrap">{error}</pre>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="sleep_time" className="block text-sm font-medium text-gray-700">Went to Bed *</label>
                    <input type="datetime-local" name="sleep_time" id="sleep_time" required value={formData.sleep_time} onChange={handleChange} className="input-field mt-1"/>
                </div>
                <div>
                    <label htmlFor="wake_time" className="block text-sm font-medium text-gray-700">Woke Up *</label>
                    <input type="datetime-local" name="wake_time" id="wake_time" required value={formData.wake_time} onChange={handleChange} className="input-field mt-1"/>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="quality" className="block text-sm font-medium text-gray-700">Sleep Quality *</label>
                    <select name="quality" id="quality" required value={formData.quality} onChange={handleChange} className="input-field mt-1">
                        {QUALITY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="interruptions" className="block text-sm font-medium text-gray-700">Interruptions</label>
                    <input type="number" name="interruptions" id="interruptions" min="0" value={formData.interruptions ?? 0} onChange={handleChange} className="input-field mt-1" />
                </div>
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (e.g., dreams, feeling upon waking)</label>
                <textarea name="notes" id="notes" rows={3} value={formData.notes || ''} onChange={handleChange} className="input-field mt-1"></textarea>
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
export default SleepLogForm;