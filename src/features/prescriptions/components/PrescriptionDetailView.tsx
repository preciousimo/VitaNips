// src/features/prescriptions/components/PrescriptionDetailView.tsx
import React, { useState } from 'react';
import { Prescription, PrescriptionItem } from '../../../types/prescriptions';
import { Link } from 'react-router-dom';
import {
    ClipboardDocumentListIcon, TagIcon, InformationCircleIcon, ForwardIcon,
    CheckCircleIcon, ExclamationCircleIcon, EyeIcon
} from '@heroicons/react/24/outline';
import PharmacySelectionModal from '../../pharmacy/components/PharmacySelectionModal';
import { createOrderFromPrescription } from '../../../api/prescriptions';
import { MedicationOrder } from '../../../types/pharmacy';
import axios from 'axios';
import Modal from '../../../components/common/Modal';
import MedicationInfoDisplay from '../../pharmacy/components/MedicationInfoDisplay';


interface PrescriptionDetailViewProps {
    prescription: Prescription;
}

const PrescriptionDetailView: React.FC<PrescriptionDetailViewProps> = ({ prescription }) => {
    const [showPharmacyModal, setShowPharmacyModal] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string } | null>(null);

    const [showMedInfoModal, setShowMedInfoModal] = useState(false);
    const [selectedMedicationIdForInfo, setSelectedMedicationIdForInfo] = useState<number | null>(null);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
        console.log(`Attempting to create order for prescription ${prescription.id} at pharmacy ${pharmacyId}`);

        try {
            const order: MedicationOrder = await createOrderFromPrescription(prescription.id, pharmacyId);
            console.log("Order creation successful:", order);
            setOrderStatus({ success: `Order #${order.id} created successfully (Status: ${order.status}). View in 'My Orders'.` });
        } catch (error: any) {
            console.error("Order creation failed:", error);
            let errorMessage = "Failed to create order. Please try again.";
            if (axios.isAxiosError(error) && error.response?.data) {
                const backendError = error.response.data;
                if (backendError.error) {
                    errorMessage = backendError.error;
                } else if (backendError.warning) {
                    errorMessage = backendError.warning;
                } else if (typeof backendError === 'string') {
                    errorMessage = backendError;
                } else {
                    const messages = Object.values(backendError).flat().join(' ');
                    if (messages) errorMessage = messages;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setOrderStatus({ error: errorMessage });
        } finally {
            setIsOrdering(false);
        }
    };

    const handleViewMedicationInfo = (item: PrescriptionItem) => {
        // If your PrescriptionItem directly contains medication_details (full Medication object):
        // setSelectedMedicationForInfo(item.medication_details);
        // If it only contains medication_id:
        if (item.medication_id) {
            setSelectedMedicationIdForInfo(item.medication_id);
            setShowMedInfoModal(true);
        } else {
            // Handle case where there's no structured medication linked,
            // maybe show a message or try a name-based search (more complex)
            alert(`Detailed information is not available for "${item.medication_name}" as it's not linked to a standard medication entry.`);
            console.warn(`No medication_id for prescription item: ${item.medication_name}`);
        }
    };

    const handleCloseMedInfoModal = () => {
        setShowMedInfoModal(false);
        setSelectedMedicationIdForInfo(null);
    };

    return (
        <>
            <PharmacySelectionModal
                isOpen={showPharmacyModal}
                onClose={handleClosePharmacyModal}
                onPharmacySelect={handlePharmacySelected}
                title={`Select Pharmacy for Prescription #${prescription.id}`}
            />

            {/* Medication Info Modal */}
            <Modal
                isOpen={showMedInfoModal}
                onClose={handleCloseMedInfoModal}
                title="Medication Information"
            >
                <MedicationInfoDisplay
                    medicationId={selectedMedicationIdForInfo}
                    onClose={handleCloseMedInfoModal}
                />
            </Modal>

            <div className="bg-indigo-50 p-4 border border-indigo-200 rounded-b-lg -mt-3 pt-6 animate-fade-in">

                {orderStatus?.success && (
                    <div className="mb-3 p-3 bg-green-100 text-green-800 border border-green-300 rounded text-sm flex items-center">
                        <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                        {orderStatus.success}
                    </div>
                )}
                {orderStatus?.error && (
                    <div className="mb-3 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm flex items-center">
                        <ExclamationCircleIcon className="h-5 w-5 mr-2 text-red-600" />
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
                                <li key={item.id} className="border-l-2 border-primary pl-3 py-2 bg-white/50 rounded-r-md shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800">{item.medication_name}</p>
                                            <p className="text-sm text-gray-600">
                                                <TagIcon className="h-3 w-3 inline mr-1 text-gray-400" />
                                                {item.dosage} | {item.frequency} | {item.duration}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                <InformationCircleIcon className="h-3 w-3 inline mr-1 text-gray-400" />
                                                Instructions: {item.instructions}
                                            </p>
                                        </div>
                                        {/* Button to view medication info */}
                                        {item.medication_id && ( // Only show if there's a linked structured medication
                                            <button
                                                onClick={() => handleViewMedicationInfo(item)}
                                                className="p-1 text-blue-600 hover:text-blue-800 flex-shrink-0"
                                                title={`View details for ${item.medication_name}`}
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
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
                        disabled={isOrdering || !!orderStatus?.success || !prescription.items || prescription.items.length === 0}
                        className="btn-primary text-sm px-3 py-1 inline-flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <ForwardIcon className="h-4 w-4 mr-1.5" />
                        {isOrdering ? 'Processing...' : (orderStatus?.success ? 'Order Placed' : 'Order from Pharmacy')}
                    </button>
                    {(!prescription.items || prescription.items.length === 0) && (
                        <p className="text-xs text-red-500 mt-1 text-right">Cannot order: Prescription has no items.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default PrescriptionDetailView;