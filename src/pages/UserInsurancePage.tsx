// src/pages/UserInsurancePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { getUserInsurances, addUserInsurance, updateUserInsurance, deleteUserInsurance } from '../api/insurance';
import { UserInsurance, UserInsurancePayload } from '../types/insurance';
import UserInsuranceCard from '../features/insurance/components/UserInsuranceCard';
import UserInsuranceForm from '../features/insurance/components/UserInsuranceForm';
import Modal from '../components/common/Modal';

const UserInsurancePage: React.FC = () => {
    const [insurances, setInsurances] = useState<UserInsurance[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingInsurance, setEditingInsurance] = useState<UserInsurance | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const sortInsurances = (data: UserInsurance[]) => {
         return data.sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            const nameA = a.plan?.provider?.name || '';
            const nameB = b.plan?.provider?.name || '';
            return nameA.localeCompare(nameB);
        });
    };

    const loadInitialInsurances = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setInsurances([]);
        setNextPageUrl(null);
        setTotalCount(0);
        try {
            const response = await getUserInsurances();
            if (response && Array.isArray(response.results)) {
                setInsurances(sortInsurances(response.results));
                setNextPageUrl(response.next);
                setTotalCount(response.count);
            } else {
                console.warn("Received unexpected insurance response:", response);
                setError("Failed to process insurance data.");
                setInsurances([]);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load your insurance records.");
            console.error(err);
            setInsurances([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

     const loadMoreInsurances = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            const response = await getUserInsurances(nextPageUrl);
            if (response && Array.isArray(response.results)) {
                 setInsurances(prev => sortInsurances([...prev, ...response.results]));
                 setNextPageUrl(response.next);
            } else {
                console.warn("Received unexpected insurance response on load more:", response);
                 setError("Failed to process additional insurance data.");
                 setNextPageUrl(null);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load more insurance plans.");
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        loadInitialInsurances();
    }, [loadInitialInsurances]);

    const handleAddClick = () => { /* ... */ };
    const handleEditClick = (insurance: UserInsurance) => { /* ... */ };
    const handleFormCancel = () => { /* ... */ };
    const handleFormSubmit = async (payload: UserInsurancePayload, id?: number) => {
         setIsSubmitting(true);
         try {
             if (id) {
                 await updateUserInsurance(id, payload);
             } else {
                 await addUserInsurance(payload);
             }
             setShowFormModal(false);
             setEditingInsurance(null);
             await loadInitialInsurances();
         } catch (err: any) {
             console.error("Failed to save insurance:", err);
             throw err;
         } finally {
              setIsSubmitting(false);
         }
     };
    const handleDelete = async (id: number) => {
         if (!window.confirm("Are you sure you want to remove this insurance plan?")) {
             return;
         }
         setError(null);
         try {
             await deleteUserInsurance(id);
             await loadInitialInsurances();
         } catch (err: any) {
             setError(err.message || "Failed to remove insurance plan.");
             console.error(err);
         }
     };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-gray-800">Your Insurance Plans</h1>
                 <button onClick={handleAddClick} className="btn-primary inline-flex items-center px-4 py-2">
                     <PlusIcon className="h-5 w-5 mr-2" /> Add Plan
                 </button>
            </div>

            <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingInsurance ? 'Edit Insurance Plan' : 'Add Insurance Plan'}>
                  <UserInsuranceForm initialData={editingInsurance} onSubmit={handleFormSubmit} onCancel={handleFormCancel} isSubmitting={isSubmitting}/>
            </Modal>

             <div>
                 {isLoading ? (
                     <p className="text-muted text-center py-4">Loading your insurance plans...</p>
                 ) : error ? (
                     <p className="text-red-600 text-center py-4 bg-red-50 rounded">{error}</p>
                 ) : (
                     <>
                        {totalCount > 0 ? (
                             <p className="text-sm text-muted mb-4">Showing {insurances.length} of {totalCount} plans.</p>
                        ) : null}

                         {insurances.length > 0 ? (
                             <div className="space-y-4">
                                {insurances.map(ins => (
                                    <UserInsuranceCard
                                        key={ins.id}
                                        insurance={ins}
                                        onEdit={handleEditClick}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                         ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-md">
                                 <p className="text-gray-600">You haven't added any insurance plans yet.</p>
                                 <button onClick={handleAddClick} className="mt-4 btn-primary inline-flex items-center">
                                    <PlusIcon className="h-5 w-5 mr-2" /> Add Your First Plan
                                 </button>
                             </div>
                         )}

                        {nextPageUrl && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={loadMoreInsurances}
                                    disabled={isLoadingMore}
                                    className="btn-primary px-6 py-2 disabled:opacity-50"
                                >
                                    {isLoadingMore ? 'Loading...' : 'Load More Plans'}
                                </button>
                            </div>
                        )}
                     </>
                 )}
             </div>

        </div>
    );
};

export default UserInsurancePage;