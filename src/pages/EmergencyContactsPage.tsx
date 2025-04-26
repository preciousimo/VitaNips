// src/pages/EmergencyContactsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { getUserEmergencyContacts, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../api/emergencyContacts';
import { EmergencyContact, EmergencyContactPayload } from '../types/user';
// Assuming PaginatedResponse is defined
// import { PaginatedResponse } from '../types/common';
import EmergencyContactListItem from '../features/user/components/EmergencyContactListItem';
import EmergencyContactForm from '../features/user/components/EmergencyContactForm';
import Modal from '../components/common/Modal';

const EmergencyContactsPage: React.FC = () => {
    // State for accumulated results
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    // State for pagination
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    // Initial loading and error state
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // Form/Modal state
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const loadInitialContacts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setContacts([]); // Reset
        setNextPageUrl(null);
        setTotalCount(0);
        try {
            // Fetch first page
            const response = await getUserEmergencyContacts(); // Add params if needed
            if (response && Array.isArray(response.results)) {
                // Sort contacts by name, for example
                setContacts(response.results.sort((a, b) => a.name.localeCompare(b.name)));
                setNextPageUrl(response.next);
                setTotalCount(response.count);
            } else {
                 console.warn("Received unexpected contacts response:", response);
                 setError("Failed to process contact data.");
                 setContacts([]);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load emergency contacts.");
            console.error(err);
            setContacts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMoreContacts = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            // Fetch next page
            const response = await getUserEmergencyContacts(nextPageUrl);
            if (response && Array.isArray(response.results)) {
                 // Append and re-sort
                 setContacts(prev => [...prev, ...response.results].sort((a, b) => a.name.localeCompare(b.name)));
                 setNextPageUrl(response.next);
            } else {
                 console.warn("Received unexpected contacts response on load more:", response);
                 setError("Failed to process additional contact data.");
                 setNextPageUrl(null);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load more contacts.");
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };


    useEffect(() => {
        loadInitialContacts();
    }, [loadInitialContacts]);

    // --- Form Handling (no changes needed here from original) ---
    const handleAddClick = () => { /* ... */ };
    const handleEditClick = (contact: EmergencyContact) => { /* ... */ };
    const handleFormCancel = () => { /* ... */ };
    const handleFormSubmit = async (payload: EmergencyContactPayload, id?: number) => {
        setIsSubmitting(true);
        try {
            if (id) {
                await updateEmergencyContact(id, payload);
            } else {
                await addEmergencyContact(payload);
            }
            setShowFormModal(false);
            setEditingContact(null);
            // Reload first page after add/edit to see changes potentially affecting sorting
            await loadInitialContacts();
        } catch (err: any) {
            console.error("Failed to save contact:", err);
            // Let the form display specific errors by re-throwing
            throw err;
        } finally {
             setIsSubmitting(false);
        }
    };
     const handleDelete = async (id: number) => {
         if (!window.confirm("Are you sure you want to delete this emergency contact?")) {
             return;
         }
         setError(null);
         try {
             await deleteEmergencyContact(id);
             // Reload first page after delete
             await loadInitialContacts();
         } catch (err: any) {
             setError(err.message || "Failed to delete contact.");
             console.error(err);
         }
     };
    // --- End Form Handling ---

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header and Add Button (no changes) */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Emergency Contacts</h1>
                <button onClick={handleAddClick} className="btn-primary inline-flex items-center px-4 py-2">
                    <PlusIcon className="h-5 w-5 mr-2" /> Add Contact
                </button>
            </div>
            {/* Important Note (no changes) */}
             <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 text-sm text-yellow-800">
                <ShieldExclamationIcon className="h-5 w-5 inline mr-1 mb-0.5"/>
                Please note: Information stored here is for your reference. Sharing it with emergency services requires separate action or features not yet implemented.
            </div>

            {/* Modal for Add/Edit Form (no changes) */}
            <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}>
                 <EmergencyContactForm initialData={editingContact} onSubmit={handleFormSubmit} onCancel={handleFormCancel} isSubmitting={isSubmitting}/>
            </Modal>

             {/* List Area */}
             <div>
                 {isLoading ? (
                     <p className="text-muted text-center py-4">Loading contacts...</p>
                 ) : error ? (
                     <p className="text-red-600 text-center py-4 bg-red-50 rounded">{error}</p>
                 ) : (
                     <>
                         {totalCount > 0 ? (
                            <p className="text-sm text-muted mb-4">Showing {contacts.length} of {totalCount} contacts.</p>
                         ) : null}

                         {contacts.length > 0 ? (
                             <ul className="space-y-0">
                                {contacts.map(contact => (
                                    <EmergencyContactListItem
                                        key={contact.id}
                                        contact={contact}
                                        onEdit={handleEditClick}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </ul>
                         ) : (
                             <div className="text-center py-10 bg-gray-50 rounded-md">
                                <p className="text-gray-600">You haven't added any emergency contacts yet.</p>
                                <button onClick={handleAddClick} className="mt-4 btn-primary inline-flex items-center">
                                    <PlusIcon className="h-5 w-5 mr-2" /> Add Your First Contact
                                </button>
                            </div>
                         )}

                        {/* Load More Button */}
                        {nextPageUrl && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={loadMoreContacts}
                                    disabled={isLoadingMore}
                                    className="btn-primary px-6 py-2 disabled:opacity-50"
                                >
                                    {isLoadingMore ? 'Loading...' : 'Load More Contacts'}
                                </button>
                            </div>
                        )}
                     </>
                 )}
            </div>

        </div>
    );
};

export default EmergencyContactsPage;