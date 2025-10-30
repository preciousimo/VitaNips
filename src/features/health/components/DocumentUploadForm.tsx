// src/features/health/components/DocumentUploadForm.tsx
import React, { useState, useRef } from 'react';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface DocumentUploadFormProps {
    onUploadSuccess: () => void;
    onCancel: () => void;
}

const DOCUMENT_TYPES = [
    { value: 'lab_result', label: 'Lab Result' },
    { value: 'scan', label: 'Scan/Imaging' },
    { value: 'report', label: 'Medical Report' },
    { value: 'prescription_image', label: 'Prescription Image' },
    { value: 'insurance', label: 'Insurance Document' },
    { value: 'other', label: 'Other' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ onUploadSuccess, onCancel }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [documentType, setDocumentType] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return 'File size must be less than 10MB';
        }
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return 'Invalid file type. Allowed: PDF, Images (JPG, PNG, GIF), Word documents';
        }
        return null;
    };

    const handleFileSelect = (file: File) => {
        const error = validateFile(file);
        if (error) {
            toast.error(error);
            return;
        }
        setSelectedFile(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            toast.error('Please select a file to upload');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const { uploadMedicalDocument } = await import('../../../api/documents');
            
            // Simulate progress (you can enhance this with actual upload progress)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            await uploadMedicalDocument({
                file: selectedFile,
                description: description.trim() || undefined,
                document_type: documentType || undefined,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            toast.success('Document uploaded successfully!');
            onUploadSuccess();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to upload document');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File *
                </label>
                
                {!selectedFile ? (
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            dragActive
                                ? 'border-primary bg-primary-light'
                                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                        }`}
                    >
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                            PDF, JPG, PNG, GIF, Word (max. 10MB)
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileInputChange}
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <DocumentIcon className="h-8 w-8 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="ml-4 p-1 text-gray-400 hover:text-red-600 flex-shrink-0"
                                aria-label="Remove file"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        
                        {isUploading && (
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description or title"
                    className="input-field w-full"
                    maxLength={255}
                    disabled={isUploading}
                />
            </div>

            {/* Document Type */}
            <div>
                <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                </label>
                <select
                    id="documentType"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="input-field w-full"
                    disabled={isUploading}
                >
                    <option value="">Select type (optional)</option>
                    {DOCUMENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isUploading}
                    className="btn-secondary px-4 py-2"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!selectedFile || isUploading}
                    className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                </button>
            </div>
        </form>
    );
};

export default DocumentUploadForm;
