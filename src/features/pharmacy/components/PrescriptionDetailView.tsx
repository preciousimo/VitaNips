// src/features/prescriptions/components/PrescriptionDetailView.tsx
import React, { useState } from 'react'; // Added useState
import { Prescription } from '../../../types/prescriptions';
import { Link } from 'react-router-dom';
import { ClipboardDocumentListIcon, TagIcon, InformationCircleIcon, ForwardIcon } from '@heroicons/react/24/outline'; // Added ForwardIcon
import PharmacySelectionModal from '../../pharmacy/components/PharmacySelectionModal'; // Import the modal
import { createOrderFromPrescription } from '../../../api/prescriptions'; // Import the API function

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
        setOrderStatus(null); // Clear previous status
        setShowPharmacyModal(true);
    };

    const handleClosePharmacyModal = () => {
        setShowPharmacyModal(false);
    };

    const handlePharmacySelected = async (pharmacyId: number) => {
        setIsOrdering(true);
        setOrderStatus(null);
        try {
            const order = await createOrderFromPrescription(prescription.id, pharmacyId);
            // Handle success - maybe show a message and the new order ID/status
            setOrderStatus({ success: `Order #${order.id} created successfully with status: ${order.status}.` });
            // Optionally, navigate to an order page: navigate(`/orders/${order.id}`);
        } catch (error: any) {
            // Handle error - display message to user
             const backendErrors = error.response?.data;
             if (typeof backendErrors === 'object' && backendErrors !== null) {
                setOrderStatus({ error: backendErrors.error || backendErrors.warning || "Failed to create order." });
             } else {
                setOrderStatus({ error: error.message || "Failed to create order." });
             }
        } finally {
            setIsOrdering(false);
        }
    };


    return (
        <>
             {/* Pharmacy Selection Modal */}
            <PharmacySelectionModal
                isOpen={showPharmacyModal}
                onClose={handleClosePharmacyModal}
                onPharmacySelect={handlePharmacySelected}
                title={`Select Pharmacy for Prescription #${prescription.id}`}
            />

            {/* Existing Detail View Content */}
            <div className="bg-indigo-50 p-4 border border-indigo-200 rounded-b-lg -mt-3 pt-6 animate-fade-in">
                {/* Order Status Message Area */}
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
                    {/* ... diagnosis, notes, date, appointment link ... */}
                     <h4 className="font-semibold text-gray-800 mb-1">Diagnosis & Notes</h4>
                     <p className="text-sm text-gray-700 mb-1"><span className='font-medium'>Diagnosis:</span> {prescription.diagnosis}</p>
                     {prescription.notes && (
                        <p className="text-sm text-gray-600"><span className='font-medium'>Notes:</span> {prescription.notes}</p>
                     )}
                     <p className="text-xs text-gray-500 mt-1">Prescribed on: {formatDate(prescription.date_prescribed)}</p>
                     <Link to={`/appointments/${prescription.appointment}`} className="text-xs text-primary hover:underline">View Associated Appointment</Link>
                </div>

                <div>
                    {/* ... medication list ... */}
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

                 {/* "Order from Pharmacy" button */}
                 <div className="mt-4 pt-4 border-t text-right">
                     <button
                        onClick={handleOpenPharmacyModal}
                        disabled={isOrdering || !!orderStatus?.success} // Disable if ordering or already successful
                        className="btn-primary text-sm px-3 py-1 inline-flex items-center disabled:opacity-60"
                     >
                        <ForwardIcon className="h-4 w-4 mr-1.5"/>
                        {isOrdering ? 'Processing...' : (orderStatus?.success ? 'Order Placed' : 'Order from Pharmacy')}
                    </button>
                 </div>
            </div>
        </>
    );
};


export default PrescriptionDetailView;