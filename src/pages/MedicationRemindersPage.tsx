// src/pages/MedicationRemindersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { BellAlertIcon, PlusIcon } from '@heroicons/react/24/solid';
import {
    getMedicationReminders,
    createMedicationReminder,
    updateMedicationReminder,
    deleteMedicationReminder,
} from '../api/medicationReminders';
import { MedicationReminder, MedicationReminderPayload } from '../types/reminders';
import MedicationReminderListItem from '../features/pharmacy/components/MedicationReminderListItem';
import MedicationReminderForm from '../features/pharmacy/components/MedicationReminderForm';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

const MedicationRemindersPage: React.FC = () => {
    const [reminders, setReminders] = useState<MedicationReminder[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);

    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingReminder, setEditingReminder] = useState<MedicationReminder | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

    const sortReminders = (data: MedicationReminder[]): MedicationReminder[] => {
        return [...data].sort((a, b) => {
            if (a.is_active && !b.is_active) return -1;
            if (!a.is_active && b.is_active) return 1;
            const timeA = a.time_of_day || "00:00";
            const timeB = b.time_of_day || "00:00";
            if (timeA < timeB) return -1;
            if (timeA > timeB) return 1;
            return (a.medication_display?.name || '').localeCompare(b.medication_display?.name || '');
        });
    };

    const fetchReminders = useCallback(async (url: string | null = null, reset: boolean = true) => {
        if (url) {
            setIsLoadingMore(true);
        } else if (reset) {
            setIsLoading(true);
            setReminders([]);
            setNextPageUrl(null);
            setTotalCount(0);
        }
        setError(null);

        try {
            const response = await getMedicationReminders(url);
            if (response && Array.isArray(response.results)) {
                const newReminders = response.results;
                setReminders(prev => sortReminders(url ? [...prev, ...newReminders] : newReminders));
                setNextPageUrl(response.next);
                if (reset || !url) { // Set total count on initial load or full reset
                    setTotalCount(response.count);
                }
            } else {
                console.warn("Unexpected reminders response:", response);
                setError("Failed to process reminders data.");
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
        fetchReminders(null, true); // Initial load
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
        setIsSubmittingForm(true); // Use dedicated state for form submission
        try {
            if (id) {
                await updateMedicationReminder(id, payload);
            } else {
                await createMedicationReminder(payload);
            }
            setShowFormModal(false);
            setEditingReminder(null);
            await fetchReminders(null, true); // Refresh list completely after add/edit
        } catch (err: any) {
            console.error("Failed to save reminder from page handler:", err);
            // Error is displayed within the form, but re-throwing allows form to catch it.
            throw err;
        } finally {
            setIsSubmittingForm(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this reminder? This action cannot be undone.")) {
            return;
        }
        const toastId = toast.loading("Deleting reminder...");
        setError(null);
        try {
            await deleteMedicationReminder(id);
            toast.success("Reminder deleted successfully.", { id: toastId });
            await fetchReminders(null, true); // Refresh list
        } catch (err: any) {
            const errorMsg = err.message || "Failed to delete reminder.";
            setError(errorMsg);
            toast.error(errorMsg, { id: toastId });
            console.error(err);
        }
    };

    const handleToggleActive = async (id: number, newActiveState: boolean) => {
        const originalReminders = [...reminders];
        setReminders(prev => prev.map(r => r.id === id ? { ...r, is_active: newActiveState } : r)); // Optimistic update

        try {
            await updateMedicationReminder(id, { is_active: newActiveState });
            toast.success(`Reminder ${newActiveState ? 'activated' : 'deactivated'}.`);
            // Optionally re-fetch to ensure consistency if backend has other side effects
            // await fetchReminders(null, true);
        } catch (error: any) {
            console.error("Failed to toggle reminder active state", error);
            setReminders(originalReminders); // Revert optimistic update
            toast.error("Could not update reminder status. Please try again.");
        }
    };


    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Medication Reminders</h1>
                <button
                    onClick={handleAddClick}
                    className="btn-primary inline-flex items-center px-3 py-2 sm:px-4 text-sm sm:text-base"
                >
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" /> Add Reminder
                </button>
            </div>

            <Modal
                isOpen={showFormModal}
                onClose={handleFormCancel}
                title={editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
            >
                <MedicationReminderForm
                    initialData={editingReminder}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    isSubmitting={isSubmittingForm}
                />
            </Modal>

            {isLoading && reminders.length === 0 && (
                <div className="text-center py-10 text-muted">
                    <svg className="mx-auto h-12 w-12 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v3m0 9v3m-4.5-4.5h3m9 0h3M5.636 5.636l2.122 2.122m9.9 9.9l2.122 2.122M5.636 18.364l2.122-2.122m9.9-9.9l2.122-2.122" />
                    </svg>
                    Loading reminders...
                </div>
            )}
            {error && <p className="text-red-600 text-center py-4 bg-red-50 p-3 rounded-md my-4">{error}</p>}

            {!isLoading && !error && reminders.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-lg shadow">
                    <BellAlertIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Reminders Yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Stay on track with your medications by adding a reminder.</p>
                    <div className="mt-6">
                        <button onClick={handleAddClick} type="button" className="btn-primary inline-flex items-center">
                            <PlusIcon className="h-5 w-5 mr-2" /> Add Your First Reminder
                        </button>
                    </div>
                </div>
            )}

            {reminders.length > 0 && (
                <div className="space-y-3"> {/* Use space-y instead of ul for direct children */}
                    {reminders.map(reminder => (
                        <MedicationReminderListItem
                            key={reminder.id}
                            reminder={reminder}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                            onToggleActive={handleToggleActive}
                        />
                    ))}
                </div>
            )}

            {nextPageUrl && !isLoadingMore && (
                <div className="mt-8 text-center">
                    <button onClick={() => fetchReminders(nextPageUrl, false)} className="btn-primary px-6 py-2 text-sm">
                        Load More Reminders
                    </button>
                </div>
            )}
            {isLoadingMore && <p className="text-muted text-center py-4 text-sm">Loading more...</p>}
            {!isLoading && !nextPageUrl && totalCount > 0 && reminders.length === totalCount && (
                <p className="text-center text-muted text-sm mt-6">All {totalCount} reminders loaded.</p>
            )}
        </div>
    );
};

export default MedicationRemindersPage;