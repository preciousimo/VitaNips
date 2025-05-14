// src/features/insurance/components/DigitalInsuranceCardModal.tsx
import React from 'react';
import { UserInsurance } from '../../../types/insurance';
import Modal from '../../../components/common/Modal'; // Your existing Modal component
import { IdentificationIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface DigitalInsuranceCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    insurance: UserInsurance | null;
}

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const DigitalInsuranceCardModal: React.FC<DigitalInsuranceCardModalProps> = ({ isOpen, onClose, insurance }) => {
    if (!insurance || !insurance.plan) return null; // Or a loading/error state if fetched async

    const provider = insurance.plan.provider;
    const plan = insurance.plan;
    const placeholderLogo = '/default-provider-logo.png'; // Path to your placeholder

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Digital Insurance Card">
            <div className="p-2 sm:p-4">
                <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl shadow-2xl p-6 space-y-4 transform transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{provider.name}</h2>
                            <p className="text-sm opacity-90">{plan.name} ({plan.plan_type})</p>
                        </div>
                        <img
                            src={provider.logo || placeholderLogo}
                            alt={`${provider.name} Logo`}
                            className="h-10 w-auto object-contain bg-white p-1 rounded-md flex-shrink-0"
                            onError={(e) => (e.currentTarget.src = placeholderLogo)}
                        />
                    </div>

                    <div className="border-t border-white/30 pt-4 space-y-3">
                        <div>
                            <p className="text-xs opacity-80 tracking-wider">MEMBER NAME</p>
                            <p className="text-lg font-medium">
                                {/* Assuming user name is not directly on UserInsurance, you'd fetch/pass it or use placeholder */}
                                [User Full Name Here]
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs opacity-80 tracking-wider">MEMBER ID</p>
                                <p className="text-md font-medium">{insurance.member_id}</p>
                            </div>
                            <div>
                                <p className="text-xs opacity-80 tracking-wider">POLICY NUMBER</p>
                                <p className="text-md font-medium">{insurance.policy_number}</p>
                            </div>
                            {insurance.group_number && (
                                <div>
                                    <p className="text-xs opacity-80 tracking-wider">GROUP NUMBER</p>
                                    <p className="text-md font-medium">{insurance.group_number}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs opacity-80 tracking-wider">EFFECTIVE DATE</p>
                                <p className="text-md font-medium">{formatDate(insurance.start_date)}</p>
                            </div>
                            {insurance.end_date && (
                                <div>
                                    <p className="text-xs opacity-80 tracking-wider">EXPIRY DATE</p>
                                    <p className="text-md font-medium">{formatDate(insurance.end_date)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {insurance.is_primary && (
                        <div className="flex items-center justify-end text-xs opacity-90 mt-2">
                            <ShieldCheckIcon className="h-4 w-4 mr-1"/> Primary Plan
                        </div>
                    )}
                </div>

                {(insurance.insurance_card_front || insurance.insurance_card_back) && (
                    <div className="mt-6">
                        <h4 className="text-md font-semibold text-gray-700 mb-2">Scanned Card Images:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {insurance.insurance_card_front && (
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Front</p>
                                    <img src={insurance.insurance_card_front} alt="Insurance Card Front" className="rounded-lg shadow-md w-full object-contain max-h-60" />
                                </div>
                            )}
                            {insurance.insurance_card_back && (
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Back</p>
                                    <img src={insurance.insurance_card_back} alt="Insurance Card Back" className="rounded-lg shadow-md w-full object-contain max-h-60" />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                 <div className="mt-6 text-right">
                    <button onClick={onClose} className="btn-primary bg-gray-600 hover:bg-gray-700 px-4 py-2 text-sm">Close</button>
                </div>
            </div>
        </Modal>
    );
};
export default DigitalInsuranceCardModal;