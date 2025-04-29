// src/pages/AppointmentDetailPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    CalendarIcon,
    ClockIcon,
    VideoCameraIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    PencilIcon, // Maybe for rescheduling later?
    TrashIcon, // Maybe for cancelling here instead of list?
    UserIcon
} from '@heroicons/react/24/outline'; // Using outline for consistency

import { getAppointmentDetails, cancelAppointment } from '../api/appointments'; // API calls
import { Appointment } from '../types/appointments'; // Type definition
// Optional: Import Doctor type if fetching doctor details separately
// import { Doctor } from '../../types/doctors';
// import { getDoctorById } from '../../api/doctors';

// Assume LoadingSpinner and ErrorMessage components exist
// import LoadingSpinner from '../../components/common/LoadingSpinner';
// import ErrorMessage from '../../components/common/ErrorMessage';

// --- Helper Functions (Consider moving to a utils file) ---
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
        // Use local timezone for display interpretation of date string
        // Add time component to avoid potential off-by-one day issues depending on browser TZ interpretation
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch { return 'Invalid Date'; }
};

const getStatusInfo = (status: Appointment['status']): { text: string; color: string; icon: React.ElementType } => {
     switch (status) {
        case 'scheduled': return { text: 'Scheduled', color: 'text-blue-600', icon: InformationCircleIcon };
        case 'confirmed': return { text: 'Confirmed', color: 'text-green-600', icon: CheckCircleIcon };
        case 'completed': return { text: 'Completed', color: 'text-gray-500', icon: CheckCircleIcon };
        case 'cancelled': return { text: 'Cancelled', color: 'text-red-600', icon: XCircleIcon };
        case 'no_show': return { text: 'No Show', color: 'text-orange-600', icon: XCircleIcon };
        default: return { text: status, color: 'text-gray-500', icon: InformationCircleIcon };
    }
};
// --- End Helper Functions ---


const AppointmentDetailPage: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    // Optional: state for doctor details if fetched separately
    // const [doctorDetails, setDoctorDetails] = useState<Doctor | null>(null);

    // --- Fetch Appointment Data ---
    const fetchAppointment = useCallback(async () => {
        if (!appointmentId) {
            setError("Appointment ID not found in URL.");
            setIsLoading(false);
            return;
        }

        // Validate ID format
        const id = parseInt(appointmentId, 10);
        if (isNaN(id)) {
             setError("Invalid Appointment ID format.");
             setIsLoading(false);
             return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await getAppointmentDetails(id);
            setAppointment(data);
            // Optional: Fetch doctor details if needed
            // if (data.doctor) {
            //    const doctorData = await getDoctorById(data.doctor);
            //    setDoctorDetails(doctorData);
            // }
        } catch (err: any) {
            console.error("Failed to fetch appointment details:", err);
            setError(err.message || "Failed to load appointment details.");
            setAppointment(null);
        } finally {
            setIsLoading(false);
        }
    }, [appointmentId]);

    useEffect(() => {
        fetchAppointment();
    }, [fetchAppointment]);

    // --- Handle Cancellation ---
    const handleCancel = async () => {
         if (!appointment || !window.confirm("Are you sure you want to cancel this appointment?")) {
            return;
        }
        setIsCancelling(true);
        setError(null); // Clear previous errors
        try {
            await cancelAppointment(appointment.id);
            // Update the state locally or refetch
            // setAppointment(prev => prev ? { ...prev, status: 'cancelled' } : null);
            // Or redirect back to list page after cancellation
             navigate('/appointments', { state: { message: 'Appointment cancelled successfully.' }}); // Example redirect
             // toast.success('Appointment cancelled.'); // Use toast if preferred
        } catch (err: any) {
            setError(err.message || "Failed to cancel appointment.");
            console.error(err);
            setIsCancelling(false);
        }
        // No finally block for setIsCancelling if navigating away
    };

    // --- Render Logic ---
    if (isLoading) {
        return <div className="text-center py-10"><p>Loading appointment details...</p>{/* Spinner */}</div>;
    }

    if (error) {
         return (
             <div className="text-center py-10 bg-red-50 text-red-700 p-4 rounded-md max-w-2xl mx-auto">
                 <p>{error}</p>
                 <Link to="/appointments" className="mt-4 inline-block text-primary hover:underline">
                     &larr; Back to Appointments List
                 </Link>
             </div>
         );
    }

    if (!appointment) {
        return (
             <div className="text-center py-10">
                 <p className="text-muted">Appointment not found.</p>
                 <Link to="/appointments" className="mt-4 inline-block text-primary hover:underline">
                     &larr; Back to Appointments List
                 </Link>
             </div>
         );
    }

    // Determine if actions like 'Cancel' or 'Join Call' should be shown
    const now = new Date();
    const appointmentStartTime = new Date(`${appointment.date}T${appointment.start_time}`);
    // Allow joining slightly before start time (e.g., 15 mins) and maybe for a while after
    const joinWindowStart = new Date(appointmentStartTime.getTime() - 15 * 60000);
    const joinWindowEnd = new Date(appointmentStartTime.getTime() + 60 * 60000); // Allow joining up to 1hr after start
    const canCancel = ['scheduled', 'confirmed'].includes(appointment.status) && appointmentStartTime > now;
    const canJoinCall = appointment.appointment_type === 'virtual' &&
                       ['scheduled', 'confirmed'].includes(appointment.status) && // Or just 'confirmed'?
                       now >= joinWindowStart && now <= joinWindowEnd;


    const { text: statusText, color: statusColor, icon: StatusIcon } = getStatusInfo(appointment.status);

    return (
        <div className="max-w-3xl mx-auto">
             <Link to="/appointments" className="inline-flex items-center text-primary hover:underline mb-4 text-sm">
                <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Appointments
            </Link>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">Appointment Details</h1>
                     {/* Status Badge */}
                     <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} bg-opacity-20`}>
                         <StatusIcon className={`h-3 w-3 mr-1 ${statusColor}`} />
                         {statusText}
                     </span>
                </div>

                <div className="px-6 py-5 space-y-4">
                     {/* Doctor Info */}
                    <div className="flex items-center space-x-3">
                         {/* Placeholder for doctor image/icon */}
                         <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500"/>
                         </div>
                         <div>
                              <p className="text-sm font-medium text-gray-500">Doctor</p>
                             {/* Link to Doctor's profile */}
                             <Link to={`/doctors/${appointment.doctor}`} className="text-lg font-semibold text-primary hover:underline">
                                 {/* TODO: Display Doctor's Name */}
                                 Doctor ID: {appointment.doctor}
                             </Link>
                         </div>
                    </div>

                     {/* Date & Time */}
                     <div className='flex flex-col sm:flex-row sm:space-x-6'>
                        <div className="flex items-center">
                            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2"/>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Date</p>
                                <p className="text-md text-gray-800">{formatDate(appointment.date)}</p>
                            </div>
                        </div>
                        <div className="flex items-center mt-2 sm:mt-0">
                             <ClockIcon className="h-5 w-5 text-gray-400 mr-2"/>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Time</p>
                                <p className="text-md text-gray-800">{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</p>
                            </div>
                        </div>
                     </div>


                     {/* Type */}
                     <div className="flex items-center">
                         {appointment.appointment_type === 'virtual' ? (
                            <VideoCameraIcon className="h-5 w-5 text-purple-600 mr-2"/>
                        ) : (
                             <BuildingOfficeIcon className="h-5 w-5 text-teal-600 mr-2"/>
                         )}
                        <div>
                            <p className="text-sm font-medium text-gray-500">Type</p>
                            <p className="text-md text-gray-800 capitalize">{appointment.appointment_type.replace('_', '-')}</p>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                         <p className="text-sm font-medium text-gray-500">Reason for Visit</p>
                         <p className="text-md text-gray-700 mt-1">{appointment.reason || <span className='italic'>Not specified</span>}</p>
                    </div>

                     {/* Notes */}
                    {appointment.notes && (
                        <div>
                             <p className="text-sm font-medium text-gray-500">Additional Notes</p>
                             <p className="text-md text-gray-700 mt-1 whitespace-pre-wrap">{appointment.notes}</p>
                        </div>
                    )}

                    {/* Follow-up */}
                    {appointment.followup_required && (
                        <p className="text-sm text-orange-600 font-medium">Follow-up Required.</p>
                    )}
                </div>

                {/* --- Actions --- */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3">
                     {/* Join Call Button */}
                     {canJoinCall && (
                        <Link
                            to={`/appointments/${appointment.id}/call`} // Link to the video call page
                            className="btn-primary inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        >
                             <VideoCameraIcon className="h-5 w-5 mr-2"/>
                            Join Virtual Call
                        </Link>
                    )}

                    {/* Cancel Button */}
                    {canCancel && (
                         <button
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                         >
                            <TrashIcon className="h-5 w-5 mr-2"/>
                            {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
                        </button>
                    )}

                     {/* Add Reschedule Button later if needed */}
                </div>

            </div>
        </div>
    );
};

export default AppointmentDetailPage;