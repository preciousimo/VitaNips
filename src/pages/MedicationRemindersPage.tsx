// src/pages/MedicationRemindersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import {
    getMedicationReminders,
    createMedicationReminder,
    updateMedicationReminder,
    deleteMedicationReminder,
} from '../api/medicationReminders';
import { MedicationReminder, MedicationReminderPayload } from '../types/reminders';
import MedicationReminderListItem from '../features/pharmacy/components/MedicationReminderListItem';
import MedicationReminderForm from '../features/pharmacy/components/MedicationReminderForm';
import Modal from '../components/common/Modal'; // Assuming you have a Modal component

const MedicationRemindersPage: React.FC = () => {
    const [reminders, setReminders] = useState<MedicationReminder[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingReminder, setEditingReminder] = useState<MedicationReminder | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const sortReminders = (data: MedicationReminder[]) => {
        return data.sort((a, b) => {
            // Sort by active first, then by time, then by medication name
            if (a.is_active && !b.is_active) return -1;
            if (!a.is_active && b.is_active) return 1;
            const timeA = a.time_of_day;
            const timeB = b.time_of_day;
            if (timeA < timeB) return -1;
            if (timeA > timeB) return 1;
            return a.medication.name.localeCompare(b.medication.name);
        });
    };

    const fetchReminders = useCallback(async (url: string | null = null) => {
        if (url) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
            setReminders([]); // Reset for initial load
        }
        setError(null);

        try {
            const response = await getMedicationReminders(url);
            if (response && Array.isArray(response.results)) {
                const sorted = sortReminders(response.results);
                setReminders(prev => url ? sortReminders([...prev, ...sorted]) : sorted);
                setNextPageUrl(response.next);
            } else {
                console.warn("Unexpected reminders response:", response);
                setError("Failed to process reminders.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to load medication reminders.");
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchReminders();
    }, [fetchReminders]);

    const handleAddClick = () => {
        setEditingReminder(null);
        setShowFormModal(true);
    };

    const handleEditClick = (reminder: MedicationReminder) => {
        setEditingReminder(reminder);
        setShowFormModal(true);
    };

    const handleFormCancel = () => {
        setShowFormModal(false);
        setEditingReminder(null);
    };

    const handleFormSubmit = async (payload: MedicationReminderPayload, id?: number) => {
        setIsSubmitting(true);
        try {
            if (id) {
                await updateMedicationReminder(id, payload);
            } else {
                await createMedicationReminder(payload);
            }
            setShowFormModal(false);
            setEditingReminder(null);
            await fetchReminders(); // Refresh list
        } catch (err: any) {
            console.error("Failed to save reminder from page:", err);
            // Error state will be handled by the form, but we might want a page-level error too
            throw err; // Re-throw to let form handle its own error display
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this reminder?")) {
            return;
        }
        setError(null);
        try {
            await deleteMedicationReminder(id);
            await fetchReminders(); // Refresh list
        } catch (err: any) {
            setError(err.message || "Failed to delete reminder.");
            console.error(err);
        }
    };
    
    const handleToggleActive = async (id: number, isActive: boolean) => {
        try {
            await updateMedicationReminder(id, { is_active: isActive });
            await fetchReminders(); // Refresh the list
        } catch (error) {
            console.error("Failed to toggle reminder active state", error);
            setError("Could not update reminder status. Please try again.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Medication Reminders</h1>
                <button
                    onClick={handleAddClick}
                    className="btn-primary inline-flex items-center px-4 py-2"
                >
                    <PlusIcon className="h-5 w-5 mr-2" /> Add Reminder
                </button>
            </div>

            <Modal
                isOpen={showFormModal}
                onClose={handleFormCancel}
                title={editingReminder ? 'Edit Medication Reminder' : 'Add New Medication Reminder'}
            >
                <MedicationReminderForm
                    initialData={editingReminder}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    isSubmitting={isSubmitting}
                />
            </Modal>

            {isLoading && reminders.length === 0 && <p className="text-muted text-center py-4">Loading reminders...</p>}
            {error && <p className="text-red-600 text-center py-4 bg-red-50 p-3 rounded-md">{error}</p>}

            {!isLoading && !error && reminders.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-md">
                    <p className="text-gray-600">You have no medication reminders set up yet.</p>
                    <button onClick={handleAddClick} className="mt-4 btn-primary inline-flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" /> Add Your First Reminder
                    </button>
                </div>
            )}

            {reminders.length > 0 && (
                <ul className="space-y-0">
                    {reminders.map(reminder => (
                        <MedicationReminderListItem
                            key={reminder.id}
                            reminder={reminder}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                            onToggleActive={handleToggleActive}
                        />
                    ))}
                </ul>
            )}

            {nextPageUrl && !isLoadingMore && (
                <div className="mt-8 text-center">
                    <button onClick={() => fetchReminders(nextPageUrl)} className="btn-primary px-6 py-2">
                        Load More
                    </button>
                </div>
            )}
            {isLoadingMore && <p className="text-muted text-center py-4">Loading more reminders...</p>}
        </div>
    );
};

export default MedicationRemindersPage;