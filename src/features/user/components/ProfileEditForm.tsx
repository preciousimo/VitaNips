// src/features/user/components/ProfileEditForm.tsx
import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { User } from '../../../types/user';
import { UserProfileUpdatePayload } from '../../../api/user';

interface ProfileEditFormProps {
  initialData: User | null;
  onSubmit: (payload: UserProfileUpdatePayload) => Promise<User | void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Define stricter types for form inputs
type FormFieldValue = string | number | boolean | null;
type FormErrors = Partial<Record<keyof UserProfileUpdatePayload, string>>;

// Component for rendering notification preferences
const NotificationPreferences: React.FC<{
  formData: UserProfileUpdatePayload;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ formData, handleChange }) => (
  <>
    <h4 className="md:col-span-2 text-md font-semibold text-gray-700">Notification Preferences</h4>
    <div className="md:col-span-2 space-y-2">
      {[
        { id: 'notify_appointment_reminder_email', label: 'Reminders via Email' },
        { id: 'notify_appointment_reminder_sms', label: 'Reminders via SMS' },
        { id: 'notify_appointment_reminder_push', label: 'Reminders via Push Notification (Browser/App)' },
        { id: 'notify_refill_reminder_email', label: 'Receive Medication Refill Reminders via Email' },
      ].map(({ id, label }) => (
        <div key={id} className="flex items-center">
          <input
            type="checkbox"
            id={id}
            name={id}
            checked={!!formData[id as keyof UserProfileUpdatePayload]}
            onChange={handleChange}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            aria-checked={!!formData[id as keyof UserProfileUpdatePayload]}
          />
          <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
            {label}
          </label>
        </div>
      ))}
    </div>
  </>
);

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<UserProfileUpdatePayload>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Initialize form data
  useEffect(() => {
    const defaultData: UserProfileUpdatePayload = {
      first_name: '',
      last_name: '',
      phone_number: null,
      date_of_birth: null,
      blood_group: null,
      allergies: null,
      chronic_conditions: null,
      weight: null,
      height: null,
      notify_appointment_reminder_email: true,
      notify_appointment_reminder_sms: false,
      notify_refill_reminder_email: true,
      notify_appointment_reminder_push: true,
    };

    if (initialData) {
      setFormData({
        ...defaultData,
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        phone_number: initialData.phone_number || null,
        date_of_birth: initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : null,
        blood_group: initialData.blood_group || null,
        allergies: initialData.allergies || null,
        chronic_conditions: initialData.chronic_conditions || null,
        weight: initialData.weight || null,
        height: initialData.height || null,
        notify_appointment_reminder_email: initialData.notify_appointment_reminder_email ?? true,
        notify_appointment_reminder_sms: initialData.notify_appointment_reminder_sms ?? false,
        notify_refill_reminder_email: initialData.notify_refill_reminder_email ?? true,
        notify_appointment_reminder_push: initialData.notify_appointment_reminder_push ?? true,
      });
    } else {
      setFormData(defaultData);
    }
  }, [initialData]);

  // Validate individual field
  const validateField = useCallback(
    (name: string, value: FormFieldValue): string | null => {
      if (['first_name', 'last_name'].includes(name) && !value) {
        return `${name.replace('_', ' ')} is required`;
      }
      if (name === 'phone_number' && value && !/^\+?\d{10,15}$/.test(value as string)) {
        return 'Invalid phone number format';
      }
      if (name === 'weight' && value !== null) {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (typeof numericValue !== 'number' || isNaN(numericValue)) {
          return 'Weight must be a valid number';
        }
        if (numericValue < 0 || numericValue > 500) {
          return 'Weight must be between 0 and 500 kg';
        }
      }
      if (name === 'height' && value !== null) {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (typeof numericValue !== 'number' || isNaN(numericValue)) {
          return 'Height must be a valid number';
        }
        if (numericValue < 0 || numericValue > 300) {
          return 'Height must be between 0 and 300 cm';
        }
      }
      return null;
    },
    []
  );

  // Handle input changes
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value, type } = e.target;
      let processedValue: FormFieldValue = value;

      if (type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
      } else if (value === '' && ['phone_number', 'date_of_birth', 'blood_group', 'allergies', 'chronic_conditions'].includes(name)) {
        processedValue = null;
      } else if (['weight', 'height'].includes(name)) {
        processedValue = value ? parseFloat(value) : null;
        if (isNaN(processedValue as number)) processedValue = null;
      }

      setFormData((prev) => ({ ...prev, [name]: processedValue }));
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, processedValue),
      }));
    },
    [validateField]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setGlobalError(null);
      setErrors({});

      // Validate all fields
      const newErrors: FormErrors = {};
      Object.entries(formData).forEach(([key, value]) => {
        const error = validateField(key, value);
        if (error) newErrors[key as keyof UserProfileUpdatePayload] = error;
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setGlobalError('Please correct the errors in the form.');
        return;
      }

      const payload: UserProfileUpdatePayload = {
        ...formData,
        weight: formData.weight ? Number(formData.weight) : null,
        height: formData.height ? Number(formData.height) : null,
      };

      try {
        await onSubmit(payload);
      } catch (err: any) {
        console.error('Profile update error:', err);
        const errorData = err.response?.data;
        if (typeof errorData === 'object' && errorData !== null) {
          const fieldErrors: FormErrors = {};
          Object.entries(errorData).forEach(([key, value]) => {
            fieldErrors[key as keyof UserProfileUpdatePayload] = Array.isArray(value)
              ? value.join(', ')
              : String(value);
          });
          setErrors(fieldErrors);
          setGlobalError('Failed to update profile. Please check the fields.');
        } else {
          setGlobalError(err.message || 'Failed to update profile.');
        }
      }
    },
    [formData, onSubmit, validateField]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {globalError && (
        <div
          className="text-red-600 text-sm bg-red-50 p-3 rounded-md"
          role="alert"
        >
          {globalError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700"
          >
            First Name *
          </label>
          <input
            type="text"
            name="first_name"
            id="first_name"
            required
            value={formData.first_name ?? ''}
            onChange={handleChange}
            className="input-field"
            aria-invalid={!!errors.first_name}
            aria-describedby={errors.first_name ? 'first_name-error' : undefined}
          />
          {errors.first_name && (
            <p
              id="first_name-error"
              className="text-red-600 text-sm mt-1"
              role="alert"
            >
              {errors.first_name}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name *
          </label>
          <input
            type="text"
            name="last_name"
            id="last_name"
            required
            value={formData.last_name ?? ''}
            onChange={handleChange}
            className="input-field"
            aria-invalid={!!errors.last_name}
            aria-describedby={errors.last_name ? 'last_name-error' : undefined}
          />
          {errors.last_name && (
            <p
              id="last_name-error"
              className="text-red-600 text-sm mt-1"
              role="alert"
            >
              {errors.last_name}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="phone_number"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <input
            type="tel"
            name="phone_number"
            id="phone_number"
            value={formData.phone_number ?? ''}
            onChange={handleChange}
            className="input-field"
            placeholder="+1234567890"
            aria-invalid={!!errors.phone_number}
            aria-describedby={errors.phone_number ? 'phone_number-error' : undefined}
          />
          {errors.phone_number && (
            <p
              id="phone_number-error"
              className="text-red-600 text-sm mt-1"
              role="alert"
            >
              {errors.phone_number}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="date_of_birth"
            className="block text-sm font-medium text-gray-700"
          >
            Date of Birth
          </label>
          <input
            type="date"
            name="date_of_birth"
            id="date_of_birth"
            value={formData.date_of_birth ?? ''}
            onChange={handleChange}
            className="input-field"
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
            aria-invalid={!!errors.date_of_birth}
            aria-describedby={errors.date_of_birth ? 'date_of_birth-error' : undefined}
          />
          {errors.date_of_birth && (
            <p
              id="date_of_birth-error"
              className="text-red-600 text-sm mt-1"
              role="alert"
            >
              {errors.date_of_birth}
            </p>
          )}
        </div>
      </div>

      <div className="pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Health Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="blood_group"
              className="block text-sm font-medium text-gray-700"
            >
              Blood Group
            </label>
            <select
              name="blood_group"
              id="blood_group"
              value={formData.blood_group ?? ''}
              onChange={handleChange}
              className="input-field"
              aria-invalid={!!errors.blood_group}
              aria-describedby={errors.blood_group ? 'blood_group-error' : undefined}
            >
              <option value="">-- Select --</option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            {errors.blood_group && (
              <p
                id="blood_group-error"
                className="text-red-600 text-sm mt-1"
                role="alert"
              >
                {errors.blood_group}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="allergies"
              className="block text-sm font-medium text-gray-700"
            >
              Allergies
            </label>
            <textarea
              name="allergies"
              id="allergies"
              rows={3}
              value={formData.allergies ?? ''}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Penicillin, Peanuts, Pollen"
              aria-invalid={!!errors.allergies}
              aria-describedby={errors.allergies ? 'allergies-error' : undefined}
            />
            {errors.allergies && (
              <p
                id="allergies-error"
                className="text-red-600 text-sm mt-1"
                role="alert"
              >
                {errors.allergies}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="chronic_conditions"
              className="block text-sm font-medium text-gray-700"
            >
              Chronic Conditions
            </label>
            <textarea
              name="chronic_conditions"
              id="chronic_conditions"
              rows={3}
              value={formData.chronic_conditions ?? ''}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Hypertension, Diabetes Type 2, Asthma"
              aria-invalid={!!errors.chronic_conditions}
              aria-describedby={
                errors.chronic_conditions ? 'chronic_conditions-error' : undefined
              }
            />
            {errors.chronic_conditions && (
              <p
                id="chronic_conditions-error"
                className="text-red-600 text-sm mt-1"
                role="alert"
              >
                {errors.chronic_conditions}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="weight"
              className="block text-sm font-medium text-gray-700"
            >
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              name="weight"
              id="weight"
              value={formData.weight ?? ''}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 70.5"
              aria-invalid={!!errors.weight}
              aria-describedby={errors.weight ? 'weight-error' : undefined}
            />
            {errors.weight && (
              <p id="weight-error" className="text-red-600 text-sm mt-1" role="alert">
                {errors.weight}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="height"
              className="block text-sm font-medium text-gray-700"
            >
              Height (cm)
            </label>
            <input
              type="number"
              step="0.1"
              name="height"
              id="height"
              value={formData.height ?? ''}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 175.0"
              aria-invalid={!!errors.height}
              aria-describedby={errors.height ? 'height-error' : undefined}
            />
            {errors.height && (
              <p id="height-error" className="text-red-600 text-sm mt-1" role="alert">
                {errors.height}
              </p>
            )}
          </div>
        </div>
      </div>

      <NotificationPreferences formData={formData} handleChange={handleChange} />

      <div className="flex justify-end space-x-3 pt-5 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary inline-flex justify-center px-4 py-2 text-sm font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;