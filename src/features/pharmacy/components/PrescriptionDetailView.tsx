// src/features/prescriptions/components/PrescriptionDetailView.tsx
import React, { useState } from 'react';
import { Prescription } from '../../../types/prescriptions';
import { Link } from 'react-router-dom';
import { ClipboardDocumentListIcon, TagIcon, InformationCircleIcon, ForwardIcon } from '@heroicons/react/24/outline';
import PharmacySelectionModal from '../../pharmacy/components/PharmacySelectionModal';
import { forwardPrescriptionToPharmacy } from '../../../api/prescriptions';
import axios from 'axios';

interface PrescriptionDetailViewProps {
    prescription: Prescription;
}

const PrescriptionDetailView: React.FC<PrescriptionDetailViewProps> = ({ prescription }) => {
    const [showPharmacyModal, setShowPharmacyModal] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string } | null>(null);


    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return 'Invalid Date'; }
    };

    const handleOpenPharmacyModal = () => {
        setOrderStatus(null);
        setShowPharmacyModal(true);
    };

    const handleClosePharmacyModal = () => {
        setShowPharmacyModal(false);
    };

    const handlePharmacySelected = async (pharmacyId: number) => {
        setIsOrdering(true);
        setOrderStatus(null);
        try {
            const response = await forwardPrescriptionToPharmacy(prescription.id, pharmacyId);
            setOrderStatus({ 
                success: `${response.message} Order #${response.order.id} (Status: ${response.order.status}).` 
            });
        } catch (error: unknown) {
            console.error("Prescription forwarding failed:", error);
            let errorMessage = "An unexpected error occurred while forwarding the prescription.";
            if (axios.isAxiosError(error) && error.response) {
                const { status, data } = error.response;
                if (data) {
                    if (data.error) errorMessage = data.error;
                    else if (data.warning) errorMessage = data.warning;
                    else if (data.detail) errorMessage = data.detail;
                    else if (typeof data === 'string') errorMessage = data;
                    else {
                        const messages = Object.values(data).flat().join(' ');
                        if (messages) errorMessage = messages;
                    }
                }
                if (errorMessage === "An unexpected error occurred while forwarding the prescription." || !data) {
                    switch (status) {
                        case 400:
                            errorMessage = "Invalid request. Please check the prescription details or selected pharmacy.";
                            break;
                        case 401:
                            errorMessage = "Authentication error. Please log in again.";
                            break;
                        case 403:
                            errorMessage = "You do not have permission to perform this action.";
                            break;
                        case 404:
                            errorMessage = "Prescription or Pharmacy not found.";
                            break;
                        case 409:
                            errorMessage = data?.error || "An order for this prescription already exists.";
                            if (data?.order_id) {
                                errorMessage += ` (Order ID: ${data.order_id}, Status: ${data.status})`;
                            }
                            break;
                        case 500:
                            errorMessage = "Server error. Please try again later.";
                            break;
                    }
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            setOrderStatus({ error: errorMessage });
        } finally {
            setIsOrdering(false);
        }

    };

    return (
        <>
            <PharmacySelectionModal
                isOpen={showPharmacyModal}
                onClose={handleClosePharmacyModal}
                onPharmacySelect={handlePharmacySelected}
                title={`Select Pharmacy for Prescription #${prescription.id}`}
            />

            <div className="bg-indigo-50 p-4 border border-indigo-200 rounded-b-lg -mt-3 pt-6 animate-fade-in">
                {orderStatus?.success && (
                    <div className="mb-3 p-2 bg-green-100 text-green-700 border border-green-300 rounded text-sm">
                        {orderStatus.success}
                    </div>
                )}
                {orderStatus?.error && (
                    <div className="mb-3 p-2 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
                        {orderStatus.error}
                    </div>
                )}


                <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-1">Diagnosis & Notes</h4>
                    <p className="text-sm text-gray-700 mb-1"><span className='font-medium'>Diagnosis:</span> {prescription.diagnosis}</p>
                    {prescription.notes && (
                        <p className="text-sm text-gray-600"><span className='font-medium'>Notes:</span> {prescription.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Prescribed on: {formatDate(prescription.date_prescribed)}</p>
                    <Link to={`/appointments/${prescription.appointment}`} className="text-xs text-primary hover:underline">View Associated Appointment</Link>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-primary" /> Medications Prescribed
                    </h4>
                    {prescription.items && prescription.items.length > 0 ? (
                        <ul className="space-y-3 pl-1">
                            {prescription.items.map((item) => (
                                <li key={item.id} className="border-l-2 border-primary pl-3 py-1">
                                    <p className="font-medium text-gray-800">{item.medication_name}</p>
                                    <p className="text-sm text-gray-600"><TagIcon className="h-3 w-3 inline mr-1 text-gray-400" /> {item.dosage} | {item.frequency} | {item.duration}</p>
                                    <p className="text-xs text-gray-500 mt-1"><InformationCircleIcon className="h-3 w-3 inline mr-1 text-gray-400" /> Instructions: {item.instructions}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted">No specific medications listed for this prescription.</p>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t text-right">
                    <button
                        onClick={handleOpenPharmacyModal}
                        disabled={isOrdering || !!orderStatus?.success}
                        className="btn-primary text-sm px-3 py-1 inline-flex items-center disabled:opacity-60"
                    >
                        <ForwardIcon className="h-4 w-4 mr-1.5" />
                        {isOrdering ? 'Sending...' : (orderStatus?.success ? 'Sent to Pharmacy' : 'Send to Pharmacy')}
                    </button>
                </div>
            </div>
        </>
    );
};


export default PrescriptionDetailView;