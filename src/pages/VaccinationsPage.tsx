// src/pages/VaccinationsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { getUserVaccinations, addVaccination, updateVaccination, deleteVaccination } from '../api/vaccinations';
import { Vaccination, VaccinationPayload } from '../types/health';
// Assuming PaginatedResponse is defined
// import { PaginatedResponse } from '../types/common';
import VaccinationListItem from '../features/health/components/VaccinationListItem';
import VaccinationForm from '../features/health/components/VaccinationForm';
import Modal from '../components/common/Modal';

const VaccinationsPage: React.FC = () => {
     // State for accumulated results
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
     // State for pagination
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
     // Initial loading and error state
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // Form/Modal state
    const [showFormModal, setShowFormModal] = useState<boolean>(false); // Changed from showForm
    const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const sortVaccinations = (data: Vaccination[]) => {
        // Sort newest first by date administered
        return data.sort((a, b) =>
            new Date(b.date_administered).getTime() - new Date(a.date_administered).getTime()
        );
    };

    const loadInitialVaccinations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setVaccinations([]); // Reset
        setNextPageUrl(null);
        setTotalCount(0);
        try {
            // Fetch first page
            const response = await getUserVaccinations(); // Add params if needed
            if (response && Array.isArray(response.results)) {
                 setVaccinations(sortVaccinations(response.results));
                 setNextPageUrl(response.next);
                 setTotalCount(response.count);
            } else {
                 console.warn("Received unexpected vaccination response:", response);
                 setError("Failed to process vaccination data.");
                 setVaccinations([]);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load vaccination records.");
            console.error(err);
            setVaccinations([]);
        } finally {
            setIsLoading(false);
        }
    }, []); // sortVaccinations stable

    const loadMoreVaccinations = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            // Fetch next page
            const response = await getUserVaccinations(nextPageUrl);
             if (response && Array.isArray(response.results)) {
                  // Append and re-sort
                  setVaccinations(prev => sortVaccinations([...prev, ...response.results]));
                  setNextPageUrl(response.next);
             } else {
                 console.warn("Received unexpected vaccination response on load more:", response);
                  setError("Failed to process additional vaccination data.");
                  setNextPageUrl(null);
             }
        } catch (err: any) {
            setError(err.message || "Failed to load more records.");
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };


    useEffect(() => {
        loadInitialVaccinations();
    }, [loadInitialVaccinations]);

    // --- Form Handling ---
     const handleAddClick = () => {
         setEditingVaccination(null);
         setShowFormModal(true); // Use modal state
     };
     const handleEditClick = (vaccination: Vaccination) => {
         setEditingVaccination(vaccination);
         setShowFormModal(true); // Use modal state
     };
     const handleFormCancel = () => {
         setShowFormModal(false); // Use modal state
         setEditingVaccination(null);
     };
     const handleFormSubmit = async (payload: VaccinationPayload, id?: number) => {
         setIsSubmitting(true);
         setError(null);
         try {
             if (id) {
                 await updateVaccination(id, payload);
             } else {
                 await addVaccination(payload);
             }
             setShowFormModal(false); // Use modal state
             setEditingVaccination(null);
             // Reload first page after add/edit
             await loadInitialVaccinations();
         } catch (err: any) {
             console.error("Failed to save vaccination:", err);
             // Re-throw for the form to display specific errors
             throw new Error(err.message || "Failed to save record. Please check details.");
         } finally {
              setIsSubmitting(false);
         }
     };
      const handleDelete = async (id: number) => {
          if (!window.confirm("Are you sure you want to delete this vaccination record?")) {
              return;
          }
          setError(null);
          try {
              await deleteVaccination(id);
              // Reload first page after delete
              await loadInitialVaccinations();
          } catch (err: any) {
              setError(err.message || "Failed to delete vaccination record.");
              console.error(err);
          }
      };
     // --- End Form Handling ---


    return (
        <div className="max-w-3xl mx-auto">
            {/* Header and Add Button */}
             <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-gray-800">Vaccination Records</h1>
                 <button onClick={handleAddClick} className="btn-primary inline-flex items-center px-4 py-2">
                     <PlusIcon className="h-5 w-5 mr-2" /> Add Record
                 </button>
             </div>

             {/* Form Area (Now using Modal) */}
              <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingVaccination ? 'Edit Vaccination Record' : 'Add Vaccination Record'}>
                  <VaccinationForm
                      initialData={editingVaccination}
                      onSubmit={handleFormSubmit}
                      onCancel={handleFormCancel}
                      isSubmitting={isSubmitting}
                  />
              </Modal>

            {/* List Area */}
             <div>
                 {isLoading ? (
                     <p className="text-muted text-center py-4">Loading records...</p>
                 ) : error ? (
                     <p className="text-red-600 text-center py-4 bg-red-50 rounded">{error}</p>
                 ) : (
                      <>
                        {totalCount > 0 ? (
                              <p className="text-sm text-muted mb-4">Showing {vaccinations.length} of {totalCount} records.</p>
                         ) : null}

                         {vaccinations.length > 0 ? (
                             <ul className="space-y-0">
                                {vaccinations.map(vac => (
                                    <VaccinationListItem
                                        key={vac.id}
                                        vaccination={vac}
                                        onEdit={handleEditClick}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </ul>
                         ) : (
                             <div className="text-center py-10 bg-gray-50 rounded-md">
                                 <p className="text-gray-600">You haven't added any vaccination records yet.</p>
                             </div>
                         )}

                        {/* Load More Button */}
                        {nextPageUrl && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={loadMoreVaccinations}
                                    disabled={isLoadingMore}
                                    className="btn-primary px-6 py-2 disabled:opacity-50"
                                >
                                    {isLoadingMore ? 'Loading...' : 'Load More Records'}
                                </button>
                            </div>
                        )}
                      </>
                 )}
             </div>

        </div>
    );
};

export default VaccinationsPage;