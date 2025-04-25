// src/pages/VaccinationsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { getUserVaccinations, addVaccination, updateVaccination, deleteVaccination } from '../api/vaccinations';
import { Vaccination, VaccinationPayload } from '../types/health';
import VaccinationListItem from '../features/health/components/VaccinationListItem';
import VaccinationForm from '../features/health/components/VaccinationForm';
import Modal from '../components/common/Modal';
// Import Loading/Error components if available

const VaccinationsPage: React.FC = () => {
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // For form submission state

    const loadVaccinations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getUserVaccinations();
            setVaccinations(data.sort((a, b) => new Date(b.date_administered).getTime() - new Date(a.date_administered).getTime())); // Sort newest first
        } catch (err) {
            setError("Failed to load vaccination records.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVaccinations();
    }, [loadVaccinations]);

    const handleAddClick = () => {
        setEditingVaccination(null); // Ensure we are adding, not editing
        setShowForm(true);
    };

    const handleEditClick = (vaccination: Vaccination) => {
        setEditingVaccination(vaccination);
        setShowForm(true);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingVaccination(null);
    };

    const handleFormSubmit = async (payload: VaccinationPayload, id?: number) => {
        setIsSubmitting(true);
        setError(null); // Clear previous errors
        try {
            if (id) {
                // Update existing
                await updateVaccination(id, payload);
            } else {
                // Add new
                await addVaccination(payload);
            }
            setShowForm(false); // Close form on success
            setEditingVaccination(null);
            await loadVaccinations(); // Reload the list
        } catch (err: any) {
            console.error("Failed to save vaccination:", err);
            // Re-throw the error to be caught by the form's error handler
            throw new Error(err.message || "Failed to save record. Please check the details and try again.");
        } finally {
             setIsSubmitting(false);
        }
    };

     const handleDelete = async (id: number) => {
        // Optional: Add a confirmation dialog here
        if (!window.confirm("Are you sure you want to delete this vaccination record?")) {
             return;
         }

         // Consider adding a loading state for deletion if needed
         setError(null);
         try {
             await deleteVaccination(id);
             await loadVaccinations(); // Refresh list after delete
         } catch (err) {
             setError("Failed to delete vaccination record.");
             console.error(err);
         }
     };


    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Vaccination Records</h1>
                <button
                    onClick={handleAddClick}
                    className="btn-primary inline-flex items-center px-4 py-2"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Record
                </button>
            </div>

            {/* Form Area (Conditional Rendering or Modal) */}
             {showForm && (
                 <div className="mb-6"> {/* Simple div, replace with Modal */}
                    <VaccinationForm
                        initialData={editingVaccination}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                        isSubmitting={isSubmitting}
                    />
                 </div>
             )}


            {/* List Area */}
            <div>
                {isLoading ? (
                    <p className="text-muted text-center py-4">Loading records...</p>
                ) : error ? (
                    <p className="text-red-600 text-center py-4">{error}</p>
                ) : vaccinations.length > 0 ? (
                     <ul className="space-y-0"> {/* Removed space-y, margin added to item */}
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
                    <p className="text-muted text-center py-10 bg-gray-50 rounded-md">
                        You haven't added any vaccination records yet.
                    </p>
                )}
            </div>
        </div>
    );
};

export default VaccinationsPage;