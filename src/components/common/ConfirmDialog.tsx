// src/components/common/ConfirmDialog.tsx
import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
    icon?: React.ReactNode;
    isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmButtonClass = 'bg-red-600 hover:bg-red-700',
    icon,
    isLoading = false,
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fadeIn">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    aria-label="Close dialog"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                    {icon || <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {title}
                </h3>

                {/* Message */}
                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex space-x-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonClass}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
