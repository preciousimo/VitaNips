// src/components/common/FormInput.tsx
import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { generateId } from '../../utils/accessibility';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label: string;
    error?: string;
    helperText?: string;
    isRequired?: boolean;
    showPasswordToggle?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ 
        label, 
        error, 
        helperText, 
        isRequired = false,
        showPasswordToggle = false,
        type = 'text',
        id,
        className = '',
        ...props 
    }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const [inputId] = useState(id || generateId('input'));
        const errorId = `${inputId}-error`;
        const helperId = `${inputId}-helper`;
        
        const inputType = showPasswordToggle && type === 'password' 
            ? (showPassword ? 'text' : 'password')
            : type;

        const hasError = !!error;
        
        const baseInputClasses = `
            block w-full px-3 py-2 border rounded-md shadow-sm 
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
            ${hasError 
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-primary focus:border-primary'
            }
            ${showPasswordToggle ? 'pr-10' : ''}
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

                {/* Input Container */}
                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        type={inputType}
                        className={baseInputClasses.trim()}
                        aria-invalid={hasError}
                        aria-describedby={
                            hasError ? errorId : helperText ? helperId : undefined
                        }
                        aria-required={isRequired}
                        {...props}
                    />

                    {/* Error Icon */}
                    {hasError && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ExclamationCircleIcon 
                                className="h-5 w-5 text-red-500" 
                                aria-hidden="true"
                            />
                        </div>
                    )}

                    {/* Password Toggle */}
                    {showPasswordToggle && type === 'password' && !hasError && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                                <EyeIcon className="h-5 w-5" aria-hidden="true" />
                            )}
                        </button>
                    )}
                </div>

                {/* Helper Text */}
                {helperText && !hasError && (
                    <p 
                        id={helperId} 
                        className="mt-1 text-sm text-gray-500"
                    >
                        {helperText}
                    </p>
                )}

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

FormInput.displayName = 'FormInput';

export default FormInput;
