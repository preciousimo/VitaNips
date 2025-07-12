// src/features/appointments/components/AppointmentBookingForm.tsx
import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { AppointmentPayload } from '../../../types/appointments';
import { DoctorAvailability } from '../../../types/doctors';
import { createAppointment } from '../../../api/appointments';
import { formatTime, formatDate } from '../../../utils';
import toast from 'react-hot-toast';
import { 
    CalendarDaysIcon, 
    ClockIcon, 
    UserIcon, 
    VideoCameraIcon, 
    UserGroupIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface AppointmentBookingFormProps {
    doctorId: number;
    doctorName: string;
    availability: DoctorAvailability[];
    onBookingSuccess: (newAppointment: any) => void;
    onCancel: () => void;
    isFollowUp?: boolean;
    prefillReason?: string;
}

const generateTimeSlots = (start: string, end: string, intervalMinutes = 30): string[] => {
    const slots: string[] = [];
    const startTime = new Date(`1970-01-01T${start}Z`);
    const endTime = new Date(`1970-01-01T${end}Z`);

    let currentTime = startTime;
    while (currentTime < endTime) {
        const hours = currentTime.getUTCHours().toString().padStart(2, '0');
        const minutes = currentTime.getUTCMinutes().toString().padStart(2, '0');
        slots.push(`${hours}:${minutes}`);
        currentTime = new Date(currentTime.getTime() + intervalMinutes * 60000);
    }
    return slots;
};

const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({
    doctorId,
    doctorName,
    availability,
    onBookingSuccess,
    onCancel,
    isFollowUp,
    prefillReason
}) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [appointmentType, setAppointmentType] = useState<'in_person' | 'virtual'>('in_person');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isFollowUp && prefillReason) {
            setReason(prefillReason);
        } else {
            setReason('');
        }
    }, [isFollowUp, prefillReason]);

    useEffect(() => {
        if (selectedDate && availability.length > 0) {
            const dateObj = new Date(selectedDate + 'T00:00:00Z');
            const dayOfWeek = dateObj.getUTCDay();
            const djangoDayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;

            const slotsForDay = availability
                .filter(slot => slot.day_of_week === djangoDayOfWeek && slot.is_available)
                .flatMap(slot => generateTimeSlots(slot.start_time, slot.end_time));

            setAvailableSlots(slotsForDay);
            setSelectedTime(''); // Reset time when date changes
        } else {
            setAvailableSlots([]);
            setSelectedTime('');
        }
    }, [selectedDate, availability]);

    const calculateEndTime = (startTime: string, durationMinutes = 30): string => {
        if (!startTime) return '';
        try {
            const [hours, minutes] = startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0, 0);
            const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
            return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        } catch {
            return '';
        }
    };

    const today = new Date().toISOString().split('T')[0];

    // Validation function
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!selectedDate) {
            errors.date = 'Please select a date for your appointment.';
        }

        if (!selectedTime) {
            errors.time = 'Please select a time slot.';
        }

        if (!reason.trim()) {
            errors.reason = 'Please provide a reason for your appointment.';
        } else if (reason.trim().length < 10) {
            errors.reason = 'Please provide a more detailed reason (at least 10 characters).';
        }

        if (notes.trim().length > 500) {
            errors.notes = 'Notes cannot exceed 500 characters.';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationErrors({});

        if (!validateForm()) {
            toast.error('Please fix the errors below.');
            return;
        }

        setIsSubmitting(true);
        const endTime = calculateEndTime(selectedTime);
        if (!endTime) {
            setError("Invalid start time selected, cannot calculate end time.");
            toast.error("Invalid start time.");
            setIsSubmitting(false);
            return;
        }

        const payload: AppointmentPayload = {
            doctor: doctorId,
            date: selectedDate,
            start_time: selectedTime,
            end_time: endTime,
            appointment_type: appointmentType,
            reason: reason.trim(),
            notes: notes.trim() || undefined,
        };

        try {
            const newAppointment = await createAppointment(payload);
            toast.success('Appointment booked successfully!');
            onBookingSuccess(newAppointment);
        } catch (err: any) {
            console.error("Appointment booking error:", err);
            const errorData = err.response?.data;
            let errorMessage = "Failed to book appointment. The time slot might be unavailable or there was a server error.";
            if (errorData && typeof errorData === 'object') {
                const messages = Object.entries(errorData)
                    .map(([key, val]) => `${key === 'detail' ? '' : key + ': '}${Array.isArray(val) ? val.join(', ') : val}`)
                    .join(' \n');
                errorMessage = messages || errorMessage;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            toast.error(errorMessage, { duration: 5000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAvailableDays = useMemo(() => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return availability
            .filter(slot => slot.is_available)
            .map(slot => days[slot.day_of_week])
            .filter((day, index, arr) => arr.indexOf(day) === index);
    }, [availability]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <CalendarDaysIcon className="h-6 w-6 mr-2 text-primary" />
                    {isFollowUp ? "Schedule Follow-up" : "Book New Appointment"}
                </h3>
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    With: <span className='font-medium ml-1'>{doctorName}</span>
                </p>
                {getAvailableDays.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                        Available: {getAvailableDays.join(', ')}
                    </p>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                        <div className="text-sm text-red-700">
                            <p className="font-medium">Booking Error</p>
                            <p className="mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Selection */}
            <div>
                <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date *
                </label>
                <input 
                    type="date" 
                    id="appointment-date" 
                    name="appointment-date"
                    value={selectedDate} 
                    min={today}
                    onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setValidationErrors(prev => ({ ...prev, date: '' }));
                    }}
                    className={`input-field ${validationErrors.date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {validationErrors.date && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.date}</p>
                )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
                <div>
                    <label htmlFor="appointment-time" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Available Time Slot *
                    </label>
                    {availableSlots.length > 0 ? (
                        <select 
                            id="appointment-time" 
                            name="appointment-time" 
                            value={selectedTime}
                            onChange={(e) => {
                                setSelectedTime(e.target.value);
                                setValidationErrors(prev => ({ ...prev, time: '' }));
                            }}
                            className={`input-field ${validationErrors.time ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        >
                            <option value="" disabled>-- Select Time --</option>
                            {availableSlots.map(slot => (
                                <option key={slot} value={slot}>
                                    {formatTime(slot)}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                                <div className="text-sm text-yellow-700">
                                    <p className="font-medium">No Available Slots</p>
                                    <p className="mt-1">No available slots found for this date. Please select another date or contact the clinic.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {validationErrors.time && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors.time}</p>
                    )}
                </div>
            )}

            {/* Appointment Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Appointment Type *</label>
                <div className="grid grid-cols-2 gap-3">
                    <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        appointmentType === 'in_person' 
                            ? 'border-primary bg-primary-light' 
                            : 'border-gray-300 hover:border-gray-400'
                    }`}>
                        <input 
                            type="radio" 
                            name="appointmentType" 
                            value="in_person"
                            checked={appointmentType === 'in_person'}
                            onChange={() => setAppointmentType('in_person')}
                            className="sr-only"
                        />
                        <UserGroupIcon className={`h-5 w-5 mr-2 ${appointmentType === 'in_person' ? 'text-primary' : 'text-gray-400'}`} />
                        <div>
                            <div className={`font-medium ${appointmentType === 'in_person' ? 'text-primary' : 'text-gray-700'}`}>
                                In-Person
                            </div>
                            <div className="text-xs text-gray-500">Visit the clinic</div>
                        </div>
                        {appointmentType === 'in_person' && (
                            <CheckCircleIcon className="h-5 w-5 text-primary absolute top-2 right-2" />
                        )}
                    </label>
                    
                    <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        appointmentType === 'virtual' 
                            ? 'border-primary bg-primary-light' 
                            : 'border-gray-300 hover:border-gray-400'
                    }`}>
                        <input 
                            type="radio" 
                            name="appointmentType" 
                            value="virtual"
                            checked={appointmentType === 'virtual'}
                            onChange={() => setAppointmentType('virtual')}
                            className="sr-only"
                        />
                        <VideoCameraIcon className={`h-5 w-5 mr-2 ${appointmentType === 'virtual' ? 'text-primary' : 'text-gray-400'}`} />
                        <div>
                            <div className={`font-medium ${appointmentType === 'virtual' ? 'text-primary' : 'text-gray-700'}`}>
                                Virtual
                            </div>
                            <div className="text-xs text-gray-500">Video consultation</div>
                        </div>
                        {appointmentType === 'virtual' && (
                            <CheckCircleIcon className="h-5 w-5 text-primary absolute top-2 right-2" />
                        )}
                    </label>
                </div>
            </div>

            {/* Reason */}
            <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    {isFollowUp ? "Reason for Follow-up *" : "Reason for Appointment *"}
                </label>
                <textarea 
                    id="reason" 
                    name="reason" 
                    rows={isFollowUp ? 3 : 4} 
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        setValidationErrors(prev => ({ ...prev, reason: '' }));
                    }}
                    className={`input-field ${validationErrors.reason ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Please describe your symptoms, concerns, or reason for the appointment..."
                />
                {validationErrors.reason && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.reason}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    {reason.length}/500 characters (minimum 10 required)
                </p>
            </div>

            {/* Notes */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                </label>
                <textarea 
                    id="notes" 
                    name="notes" 
                    rows={3} 
                    value={notes}
                    onChange={(e) => {
                        setNotes(e.target.value);
                        setValidationErrors(prev => ({ ...prev, notes: '' }));
                    }}
                    className={`input-field ${validationErrors.notes ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Any other information for the doctor..."
                />
                {validationErrors.notes && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.notes}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    {notes.length}/500 characters
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting || !selectedTime || !reason.trim() || availableSlots.length === 0}
                    className="btn-primary inline-flex items-center px-6 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Booking...
                        </>
                    ) : (
                        'Confirm Booking'
                    )}
                </button>
            </div>
        </form>
    );
};

export default AppointmentBookingForm;