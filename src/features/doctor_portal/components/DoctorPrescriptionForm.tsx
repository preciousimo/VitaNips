// src/features/doctor_portal/components/DoctorPrescriptionForm.tsx
import React, { useState, FormEvent } from 'react';
import { DoctorPrescriptionPayload, DoctorPrescriptionItemPayload } from '../../../api/doctorPortal'; // Adjust path
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface DoctorPrescriptionFormProps {
    appointmentId: number; // The selected appointment ID
    patientName: string;
    appointmentDate: string;
    onSubmit: (payload: DoctorPrescriptionPayload) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const DoctorPrescriptionForm: React.FC<DoctorPrescriptionFormProps> = ({
    appointmentId,
    patientName,
    appointmentDate,
    onSubmit,
    onCancel,
    isSubmitting: propIsSubmitting,
}) => {
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<Partial<DoctorPrescriptionItemPayload>[]>([
        { medication_name_input: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
    const [error, setError] = useState<string | null>(null);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);

    const handleItemChange = (index: number, field: keyof DoctorPrescriptionItemPayload, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { medication_name_input: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const removeItem = (index: number) => {
        if (items.length <= 1) {
            toast.error("At least one medication item is required.");
            return;
        }
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!diagnosis.trim()) {
            setError("Diagnosis is required.");
            toast.error("Diagnosis is required.");
            return;
        }
        
        const validItems = items.filter(item =>
            item.medication_name_input?.trim() &&
            item.dosage?.trim() &&
            item.frequency?.trim() &&
            item.duration?.trim()
        );

        if (validItems.length === 0) {
            setError("At least one complete medication item is required (Medication Name, Dosage, Frequency, Duration).");
            toast.error("At least one complete medication item is required.");
            return;
        }

        setIsFormSubmitting(true);
        const payload: DoctorPrescriptionPayload = {
            appointment_id: appointmentId,
            diagnosis: diagnosis.trim(),
            notes: notes.trim() || undefined,
            items: validItems as DoctorPrescriptionItemPayload[], // Cast after validation
        };
        
        try {
            await onSubmit(payload);
            toast.success("Prescription submitted successfully!");
        } catch (err: any) {
            const errorData = err.response?.data;
            let errorMessage = "Failed to submit prescription.";
            
            if (errorData && typeof errorData === 'object') {
                const messages = Object.entries(errorData)
                    .map(([key, val]) => `${key === 'detail' ? '' : key + ': '}${Array.isArray(val) ? val.join(', ') : val}`)
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
        <form onSubmit={handleSubmit} className="space-y-6 p-1">
            <div>
                <h3 className="text-xl font-semibold text-gray-800">New Prescription</h3>
                <p className="text-sm text-gray-600">
                    For: <span className="font-medium">{patientName}</span> (Appointment on {new Date(appointmentDate + "T00:00:00Z").toLocaleDateString()})
                </p>
            </div>

            {error && <pre className="text-red-500 text-sm bg-red-50 p-3 rounded-md whitespace-pre-wrap">{error}</pre>}

            <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">Diagnosis *</label>
                <textarea id="diagnosis" name="diagnosis" rows={3} required value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)} className="input-field mt-1"
                          placeholder="Enter patient's diagnosis..."/>
            </div>

            <div className="space-y-4 border p-4 rounded-md bg-gray-50">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Medication Items *</h4>
                {items.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-white shadow-sm space-y-2 relative">
                        {items.length > 1 && (
                            <button type="button" onClick={() => removeItem(index)}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                <TrashIcon className="h-3 w-3"/>
                            </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label htmlFor={`med_name_${index}`} className="text-xs font-medium text-gray-600">Medication Name *</label>
                                <input type="text" id={`med_name_${index}`} required value={item.medication_name_input || ''}
                                       onChange={(e) => handleItemChange(index, 'medication_name_input', e.target.value)}
                                       className="input-field mt-0.5 text-sm py-1.5" placeholder="e.g., Amoxicillin 250mg"/>
                            </div>
                            <div>
                                <label htmlFor={`dosage_${index}`} className="text-xs font-medium text-gray-600">Dosage *</label>
                                <input type="text" id={`dosage_${index}`} required value={item.dosage || ''}
                                       onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                                       className="input-field mt-0.5 text-sm py-1.5" placeholder="e.g., 1 tablet, 10ml"/>
                            </div>
                            <div>
                                <label htmlFor={`frequency_${index}`} className="text-xs font-medium text-gray-600">Frequency *</label>
                                <input type="text" id={`frequency_${index}`} required value={item.frequency || ''}
                                       onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                                       className="input-field mt-0.5 text-sm py-1.5" placeholder="e.g., Twice daily, Every 6 hours"/>
                            </div>
                            <div>
                                <label htmlFor={`duration_${index}`} className="text-xs font-medium text-gray-600">Duration *</label>
                                <input type="text" id={`duration_${index}`} required value={item.duration || ''}
                                       onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                                       className="input-field mt-0.5 text-sm py-1.5" placeholder="e.g., 7 days, 1 month"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor={`instructions_${index}`} className="text-xs font-medium text-gray-600">Instructions</label>
                            <textarea id={`instructions_${index}`} value={item.instructions || ''} rows={2}
                                   onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                                   className="input-field mt-0.5 text-sm py-1.5" placeholder="e.g., Take with food, Before bedtime"/>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addItem}
                        className="text-sm text-primary hover:text-primary-dark font-medium inline-flex items-center mt-2 py-1 px-2 border border-primary-light rounded-md hover:bg-primary-light/30">
                    <PlusIcon className="h-4 w-4 mr-1"/> Add Another Medication
                </button>
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">General Prescription Notes (Optional)</label>
                <textarea id="notes" name="notes" rows={2} value={notes}
                          onChange={(e) => setNotes(e.target.value)} className="input-field mt-1"
                          placeholder="e.g., Review in 2 weeks, Follow up if symptoms persist..."/>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                <button type="submit" disabled={isFormSubmitting || propIsSubmitting} className="btn-primary disabled:opacity-50">
                    {isFormSubmitting || propIsSubmitting ? 'Submitting...' : 'Submit Prescription'}
                </button>
            </div>
        </form>
    );
};

export default DoctorPrescriptionForm;