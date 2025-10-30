// src/components/common/EmptyState.tsx
import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className = '',
}) => {
    return (
        <div className={`text-center py-12 px-4 ${className}`}>
            {Icon && (
                <div className="flex justify-center mb-4">
                    <Icon className="h-16 w-16 text-gray-300" />
                </div>
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
