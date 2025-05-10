// src/pages/ProfilePage.tsx
import React, { useState, useCallback } from 'react';
import { PencilIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, UserProfileUpdatePayload } from '../api/user';
import ProfileEditForm from '../features/user/components/ProfileEditForm';
import { User } from '../types/user';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, fetchUserProfile } = useAuth();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleProfileUpdate = async (payload: UserProfileUpdatePayload): Promise<User | void> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
        const updatedUser = await updateUserProfile(payload);
        if (fetchUserProfile) {
            await fetchUserProfile(localStorage.getItem('accessToken') || '');
         } else {
             console.warn("AuthContext does not provide fetchUserProfile. Cannot refresh user state automatically.");
         }

        setSuccess("Profile updated successfully!");
        setIsEditing(false);
    } catch (err: any) {
        console.error("Update failed:", err);
        setError("Failed to update profile. Check form for details.");
        throw err;
    } finally {
        setIsSubmitting(false);
    }
  };

  const displayField = (value: string | number | null | undefined, placeholder = 'Not set') => {
      return value || <span className="text-muted italic">{placeholder}</span>;
  }
  const displayDateField = (value: string | null | undefined) => {
       if (!value) return <span className="text-muted italic">Not set</span>;
        try {
            return new Date(value + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return <span className="text-red-500">Invalid Date</span>; }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
        {!isEditing && (
             <button
                onClick={handleEditToggle}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
                 <PencilIcon className="h-5 w-5 mr-2" />
                Edit Profile
            </button>
        )}
      </div>

       {success && !isEditing && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
              {success}
          </div>
       )}


      {isEditing ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <ProfileEditForm
                    initialData={user}
                    onSubmit={handleProfileUpdate}
                    onCancel={handleCancelEdit}
                    isSubmitting={isSubmitting}
                />
            </div>
      ) : (
            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                <div className="pb-4 border-b">
                     <h3 className="text-lg font-semibold text-gray-700 mb-3">Basic Information</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Username:</strong> {user?.username}</p>
                        <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
                        <p><strong>Phone:</strong> {displayField(user?.phone_number)}</p>
                        <p><strong>Date of Birth:</strong> {displayDateField(user?.date_of_birth)}</p>
                    </div>
                </div>

                 <div className="pb-4 border-b">
                     <h3 className="text-lg font-semibold text-gray-700 mb-3">Health Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                         <p><strong>Blood Group:</strong> {displayField(user?.blood_group)}</p>
                         <p><strong>Weight (kg):</strong> {displayField(user?.weight)}</p>
                         <p><strong>Height (cm):</strong> {displayField(user?.height)}</p>
                        <div className="md:col-span-2">
                            <p className="font-medium">Allergies:</p>
                            <p className="text-gray-600 whitespace-pre-wrap">{displayField(user?.allergies, 'No allergies listed.')}</p>
                         </div>
                         <div className="md:col-span-2">
                            <p className="font-medium">Chronic Conditions:</p>
                            <p className="text-gray-600 whitespace-pre-wrap">{displayField(user?.chronic_conditions, 'No conditions listed.')}</p>
                         </div>
                    </div>
                 </div>

                 <Link to="/emergency-contacts">Emergency Contacts section</Link>."

            </div>
      )}
    </div>
  );
};

export default ProfilePage;