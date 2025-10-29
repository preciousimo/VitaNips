// src/pages/doctor/DoctorPrescriptionWorkspacePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, DocumentTextIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import {
    getDoctorEligibleAppointments,
    createDoctorPrescription,
    getDoctorPrescriptions,
    EligibleAppointmentForPrescription,
    DoctorPrescriptionPayload,
} from '../../api/doctorPortal';
import { Prescription as UserPrescription } from '../../types/prescriptions';
import Modal from '../../components/common/Modal';
import DoctorPrescriptionForm from '../../features/doctor_portal/components/DoctorPrescriptionForm';

const formatDate = (dateStr: string) => new Date(dateStr + "T00:00:00Z").toLocaleDateString('en-CA');

// Simple list item for eligible appointments
const EligibleAppointmentItem: React.FC<{
    appt: EligibleAppointmentForPrescription;
    onWritePrescription: (appt: EligibleAppointmentForPrescription) => void;
}> = ({ appt, onWritePrescription }) => (
    <div className="p-3 bg-white shadow rounded-md flex justify-between items-center hover:shadow-md">
        <div>
            <p className="text-sm font-medium text-primary">{appt.patient_name} ({appt.patient_email})</p>
            <p className="text-xs text-gray-600">Appointment: {formatDate(appt.date)} - Reason: {appt.reason.substring(0,50)}...</p>
            <p className={`text-xs ${appt.has_existing_prescription ? 'text-orange-500' : 'text-green-500'}`}>
                {appt.has_existing_prescription ? 'Prescription Exists' : 'No Prescription Yet'}
            </p>
        </div>
        {!appt.has_existing_prescription && (
            <button onClick={() => onWritePrescription(appt)} className="btn-primary text-xs py-1 px-2">
                Write Prescription
            </button>
        )}
    </div>
);

// Simple list item for doctor's written prescriptions
const DoctorPrescriptionItem: React.FC<{ pres: UserPrescription }> = ({ pres }) => {
    const patientEmail = typeof pres.user === 'object' && pres.user !== null && 'email' in pres.user 
        ? (pres.user as { email?: string }).email 
        : String(pres.user);
    
    return (
        <div className="p-3 bg-white shadow rounded-md hover:shadow-md">
            <p className="text-sm font-medium text-primary">Patient: {patientEmail}</p>
            <p className="text-xs text-gray-600">Prescribed: {new Date(pres.date_prescribed + "T00:00:00Z").toLocaleDateString()} - Diagnosis: {pres.diagnosis}</p>
            <p className="text-xs mt-1">{pres.items.length} medication(s).</p>
            {/* Add Link to view/edit detail later */}
        </div>
    );
};


const DoctorPrescriptionWorkspacePage: React.FC = () => {
    const [eligibleAppointments, setEligibleAppointments] = useState<EligibleAppointmentForPrescription[]>([]);
    const [writtenPrescriptions, setWrittenPrescriptions] = useState<UserPrescription[]>([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
    const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState<EligibleAppointmentForPrescription | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);

    const fetchEligibleAppointments = useCallback(async () => {
        setIsLoadingAppointments(true); setError(null);
        try {
            const response = await getDoctorEligibleAppointments();
            setEligibleAppointments(response.results.filter(appt => !appt.has_existing_prescription)); // Only show those without prescriptions
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load eligible appointments.";
            setError(errorMessage);
        }
        finally { setIsLoadingAppointments(false); }
    }, []);

    const fetchWrittenPrescriptions = useCallback(async () => {
        setIsLoadingPrescriptions(true); setError(null);
        try {
            const response = await getDoctorPrescriptions();
            setWrittenPrescriptions(response.results);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load written prescriptions.";
            setError(errorMessage);
        }
        finally { setIsLoadingPrescriptions(false); }
    }, []);

    useEffect(() => {
        fetchEligibleAppointments();
        fetchWrittenPrescriptions();
    }, [fetchEligibleAppointments, fetchWrittenPrescriptions]);

    const handleOpenPrescriptionModal = (appt: EligibleAppointmentForPrescription) => {
        setSelectedAppointmentForPrescription(appt);
        setShowPrescriptionModal(true);
    };

    const handleClosePrescriptionModal = () => {
        setSelectedAppointmentForPrescription(null);
        setShowPrescriptionModal(false);
    };

    const handlePrescriptionSubmit = async (payload: DoctorPrescriptionPayload) => {
        setIsSubmittingForm(true);
        try {
            await createDoctorPrescription(payload);
            handleClosePrescriptionModal();
            // Refresh both lists
            await fetchEligibleAppointments();
            await fetchWrittenPrescriptions();
        } finally {
            setIsSubmittingForm(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <ClipboardDocumentListIcon className="h-8 w-8 mr-3 text-primary"/>
                    Prescription Workspace
                </h1>
            </div>

            {error && <p className="text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

            <section className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <PlusIcon className="h-6 w-6 mr-2 text-green-600"/> Write New Prescription for Completed Appointment
                </h2>
                {isLoadingAppointments ? <p>Loading appointments...</p> :
                    eligibleAppointments.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {eligibleAppointments.map(appt => (
                                <EligibleAppointmentItem key={appt.id} appt={appt} onWritePrescription={handleOpenPrescriptionModal} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No recent completed appointments found needing a prescription.</p>
                    )
                }
            </section>

            <section className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md">
                 <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-600"/> Recently Issued Prescriptions
                </h2>
                {isLoadingPrescriptions ? <p>Loading prescriptions...</p> :
                    writtenPrescriptions.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {writtenPrescriptions.map(pres => (
                                <DoctorPrescriptionItem key={pres.id} pres={pres} />
                            ))}
                        </div>
                    ) : (
                         <p className="text-sm text-gray-500">You have not issued any prescriptions recently.</p>
                    )
                }
            </section>

            {selectedAppointmentForPrescription && (
                <Modal
                    isOpen={showPrescriptionModal}
                    onClose={handleClosePrescriptionModal}
                    title={`New Prescription for ${selectedAppointmentForPrescription.patient_name}`}
                >
                    <DoctorPrescriptionForm
                        appointmentId={selectedAppointmentForPrescription.id}
                        patientName={selectedAppointmentForPrescription.patient_name}
                        appointmentDate={selectedAppointmentForPrescription.date}
                        onSubmit={handlePrescriptionSubmit}
                        onCancel={handleClosePrescriptionModal}
                        isSubmitting={isSubmittingForm}
                    />
                </Modal>
            )}
        </div>
    );
};
export default DoctorPrescriptionWorkspacePage;