// src/components/common/ConfirmationDialog.tsx
import React from 'react';
import { 
    ExclamationTriangleIcon, 
    TrashIcon, 
    XMarkIcon,
    CheckCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    isLoading?: boolean;
    icon?: React.ElementType;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
    isLoading = false,
    icon: CustomIcon
}) => {
    if (!isOpen) return null;

    const getIconAndColors = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: TrashIcon,
                    iconColor: 'text-red-600',
                    bgColor: 'bg-red-100',
                    buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                    borderColor: 'border-red-200'
                };
            case 'warning':
                return {
                    icon: ExclamationTriangleIcon,
                    iconColor: 'text-yellow-600',
                    bgColor: 'bg-yellow-100',
                    buttonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
                    borderColor: 'border-yellow-200'
                };
            case 'success':
                return {
                    icon: CheckCircleIcon,
                    iconColor: 'text-green-600',
                    bgColor: 'bg-green-100',
                    buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
                    borderColor: 'border-green-200'
                };
            case 'info':
            default:
                return {
                    icon: InformationCircleIcon,
                    iconColor: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    buttonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
                    borderColor: 'border-blue-200'
                };
        }
    };

    const { icon: DefaultIcon, iconColor, bgColor, buttonColor, borderColor } = getIconAndColors();
    const Icon = CustomIcon || DefaultIcon;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 overflow-y-auto"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
        >
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    {/* Header */}
                    <div className={`px-4 py-3 sm:px-6 ${bgColor} ${borderColor} border-b`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Icon className={`h-6 w-6 ${iconColor} mr-3`} />
                                <h3 className="text-lg font-medium text-gray-900">
                                    {title}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-5 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
                                <Icon className={`h-6 w-6 ${iconColor}`} />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <p className="text-sm text-gray-500">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed ${buttonColor}`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary sm:mt-0 sm:w-auto disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog; 