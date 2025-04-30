// src/features/prescriptions/components/PrescriptionDetailView.tsx

// MODIFIED: Import React hooks needed
import React, { useState } from 'react';
import { Prescription } from '../../../types/prescriptions';
import { Link } from 'react-router-dom';
// MODIFIED: Ensure all necessary icons are imported
import { ClipboardDocumentListIcon, TagIcon, InformationCircleIcon, ForwardIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import PharmacySelectionModal from '../../pharmacy/components/PharmacySelectionModal';
// MODIFIED: Import the correct API function
import { createOrderFromPrescription } from '../../../api/prescriptions'; // API function
// MODIFIED: Import MedicationOrder type for response handling
import { MedicationOrder } from '../../../types/pharmacy';
import axios from 'axios'; // Import axios to check for AxiosError

interface PrescriptionDetailViewProps {
    prescription: Prescription;
}

const PrescriptionDetailView: React.FC<PrescriptionDetailViewProps> = ({ prescription }) => {
    // State for modal visibility
    const [showPharmacyModal, setShowPharmacyModal] = useState(false);
    // State to track if API call is in progress
    const [isOrdering, setIsOrdering] = useState(false);
    // State to store success or error messages after attempting to order
    const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string } | null>(null);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            // Assume YYYY-MM-DD input, treat as UTC to avoid timezone shift issues display
            return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return 'Invalid Date'; }
    };

    // MODIFIED: Handler to open the modal - Reset status before opening
    const handleOpenPharmacyModal = () => {
        setOrderStatus(null); // Clear previous status messages
        setShowPharmacyModal(true);
    };

    // Handler to close the modal
    const handleClosePharmacyModal = () => {
        setShowPharmacyModal(false);
    };

    // MODIFIED: Handler triggered when a pharmacy is selected in the modal
    const handlePharmacySelected = async (pharmacyId: number) => {
        setIsOrdering(true); // Set loading state
        setOrderStatus(null); // Clear previous status
        console.log(`Attempting to create order for prescription ${prescription.id} at pharmacy ${pharmacyId}`);

        try {
            // Call the API function
            const order: MedicationOrder = await createOrderFromPrescription(prescription.id, pharmacyId);
            console.log("Order creation successful:", order);
            // Handle success: Update status message
            setOrderStatus({ success: `Order #${order.id} created successfully (Status: ${order.status}). View in 'My Orders'.` });
            // Consider disabling the button permanently after success if only one order per prescription is allowed

        } catch (error: any) {
            console.error("Order creation failed:", error);
            let errorMessage = "Failed to create order. Please try again.";
            // Attempt to extract more specific error from backend response
            if (axios.isAxiosError(error) && error.response?.data) {
                const backendError = error.response.data;
                // Check for specific keys the backend might send
                if (backendError.error) {
                    errorMessage = backendError.error;
                } else if (backendError.warning) {
                    // If backend sends a warning (e.g., order already exists)
                    errorMessage = backendError.warning;
                    // Optionally handle the existing order data if sent back
                    // const existingOrder = backendError.order;
                    // if (existingOrder) {
                    //    errorMessage += ` Existing Order ID: ${existingOrder.id}`;
                    // }
                } else if (typeof backendError === 'string') {
                    errorMessage = backendError;
                } else {
                     // Fallback for other structured errors
                     const messages = Object.values(backendError).flat().join(' ');
                     if (messages) errorMessage = messages;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            // Update status message with the error
            setOrderStatus({ error: errorMessage });
        } finally {
            setIsOrdering(false); // Reset loading state regardless of outcome
            // Modal is closed automatically by its internal logic after onPharmacySelect
        }
    };


    return (
        <>
            {/* Pharmacy Selection Modal */}
            <PharmacySelectionModal
                isOpen={showPharmacyModal}
                onClose={handleClosePharmacyModal}
                onPharmacySelect={handlePharmacySelected} // MODIFIED: Connect the handler
                title={`Select Pharmacy for Prescription #${prescription.id}`}
            />

            {/* Existing Detail View Content */}
            {/* MODIFIED: Added subtle background and padding */}
            <div className="bg-indigo-50 p-4 border border-indigo-200 rounded-b-lg -mt-3 pt-6 animate-fade-in">

                {/* ADDED: Order Status Message Area */}
                 {orderStatus?.success && (
                      <div className="mb-3 p-3 bg-green-100 text-green-800 border border-green-300 rounded text-sm flex items-center">
                          <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600"/>
                          {orderStatus.success}
                      </div>
                  )}
                  {orderStatus?.error && (
                      <div className="mb-3 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm flex items-center">
                           <ExclamationCircleIcon className="h-5 w-5 mr-2 text-red-600"/>
                          {orderStatus.error}
                      </div>
                  )}
                  {/* End Order Status Area */}


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
                        <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-primary"/> Medications Prescribed
                    </h4>
                    {prescription.items && prescription.items.length > 0 ? (
                         <ul className="space-y-3 pl-1">
                            {prescription.items.map((item) => (
                                <li key={item.id} className="border-l-2 border-primary pl-3 py-1">
                                     <p className="font-medium text-gray-800">{item.medication_name}</p>
                                    <p className="text-sm text-gray-600"><TagIcon className="h-3 w-3 inline mr-1 text-gray-400"/> {item.dosage} | {item.frequency} | {item.duration}</p>
                                    <p className="text-xs text-gray-500 mt-1"><InformationCircleIcon className="h-3 w-3 inline mr-1 text-gray-400"/> Instructions: {item.instructions}</p>
                                </li>
                             ))}
                         </ul>
                     ) : (
                        <p className="text-sm text-muted">No specific medications listed for this prescription.</p>
                     )}
                </div>

                 {/* MODIFIED: "Order from Pharmacy" button */}
                 <div className="mt-4 pt-4 border-t text-right">
                     <button
                        onClick={handleOpenPharmacyModal}
                        // Disable if ordering is in progress OR if an order was successfully placed OR if there are no items
                        disabled={isOrdering || !!orderStatus?.success || !prescription.items || prescription.items.length === 0}
                        className="btn-primary text-sm px-3 py-1 inline-flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
                     >
                        <ForwardIcon className="h-4 w-4 mr-1.5"/>
                        {/* Update button text based on state */}
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