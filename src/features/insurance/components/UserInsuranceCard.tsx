// src/features/insurance/components/UserInsuranceCard.tsx
import React from 'react';
import { PencilSquareIcon, TrashIcon, CheckCircleIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { UserInsurance } from '../../../types/insurance';

interface UserInsuranceCardProps {
    insurance: UserInsurance;
    onEdit: (insurance: UserInsurance) => void;
    onDelete: (id: number) => void;
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return 'Invalid Date'; }
};

const UserInsuranceCard: React.FC<UserInsuranceCardProps> = ({ insurance, onEdit, onDelete }) => {
    const provider = insurance.plan.provider;
    const plan = insurance.plan;
    const placeholderLogo = '/default-provider-logo.png'; // Add a default logo in public folder

    return (
        <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-150 border-l-4 ${insurance.is_primary ? 'border-primary' : 'border-gray-300'}`}>
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                        <img
                            src={provider.logo || placeholderLogo}
                            alt={`${provider.name} Logo`}
                            className="h-10 w-auto object-contain flex-shrink-0"
                            onError={(e) => (e.currentTarget.src = placeholderLogo)}
                        />
                        <div>
                            <h3 className="font-semibold text-gray-800">{provider.name}</h3>
                            <p className="text-sm text-primary font-medium">{plan.name} ({plan.plan_type})</p>
                        </div>
                    </div>
                     <div className="flex space-x-1 flex-shrink-0">
                        {insurance.is_primary && <CheckCircleIcon className="h-5 w-5 text-green-600" title="Primary Plan"/>}
                        <button onClick={() => onEdit(insurance)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => onDelete(insurance.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                    <div>
                        <span className="font-medium text-gray-500 block text-xs">Member ID</span>
                        <span className="text-gray-700">{insurance.member_id}</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-500 block text-xs">Policy #</span>
                        <span className="text-gray-700">{insurance.policy_number}</span>
                    </div>
                     <div>
                        <span className="font-medium text-gray-500 block text-xs">Group #</span>
                        <span className="text-gray-700">{insurance.group_number || 'N/A'}</span>
                    </div>
                     <div>
                        <span className="font-medium text-gray-500 block text-xs">Effective Dates</span>
                        <span className="text-gray-700">{formatDate(insurance.start_date)} - {insurance.end_date ? formatDate(insurance.end_date) : 'Present'}</span>
                    </div>
                </div>

                {/* Placeholder/Link for Card Images */}
                {(insurance.insurance_card_front || insurance.insurance_card_back) && (
                     <div className="border-t pt-2 mt-2">
                         <button className="text-sm text-blue-600 hover:underline inline-flex items-center">
                            <IdentificationIcon className="h-4 w-4 mr-1" /> View Card Images
                         </button>
                         {/* Add logic to show images in a modal later */}
                     </div>
                )}
            </div>
        </div>
    );
};

export default UserInsuranceCard;