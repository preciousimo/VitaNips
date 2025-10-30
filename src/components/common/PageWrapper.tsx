// src/components/common/PageWrapper.tsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

interface PageWrapperProps {
    isLoading?: boolean;
    error?: string | null;
    isEmpty?: boolean;
    emptyStateProps?: {
        icon?: React.ComponentType<{ className?: string }>;
        title: string;
        description?: string;
        actionLabel?: string;
        onAction?: () => void;
    };
    onRetry?: () => void;
    loadingText?: string;
    children: React.ReactNode;
    className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
    isLoading,
    error,
    isEmpty,
    emptyStateProps,
    onRetry,
    loadingText,
    children,
    className = '',
}) => {
    if (isLoading) {
        return (
            <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
                <LoadingSpinner size="lg" text={loadingText} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`max-w-2xl mx-auto ${className}`}>
                <ErrorMessage message={error} onRetry={onRetry} />
            </div>
        );
    }

    if (isEmpty && emptyStateProps) {
        return (
            <div className={className}>
                <EmptyState {...emptyStateProps} />
            </div>
        );
    }

    return <div className={className}>{children}</div>;
};

export default PageWrapper;
