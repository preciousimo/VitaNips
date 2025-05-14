// src/features/appointments/components/AppointmentBookingForm.tsx
import React, { useState, useEffect, FormEvent, useMemo } from 'react';
// import { useLocation } from 'react-router-dom';
import { AppointmentPayload } from '../../../types/appointments';
import { DoctorAvailability } from '../../../types/doctors';
import { createAppointment } from '../../../api/appointments';
import toast from 'react-hot-toast';

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

const formatTime = (timeStr: string): string => {
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const normalizedHours = hours % 12 || 12;
    return `${normalizedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedDate || !selectedTime || !reason.trim()) {
            setError("Please select a date, time slot, and provide a reason for the appointment.");
            toast.error("Date, time, and reason are required.");
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-1 md:p-2"> {/* Adjusted padding for modal */}
             <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    {isFollowUp ? "Schedule Follow-up" : "Book New Appointment"}
                </h3>
                <p className="text-sm text-gray-600">With: <span className='font-medium'>{doctorName}</span></p>
             </div>


            {error && <pre className="text-red-500 text-sm bg-red-50 p-3 rounded-md whitespace-pre-wrap mb-3">{error}</pre>}

            <div>
                <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700">Select Date *</label>
                <input type="date" id="appointment-date" name="appointment-date"
                       value={selectedDate} min={today}
                       onChange={(e) => setSelectedDate(e.target.value)} required className="input-field mt-1" />
            </div>

            {selectedDate && (
                <div>
                    <label htmlFor="appointment-time" className="block text-sm font-medium text-gray-700">Select Available Time Slot *</label>
                    {availableSlots.length > 0 ? (
                        <select id="appointment-time" name="appointment-time" value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)} required className="input-field mt-1">
                            <option value="" disabled>-- Select Time --</option>
                            {availableSlots.map(slot => (
                                <option key={slot} value={slot}>{formatTime(slot)}</option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-sm text-red-500 mt-1 bg-red-50 p-2 rounded-md">
                            No available slots found for this date based on the doctor's general availability. Please select another date or contact the clinic.
                        </p>
                    )}
                </div>
            )}

            <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                    {isFollowUp ? "Reason for Follow-up (auto-filled) *" : "Reason for Appointment *"}
                </label>
                <textarea id="reason" name="reason" rows={isFollowUp ? 2 : 3} value={reason}
                          onChange={(e) => setReason(e.target.value)} required className="input-field mt-1"
                          placeholder="Briefly describe the reason for your visit..."/>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Appointment Type *</label>
                <div className="mt-2 flex space-x-4">
                    <label className="inline-flex items-center">
                        <input type="radio" name="appointmentType" value="in_person"
                               checked={appointmentType === 'in_person'}
                               onChange={() => setAppointmentType('in_person')}
                               className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
                        <span className="ml-2 text-sm text-gray-700">In-Person</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input type="radio" name="appointmentType" value="virtual"
                               checked={appointmentType === 'virtual'}
                               onChange={() => setAppointmentType('virtual')}
                               className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
                        <span className="ml-2 text-sm text-gray-700">Virtual</span>
                    </label>
                </div>
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
                <textarea id="notes" name="notes" rows={2} value={notes}
                          onChange={(e) => setNotes(e.target.value)} className="input-field mt-1"
                          placeholder="Any other information for the doctor..."/>
            </div>


            <div className="flex justify-end space-x-3 pt-4 border-t mt-5">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-light">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting || !selectedTime || !reason.trim()}
                        className="btn-primary inline-flex justify-center px-4 py-2 text-sm font-medium disabled:opacity-60">
                    {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </button>
            </div>
        </form>
    );
};

export default AppointmentBookingForm;