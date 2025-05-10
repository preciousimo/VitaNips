// src/features/health/components/MedicalDocumentListItem.tsx
import React from 'react';
import { DocumentIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { MedicalDocument } from '../../../types/health';

interface MedicalDocumentListItemProps {
    document: MedicalDocument;
    onDelete: (id: number) => void;
    isDeleting?: boolean;
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    } catch { return 'Invalid Date'; }
};

const MedicalDocumentListItem: React.FC<MedicalDocumentListItemProps> = ({ document, onDelete, isDeleting }) => {

    const handleViewDownload = () => {
        if (document.file_url) {
            window.open(document.file_url, '_blank', 'noopener,noreferrer');
        } else {
            alert("Document URL is not available.");
        }
    };

    return (
         <li className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-150 mb-3">
            <div className="flex justify-between items-start space-x-3">
                <div className="flex items-start space-x-3 flex-grow min-w-0">
                    <DocumentIcon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-grow min-w-0">
                        <p className="font-semibold text-gray-800 truncate" title={document.filename ?? 'N/A'}>
                            {document.filename ?? 'Unnamed Document'}
                        </p>
                        <p className="text-sm text-gray-600">
                            {document.description || <span className='italic text-muted'>No description</span>}
                        </p>
                        <p className="text-xs text-muted mt-1">
                           Type: {document.document_type || 'N/A'} | Uploaded: {formatDate(document.uploaded_at)}
                        </p>
                    </div>
                </div>

                <div className="flex space-x-1 flex-shrink-0 items-center pt-1">
                    <button
                        onClick={handleViewDownload}
                        disabled={!document.file_url}
                        className="text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View/Download Document"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(document.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-wait"
                        title="Delete Document"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </li>
    );
};

export default MedicalDocumentListItem;