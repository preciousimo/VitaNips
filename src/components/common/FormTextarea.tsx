// src/components/common/FormTextarea.tsx
import { TextareaHTMLAttributes, forwardRef, useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { generateId } from '../../utils/accessibility';

interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
    label: string;
    error?: string;
    helperText?: string;
    isRequired?: boolean;
    showCharCount?: boolean;
    maxLength?: number;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ 
        label, 
        error, 
        helperText, 
        isRequired = false,
        showCharCount = false,
        maxLength,
        id,
        className = '',
        value,
        ...props 
    }, ref) => {
        const [inputId] = useState(id || generateId('textarea'));
        const errorId = `${inputId}-error`;
        const helperId = `${inputId}-helper`;
        
        const hasError = !!error;
        const charCount = typeof value === 'string' ? value.length : 0;
        
        const baseTextareaClasses = `
            block w-full px-3 py-2 border rounded-md shadow-sm 
            transition-colors duration-200 resize-y
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
            ${hasError 
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-primary focus:border-primary'
            }
        `;

        return (
            <div className={className}>
                {/* Label */}
                <label 
                    htmlFor={inputId} 
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                    {isRequired && (
                        <span className="text-red-500 ml-1" aria-label="required">*</span>
                    )}
                </label>

                {/* Textarea Container */}
                <div className="relative">
                    <textarea
                        ref={ref}
                        id={inputId}
                        className={baseTextareaClasses.trim()}
                        aria-invalid={hasError}
                        aria-describedby={
                            hasError ? errorId : helperText ? helperId : undefined
                        }
                        aria-required={isRequired}
                        maxLength={maxLength}
                        value={value}
                        {...props}
                    />

                    {/* Error Icon */}
                    {hasError && (
                        <div className="absolute top-2 right-2 pointer-events-none">
                            <ExclamationCircleIcon 
                                className="h-5 w-5 text-red-500" 
                                aria-hidden="true"
                            />
                        </div>
                    )}
                </div>

                {/* Helper Text / Character Count */}
                <div className="mt-1 flex justify-between items-start">
                    {helperText && !hasError && (
                        <p 
                            id={helperId} 
                            className="text-sm text-gray-500"
                        >
                            {helperText}
                        </p>
                    )}
                    
                    {showCharCount && maxLength && (
                        <p 
                            className={`text-sm ml-auto ${
                                charCount > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-500'
                            }`}
                            aria-live="polite"
                            aria-label={`${charCount} of ${maxLength} characters used`}
                        >
                            {charCount} / {maxLength}
                        </p>
                    )}
                </div>

                {/* Error Message */}
                {hasError && (
                    <p 
                        id={errorId} 
                        className="mt-1 text-sm text-red-600"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;
