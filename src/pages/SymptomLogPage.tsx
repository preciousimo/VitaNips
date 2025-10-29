// src/pages/SymptomLogPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { ShieldExclamationIcon as PageIcon } from '@heroicons/react/24/outline';
import { getSymptomLogs, createSymptomLog, updateSymptomLog, deleteSymptomLog } from '../api/healthLogs';
import { SymptomLog, SymptomPayload } from '../types/healthLogs';
import SymptomLogListItem from '../features/health/components/SymptomLogListItem';
import SymptomLogForm from '../features/health/components/SymptomLogForm';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { SkeletonList } from '../components/common/SkeletonLoader';
import ConfirmDialog from '../components/common/ConfirmDialog';

const SymptomLogPage: React.FC = () => {
    const [logs, setLogs] = useState<SymptomLog[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);

    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingLog, setEditingLog] = useState<SymptomLog | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
    
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const sortLogs = (data: SymptomLog[]): SymptomLog[] => {
        return [...data].sort((a, b) => new Date(b.date_experienced).getTime() - new Date(a.date_experienced).getTime());
    };

    const fetchLogs = useCallback(async (url: string | null = null, reset: boolean = true) => {
        if (url) setIsLoadingMore(true);
        else if (reset) { setIsLoading(true); setLogs([]); setNextPageUrl(null); setTotalCount(0); }
        setError(null);

        try {
            const response = await getSymptomLogs(url);
            const newLogs = response.results;
            setLogs(prev => sortLogs(url ? [...prev, ...newLogs] : newLogs));
            setNextPageUrl(response.next);
            if (reset || !url) setTotalCount(response.count);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load symptom logs.";
            setError(errorMessage);
        } finally { setIsLoading(false); setIsLoadingMore(false); }
    }, []);

    useEffect(() => { fetchLogs(null, true); }, [fetchLogs]);

    const handleAddClick = () => { setEditingLog(null); setShowFormModal(true); };
    const handleEditClick = (log: SymptomLog) => { setEditingLog(log); setShowFormModal(true); };
    const handleFormCancel = () => { setShowFormModal(false); setEditingLog(null); };

    const handleFormSubmit = async (payload: SymptomPayload, id?: number) => {
        setIsSubmittingForm(true);
        try {
            if (id) await updateSymptomLog(id, payload);
            else await createSymptomLog(payload);
            setShowFormModal(false); setEditingLog(null);
            await fetchLogs(null, true);
        } finally { setIsSubmittingForm(false); }
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
            await deleteSymptomLog(deleteId);
            toast.success("Symptom log entry deleted.", { id: toastId });
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
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                    <PageIcon className="h-7 w-7 mr-2 text-yellow-600" /> Symptom Log
                </h1>
                <button onClick={handleAddClick} className="btn-primary inline-flex items-center px-3 py-2 sm:px-4 text-sm">
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" /> Log Symptom
                </button>
            </div>

            <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingLog ? 'Edit Symptom Log' : 'Log New Symptom'}>
                <SymptomLogForm initialData={editingLog} onSubmit={handleFormSubmit} onCancel={handleFormCancel} isSubmitting={isSubmittingForm} />
            </Modal>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Symptom Log Entry"
                message="Are you sure you want to delete this symptom log entry? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
            />

            {/* Loading, Error, Empty States as in VitalsLogPage */}
            {isLoading && logs.length === 0 && <SkeletonList count={5} />}
            {error && <p className="text-red-600 text-center py-4 bg-red-50 rounded my-4">{error}</p>}
            {!isLoading && !error && logs.length === 0 && (
                 <div className="text-center py-16 bg-gray-50 rounded-lg shadow">
                    <PageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Symptoms Logged</h3>
                    <p className="mt-1 text-sm text-gray-500">Keep track of how you're feeling by logging your symptoms.</p>
                    <div className="mt-6">
                        <button onClick={handleAddClick} type="button" className="btn-primary inline-flex items-center">
                            <PlusIcon className="h-5 w-5 mr-2" /> Log Your First Symptom
                        </button>
                    </div>
                </div>
            )}


            {logs.length > 0 && (
                <div className="space-y-3">
                    {logs.map(log => <SymptomLogListItem key={log.id} log={log} onEdit={handleEditClick} onDelete={handleDelete} />)}
                </div>
            )}

            {/* Pagination as in VitalsLogPage */}
            {nextPageUrl && !isLoadingMore && (
                <div className="mt-8 text-center">
                    <button onClick={() => fetchLogs(nextPageUrl, false)} className="btn-primary px-6 py-2 text-sm">
                        Load More
                    </button>
                </div>
            )}
            {isLoadingMore && <p className="text-muted text-center py-4 text-sm">Loading more...</p>}
            {!isLoading && !nextPageUrl && totalCount > 0 && logs.length === totalCount && (
                <p className="text-center text-muted text-sm mt-6">All {totalCount} entries loaded.</p>
            )}
        </div>
    );
};
export default SymptomLogPage;