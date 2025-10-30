// src/hooks/useValidatedForm.ts
import { useForm, UseFormProps, UseFormReturn, FieldValues, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

/**
 * Custom hook that wraps react-hook-form with Zod validation
 * Provides type-safe form handling with automatic validation
 * 
 * @example
 * const { register, handleSubmit, formState: { errors } } = useValidatedForm({
 *   schema: loginSchema,
 *   defaultValues: { username: '', password: '' }
 * });
 */
export function useValidatedForm<TFormData extends FieldValues>(
  schema: ZodSchema,
  options?: Omit<UseFormProps<TFormData>, 'resolver'>
): UseFormReturn<TFormData> {
  // @ts-expect-error - Zod v4 type compatibility with react-hook-form
  return useForm<TFormData>({
    ...options,
    // @ts-expect-error - Zod v4 type compatibility with react-hook-form
    resolver: zodResolver(schema),
    mode: options?.mode || 'onBlur', // Validate on blur by default
  });
}

/**
 * Helper to extract error message from react-hook-form errors
 */
export function getFieldError(errors: FieldErrors, fieldName: string): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = fieldName.split('.').reduce((obj: any, key: string) => obj?.[key], errors as any);
  return error?.message;
}
