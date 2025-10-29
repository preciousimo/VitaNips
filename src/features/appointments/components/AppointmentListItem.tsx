// src/features/appointments/components/AppointmentListItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon, VideoCameraIcon, BuildingOfficeIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; // Use outline for status?
import { Appointment } from '../../../types/appointments';

interface AppointmentListItemProps {
    appointment: Appointment;
    onCancel: (id: number) => void;
    isCancelling?: boolean;
}

const formatTime = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minute < 10 ? '0' + minute : minute} ${ampm}`;
};

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
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

const AppointmentListItem: React.FC<AppointmentListItemProps> = ({ appointment, onCancel, isCancelling }) => {
    const { text: statusText, color: statusColor, icon: StatusIcon } = getStatusInfo(appointment.status);
    const isUpcoming = ['scheduled', 'confirmed'].includes(appointment.status) && new Date(appointment.date + 'T' + appointment.start_time) > new Date();

    return (
        <li className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-150 mb-3">
            <Link to={`/appointments/${appointment.id}`} className="block p-4 group">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                <div className="flex-grow mb-3 sm:mb-0 sm:mr-4">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                        <CalendarIcon className="h-4 w-4 mr-1.5" />
                        <span>{formatDate(appointment.date)}</span>
                        <span className="mx-2">|</span>
                        <ClockIcon className="h-4 w-4 mr-1.5" />
                        <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                    </div>
                            <p className="text-lg font-semibold text-primary group-hover:underline mb-1 inline-block">
                                Doctor ID: {appointment.doctor}
                            </p>
                    <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Reason:</span> {appointment.reason || 'Not specified'}
                    </p>
                     <div className="flex items-center text-sm">
                        {appointment.appointment_type === 'virtual' ? (
                            <VideoCameraIcon className="h-4 w-4 mr-1.5 text-purple-600"/>
                        ) : (
                             <BuildingOfficeIcon className="h-4 w-4 mr-1.5 text-teal-600"/>
                         )}
                         <span className="capitalize">{appointment.appointment_type.replace('_', '-')}</span>
                     </div>
                </div>

                <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} bg-gray-100`}>
                        <StatusIcon className={`h-3 w-3 mr-1 ${statusColor}`} />
                         {statusText}
                     </span>

                    {isUpcoming && (
                        <button
                            onClick={() => onCancel(appointment.id)}
                            disabled={isCancelling}
                            className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
                        </button>
                    )}
                </div>
            </div>
            </Link>
        </li>
    );
};

export default AppointmentListItem;