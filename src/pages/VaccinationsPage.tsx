// src/pages/VaccinationsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { getUserVaccinations, addVaccination, updateVaccination, deleteVaccination } from '../api/vaccinations';
import { Vaccination, VaccinationPayload } from '../types/health';
import VaccinationListItem from '../features/health/components/VaccinationListItem';
import VaccinationForm from '../features/health/components/VaccinationForm';
import Modal from '../components/common/Modal';
import { SkeletonList } from '../components/common/SkeletonLoader';
import ConfirmDialog from '../components/common/ConfirmDialog';

const VaccinationsPage: React.FC = () => {
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const sortVaccinations = (data: Vaccination[]) => {
        return data.sort((a, b) =>
            new Date(b.date_administered).getTime() - new Date(a.date_administered).getTime()
        );
    };

    const loadInitialVaccinations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setVaccinations([]);
        setNextPageUrl(null);
        setTotalCount(0);
        try {
            const response = await getUserVaccinations();
            if (response && Array.isArray(response.results)) {
                 setVaccinations(sortVaccinations(response.results));
                 setNextPageUrl(response.next);
                 setTotalCount(response.count);
            } else {
                 console.warn("Received unexpected vaccination response:", response);
                 setError("Failed to process vaccination data.");
                 setVaccinations([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load vaccination records.";
            setError(errorMessage);
            console.error(err);
            setVaccinations([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMoreVaccinations = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            const response = await getUserVaccinations(nextPageUrl);
             if (response && Array.isArray(response.results)) {
                  setVaccinations(prev => sortVaccinations([...prev, ...response.results]));
                  setNextPageUrl(response.next);
             } else {
                 console.warn("Received unexpected vaccination response on load more:", response);
                  setError("Failed to process additional vaccination data.");
                  setNextPageUrl(null);
             }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load more records.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        loadInitialVaccinations();
    }, [loadInitialVaccinations]);

     const handleAddClick = () => {
         setEditingVaccination(null);
         setShowFormModal(true);
     };
     const handleEditClick = (vaccination: Vaccination) => {
         setEditingVaccination(vaccination);
         setShowFormModal(true);
     };
     const handleFormCancel = () => {
         setShowFormModal(false);
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
             setShowFormModal(false);
             setEditingVaccination(null);
             await loadInitialVaccinations();
         } catch (err) {
             console.error("Failed to save vaccination:", err);
             const errorMessage = err instanceof Error ? err.message : "Failed to save record. Please check details.";
             throw new Error(errorMessage);
         } finally {
              setIsSubmitting(false);
         }
     };
      const handleDelete = (id: number) => {
          setDeleteId(id);
          setShowConfirmDialog(true);
      };

      const handleConfirmDelete = async () => {
          if (!deleteId) return;
          setIsDeleting(true);
          setError(null);
          try {
              await deleteVaccination(deleteId);
              setShowConfirmDialog(false);
              setDeleteId(null);
              await loadInitialVaccinations();
          } catch (err) {
              const errorMessage = err instanceof Error ? err.message : "Failed to delete vaccination record.";
              setError(errorMessage);
              console.error(err);
          } finally {
              setIsDeleting(false);
          }
      };

      const handleCancelDelete = () => {
          setShowConfirmDialog(false);
          setDeleteId(null);
      };

    return (
        <div className="max-w-3xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-gray-800">Vaccination Records</h1>
                 <button onClick={handleAddClick} className="btn-primary inline-flex items-center px-4 py-2">
                     <PlusIcon className="h-5 w-5 mr-2" /> Add Record
                 </button>
             </div>

              <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingVaccination ? 'Edit Vaccination Record' : 'Add Vaccination Record'}>
                  <VaccinationForm
                      initialData={editingVaccination}
                      onSubmit={handleFormSubmit}
                      onCancel={handleFormCancel}
                      isSubmitting={isSubmitting}
                  />
              </Modal>

              <ConfirmDialog
                  isOpen={showConfirmDialog}
                  onClose={handleCancelDelete}
                  onConfirm={handleConfirmDelete}
                  title="Delete Vaccination Record"
                  message="Are you sure you want to delete this vaccination record? This action cannot be undone."
                  confirmText="Delete"
                  cancelText="Cancel"
                  isLoading={isDeleting}
              />

             <div>
                 {isLoading ? (
                     <SkeletonList count={4} />
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