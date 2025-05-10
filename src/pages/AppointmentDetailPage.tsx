// src/pages/AppointmentDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon, CalendarIcon, ClockIcon, VideoCameraIcon, BuildingOfficeIcon,
    CheckCircleIcon, XCircleIcon, InformationCircleIcon, PencilIcon, TrashIcon, UserIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

import { getAppointmentDetails, cancelAppointment } from '../api/appointments';
import { Appointment } from '../types/appointments';

const LoadingSpinner: React.FC = () => <p>Loading...</p>;
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => <p className="text-red-600">{message}</p>;

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

const AppointmentDetailPage: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState<boolean>(false);

    const fetchAppointment = useCallback(async () => {
        if (!appointmentId) { setError("Appointment ID not found."); setIsLoading(false); return; }
        const id = parseInt(appointmentId, 10);
        if (isNaN(id)) { setError("Invalid Appointment ID."); setIsLoading(false); return; }
        setIsLoading(true); setError(null);
        try {
            const data = await getAppointmentDetails(id);
            setAppointment(data);
        } catch (err: any) {
            setError(err.message || "Failed to load details."); setAppointment(null);
        } finally { setIsLoading(false); }
    }, [appointmentId]);

    useEffect(() => {
        fetchAppointment();
    }, [fetchAppointment]);

    const handleCancel = async () => {
        if (!appointment || !window.confirm("Are you sure you want to cancel this appointment?")) {
            return;
        }
        setIsCancelling(true);
        setError(null);
        try {
            await cancelAppointment(appointment.id);
            navigate('/appointments', { state: { message: 'Appointment cancelled successfully.' } });
        } catch (err: any) {
            setError(err.message || "Failed to cancel appointment.");
            console.error(err);
            setIsCancelling(false);
        }
    };

    const handleScheduleFollowUp = () => {
        if (!appointment) return;
        const doctorId = appointment.doctor;
        const originalDate = formatDate(appointment.date);
        const reason = `Follow-up for appointment on ${originalDate}`;

        navigate(`/doctors/${doctorId}`, {
            state: {
                prefillReason: reason,
                openBooking: true
            }
        });
    };
    if (isLoading) {
        return <div className="text-center py-10"><LoadingSpinner /></div>;
    }
    if (error) {
        return <div className="text-center py-10"><ErrorMessage message={error} /></div>;
    }
    if (!appointment) {
        return <div className="text-center py-10"><p>Appointment not found.</p></div>;
    }

    const now = new Date();
    const appointmentStartTime = new Date(`${appointment.date}T${appointment.start_time}`);
    const joinWindowStart = new Date(appointmentStartTime.getTime() - 15 * 60000);
    const joinWindowEnd = new Date(appointmentStartTime.getTime() + 60 * 60000);
    const canCancel = ['scheduled', 'confirmed'].includes(appointment.status) && appointmentStartTime > now;
    const canJoinCall = appointment.appointment_type === 'virtual' && ['scheduled', 'confirmed'].includes(appointment.status) && now >= joinWindowStart && now <= joinWindowEnd;
    const showScheduleFollowUp = appointment.status === 'completed';

    const { text: statusText, color: statusColor, icon: StatusIcon } = getStatusInfo(appointment.status);

    return (
        <div className="max-w-3xl mx-auto">
            <Link to="/appointments" className="inline-flex items-center text-primary hover:underline mb-4 text-sm">
                <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Appointments
            </Link>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">Appointment Details</h1>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} bg-opacity-20`}>
                        <StatusIcon className={`h-3 w-3 mr-1 ${statusColor}`} />
                        {statusText}
                    </span>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center"><UserIcon className="h-6 w-6 text-gray-500" /></div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Doctor</p>
                            <Link to={`/doctors/${appointment.doctor}`} className="text-lg font-semibold text-primary hover:underline">Doctor ID: {appointment.doctor}</Link>
                        </div>
                    </div>
                    <div className='flex flex-col sm:flex-row sm:space-x-6'>
                        <div className="flex items-center">
                            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Date</p>
                                <p className="text-md text-gray-800">{formatDate(appointment.date)}</p>
                            </div>
                        </div>
                        <div className="flex items-center mt-2 sm:mt-0">
                            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Time</p>
                                <p className="text-md text-gray-800">{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {appointment.appointment_type === 'virtual' ? <VideoCameraIcon className="h-5 w-5 text-purple-600 mr-2" /> : <BuildingOfficeIcon className="h-5 w-5 text-teal-600 mr-2" />}
                        <div>
                            <p className="text-sm font-medium text-gray-500">Type</p>
                            <p className="text-md text-gray-800 capitalize">{appointment.appointment_type.replace('_', '-')}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Reason for Visit</p>
                        <p className="text-md text-gray-700 mt-1">{appointment.reason || <span className='italic'>Not specified</span>}</p>
                    </div>
                    {appointment.notes && (
                        <div>
                            <p className="text-sm font-medium text-gray-500">Additional Notes</p>
                            <p className="text-md text-gray-700 mt-1 whitespace-pre-wrap">{appointment.notes}</p>
                        </div>
                    )}
                    {appointment.followup_required && (<p className="text-sm text-orange-600 font-medium">Follow-up Required.</p>)}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3">
                    {canJoinCall && (<Link to={`/appointments/${appointment.id}/call`} className="btn-primary inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 focus:ring-green-500"><VideoCameraIcon className="h-5 w-5 mr-2" />Join Virtual Call</Link>)}
                    {canCancel && (<button onClick={handleCancel} disabled={isCancelling} className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"><TrashIcon className="h-5 w-5 mr-2" />{isCancelling ? 'Cancelling...' : 'Cancel Appointment'}</button>)}
                    {showScheduleFollowUp && (
                        <button
                            onClick={handleScheduleFollowUp}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <ArrowPathIcon className="h-5 w-5 mr-2" />
                            Schedule Follow-up
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailPage;