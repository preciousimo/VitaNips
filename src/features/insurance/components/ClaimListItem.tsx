// src/features/insurance/components/ClaimListItem.tsx
import React from 'react';
import { InsuranceClaim, ClaimStatus } from '../../../types/insuranceClaims';
import { CalendarDaysIcon, HashtagIcon, BanknotesIcon, InformationCircleIcon, CheckCircleIcon, ClockIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ClaimListItemProps {
    claim: InsuranceClaim;
    // onSelect?: (claim: InsuranceClaim) => void; // For future detail view
}

const formatDateDisplay = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch { return dateStr; }
};

const getStatusInfo = (status: ClaimStatus): { text: string; color: string; icon: React.ElementType } => {
    switch (status) {
        case 'submitted': return { text: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: InformationCircleIcon };
        case 'in_review': return { text: 'In Review', color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon };
        case 'additional_info': return { text: 'Info Requested', color: 'bg-orange-100 text-orange-700', icon: InformationCircleIcon };
        case 'approved': return { text: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircleIcon };
        case 'partially_approved': return { text: 'Partially Approved', color: 'bg-teal-100 text-teal-700', icon: CheckCircleIcon };
        case 'denied': return { text: 'Denied', color: 'bg-red-100 text-red-700', icon: ExclamationTriangleIcon };
        case 'paid': return { text: 'Paid', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircleIcon };
        default: return { text: status, color: 'bg-gray-100 text-gray-700', icon: InformationCircleIcon };
    }
};


const ClaimListItem: React.FC<ClaimListItemProps> = ({ claim }) => {
    const statusInfo = getStatusInfo(claim.status);

    return (
        <div className="bg-white p-4 my-3 rounded-lg shadow hover:shadow-xl transition-shadow duration-200 border-l-4 border-primary">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                <div className="flex-grow">
                    <div className="flex items-center mb-1">
                        <DocumentTextIcon className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                        <h3 className="font-semibold text-gray-800 text-md">
                            Claim: {claim.claim_number || `ID ${claim.id}`}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 ml-7">
                        For: {claim.user_insurance_display?.plan?.provider?.name} - {claim.user_insurance_display?.plan?.name}
                    </p>
                    <p className="text-sm text-gray-700 ml-7 mt-1">
                        Medical Provider: <span className="font-medium">{claim.provider_name}</span>
                    </p>
                    <p className="text-xs text-gray-600 ml-7 mt-1">
                        <CalendarDaysIcon className="h-3.5 w-3.5 inline mr-1 text-gray-500"/>
                        Service Date: {formatDateDisplay(claim.service_date)}
                    </p>
                    <p className="text-xs text-gray-600 ml-7">
                        <BanknotesIcon className="h-3.5 w-3.5 inline mr-1 text-gray-500"/>
                        Amount Claimed: <span className="font-semibold">NGN {parseFloat(claim.claimed_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </p>
                </div>
                <div className="flex-shrink-0 mt-2 sm:mt-0 sm:text-right">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <statusInfo.icon className="h-3.5 w-3.5 mr-1.5" />
                        {statusInfo.text}
                    </span>
                    <p className="text-xs text-gray-500 mt-1.5">
                        Submitted: {formatDateDisplay(claim.date_submitted)}
                    </p>
                    {claim.date_processed && (
                         <p className="text-xs text-gray-500 mt-0.5">
                            Processed: {formatDateDisplay(claim.date_processed)}
                        </p>
                    )}
                </div>
            </div>
            {claim.service_description &&
                <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200 ml-7">
                    <span className="font-medium">Service:</span> {claim.service_description}
                </p>
            }
            {claim.approved_amount &&
                <p className="text-xs text-green-600 font-semibold mt-1 ml-7">
                    Amount Approved: NGN {parseFloat(claim.approved_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
            }
            {claim.notes &&
                <p className="text-xs text-gray-500 mt-1 ml-7">Notes: {claim.notes}</p>
            }
        </div>
    );
};

export default ClaimListItem;