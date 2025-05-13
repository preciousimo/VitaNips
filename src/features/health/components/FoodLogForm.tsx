// src/features/health/components/FoodLogForm.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { FoodLog, FoodPayload, MealType } from '../../../types/healthLogs';
import toast from 'react-hot-toast';

interface FoodLogFormProps {
    initialData?: FoodLog | null;
    onSubmit: (payload: FoodPayload, id?: number) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
];

const FoodLogForm: React.FC<FoodLogFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting: propIsSubmitting,
}) => {
    const getDefaultDateTime = () => new Date().toISOString().slice(0, 16);

    const [formData, setFormData] = useState<Partial<FoodPayload>>({
        food_item: '',
        meal_type: 'breakfast',
        datetime: getDefaultDateTime(),
        calories: undefined,
        carbohydrates: undefined,
        proteins: undefined,
        fats: undefined,
        notes: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);


    useEffect(() => {
        if (initialData) {
            setFormData({
                food_item: initialData.food_item || '',
                meal_type: initialData.meal_type || 'breakfast',
                datetime: initialData.datetime ? initialData.datetime.slice(0, 16) : getDefaultDateTime(),
                calories: initialData.calories ?? undefined,
                carbohydrates: initialData.carbohydrates ?? undefined,
                proteins: initialData.proteins ?? undefined,
                fats: initialData.fats ?? undefined,
                notes: initialData.notes || '',
            });
        } else {
            setFormData({
                food_item: '', meal_type: 'breakfast', datetime: getDefaultDateTime(),
                calories: undefined, carbohydrates: undefined, proteins: undefined, fats: undefined, notes: '',
            });
        }
        setError(null);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

        if (!formData.food_item || !formData.meal_type || !formData.datetime) {
            setError('Food Item, Meal Type, and Date/Time are required.');
            setIsFormSubmitting(false);
            return;
        }

        const payload: FoodPayload = {
            food_item: formData.food_item.trim(),
            meal_type: formData.meal_type as MealType,
            datetime: new Date(formData.datetime).toISOString(),
            calories: formData.calories ?? null,
            carbohydrates: formData.carbohydrates ?? null,
            proteins: formData.proteins ?? null,
            fats: formData.fats ?? null,
            notes: formData.notes?.trim() ? formData.notes : null,
        };

        try {
            await onSubmit(payload, initialData?.id);
            toast.success(`Food log ${initialData ? 'updated' : 'added'} successfully!`);
        } catch (err: any) {
            // Simplified error handling for brevity
            const errorMsg = err.response?.data?.detail || err.message || "Failed to save food log.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsFormSubmitting(false);
        }
    };

    const numberInputProps = (name: keyof FoodPayload, placeholder: string, step = "any") => ({
        type: "number", name, id: name,
        value: formData[name] === undefined || formData[name] === null ? '' : String(formData[name]),
        onChange: handleChange,
        className: "input-field mt-1", placeholder, step
    });


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
                {initialData ? 'Edit Food Log Entry' : 'Log New Food Entry'}
            </h3>
            {error && <pre className="text-red-500 text-sm bg-red-50 p-3 rounded-md whitespace-pre-wrap">{error}</pre>}

            <div>
                <label htmlFor="food_item" className="block text-sm font-medium text-gray-700">Food Item / Meal *</label>
                <input type="text" name="food_item" id="food_item" required value={formData.food_item || ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Chicken Salad, Apple" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="meal_type" className="block text-sm font-medium text-gray-700">Meal Type *</label>
                    <select name="meal_type" id="meal_type" required value={formData.meal_type} onChange={handleChange} className="input-field mt-1">
                        {MEAL_TYPE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">Date & Time Eaten *</label>
                    <input type="datetime-local" name="datetime" id="datetime" required value={formData.datetime} onChange={handleChange} className="input-field mt-1"/>
                </div>
            </div>
            <h4 className="text-md font-medium text-gray-700 pt-2 border-b pb-1">Nutritional Info (Optional)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div>
                    <label htmlFor="calories" className="block text-xs font-medium text-gray-700">Calories (kcal)</label>
                    <input {...numberInputProps('calories', "e.g., 350")} />
                </div>
                <div>
                    <label htmlFor="proteins" className="block text-xs font-medium text-gray-700">Protein (g)</label>
                    <input {...numberInputProps('proteins', "e.g., 20", "0.1")} />
                </div>
                <div>
                    <label htmlFor="carbohydrates" className="block text-xs font-medium text-gray-700">Carbs (g)</label>
                    <input {...numberInputProps('carbohydrates', "e.g., 40", "0.1")} />
                </div>
                <div>
                    <label htmlFor="fats" className="block text-xs font-medium text-gray-700">Fat (g)</label>
                    <input {...numberInputProps('fats', "e.g., 15", "0.1")} />
                </div>
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea name="notes" id="notes" rows={2} value={formData.notes || ''} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Felt full, homemade"></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isFormSubmitting || propIsSubmitting} className="btn-primary disabled:opacity-50">
                    {isFormSubmitting || propIsSubmitting ? 'Saving...' : (initialData ? 'Update Entry' : 'Add Entry')}
                </button>
            </div>
        </form>
    );
};
export default FoodLogForm;