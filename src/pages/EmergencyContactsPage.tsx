// src/pages/EmergencyContactsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { getUserEmergencyContacts, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../api/emergencyContacts';
import { EmergencyContact, EmergencyContactPayload } from '../types/user';
import EmergencyContactListItem from '../features/user/components/EmergencyContactListItem';
import EmergencyContactForm from '../features/user/components/EmergencyContactForm';
import Modal from '../components/common/Modal'; // Re-use the Modal component

const EmergencyContactsPage: React.FC = () => {
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const loadContacts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getUserEmergencyContacts();
            setContacts(data); // Sort if needed, e.g., by name
        } catch (err) {
            setError("Failed to load emergency contacts.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadContacts();
    }, [loadContacts]);

    const handleAddClick = () => {
        setEditingContact(null);
        setShowFormModal(true);
    };

    const handleEditClick = (contact: EmergencyContact) => {
        setEditingContact(contact);
        setShowFormModal(true);
    };

    const handleFormCancel = () => {
        setShowFormModal(false);
        setEditingContact(null);
    };

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
            await loadContacts(); // Reload list
        } catch (err: any) {
            console.error("Failed to save contact:", err);
            throw err; // Let form handle displaying
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
             await loadContacts(); // Refresh list
         } catch (err) {
             setError("Failed to delete contact.");
             console.error(err);
         }
     };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Emergency Contacts</h1>
                <button
                    onClick={handleAddClick}
                    className="btn-primary inline-flex items-center px-4 py-2"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Contact
                </button>
            </div>

             {/* Important Note */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 text-sm text-yellow-800">
                <ShieldExclamationIcon className="h-5 w-5 inline mr-1 mb-0.5"/>
                Please note: Information stored here is for your reference. Sharing it with emergency services requires separate action or features not yet implemented.
            </div>


            {/* Modal for Add/Edit Form */}
            <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}>
                 <EmergencyContactForm
                    initialData={editingContact}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    isSubmitting={isSubmitting}
                />
            </Modal>

            {/* List Area */}
            <div>
                {isLoading ? (
                    <p className="text-muted text-center py-4">Loading contacts...</p>
                ) : error ? (
                    <p className="text-red-600 text-center py-4">{error}</p>
                ) : contacts.length > 0 ? (
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
            </div>
        </div>
    );
};

export default EmergencyContactsPage;