// src/pages/VitalsLogPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { ChartBarIcon } from '@heroicons/react/24/outline'; // Example icon
import { getVitalSigns, createVitalSign, updateVitalSign, deleteVitalSign } from '../api/healthLogs';
import { VitalSignLog, VitalSignPayload } from '../types/healthLogs';
import VitalSignLogListItem from '../features/health/components/VitalSignLogListItem';
import VitalSignForm from '../features/health/components/VitalSignForm';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { SkeletonList } from '../components/common/SkeletonLoader';
import ConfirmDialog from '../components/common/ConfirmDialog';

const VitalsLogPage: React.FC = () => {
    const [logs, setLogs] = useState<VitalSignLog[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);

    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingLog, setEditingLog] = useState<VitalSignLog | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
    
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const sortLogs = (data: VitalSignLog[]): VitalSignLog[] => {
        return [...data].sort((a, b) => new Date(b.date_recorded).getTime() - new Date(a.date_recorded).getTime());
    };

    const fetchLogs = useCallback(async (url: string | null = null, reset: boolean = true) => {
        if (url) setIsLoadingMore(true);
        else if (reset) {
            setIsLoading(true);
            setLogs([]);
            setNextPageUrl(null);
            setTotalCount(0);
        }
        setError(null);

        try {
            const response = await getVitalSigns(url);
            const newLogs = response.results;
            setLogs(prev => sortLogs(url ? [...prev, ...newLogs] : newLogs));
            setNextPageUrl(response.next);
            if (reset || !url) setTotalCount(response.count);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load vital signs.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs(null, true);
    }, [fetchLogs]);

    const handleAddClick = () => {
        setEditingLog(null);
        setShowFormModal(true);
    };
    const handleEditClick = (log: VitalSignLog) => {
        setEditingLog(log);
        setShowFormModal(true);
    };
    const handleFormCancel = () => {
        setShowFormModal(false);
        setEditingLog(null);
    };

    const handleFormSubmit = async (payload: VitalSignPayload, id?: number) => {
        setIsSubmittingForm(true);
        try {
            if (id) await updateVitalSign(id, payload);
            else await createVitalSign(payload);
            setShowFormModal(false);
            setEditingLog(null);
            await fetchLogs(null, true);
        } finally {
            setIsSubmittingForm(false);
        }
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowConfirmDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        const toastId = toast.loading("Deleting entry...");
        try {
            await deleteVitalSign(deleteId);
            toast.success("Vitals log entry deleted.", { id: toastId });
            setShowConfirmDialog(false);
            setDeleteId(null);
            await fetchLogs(null, true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete entry.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmDialog(false);
        setDeleteId(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                    <ChartBarIcon className="h-7 w-7 mr-2 text-blue-600" /> Vital Signs Log
                </h1>
                <button onClick={handleAddClick} className="btn-primary inline-flex items-center px-3 py-2 sm:px-4 text-sm">
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" /> Log Vitals
                </button>
            </div>

            <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingLog ? 'Edit Vitals Log' : 'Log New Vitals'}>
                <VitalSignForm initialData={editingLog} onSubmit={handleFormSubmit} onCancel={handleFormCancel} isSubmitting={isSubmittingForm} />
            </Modal>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Vitals Log Entry"
                message="Are you sure you want to delete this vitals log entry? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
            />

            {isLoading && logs.length === 0 && (
                <SkeletonList count={5} />
            )}

            {error && (
                <p className="text-red-500 text-center py-4 bg-red-50 rounded my-4">
                    {error}
                </p>
            )}

            {!isLoading && !error && logs.length === 0 && (
                <p className="text-center py-4 text-sm text-muted">No vitals logged yet.</p>
            )}

            {logs.length > 0 && (
                <div className="space-y-3">
                    {logs.map(log => (
                        <VitalSignLogListItem
                            key={log.id}
                            log={log}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {nextPageUrl && !isLoadingMore && (
                <button
                    onClick={() => fetchLogs(nextPageUrl, false)}
                    className="mt-4 mx-auto block btn-secondary"
                >
                    Load More
                </button>
            )}

            {isLoadingMore && (
                <p className="text-muted text-center py-4 text-sm">Loading more...</p>
            )}

            {!isLoading && !nextPageUrl && totalCount > 0 && logs.length === totalCount && (
                <p className="text-center text-muted text-sm mt-6">
                    All {totalCount} entries loaded.
                </p>
            )}

        </div>
    );
};
export default VitalsLogPage;