// src/pages/EmergencyContactsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { getUserEmergencyContacts, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../api/emergencyContacts';
import { EmergencyContact, EmergencyContactPayload } from '../types/user';
import EmergencyContactListItem from '../features/user/components/EmergencyContactListItem';
import EmergencyContactForm from '../features/user/components/EmergencyContactForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { triggerSOS } from '../api/emergency';

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
    
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // SOS state
    const [showSOSConfirm, setShowSOSConfirm] = useState<boolean>(false);
    const [isSendingSOS, setIsSendingSOS] = useState<boolean>(false);

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
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load emergency contacts.";
            setError(errorMessage);
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
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load more contacts.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        loadInitialContacts();
    }, [loadInitialContacts]);

    const handleAddClick = () => { /* ... */ };
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
        } catch (err) {
            console.error("Failed to save contact:", err);
            throw err;
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
            await deleteEmergencyContact(deleteId);
            setShowConfirmDialog(false);
            setDeleteId(null);
            await loadInitialContacts();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete contact.";
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

    // SOS handlers
    const handleSOSClick = () => {
        setShowSOSConfirm(true);
    };

    const handleConfirmSOS = () => {
        setShowSOSConfirm(false);
        setIsSendingSOS(true);
        const toastId = toast.loading('Getting your location and sending SOS...');

        if (!navigator.geolocation) {
            toast.error('Geolocation not supported by your browser.', { id: toastId });
            setIsSendingSOS(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await triggerSOS({ latitude, longitude });
                    toast.success(res.status || 'SOS alert sent to your contacts.', { id: toastId, duration: 5000 });
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Failed to send SOS. Please try again.';
                    toast.error(msg, { id: toastId });
                } finally {
                    setIsSendingSOS(false);
                }
            },
            (geoError) => {
                let msg = 'Could not get location.';
                switch (geoError.code) {
                    case geoError.PERMISSION_DENIED: msg = 'Location permission denied.'; break;
                    case geoError.POSITION_UNAVAILABLE: msg = 'Location information is unavailable.'; break;
                    case geoError.TIMEOUT: msg = 'Location request timed out.'; break;
                }
                toast.error(msg, { id: toastId });
                setIsSendingSOS(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const handleCancelSOS = () => setShowSOSConfirm(false);

    return (
        <div className="max-w-3xl mx-auto">
            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Emergency Contact"
                message="Are you sure you want to delete this emergency contact? This action cannot be undone."
                confirmText="Delete Contact"
                cancelText="Cancel"
                isLoading={isDeleting}
            />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Emergency Contacts</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleSOSClick}
                        disabled={isSendingSOS}
                        className={`inline-flex items-center px-4 py-2 rounded-md shadow ${isSendingSOS ? 'bg-yellow-500 cursor-wait' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                        title="Send SOS alert to your emergency contacts"
                    >
                        <ShieldExclamationIcon className="h-5 w-5 mr-2" /> {isSendingSOS ? 'Sending SOS...' : 'Send SOS'}
                    </button>
                    <button onClick={handleAddClick} className="btn-primary inline-flex items-center px-4 py-2">
                        <PlusIcon className="h-5 w-5 mr-2" /> Add Contact
                    </button>
                </div>
            </div>
             <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 text-sm text-yellow-800">
                <ShieldExclamationIcon className="h-5 w-5 inline mr-1 mb-0.5"/>
                Tip: Keep your emergency contacts up to date. Use the "Send SOS" button to alert them with your current location in an emergency.
            </div>

            <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}>
                 <EmergencyContactForm initialData={editingContact} onSubmit={handleFormSubmit} onCancel={handleFormCancel} isSubmitting={isSubmitting}/>
            </Modal>

             <div>

            {/* SOS Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showSOSConfirm}
                onClose={handleCancelSOS}
                onConfirm={handleConfirmSOS}
                title="Confirm SOS Alert"
                message="Are you sure you want to send an SOS alert to all your emergency contacts with your current location?"
                confirmText="Send SOS"
                cancelText="Cancel"
                isLoading={isSendingSOS}
            />
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
                                        onEdit={() => {/* TODO: Implement edit functionality */}}
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