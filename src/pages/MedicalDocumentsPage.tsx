// src/pages/MedicalDocumentsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import {
    getUserMedicalDocuments,
    uploadMedicalDocument,
    deleteMedicalDocument
} from '../api/health';
import { MedicalDocument, MedicalDocumentUploadPayload } from '../types/health';
import MedicalDocumentListItem from '../features/health/components/MedicalDocumentListItem';
import MedicalDocumentUploadForm from '../features/health/components/MedicalDocumentUploadForm';
import Modal from '../components/common/Modal';

const MedicalDocumentsPage: React.FC = () => {
    const [documents, setDocuments] = useState<MedicalDocument[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadInitialDocuments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setDocuments([]);
        setNextPageUrl(null);
        setTotalCount(0);
        try {
            const response = await getUserMedicalDocuments();

            if (response && Array.isArray(response.results)) {
                 response.results.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
                setDocuments(response.results);
                setNextPageUrl(response.next);
                setTotalCount(response.count);
            } else {
                console.warn("Received unexpected documents response structure:", response);
                setError("Received invalid data from server.");
                setDocuments([]);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load medical documents.");
            console.error(err);
            setDocuments([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMoreDocuments = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            const response = await getUserMedicalDocuments(nextPageUrl);

            if (response && Array.isArray(response.results)) {
                setDocuments(prev =>
                    [...prev, ...response.results].sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
                );
                setNextPageUrl(response.next);
            } else {
                 console.warn("Received unexpected more documents response structure:", response);
                 setError("Received invalid data while loading more.");
                 setNextPageUrl(null);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load more documents.");
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        loadInitialDocuments();
    }, [loadInitialDocuments]);

    const handleOpenUploadModal = () => {
        setShowUploadModal(true);
    };
    const handleCloseUploadModal = () => {
        setShowUploadModal(false);
    };
    const handleUploadSubmit = async (payload: MedicalDocumentUploadPayload, file: File) => {
        setIsUploading(true);
        try {
            await uploadMedicalDocument(payload, file);
            setShowUploadModal(false);
            await loadInitialDocuments();
        } catch (err) {
             console.error("Upload failed:", err);
             throw err;
        } finally {
             setIsUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (deletingId === id || !window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
             return;
         }
         setDeletingId(id);
         setError(null);
         try {
             await deleteMedicalDocument(id);
            
             await loadInitialDocuments();
         } catch (err: any) {
             setError(err.message || "Failed to delete document.");
             console.error(err);
         } finally {
             setDeletingId(null);
         }
     };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Medical Documents</h1>
                <button
                    onClick={handleOpenUploadModal}
                    className="btn-primary inline-flex items-center px-4 py-2"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Upload Document
                </button>
            </div>

             <Modal isOpen={showUploadModal} onClose={handleCloseUploadModal} title="">
                 <MedicalDocumentUploadForm
                    onSubmit={handleUploadSubmit}
                    onCancel={handleCloseUploadModal}
                    isSubmitting={isUploading}
                 />
             </Modal>

            <div>
                {isLoading ? (
                    <p className="text-muted text-center py-4">Loading documents...</p>
                ) : error && documents.length === 0 ? (
                    <p className="text-red-600 text-center py-4">{error}</p>
                ) : (
                    <>
                        {error && documents.length > 0 && <p className="text-red-600 text-center py-2">{error}</p>}
                        {documents.length > 0 ? (
                            <ul className="space-y-0">
                                {documents.map(doc => (
                                    <MedicalDocumentListItem
                                        key={doc.id}
                                        document={doc}
                                        onDelete={handleDelete}
                                        isDeleting={deletingId === doc.id}
                                    />
                                ))}
                            </ul>
                        ) : (
                            !isLoading && !error && (
                                <div className="text-center py-10 bg-gray-50 rounded-md">
                                    <p className="text-gray-600">You haven't uploaded any medical documents yet.</p>
                                    <button onClick={handleOpenUploadModal} className="mt-4 btn-primary inline-flex items-center">
                                        <PlusIcon className="h-5 w-5 mr-2" /> Upload Your First Document
                                    </button>
                                </div>
                            )
                        )}

                        {nextPageUrl && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={loadMoreDocuments}
                                    disabled={isLoadingMore}
                                    className="btn-primary px-6 py-2 disabled:opacity-50"
                                >
                                    {isLoadingMore ? 'Loading...' : 'Load More Documents'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MedicalDocumentsPage;