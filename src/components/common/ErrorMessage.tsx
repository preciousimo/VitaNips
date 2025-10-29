// src/components/common/ErrorMessage.tsx
import React from 'react';
import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
    message: string;
    type?: 'error' | 'warning';
    onRetry?: () => void;
    onDismiss?: () => void;
    className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
    message,
    type = 'error',
    onRetry,
    onDismiss,
    className = '',
}) => {
    const isError = type === 'error';
    const Icon = isError ? XCircleIcon : ExclamationTriangleIcon;

    const bgColor = isError ? 'bg-red-50' : 'bg-yellow-50';
    const borderColor = isError ? 'border-red-200' : 'border-yellow-200';
    const textColor = isError ? 'text-red-800' : 'text-yellow-800';
    const iconColor = isError ? 'text-red-500' : 'text-yellow-500';
    const buttonColor = isError
        ? 'text-red-600 hover:text-red-700 hover:bg-red-100'
        : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100';

    return (
        <div
            className={`${bgColor} ${borderColor} ${textColor} border rounded-lg p-4 ${className}`}
            role="alert"
        >
            <div className="flex items-start">
                <Icon className={`h-5 w-5 ${iconColor} mr-3 mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                {(onRetry || onDismiss) && (
                    <div className="ml-3 flex space-x-2 flex-shrink-0">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className={`text-sm font-medium ${buttonColor} px-3 py-1 rounded-md transition-colors`}
                            >
                                Retry
                            </button>
                        )}
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className={`${buttonColor} p-1 rounded-md transition-colors`}
                                aria-label="Dismiss"
                            >
                                <XCircleIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;
