// src/features/insurance/components/UserInsuranceCard.tsx
import React, { useState } from 'react';
import { PencilSquareIcon, TrashIcon, CheckCircleIcon, IdentificationIcon as ViewCardIcon } from '@heroicons/react/24/outline';
import { UserInsurance } from '../../../types/insurance';
import DigitalInsuranceCardModal from './DigitalInsuranceCardModal'; // Import the modal
import { useAuth } from '../../../contexts/AuthContext'; // To get user's name

interface UserInsuranceCardProps {
    insurance: UserInsurance;
    onEdit: (insurance: UserInsurance) => void;
    onDelete: (id: number) => void;
}

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return 'Invalid Date'; }
};

const UserInsuranceCard: React.FC<UserInsuranceCardProps> = ({ insurance, onEdit, onDelete }) => {
    const [showDigitalCardModal, setShowDigitalCardModal] = useState(false);
    const { user } = useAuth(); // Get current user for name

    const provider = insurance.plan?.provider;
    const plan = insurance.plan;
    const placeholderLogo = '/default-provider-logo.png'; // Ensure this path is correct in your public folder

    // Graceful handling if essential plan/provider data is missing
    if (!plan || !provider) {
        return (
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-300">
                <p className="text-sm text-red-700 font-medium">Incomplete Insurance Data</p>
                <p className="text-xs text-red-600">Policy: {insurance.policy_number || 'N/A'}. Please edit or remove this entry.</p>
                <div className="flex space-x-2 mt-2">
                    <button onClick={() => onEdit(insurance)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(insurance.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        );
    }

    // Prepare user name for the digital card
    const memberName = (user?.first_name && user?.last_name) ? `${user.first_name} ${user.last_name}` : user?.username || 'N/A';


    return (
        <>
            <div className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 border-l-4 ${insurance.is_primary ? 'border-primary' : 'border-gray-200'}`}>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                            <img
                                src={provider.logo || placeholderLogo}
                                alt={`${provider.name} Logo`}
                                className="h-10 w-10 object-contain flex-shrink-0 rounded-sm p-0.5 border border-gray-200"
                                onError={(e) => (e.currentTarget.src = placeholderLogo)}
                            />
                            <div>
                                <h3 className="font-semibold text-gray-800 text-lg">{provider.name}</h3>
                                <p className="text-sm text-primary font-medium">{plan.name} ({plan.plan_type})</p>
                            </div>
                        </div>
                        <div className="flex space-x-1 flex-shrink-0 items-center">
                            {insurance.is_primary && <CheckCircleIcon className="h-5 w-5 text-green-500" title="Primary Plan" />}
                            <button onClick={() => onEdit(insurance)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-50" title="Edit">
                                <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => onDelete(insurance.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50" title="Delete">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-gray-700 mb-4">
                        <div>
                            <span className="font-medium text-gray-500 block text-xs">Member ID:</span>
                            <span>{insurance.member_id}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500 block text-xs">Policy #:</span>
                            <span>{insurance.policy_number}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500 block text-xs">Group #:</span>
                            <span>{insurance.group_number || <span className="italic text-gray-400">N/A</span>}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500 block text-xs">Effective:</span>
                            <span>{formatDate(insurance.start_date)} - {insurance.end_date ? formatDate(insurance.end_date) : 'Current'}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3 flex justify-end">
                        <button
                            onClick={() => setShowDigitalCardModal(true)}
                            className="text-sm text-primary hover:text-primary-dark font-semibold inline-flex items-center group py-1 px-3 rounded-md hover:bg-primary-light/30 transition-colors"
                        >
                            <ViewCardIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" /> View Digital Card
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Invocation */}
            {insurance && ( // Ensure insurance object is available before rendering modal
                <DigitalInsuranceCardModal
                    isOpen={showDigitalCardModal}
                    onClose={() => setShowDigitalCardModal(false)}
                    insurance={{ ...insurance, user_name: memberName } as UserInsurance & { user_name: string }} // Pass enriched insurance object
                />
            )}
        </>
    );

};
export default UserInsuranceCard;