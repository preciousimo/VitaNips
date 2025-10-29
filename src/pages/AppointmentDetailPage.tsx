// src/pages/AppointmentDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon, CalendarIcon, ClockIcon, VideoCameraIcon, BuildingOfficeIcon,
    CheckCircleIcon, XCircleIcon, InformationCircleIcon, TrashIcon, UserIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { getAppointmentDetails, cancelAppointment } from '../api/appointments';
import { Appointment } from '../types/appointments';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/common/ConfirmDialog';

const formatTime = (timeStr: string): string => {
    if (!timeStr) return '';
    try {
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch { return timeStr; }
};

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch { return 'Invalid Date'; }
};

const getStatusInfo = (status: Appointment['status']): { text: string; color: string; icon: React.ElementType, bgColor?: string } => {
    switch (status) {
        case 'scheduled': return { text: 'Scheduled', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: InformationCircleIcon };
        case 'confirmed': return { text: 'Confirmed', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircleIcon };
        case 'completed': return { text: 'Completed', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: CheckCircleIcon };
        case 'cancelled': return { text: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircleIcon };
        case 'no_show': return { text: 'No Show', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: XCircleIcon };
        default: return { text: status, color: 'text-gray-700', bgColor: 'bg-gray-100', icon: InformationCircleIcon };
    }
};
const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-20">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => <p className="text-red-600 bg-red-50 p-3 rounded-md text-center">{message}</p>;


const AppointmentDetailPage: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    const fetchAppointment = useCallback(async () => {
        if (!appointmentId) { setError("Appointment ID not found."); setIsLoading(false); return; }
        const id = parseInt(appointmentId, 10);
        if (isNaN(id)) { setError("Invalid Appointment ID."); setIsLoading(false); return; }
        setIsLoading(true); setError(null);
        try {
            const data = await getAppointmentDetails(id);
            setAppointment(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load appointment details.";
            setError(errorMessage); 
            setAppointment(null);
            console.error("Fetch appointment error:", err);
        } finally { setIsLoading(false); }
    }, [appointmentId]);

    useEffect(() => {
        fetchAppointment();
    }, [fetchAppointment]);

    const handleCancel = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmCancel = async () => {
        if (!appointment) return;
        setIsCancelling(true);
        setError(null);
        const toastId = toast.loading("Cancelling appointment...");
        try {
            await cancelAppointment(appointment.id);
            toast.success('Appointment cancelled successfully.', { id: toastId });
            setShowConfirmDialog(false);
            // navigate('/appointments', { state: { message: 'Appointment cancelled successfully.' } }); // Or refresh current page
            fetchAppointment(); // Refresh the details on the current page
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to cancel appointment.";
            setError(errorMsg);
            toast.error(errorMsg, { id: toastId });
            console.error("Cancel appointment error:", err);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleCancelDialog = () => {
        setShowConfirmDialog(false);
    };

    const handleScheduleFollowUp = () => {
        if (!appointment) return;

        const doctorId = appointment.doctor; // Assuming doctor ID is directly on appointment
        const originalDate = formatDate(appointment.date);
        const reasonSummary = appointment.reason.length > 30 ? appointment.reason.substring(0, 27) + "..." : appointment.reason;

        const followUpReason = `Follow-up for appointment on ${originalDate} (Reason: ${reasonSummary})`;

        // Navigate to the doctor's detail page to open the booking modal
        // Pass follow-up information in the state
        navigate(`/doctors/${doctorId}`, {
            state: {
                isFollowUp: true,
                originalAppointmentId: appointment.id,
                prefillReason: followUpReason,
                openBookingModalDirectly: true // Instruction for DoctorDetailPage to open modal
            }
        });
    };

    if (isLoading) return <div className="text-center py-10"><LoadingSpinner /></div>;
    if (error && !appointment) return <div className="text-center py-10"><ErrorMessage message={error} /></div>;
    if (!appointment) return <div className="text-center py-10"><p className="text-muted">Appointment not found.</p></div>;

    const now = new Date();
    const appointmentStartDateTime = new Date(`${appointment.date}T${appointment.start_time}`);
    const appointmentEndDateTime = new Date(`${appointment.date}T${appointment.end_time}`);

    const joinWindowStart = new Date(appointmentStartDateTime.getTime() - 15 * 60000); // 15 mins before
    const callInProgressOrJoinable = now >= joinWindowStart && now <= appointmentEndDateTime; // Can join if within 15 mins prior up to end time

    const canCancel = ['scheduled', 'confirmed'].includes(appointment.status) && appointmentStartDateTime > now;
    const canJoinCall = appointment.appointment_type === 'virtual' &&
        ['scheduled', 'confirmed'].includes(appointment.status) &&
        callInProgressOrJoinable;

    const showScheduleFollowUp = appointment.status === 'completed' || (appointment.followup_required && appointment.status !== 'cancelled');

    const { text: statusText, color: statusColor, bgColor: statusBgColor, icon: StatusIcon } = getStatusInfo(appointment.status);

    return (
        <div className="max-w-3xl mx-auto">
            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelDialog}
                onConfirm={handleConfirmCancel}
                title="Cancel Appointment"
                message="Are you sure you want to cancel this appointment? This action cannot be undone."
                confirmText="Cancel Appointment"
                cancelText="Keep Appointment"
                isLoading={isCancelling}
            />
            {error && !isCancelling && <div className="mb-4"><ErrorMessage message={error} /></div>}
            <Link to="/appointments" className="inline-flex items-center text-primary hover:underline mb-4 text-sm group">
                <ArrowLeftIcon className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" /> Back to Appointments
            </Link>

            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <div className={`px-6 py-4 border-b border-gray-200 ${statusBgColor || 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Appointment Details</h1>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColor} ${statusBgColor ? statusBgColor.replace('bg-', 'border-') : 'border-gray-300'} border`}>
                            <StatusIcon className={`h-4 w-4 mr-1.5 ${statusColor}`} />
                            {statusText}
                        </span>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-5">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Doctor</p>
                            <Link to={`/doctors/${appointment.doctor}`} className="text-lg font-semibold text-primary hover:underline">
                                Dr. [Name for ID: {appointment.doctor}] {/* Replace with actual doctor name if available */}
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="flex items-start">
                            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2.5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-gray-500">Date</p>
                                <p className="text-md text-gray-800">{formatDate(appointment.date)}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <ClockIcon className="h-5 w-5 text-gray-400 mr-2.5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-gray-500">Time</p>
                                <p className="text-md text-gray-800">{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            {appointment.appointment_type === 'virtual' ?
                                <VideoCameraIcon className="h-5 w-5 text-purple-600 mr-2.5 mt-0.5 flex-shrink-0" /> :
                                <BuildingOfficeIcon className="h-5 w-5 text-teal-600 mr-2.5 mt-0.5 flex-shrink-0" />}
                            <div>
                                <p className="text-xs font-medium text-gray-500">Type</p>
                                <p className="text-md text-gray-800 capitalize">{appointment.appointment_type.replace('_', '-')}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Reason for Visit</p>
                        <p className="text-md text-gray-700 mt-1 bg-gray-50 p-3 rounded-md">{appointment.reason || <span className='italic'>Not specified</span>}</p>
                    </div>
                    {appointment.notes && (
                        <div>
                            <p className="text-sm font-medium text-gray-500">Additional Notes from Doctor/System</p>
                            <p className="text-md text-gray-700 mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{appointment.notes}</p>
                        </div>
                    )}
                    {appointment.followup_required && !showScheduleFollowUp && (<p className="text-sm text-orange-600 font-semibold">A follow-up is recommended for this appointment.</p>)}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3 items-center">
                    {canJoinCall && (
                        <Link to={`/appointments/${appointment.id}/call`} className="btn-primary inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 focus:ring-green-500">
                            <VideoCameraIcon className="h-5 w-5 mr-2" />Join Virtual Call
                        </Link>
                    )}
                    {canCancel && (
                        <button onClick={handleCancel} disabled={isCancelling} className="inline-flex items-center px-4 py-2 border border-red-500 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 disabled:opacity-60">
                            <TrashIcon className="h-5 w-5 mr-2" />{isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
                        </button>
                    )}
                    {showScheduleFollowUp && (
                        <button
                            onClick={handleScheduleFollowUp}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <ArrowPathIcon className="h-5 w-5 mr-2" />
                            Schedule Follow-up
                        </button>
                    )}
                    {!canCancel && !canJoinCall && !showScheduleFollowUp && appointment.status !== 'cancelled' && (
                        <p className="text-sm text-gray-500">This appointment has passed or cannot be modified further.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailPage;