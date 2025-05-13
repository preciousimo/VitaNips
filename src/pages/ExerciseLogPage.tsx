// src/pages/ExerciseLogPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { FireIcon as PageIcon } from '@heroicons/react/24/outline';
import { getExerciseLogs, createExerciseLog, updateExerciseLog, deleteExerciseLog } from '../api/healthLogs';
import { ExerciseLog, ExercisePayload } from '../types/healthLogs';
import ExerciseLogListItem from '../features/health/components/ExerciseLogListItem';
import ExerciseLogForm from '../features/health/components/ExerciseLogForm';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

const ExerciseLogPage: React.FC = () => {
    const [logs, setLogs] = useState<ExerciseLog[]>([]);
    // ... (isLoading, error, nextPageUrl, isLoadingMore, totalCount states) ...
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);

    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingLog, setEditingLog] = useState<ExerciseLog | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

    const sortLogs = (data: ExerciseLog[]): ExerciseLog[] => {
        return [...data].sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
    };

    const fetchLogs = useCallback(async (url: string | null = null, reset: boolean = true) => {
        // ... (fetch logic using getExerciseLogs) ...
        if (url) setIsLoadingMore(true);
        else if (reset) { setIsLoading(true); setLogs([]); setNextPageUrl(null); setTotalCount(0); }
        setError(null);
        try {
            const response = await getExerciseLogs(url);
            const newLogs = response.results;
            setLogs(prev => sortLogs(url ? [...prev, ...newLogs] : newLogs));
            setNextPageUrl(response.next);
            if (reset || !url) setTotalCount(response.count);
        } catch (err: any) { setError(err.message || "Failed to load exercise logs.");
        } finally { setIsLoading(false); setIsLoadingMore(false); }
    }, []);

    useEffect(() => { fetchLogs(null, true); }, [fetchLogs]);

    const handleAddClick = () => { setEditingLog(null); setShowFormModal(true); };
    const handleEditClick = (log: ExerciseLog) => { setEditingLog(log); setShowFormModal(true); };
    const handleFormCancel = () => { setShowFormModal(false); setEditingLog(null); };

    const handleFormSubmit = async (payload: ExercisePayload, id?: number) => {
        // ... (submit logic using createExerciseLog/updateExerciseLog) ...
        setIsSubmittingForm(true);
        try {
            if (id) await updateExerciseLog(id, payload);
            else await createExerciseLog(payload);
            setShowFormModal(false); setEditingLog(null);
            await fetchLogs(null, true);
        } catch (err) { throw err;
        } finally { setIsSubmittingForm(false); }
    };

    const handleDelete = async (id: number) => {
        // ... (delete logic using deleteExerciseLog) ...
        if (!window.confirm("Delete this exercise log entry?")) return;
        const toastId = toast.loading("Deleting entry...");
        try {
            await deleteExerciseLog(id);
            toast.success("Exercise log entry deleted.", { id: toastId });
            await fetchLogs(null, true);
        } catch (err: any) { toast.error(err.message || "Failed to delete entry.", { id: toastId });}
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                    <PageIcon className="h-7 w-7 mr-2 text-red-600" /> Exercise Log
                </h1>
                <button onClick={handleAddClick} className="btn-primary inline-flex items-center px-3 py-2 sm:px-4 text-sm">
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" /> Log Exercise
                </button>
            </div>
             <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingLog ? 'Edit Exercise Log' : 'Log New Exercise'}>
                <ExerciseLogForm initialData={editingLog} onSubmit={handleFormSubmit} onCancel={handleFormCancel} isSubmitting={isSubmittingForm} />
            </Modal>
            {/* Loading, Error, Empty States, List, Pagination as in VitalsLogPage */}
            {isLoading && logs.length === 0 && <p className="text-center text-muted py-10">Loading exercise logs...</p>}
            {error && <p className="text-red-600 text-center py-4 bg-red-50 rounded my-4">{error}</p>}
            {!isLoading && !error && logs.length === 0 && ( /* Empty state */ <div className="text-center py-16 bg-gray-50 rounded-lg shadow"> <PageIcon className="mx-auto h-12 w-12 text-gray-400" /> <h3 className="mt-2 text-lg font-medium text-gray-900">No Exercise Logged</h3> <p className="mt-1 text-sm text-gray-500">Track your workouts and physical activities.</p> <div className="mt-6"> <button onClick={handleAddClick} type="button" className="btn-primary inline-flex items-center"> <PlusIcon className="h-5 w-5 mr-2" /> Log Your First Activity </button> </div> </div> )}
            {logs.length > 0 && ( <div className="space-y-3"> {logs.map(log => <ExerciseLogListItem key={log.id} log={log} onEdit={handleEditClick} onDelete={handleDelete} />)} </div> )}
            {nextPageUrl && !isLoadingMore && ( <div className="mt-8 text-center"> <button onClick={() => fetchLogs(nextPageUrl, false)} className="btn-primary px-6 py-2 text-sm"> Load More </button> </div> )}
            {isLoadingMore && <p className="text-muted text-center py-4 text-sm">Loading more...</p>}
            {!isLoading && !nextPageUrl && totalCount > 0 && logs.length === totalCount && ( <p className="text-center text-muted text-sm mt-6">All {totalCount} entries loaded.</p> )}
        </div>
    );
};
export default ExerciseLogPage;