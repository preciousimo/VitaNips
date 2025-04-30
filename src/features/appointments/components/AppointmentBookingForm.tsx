// src/features/appointments/components/AppointmentBookingForm.tsx
import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { useLocation } from 'react-router-dom'; // Added import
import { AppointmentPayload } from '../../../types/appointments';
import { DoctorAvailability } from '../../../types/doctors';
import { createAppointment } from '../../../api/appointments';

interface AppointmentBookingFormProps {
    doctorId: number;
    doctorName: string;
    availability: DoctorAvailability[];
    onBookingSuccess: (newAppointment: any) => void;
    onCancel: () => void;
}

// Helper functions (generateTimeSlots, formatTime) assumed to exist
const generateTimeSlots = (start: string, end: string, intervalMinutes = 30): string[] => {
    const slots: string[] = [];
    const startTime = new Date(`1970-01-01T${start}Z`);
    const endTime = new Date(`1970-01-01T${end}Z`);

    let currentTime = startTime;
    while (currentTime < endTime) {
        // Format as HH:MM (adjust if backend needs HH:MM:SS)
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
    const normalizedHours = hours % 12 || 12; // 12-hour format
    return `${normalizedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({
    doctorId,
    doctorName,
    availability,
    onBookingSuccess,
    onCancel
}) => {
    // MODIFIED: Access location state
    const location = useLocation();
    // Use type assertion for better type safety
    const followUpState = location.state as { prefillReason?: string; openBooking?: boolean } | undefined;

    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    // MODIFIED: Initialize reason state using followUpState
    const [reason, setReason] = useState<string>(followUpState?.prefillReason || '');
    const [notes, setNotes] = useState<string>('');
    const [appointmentType, setAppointmentType] = useState<'in_person' | 'virtual'>('in_person');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Filter availability based on selected date (no changes needed here)
    useEffect(() => {
        if (selectedDate && availability.length > 0) {
            const dateObj = new Date(selectedDate + 'T00:00:00'); // Use local date
            const dayOfWeek = dateObj.getDay(); // Sunday=0, Monday=1,...
            // Adjust to match Django's Monday=0 convention
            const djangoDayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;

            const slotsForDay = availability
                .filter(slot => slot.day_of_week === djangoDayOfWeek && slot.is_available)
                .flatMap(slot => generateTimeSlots(slot.start_time, slot.end_time)); // Generate slots based on start/end

            setAvailableSlots(slotsForDay);
            setSelectedTime(''); // Reset time when date changes
        } else {
            setAvailableSlots([]);
            setSelectedTime('');
        }
    }, [selectedDate, availability]);

    // Calculate end_time (no changes needed here)
    const calculateEndTime = (startTime: string, durationMinutes = 30): string => {
        if (!startTime) return '';
        try {
            const [hours, minutes] = startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0, 0); // Use local time components
            const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
            // Format as HH:MM (or HH:MM:SS if needed)
            return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        } catch {
            return ''; // Handle potential parsing errors
        }
    };


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedDate || !selectedTime || !reason) {
            setError("Please select a date, time slot, and provide a reason for the appointment.");
            return;
        }

        setIsSubmitting(true);

        const endTime = calculateEndTime(selectedTime);
        if (!endTime) {
            setError("Invalid start time selected.");
            setIsSubmitting(false);
            return;
        }

        const payload: AppointmentPayload = {
            doctor: doctorId,
            date: selectedDate,
            start_time: selectedTime, // Ensure format matches backend (HH:MM or HH:MM:SS)
            end_time: endTime,      // Ensure format matches backend
            appointment_type: appointmentType,
            reason: reason,
            notes: notes || null,
        };

        try {
            const newAppointment = await createAppointment(payload);
            onBookingSuccess(newAppointment); // Notify parent on success
        } catch (err: any) {
            console.error("Appointment booking error:", err);
            const errorData = err.response?.data;
            if (typeof errorData === 'object' && errorData !== null) {
                // Try to extract specific messages
                const messages = Object.entries(errorData).map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`);
                setError(messages.join(' ') || "Failed to book appointment. The time slot might be unavailable.");
            } else {
                setError(err.message || "Failed to book appointment. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    const today = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Book Appointment</h3>
            <p className="text-sm text-gray-600 mb-4">With: <span className='font-medium'>{doctorName}</span></p>

            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</p>}

            {/* Date Selection */}
            <div>
                <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700">Select Date *</label>
                <input type="date" id="appointment-date" name="appointment-date" value={selectedDate} min={today} onChange={(e) => setSelectedDate(e.target.value)} required className="input-field" />
            </div>

            {/* Time Slot Selection */}
            {selectedDate && (
                <div>
                    <label htmlFor="appointment-time" className="block text-sm font-medium text-gray-700">Select Time Slot *</label>
                    {availableSlots.length > 0 ? (<select id="appointment-time" name="appointment-time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} required className="input-field"> <option value="" disabled>-- Select Time --</option> {availableSlots.map(slot => (<option key={slot} value={slot}>{formatTime(slot)}</option>))} </select>) : (<p className="text-sm text-muted mt-1">No available slots found for this date based on general availability.</p>)}
                </div>
            )}

            {/* Reason - Will now be pre-filled if followUpState exists */}
            <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Appointment *</label>
                <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    value={reason} // Uses state, which is initialized with followUpState.prefillReason
                    onChange={(e) => setReason(e.target.value)} // Allows user to edit
                    required
                    className="input-field"
                    placeholder="Briefly describe the reason for your visit..."
                />
            </div>

            {/* Appointment Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Appointment Type *</label>
                <div className="mt-1 flex space-x-4"> <label className="inline-flex items-center"> <input type="radio" name="appointmentType" value="in_person" checked={appointmentType === 'in_person'} onChange={(e) => setAppointmentType(e.target.value as any)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" /> <span className="ml-2 text-sm text-gray-700">In-Person</span> </label> <label className="inline-flex items-center"> <input type="radio" name="appointmentType" value="virtual" checked={appointmentType === 'virtual'} onChange={(e) => setAppointmentType(e.target.value as any)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" /> <span className="ml-2 text-sm text-gray-700">Virtual</span> </label> </div>
            </div>

            {/* Optional Notes */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
                <textarea id="notes" name="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" placeholder="Any other information for the doctor..." />
            </div>


            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"> Cancel </button>
                <button type="submit" disabled={isSubmitting || !selectedTime} className="btn-primary inline-flex justify-center px-4 py-2 text-sm font-medium disabled:opacity-50"> {isSubmitting ? 'Booking...' : 'Confirm Booking'} </button>
            </div>
        </form>
    );
};

export default AppointmentBookingForm;