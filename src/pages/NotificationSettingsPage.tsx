// src/pages/NotificationSettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../api/user';
import toast from 'react-hot-toast';
import { 
  BellIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface NotificationPreferences {
  // Email notifications
  notify_appointment_confirmation_email: boolean;
  notify_appointment_cancellation_email: boolean;
  notify_appointment_reminder_email: boolean;
  notify_prescription_update_email: boolean;
  notify_order_update_email: boolean;
  notify_general_updates_email: boolean;
  notify_refill_reminder_email: boolean;
  
  // SMS notifications
  notify_appointment_reminder_sms: boolean;
  
  // Push notifications
  notify_appointment_reminder_push: boolean;
}

const NotificationSettingsPage: React.FC = () => {
  const { user, fetchUserProfile, accessToken } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    notify_appointment_confirmation_email: true,
    notify_appointment_cancellation_email: true,
    notify_appointment_reminder_email: true,
    notify_prescription_update_email: true,
    notify_order_update_email: true,
    notify_general_updates_email: true,
    notify_refill_reminder_email: true,
    notify_appointment_reminder_sms: false,
    notify_appointment_reminder_push: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load user's current preferences
  useEffect(() => {
    if (user) {
      setPreferences({
        notify_appointment_confirmation_email: user.notify_appointment_confirmation_email ?? true,
        notify_appointment_cancellation_email: user.notify_appointment_cancellation_email ?? true,
        notify_appointment_reminder_email: user.notify_appointment_reminder_email ?? true,
        notify_prescription_update_email: user.notify_prescription_update_email ?? true,
        notify_order_update_email: user.notify_order_update_email ?? true,
        notify_general_updates_email: user.notify_general_updates_email ?? true,
        notify_refill_reminder_email: user.notify_refill_reminder_email ?? true,
        notify_appointment_reminder_sms: user.notify_appointment_reminder_sms ?? false,
        notify_appointment_reminder_push: user.notify_appointment_reminder_push ?? true,
      });
    }
  }, [user]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(preferences);
      if (accessToken) {
        await fetchUserProfile(accessToken);
      }
      toast.success('Notification preferences saved!');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preferences';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const NotificationToggle: React.FC<{
    label: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
    icon: React.ReactNode;
  }> = ({ label, description, enabled, onChange, icon }) => (
    <div className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-primary transition-colors">
      <div className="flex items-start space-x-3 flex-1">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{label}</h4>
          <p className="text-sm text-gray-600 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          enabled ? 'bg-primary' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BellIcon className="h-8 w-8 text-primary" />
          Notification Settings
        </h1>
        <p className="mt-2 text-gray-600">
          Choose how you want to receive notifications about appointments, prescriptions, and more.
        </p>
      </div>

      {/* Email Notifications Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <EnvelopeIcon className="h-6 w-6 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
        </div>
        <div className="space-y-3">
          <NotificationToggle
            label="Appointment Confirmations"
            description="Get notified when your appointment is confirmed"
            enabled={preferences.notify_appointment_confirmation_email}
            onChange={() => handleToggle('notify_appointment_confirmation_email')}
            icon={<CheckCircleIcon className="h-5 w-5 text-green-600" />}
          />
          <NotificationToggle
            label="Appointment Cancellations"
            description="Get notified when an appointment is cancelled"
            enabled={preferences.notify_appointment_cancellation_email}
            onChange={() => handleToggle('notify_appointment_cancellation_email')}
            icon={<CheckCircleIcon className="h-5 w-5 text-red-600" />}
          />
          <NotificationToggle
            label="Appointment Reminders"
            description="Receive reminders 24 hours and 1 hour before appointments"
            enabled={preferences.notify_appointment_reminder_email}
            onChange={() => handleToggle('notify_appointment_reminder_email')}
            icon={<BellIcon className="h-5 w-5 text-blue-600" />}
          />
          <NotificationToggle
            label="Prescription Updates"
            description="Get notified about new prescriptions and updates"
            enabled={preferences.notify_prescription_update_email}
            onChange={() => handleToggle('notify_prescription_update_email')}
            icon={<CheckCircleIcon className="h-5 w-5 text-purple-600" />}
          />
          <NotificationToggle
            label="Medication Refill Reminders"
            description="Receive reminders when it's time to refill your medications"
            enabled={preferences.notify_refill_reminder_email}
            onChange={() => handleToggle('notify_refill_reminder_email')}
            icon={<BellIcon className="h-5 w-5 text-orange-600" />}
          />
          <NotificationToggle
            label="Order Updates"
            description="Track your medication orders from pharmacies"
            enabled={preferences.notify_order_update_email}
            onChange={() => handleToggle('notify_order_update_email')}
            icon={<CheckCircleIcon className="h-5 w-5 text-indigo-600" />}
          />
          <NotificationToggle
            label="General Updates"
            description="Stay informed about VitaNips features and updates"
            enabled={preferences.notify_general_updates_email}
            onChange={() => handleToggle('notify_general_updates_email')}
            icon={<EnvelopeIcon className="h-5 w-5 text-gray-600" />}
          />
        </div>
      </div>

      {/* SMS Notifications Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <DevicePhoneMobileIcon className="h-6 w-6 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">SMS Notifications</h2>
        </div>
        {user?.phone_number ? (
          <div className="space-y-3">
            <NotificationToggle
              label="Appointment Reminder SMS"
              description={`Send text reminders to ${user.phone_number}`}
              enabled={preferences.notify_appointment_reminder_sms}
              onChange={() => handleToggle('notify_appointment_reminder_sms')}
              icon={<DevicePhoneMobileIcon className="h-5 w-5 text-blue-600" />}
            />
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Add a phone number to your profile to enable SMS notifications.
            </p>
          </div>
        )}
      </div>

      {/* Push Notifications Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BellIcon className="h-6 w-6 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Push Notifications</h2>
        </div>
        <div className="space-y-3">
          <NotificationToggle
            label="Appointment Reminder Push"
            description="Receive push notifications for appointment reminders"
            enabled={preferences.notify_appointment_reminder_push}
            onChange={() => handleToggle('notify_appointment_reminder_push')}
            icon={<BellIcon className="h-5 w-5 text-primary" />}
          />
        </div>
        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Push notifications require enabling browser notifications for VitaNips.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-4 bg-white p-4 rounded-lg border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
          </p>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
