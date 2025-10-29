// src/pages/ProfilePage.tsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    PencilIcon, ShieldCheckIcon, UserCircleIcon, CakeIcon, PhoneIcon, MapPinIcon, AtSymbolIcon, IdentificationIcon, // Basic Info
    HeartIcon, LifebuoyIcon, // Health & Emergency
    BellAlertIcon // Notifications
} from '@heroicons/react/24/outline'; // Using outline for a cleaner look in display mode
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, UserProfileUpdatePayload } from '../api/user';
import ProfileEditForm from '../features/user/components/ProfileEditForm';
import toast from 'react-hot-toast';

// Helper to display fields nicely
const DisplayInfoItem: React.FC<{
    icon?: React.ElementType;
    label: string;
    value: string | number | React.ReactNode | null | undefined;
    placeholder?: string;
    className?: string;
    isRawHTML?: boolean;
}> = ({ icon: Icon, label, value, placeholder = 'Not specified', className = '', isRawHTML = false }) => {
    const displayValue = (value === null || value === undefined || String(value).trim() === '')
        ? <span className="text-gray-400 italic">{placeholder}</span>
        : value;

    return (
        <div className={`flex items-start ${className}`}>
            {Icon && <Icon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />}
            <div className="flex-grow">
                <dt className="text-xs font-medium text-gray-500">{label}</dt>
                {isRawHTML && typeof displayValue === 'string' ? (
                    <dd className="mt-0.5 text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: displayValue }} />
                ) : (
                    <dd className="mt-0.5 text-sm text-gray-800">{displayValue}</dd>
                )}
            </div>
        </div>
    );
};

const ProfileSectionCard: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode, actionLink?: { to: string; label: string } }> = ({ title, icon: Icon, children, actionLink }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                {Icon && <Icon className="h-6 w-6 mr-2 text-primary" />}
                {title}
            </h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
            {children}
            {actionLink && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                    <Link to={actionLink.to} className="text-sm text-primary hover:text-primary-dark font-medium">
                        {actionLink.label} &rarr;
                    </Link>
                </div>
            )}
        </div>
    </div>
);


const ProfilePage: React.FC = () => {
    const { user, fetchUserProfile } = useAuth();

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    // Error and success will now be handled by react-hot-toast for better UX

    const handleEditToggle = () => setIsEditing(!isEditing);

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleProfileUpdate = async (payload: UserProfileUpdatePayload): Promise<void> => {
        setIsSubmitting(true);
        const toastId = toast.loading("Updating profile...");
        try {
            await updateUserProfile(payload);
            if (fetchUserProfile) {
                await fetchUserProfile(localStorage.getItem('accessToken') || '');
            }
            toast.success("Profile updated successfully!", { id: toastId });
            setIsEditing(false);
        } catch (err) {
            console.error("Update failed:", err);
            const errorData = err && typeof err === 'object' && 'response' in err 
                ? (err as { response?: { data?: unknown } }).response?.data 
                : undefined;
            let errorMessage = "Failed to update profile.";
             if (errorData && typeof errorData === 'object') {
                errorMessage = Object.entries(errorData)
                    .map(([key, val]) => `${key !== 'detail' ? (key + ': ') : ''}${Array.isArray(val) ? val.join(', ') : val}`)
                    .join('; ') || errorMessage;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (err instanceof Error && err.message) {
                errorMessage = err.message;
            }
            toast.error(errorMessage, { id: toastId, duration: 5000 });
            throw err; // Re-throw for ProfileEditForm to potentially handle specific field errors if needed
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayDateField = (value: string | null | undefined) => {
        if (!value) return null; // Handled by DisplayInfoItem placeholder
        try {
            // Assuming date is YYYY-MM-DD from backend
            return new Date(value + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return <span className="text-red-500">Invalid Date</span>; }
    };

    const primaryEmergencyContact = useMemo(() => {
        return user?.emergency_contacts?.find(contact => contact.is_primary);
    }, [user?.emergency_contacts]);

    const primaryInsurance = useMemo(() => {
        return user?.insurance_details?.find(ins => ins.is_primary);
    }, [user?.insurance_details]);


    const UserAvatar = () => (
        <div className="flex-shrink-0 h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-4 border-white shadow-lg relative group">
            {user?.profile_picture ? (
                <img className="h-full w-full object-cover" src={user.profile_picture} alt="Profile" />
            ) : (
                <UserCircleIcon className="h-full w-full text-gray-300 bg-gray-100" />
            )}
             {/* <button onClick={handleEditToggle} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100 rounded-full">
                <PencilIcon className="h-6 w-6 text-white"/>
            </button> */}
        </div>
    );


    if (!user && !isEditing) { // Show loading or placeholder if user data not yet available
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-3 text-gray-600">Loading profile...</p>
            </div>
        );
    }


    return (
        <div className="max-w-5xl mx-auto pb-12">
            {isEditing ? (
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
                     <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Edit Your Profile</h1>
                    </div>
                    <ProfileEditForm
                        initialData={user}
                        onSubmit={handleProfileUpdate}
                        onCancel={handleCancelEdit}
                        isSubmitting={isSubmitting}
                    />
                </div>
            ) : (
                <>
                    {/* Profile Header */}
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6">
                            <UserAvatar />
                            <div className="mt-4 sm:mt-0 flex-grow text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {user?.first_name || ''} {user?.last_name || ''}
                                </h1>
                                <p className="text-md text-primary">{user?.username}</p>
                                <p className="text-sm text-gray-500 mt-1 flex items-center justify-center sm:justify-start">
                                    <AtSymbolIcon className="h-4 w-4 mr-1.5 text-gray-400"/>{user?.email}
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-0 flex-shrink-0">
                                <button
                                    onClick={handleEditToggle}
                                    className="btn-primary inline-flex items-center px-4 py-2 text-sm"
                                >
                                    <PencilIcon className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                            <ProfileSectionCard title="Basic Information" icon={IdentificationIcon}>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                                    <DisplayInfoItem label="Full Name" value={`${user?.first_name || ''} ${user?.last_name || ''}`} />
                                    <DisplayInfoItem label="Username" value={user?.username} />
                                    <DisplayInfoItem label="Email Address" value={user?.email} icon={AtSymbolIcon}/>
                                    <DisplayInfoItem label="Phone Number" value={user?.phone_number} icon={PhoneIcon} />
                                    <DisplayInfoItem label="Date of Birth" value={displayDateField(user?.date_of_birth)} icon={CakeIcon} />
                                    <DisplayInfoItem label="Address" value={user?.address} icon={MapPinIcon} placeholder="Address not set."/>
                                </dl>
                            </ProfileSectionCard>

                            <ProfileSectionCard title="Health Overview" icon={HeartIcon}>
                                 <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                                    <DisplayInfoItem label="Blood Group" value={user?.blood_group} />
                                    <DisplayInfoItem label="Genotype" value={user?.genotype} />
                                    <DisplayInfoItem label="Weight" value={user?.weight ? `${user.weight} kg` : null} />
                                    <DisplayInfoItem label="Height" value={user?.height ? `${user.height} cm` : null} />
                                    <div className="sm:col-span-2">
                                        <DisplayInfoItem label="Allergies" value={user?.allergies} placeholder="No allergies listed." />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <DisplayInfoItem label="Chronic Conditions" value={user?.chronic_conditions} placeholder="No chronic conditions listed." />
                                    </div>
                                </dl>
                            </ProfileSectionCard>
                        </div>

                        <div className="space-y-6 lg:space-y-8">
                             <ProfileSectionCard title="Emergency Contact" icon={LifebuoyIcon} actionLink={{to: "/emergency-contacts", label: "Manage All Contacts"}}>
                                {primaryEmergencyContact ? (
                                    <dl className="space-y-3">
                                        <DisplayInfoItem label="Primary Contact Name" value={primaryEmergencyContact.name} />
                                        <DisplayInfoItem label="Relationship" value={primaryEmergencyContact.relationship} />
                                        <DisplayInfoItem label="Phone" value={primaryEmergencyContact.phone_number} icon={PhoneIcon}/>
                                    </dl>
                                ) : (
                                    <p className="text-sm text-gray-500">No primary emergency contact set. </p>
                                )}
                            </ProfileSectionCard>

                            <ProfileSectionCard title="Insurance" icon={ShieldCheckIcon} actionLink={{to: "/insurance", label: "Manage Insurance"}}>
                                {primaryInsurance ? (
                                     <dl className="space-y-3">
                                        <DisplayInfoItem label="Primary Provider" value={primaryInsurance.plan.provider.name} />
                                        <DisplayInfoItem label="Plan Name" value={primaryInsurance.plan.name} />
                                        <DisplayInfoItem label="Policy/Member ID" value={`${primaryInsurance.policy_number} / ${primaryInsurance.member_id}`} />
                                     </dl>
                                ) : (
                                    <p className="text-sm text-gray-500">No primary insurance plan set.</p>
                                )}
                            </ProfileSectionCard>

                            <ProfileSectionCard title="Notification Preferences" icon={BellAlertIcon}>
                                <dl className="space-y-2">
                                    <DisplayInfoItem label="Appointment Email Reminders" value={user?.notify_appointment_reminder_email ? "Enabled" : "Disabled"} />
                                    <DisplayInfoItem label="Appointment SMS Reminders" value={user?.notify_appointment_reminder_sms ? "Enabled" : "Disabled"} />
                                    <DisplayInfoItem label="Appointment Push Reminders" value={user?.notify_appointment_reminder_push ? "Enabled" : "Disabled"} />
                                    <DisplayInfoItem label="Medication Refill Email Reminders" value={user?.notify_refill_reminder_email ? "Enabled" : "Disabled"} />
                                </dl>
                                <p className="text-xs text-gray-400 mt-3">You can change these when you edit your profile.</p>
                            </ProfileSectionCard>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProfilePage;