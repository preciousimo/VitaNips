// src/components/common/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'white' | 'gray';
    text?: string;
    fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'primary',
    text,
    fullScreen = false,
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
        xl: 'h-16 w-16 border-4',
    };

    const colorClasses = {
        primary: 'border-primary border-t-transparent',
        white: 'border-white border-t-transparent',
        gray: 'border-gray-400 border-t-transparent',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center">
            <div
                className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
                role="status"
                aria-label="Loading"
            >
                <span className="sr-only">Loading...</span>
            </div>
            {text && (
                <p className="mt-3 text-sm text-gray-600 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
