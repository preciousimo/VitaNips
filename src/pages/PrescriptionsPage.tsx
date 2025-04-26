// src/pages/PrescriptionsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUserPrescriptions } from '../api/prescriptions'; // Using the new API file
import { Prescription } from '../types/prescriptions'; // Using the new types file
import PrescriptionListItem from '../features/prescriptions/components/PrescriptionListItem';
import PrescriptionDetailView from '../features/prescriptions/components/PrescriptionDetailView';

const PrescriptionsPage: React.FC = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);

    const loadPrescriptions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getUserPrescriptions();
            setPrescriptions(data.sort((a, b) => new Date(b.date_prescribed).getTime() - new Date(a.date_prescribed).getTime())); // Sort newest first
            setSelectedPrescriptionId(null);
        } catch (err) {
            setError("Failed to load your prescriptions.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPrescriptions();
    }, [loadPrescriptions]);

    const handleSelectPrescription = (id: number) => {
        // If clicking the already selected one, deselect it, otherwise select the new one.
        setSelectedPrescriptionId(prevId => (prevId === id ? null : id));
    };

    // Find the full prescription object only if an ID is selected
    const selectedPrescription = prescriptions.find(p => p.id === selectedPrescriptionId);

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Prescriptions</h1>

            {isLoading ? (
                <p className="text-muted text-center py-4">Loading prescriptions...</p>
            ) : error ? (
                <p className="text-red-600 text-center py-4">{error}</p>
            ) : prescriptions.length > 0 ? (
                 <ul className="space-y-0"> {/* Let margin on item handle spacing */}
                    {prescriptions.map(presc => (
                        <React.Fragment key={presc.id}>
                            <PrescriptionListItem
                                prescription={presc}
                                isSelected={selectedPrescriptionId === presc.id}
                                onSelect={handleSelectPrescription}
                            />
                            {/* Conditionally render details immediately below the selected item */}
                            {selectedPrescriptionId === presc.id && selectedPrescription && (
                                // Use a key based on ID to force re-render on selection change if needed
                                <div key={`detail-${selectedPrescription.id}`}>
                                     <PrescriptionDetailView prescription={selectedPrescription} />
                                </div>
                             )}
                        </React.Fragment>
                    ))}
                </ul>
            ) : (
                 <div className="text-center py-10 bg-gray-50 rounded-md">
                    <p className="text-gray-600">You do not have any prescriptions recorded.</p>
                 </div>
            )}
        </div>
    );
};

export default PrescriptionsPage;