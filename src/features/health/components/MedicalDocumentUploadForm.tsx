// src/features/health/components/MedicalDocumentUploadForm.tsx
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { MedicalDocumentUploadPayload } from '../../../types/health';

interface MedicalDocumentUploadFormProps {
    onSubmit: (payload: MedicalDocumentUploadPayload, file: File) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const MedicalDocumentUploadForm: React.FC<MedicalDocumentUploadFormProps> = ({
    onSubmit,
    onCancel,
    isSubmitting,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState<string>('');
    const [documentType, setDocumentType] = useState<string>('');
    // Optional: Add state for linking to an appointment ID if needed
    // const [appointmentId, setAppointmentId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            // Basic validation (optional: add size/type checks here)
            const file = event.target.files[0];
            if (file.size > 10 * 1024 * 1024) { // Example: 10MB limit
                 setError("File is too large. Maximum size is 10MB.");
                 setSelectedFile(null);
                 event.target.value = ''; // Clear the input
                 return;
            }
            // Add allowed types check if needed
            // const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            // if (!allowedTypes.includes(file.type)) { ... }

            setSelectedFile(file);
            setError(null); // Clear previous errors
        } else {
            setSelectedFile(null);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        const payload: MedicalDocumentUploadPayload = {
            description: description || null,
            document_type: documentType || null,
            // appointment: appointmentId // Pass if implementing appointment linking
        };

        try {
            await onSubmit(payload, selectedFile);
            // Reset form on successful submission (handled by parent closing modal)
        } catch (err: any) {
            console.error('Upload submission error:', err);
             // Try to get specific errors from backend response
             const backendErrors = err.response?.data;
             if (typeof backendErrors === 'object' && backendErrors !== null) {
                 const messages = Object.entries(backendErrors)
                    .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
                    .join(' ');
                 setError(messages || err.message || 'Failed to upload document.');
             } else {
                setError(err.message || 'Failed to upload document.');
             }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Upload Medical Document</h3>
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</p>}

            <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700">Select File *</label>
                <input
                    type="file"
                    id="file"
                    name="file"
                    required
                    onChange={handleFileChange}
                    className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary/20"
                    // Optional: Add accept attribute for specific file types
                    // accept=".pdf,.jpg,.jpeg,.png"
                />
                 {selectedFile && <p className='text-xs text-muted mt-1'>Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>}
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <input
                    type="text"
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Blood Test Results - Jan 2025"
                />
            </div>

             <div>
                <label htmlFor="document_type" className="block text-sm font-medium text-gray-700">Document Type (Optional)</label>
                <input
                    type="text"
                    id="document_type"
                    name="document_type"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Lab Result, Scan, Report, Referral"
                />
            </div>

            {/* Optional: Input for Appointment ID */}
            {/* <div> ... input for appointmentId ... </div> */}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting || !selectedFile} className="btn-primary inline-flex justify-center px-4 py-2 text-sm font-medium disabled:opacity-50">
                    {isSubmitting ? 'Uploading...' : 'Upload Document'}
                </button>
            </div>
        </form>
    );
};

export default MedicalDocumentUploadForm;