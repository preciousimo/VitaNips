// src/features/pharmacy/components/MedicationInfoDisplay.tsx
import React, { useState, useEffect } from 'react';
import { Medication } from '../../../types/pharmacy';
import { getMedicationById } from '../../../api/pharmacy'; // Assuming you have this API function
import { InformationCircleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface MedicationInfoDisplayProps {
    medicationId: number | null; // Pass medication ID to fetch details
    medicationObject?: Medication | null; // Or pass the object directly if already available
    onClose?: () => void; // If used in a modal
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-8">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="ml-2 text-gray-600">Loading medication details...</p>
    </div>
);

const DetailItem: React.FC<{ label: string; value: string | number | boolean | null | undefined }> = ({ label, value }) => {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    return (
        <div>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
            </dd>
        </div>
    );
};

const MedicationInfoDisplay: React.FC<MedicationInfoDisplayProps> = ({ medicationId, medicationObject, onClose }) => {
    const [medication, setMedication] = useState<Medication | null>(medicationObject || null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (medicationObject) {
            setMedication(medicationObject);
            return;
        }

        if (medicationId) {
            setIsLoading(true);
            setError(null);
            getMedicationById(medicationId)
                .then(data => setMedication(data))
                .catch(err => {
                    console.error("Failed to fetch medication details:", err);
                    setError(err.message || "Could not load medication information.");
                })
                .finally(() => setIsLoading(false));
        } else {
            setMedication(null); // Clear if no ID or object
        }
    }, [medicationId, medicationObject]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <p className="text-red-600 bg-red-50 p-3 rounded text-center">{error}</p>;
    }

    if (!medication) {
        return <p className="text-gray-500 p-3 text-center">No medication details available.</p>;
    }

    return (
        <div className="p-1 sm:p-2">
            <div className="mb-4 pb-3 border-b border-gray-200">
                <h3 className="text-xl sm:text-2xl font-semibold text-primary leading-tight">
                    {medication.name}
                </h3>
                {medication.generic_name && medication.generic_name !== medication.name && (
                    <p className="text-sm text-gray-500">Generic: {medication.generic_name}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                    {medication.strength} {medication.dosage_form}
                    {medication.manufacturer && ` - By ${medication.manufacturer}`}
                </p>
            </div>

            <div className="space-y-4 text-sm">
                <DetailItem label="Description" value={medication.description} />
                <DetailItem label="Requires Prescription" value={medication.requires_prescription} />
                <DetailItem label="Potential Side Effects" value={medication.side_effects} />
                <DetailItem label="Contraindications (Do not take if)" value={medication.contraindications} />
                <DetailItem label="Storage Instructions" value={medication.storage_instructions} />
            </div>

            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-xs sm:text-sm">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ShieldExclamationIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                    </div>
                    <div className="ml-2.5">
                        <h4 className="font-semibold">Important Disclaimer</h4>
                        <p className="mt-0.5">
                            This information is for general reference only and may not be exhaustive. It is not a substitute for professional medical advice, diagnosis, or treatment.
                            <strong> Always consult your doctor or pharmacist</strong> for any questions regarding a medical condition or treatment and before taking any medication.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicationInfoDisplay;