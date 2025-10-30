// src/components/common/FormSelect.tsx
import { SelectHTMLAttributes, forwardRef, useState } from 'react';
import { ExclamationCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { generateId } from '../../utils/accessibility';

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label: string;
    error?: string;
    helperText?: string;
    isRequired?: boolean;
    options: Array<{ value: string | number; label: string; disabled?: boolean }>;
    placeholder?: string;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
    ({ 
        label, 
        error, 
        helperText, 
        isRequired = false,
        options,
        placeholder,
        id,
        className = '',
        ...props 
    }, ref) => {
        const [inputId] = useState(id || generateId('select'));
        const errorId = `${inputId}-error`;
        const helperId = `${inputId}-helper`;
        
        const hasError = !!error;
        
        const baseSelectClasses = `
            block w-full px-3 py-2 pr-10 border rounded-md shadow-sm 
            transition-colors duration-200 appearance-none
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
            ${hasError 
                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
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

                {/* Select Container */}
                <div className="relative">
                    <select
                        ref={ref}
                        id={inputId}
                        className={baseSelectClasses.trim()}
                        aria-invalid={hasError}
                        aria-describedby={
                            hasError ? errorId : helperText ? helperId : undefined
                        }
                        aria-required={isRequired}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option 
                                key={option.value} 
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Dropdown Icon or Error Icon */}
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {hasError ? (
                            <ExclamationCircleIcon 
                                className="h-5 w-5 text-red-500" 
                                aria-hidden="true"
                            />
                        ) : (
                            <ChevronDownIcon 
                                className="h-5 w-5 text-gray-400" 
                                aria-hidden="true"
                            />
                        )}
                    </div>
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

FormSelect.displayName = 'FormSelect';

export default FormSelect;
