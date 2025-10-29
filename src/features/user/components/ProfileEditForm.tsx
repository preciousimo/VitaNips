// src/features/user/components/ProfileEditForm.tsx
import React, { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import { User } from '../../../types/user';
import { UserProfileUpdatePayload, uploadProfilePicture } from '../../../api/user';
import { isValidPhone } from '../../../utils';
import toast from 'react-hot-toast';
import { 
    UserIcon, 
    PhoneIcon, 
    CalendarDaysIcon, 
    MapPinIcon, 
    HeartIcon, 
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    CameraIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

interface ProfileEditFormProps {
  initialData: User | null;
  onSubmit: (payload: UserProfileUpdatePayload) => Promise<User | void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genotype = ['AA', 'AS', 'SS', 'AB'];

// Define stricter types for form inputs
type FormFieldValue = string | number | boolean | null;
type FormErrors = Partial<Record<keyof UserProfileUpdatePayload, string>>;

// Component for rendering notification preferences
const NotificationPreferences: React.FC<{
  formData: UserProfileUpdatePayload;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ formData, handleChange }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
      <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
      Notification Preferences
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { id: 'notify_appointment_reminder_email', label: 'Appointment Reminders via Email', description: 'Get notified about upcoming appointments' },
        { id: 'notify_appointment_reminder_sms', label: 'Appointment Reminders via SMS', description: 'Receive SMS notifications for appointments' },
        { id: 'notify_appointment_reminder_push', label: 'Push Notifications', description: 'Browser/app push notifications' },
        { id: 'notify_refill_reminder_email', label: 'Medication Refill Reminders', description: 'Email reminders for medication refills' },
      ].map(({ id, label, description }) => (
        <div key={id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id={id}
            name={id}
            checked={!!formData[id as keyof UserProfileUpdatePayload]}
            onChange={handleChange}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
            aria-checked={!!formData[id as keyof UserProfileUpdatePayload]}
          />
          <div className="flex-1">
            <label htmlFor={id} className="block text-sm font-medium text-gray-900">
              {label}
            </label>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
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
  
  // Profile picture states
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data
  useEffect(() => {
    const defaultData: UserProfileUpdatePayload = {
      first_name: '',
      last_name: '',
      phone_number: null,
      date_of_birth: null,
      address: null,
      genotype: null,
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
        address: initialData.address || null,
        genotype: initialData.genotype || null,
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
      
      // Set initial profile picture
      if (initialData.profile_picture) {
        setProfilePicture(initialData.profile_picture);
        setPreviewUrl(initialData.profile_picture);
      }
    } else {
      setFormData(defaultData);
    }
  }, [initialData]);

  // Validate individual field
  const validateField = useCallback(
    (name: string, value: FormFieldValue): string | null => {
      if (['first_name', 'last_name'].includes(name)) {
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          return `${name.replace('_', ' ')} is required`;
        }
        if (typeof value === 'string' && value.trim().length < 2) {
          return `${name.replace('_', ' ')} must be at least 2 characters`;
        }
        if (typeof value === 'string' && value.trim().length > 50) {
          return `${name.replace('_', ' ')} must be less than 50 characters`;
        }
      }
      
      if (name === 'phone_number' && value) {
        const phoneStr = value as string;
        if (!isValidPhone(phoneStr)) {
          return 'Please enter a valid phone number (e.g., +1234567890)';
        }
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
      } else if (
        value === '' &&
        ['phone_number', 'date_of_birth', 'address', 'blood_group', 'genotype', 'allergies', 'chronic_conditions'].includes(
          name
        )
      ) {
        processedValue = null;
      } else if (['weight', 'height'].includes(name)) {
        processedValue = value ? parseFloat(value) : null;
        if (isNaN(processedValue as number)) processedValue = null;
      }

      setFormData((prev) => ({ ...prev, [name]: processedValue }));
      
      // Clear error when user starts typing
      if (errors[name as keyof UserProfileUpdatePayload]) {
        setErrors((prev) => ({
          ...prev,
          [name]: validateField(name, processedValue),
        }));
      }
    },
    [validateField, errors]
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
      } catch (err: unknown) {
        console.error('Profile update error:', err);
        const errorData = (err as { response?: { data?: unknown } }).response?.data;
        let errorMessage = 'Failed to update profile.';
        
        if (errorData && typeof errorData === 'object') {
          const messages = Object.entries(errorData)
            .map(([key, val]) => `${key === 'detail' ? '' : key + ': '}${Array.isArray(val) ? val.join(', ') : val}`)
            .join('; ');
          errorMessage = messages || errorMessage;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        setGlobalError(errorMessage);
        throw err;
      }
    },
    [formData, validateField, onSubmit]
  );

  const uploadPicture = useCallback(async (file: File) => {
    setIsUploadingPicture(true);
    try {
      const updatedUser = await uploadProfilePicture(file);
      setProfilePicture(updatedUser.profile_picture || null);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      toast.error('Failed to upload profile picture. Please try again.');
      // Reset preview on error
      setPreviewUrl(profilePicture);
    } finally {
      setIsUploadingPicture(false);
    }
  }, [profilePicture]);

  // Handle profile picture selection
  const handleProfilePictureChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload immediately
      uploadPicture(file);
    },
    [uploadPicture]
  );

  const handleRemoveProfilePicture = useCallback(() => {
    setPreviewUrl(null);
    setProfilePicture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Note: You might want to call an API endpoint to remove the picture from the backend
    toast.success('Profile picture removed');
  }, []);

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const getFieldIcon = (fieldName: string) => {
    switch (fieldName) {
      case 'first_name':
      case 'last_name':
        return UserIcon;
      case 'phone_number':
        return PhoneIcon;
      case 'date_of_birth':
        return CalendarDaysIcon;
      case 'address':
        return MapPinIcon;
      case 'blood_group':
      case 'genotype':
      case 'allergies':
      case 'chronic_conditions':
        return HeartIcon;
      default:
        return UserIcon;
    }
  };

  const renderField = (name: keyof UserProfileUpdatePayload, label: string, type: string = 'text', options?: string[]) => {
    const Icon = getFieldIcon(name);
    const value = formData[name];
    const error = errors[name];
    const isRequired = ['first_name', 'last_name'].includes(name);

    return (
      <div className="space-y-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {type === 'select' ? (
            <select
              id={name}
              name={name}
              value={value as string || ''}
              onChange={handleChange}
              className={`input-field ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            >
              <option value="">Select {label}</option>
              {options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : type === 'textarea' ? (
            <textarea
              id={name}
              name={name}
              value={value as string || ''}
              onChange={handleChange}
              rows={3}
              className={`input-field ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder={`Enter your ${label.toLowerCase()}`}
            />
          ) : (
            <input
              type={type}
              id={name}
              name={name}
              value={value as string || ''}
              onChange={handleChange}
              className={`input-field ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder={`Enter your ${label.toLowerCase()}`}
            />
          )}
          <Icon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
        {error && (
          <p className="text-red-600 text-sm flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {globalError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-sm text-red-700">
              <p className="font-medium">Update Error</p>
              <p className="mt-1">{globalError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture Upload */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <CameraIcon className="h-5 w-5 mr-2 text-primary" />
          Profile Picture
        </h3>
        <div className="flex items-center space-x-6">
          {/* Profile Picture Preview */}
          <div className="relative">
            <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <UserIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            {isUploadingPicture && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleProfilePictureClick}
                disabled={isUploadingPicture}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                <CameraIcon className="h-4 w-4 mr-2" />
                {previewUrl ? 'Change Picture' : 'Upload Picture'}
              </button>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemoveProfilePicture}
                  disabled={isUploadingPicture}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              JPG, PNG, GIF or WebP. Max file size 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <UserIcon className="h-5 w-5 mr-2 text-primary" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField('first_name', 'First Name', 'text')}
          {renderField('last_name', 'Last Name', 'text')}
          {renderField('phone_number', 'Phone Number', 'tel')}
          {renderField('date_of_birth', 'Date of Birth', 'date')}
        </div>
        <div className="mt-4">
          {renderField('address', 'Address', 'textarea')}
        </div>
      </div>

      {/* Health Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <HeartIcon className="h-5 w-5 mr-2 text-primary" />
          Health Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField('blood_group', 'Blood Group', 'select', bloodGroups)}
          {renderField('genotype', 'Genotype', 'select', genotype)}
          {renderField('weight', 'Weight (kg)', 'number')}
          {renderField('height', 'Height (cm)', 'number')}
        </div>
        <div className="mt-4 space-y-4">
          {renderField('allergies', 'Allergies', 'textarea')}
          {renderField('chronic_conditions', 'Chronic Conditions', 'textarea')}
        </div>
      </div>

      {/* Notification Preferences */}
      <NotificationPreferences formData={formData} handleChange={handleChange} />

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary inline-flex items-center px-6 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Updating...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Update Profile
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;