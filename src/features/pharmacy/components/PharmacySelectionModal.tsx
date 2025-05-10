// src/features/pharmacy/components/PharmacySelectionModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Pharmacy } from '../../../types/pharmacy';
import { getPharmacies } from '../../../api/pharmacy';
import Modal from '../../../components/common/Modal';

interface PharmacySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPharmacySelect: (pharmacyId: number) => void;
    title?: string;
}

const PharmacySelectionModal: React.FC<PharmacySelectionModalProps> = ({
    isOpen,
    onClose,
    onPharmacySelect,
    title = "Select Pharmacy"
}) => {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPharmacyId, setSelectedPharmacyId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchPharmacies(searchTerm, true);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const fetchPharmacies = useCallback(async (term: string, reset: boolean = false) => {
        setIsLoading(true);
        setError(null);
        if (reset) {
             setPharmacies([]);
             setNextPageUrl(null);
        }

        try {
            const params = { search: term };
            const response = await getPharmacies(params);
            if (response && Array.isArray(response.results)) {
                setPharmacies(reset ? response.results : prev => [...prev, ...response.results]);
                setNextPageUrl(response.next);
            } else {
                 setPharmacies(reset ? [] : pharmacies);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load pharmacies.");
        } finally {
            setIsLoading(false);
        }
    }, [pharmacies]);

     const loadMore = async () => {
        if (!nextPageUrl || isLoading) return;
         try {
             const response = await getPharmacies(nextPageUrl);
              if (response && Array.isArray(response.results)) {
                 setPharmacies(prev => [...prev, ...response.results]);
                 setNextPageUrl(response.next);
             }
         } catch(err) { /* handle error */ }
     }

    const handleSelect = (pharmacyId: number) => {
        setSelectedPharmacyId(pharmacyId);
    };

    const handleConfirm = () => {
        if (selectedPharmacyId !== null) {
            onPharmacySelect(selectedPharmacyId);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Search pharmacies by name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field w-full"
                />

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-2">
                    {isLoading && pharmacies.length === 0 && <p className='text-muted text-sm text-center'>Loading...</p>}
                    {!isLoading && pharmacies.length === 0 && <p className='text-muted text-sm text-center'>No pharmacies found.</p>}

                    {pharmacies.map(pharmacy => (
                        <div
                            key={pharmacy.id}
                            onClick={() => handleSelect(pharmacy.id)}
                            className={`p-2 rounded cursor-pointer hover:bg-primary-light/30 ${selectedPharmacyId === pharmacy.id ? 'bg-primary-light ring-2 ring-primary' : 'bg-gray-50'}`}
                        >
                            <p className="font-semibold">{pharmacy.name}</p>
                            <p className="text-xs text-muted">{pharmacy.address}</p>
                        </div>
                    ))}
                    {nextPageUrl && !isLoading && (
                         <button onClick={loadMore} className='text-blue-600 text-sm w-full text-center py-1 hover:underline'>Load More</button>
                     )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={selectedPharmacyId === null || isLoading}
                        className="btn-primary inline-flex justify-center px-4 py-2 text-sm font-medium disabled:opacity-50"
                    >
                        Confirm Selection
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PharmacySelectionModal;