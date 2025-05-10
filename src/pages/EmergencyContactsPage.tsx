// src/pages/EmergencyContactsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { getUserEmergencyContacts, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../api/emergencyContacts';
import { EmergencyContact, EmergencyContactPayload } from '../types/user';
import EmergencyContactListItem from '../features/user/components/EmergencyContactListItem';
import EmergencyContactForm from '../features/user/components/EmergencyContactForm';
import Modal from '../components/common/Modal';

const EmergencyContactsPage: React.FC = () => {
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const loadInitialContacts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setContacts([]);
        setNextPageUrl(null);
        setTotalCount(0);
        try {
            const response = await getUserEmergencyContacts();
            if (response && Array.isArray(response.results)) {
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
            const response = await getUserEmergencyContacts(nextPageUrl);
            if (response && Array.isArray(response.results)) {
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
            await loadInitialContacts();
        } catch (err: any) {
            console.error("Failed to save contact:", err);
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
             await loadInitialContacts();
         } catch (err: any) {
             setError(err.message || "Failed to delete contact.");
             console.error(err);
         }
     };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Emergency Contacts</h1>
                <button onClick={handleAddClick} className="btn-primary inline-flex items-center px-4 py-2">
                    <PlusIcon className="h-5 w-5 mr-2" /> Add Contact
                </button>
            </div>
             <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 text-sm text-yellow-800">
                <ShieldExclamationIcon className="h-5 w-5 inline mr-1 mb-0.5"/>
                Please note: Information stored here is for your reference. Sharing it with emergency services requires separate action or features not yet implemented.
            </div>

            <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}>
                 <EmergencyContactForm initialData={editingContact} onSubmit={handleFormSubmit} onCancel={handleFormCancel} isSubmitting={isSubmitting}/>
            </Modal>

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