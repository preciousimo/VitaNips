// src/pages/PrescriptionsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUserPrescriptions } from '../api/prescriptions';
import { Prescription } from '../types/prescriptions';
import PrescriptionListItem from '../features/prescriptions/components/PrescriptionListItem';
import PrescriptionDetailView from '../features/prescriptions/components/PrescriptionDetailView';

const PrescriptionsPage: React.FC = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);

    const loadPrescriptions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setPrescriptions([]);
        setNextPageUrl(null);
        setTotalCount(0);
        setSelectedPrescriptionId(null);
        try {
            const response = await getUserPrescriptions();
            if (response && Array.isArray(response.results)) {
                 setPrescriptions(response.results.sort((a, b) =>
                     new Date(b.date_prescribed).getTime() - new Date(a.date_prescribed).getTime()
                 ));
                 setNextPageUrl(response.next);
                 setTotalCount(response.count);
            } else {
                console.warn("Received unexpected prescription response:", response);
                 setError("Failed to process prescription data.");
                 setPrescriptions([]);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load your prescriptions.");
            console.error(err);
            setPrescriptions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPrescriptions();
    }, [loadPrescriptions]);

    const handleSelectPrescription = (id: number) => {
        setSelectedPrescriptionId(prevId => (prevId === id ? null : id));
    };

    const selectedPrescription = prescriptions.find(p => p.id === selectedPrescriptionId);

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Prescriptions</h1>

            {isLoading ? (
                <p className="text-muted text-center py-4">Loading prescriptions...</p>
            ) : error ? (
                <p className="text-red-600 text-center py-4 bg-red-50 rounded">{error}</p>
            ) : (
                 <>
                    {totalCount > 0 && (
                        <p className="text-sm text-muted mb-4">Displaying {prescriptions.length} of {totalCount} prescriptions.</p>
                    )}

                    {prescriptions.length > 0 ? (
                        <ul className="space-y-0">
                            {prescriptions.map(presc => (
                                <React.Fragment key={presc.id}>
                                    <PrescriptionListItem
                                        prescription={presc}
                                        isSelected={selectedPrescriptionId === presc.id}
                                        onSelect={handleSelectPrescription}
                                    />
                                    {selectedPrescriptionId === presc.id && selectedPrescription && (
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
                 </>
            )}
        </div>
    );
};

export default PrescriptionsPage;