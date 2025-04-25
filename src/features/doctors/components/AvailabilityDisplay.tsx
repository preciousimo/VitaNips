// src/features/doctors/components/AvailabilityDisplay.tsx
import React from 'react';
import { DoctorAvailability } from '../../../types/doctors';

interface AvailabilityDisplayProps {
    availability: DoctorAvailability[];
}

const dayMap: { [key: number]: string } = {
    0: 'Monday',
    1: 'Tuesday',
    2: 'Wednesday',
    3: 'Thursday',
    4: 'Friday',
    5: 'Saturday',
    6: 'Sunday',
};

// Function to format time (HH:MM:SS -> HH:MM AM/PM)
const formatTime = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minute < 10 ? '0' + minute : minute} ${ampm}`;
};

const AvailabilityDisplay: React.FC<AvailabilityDisplayProps> = ({ availability }) => {
    if (!availability || availability.length === 0) {
        return <p className="text-muted text-sm">No availability information provided.</p>;
    }

    // Group availability by day
    const groupedAvailability: { [key: string]: { start: string; end: string }[] } = {};
    availability.forEach(slot => {
        if (slot.is_available) {
            const dayName = dayMap[slot.day_of_week];
            if (!groupedAvailability[dayName]) {
                groupedAvailability[dayName] = [];
            }
            groupedAvailability[dayName].push({ start: slot.start_time, end: slot.end_time });
        }
    });

    // Sort days based on standard week order
    const sortedDays = Object.keys(groupedAvailability).sort((a, b) => {
        const dayA = Object.keys(dayMap).find(key => dayMap[parseInt(key)] === a);
        const dayB = Object.keys(dayMap).find(key => dayMap[parseInt(key)] === b);
        return (dayA ? parseInt(dayA) : -1) - (dayB ? parseInt(dayB) : -1);
    });


    return (
        <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">Available Hours</h4>
            {sortedDays.length > 0 ? (
                 <ul className="space-y-1 text-sm">
                    {sortedDays.map(day => (
                        <li key={day} className="flex justify-between">
                            <span className="font-medium text-gray-600 w-1/3">{day}:</span>
                            <span className="text-gray-800 text-right">
                                {groupedAvailability[day]
                                    .map(slot => `${formatTime(slot.start)} - ${formatTime(slot.end)}`)
                                    .join(', ')}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-muted text-sm">Doctor is currently not available.</p>
            )}
        </div>
    );
};

export default AvailabilityDisplay;