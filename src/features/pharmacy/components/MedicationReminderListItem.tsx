// src/features/pharmacy/components/MedicationReminderListItem.tsx
import React from 'react';
import { MedicationReminder } from '../../../types/reminders';
import { PencilSquareIcon, TrashIcon, BellAlertIcon, BellSlashIcon } from '@heroicons/react/24/outline';

interface MedicationReminderListItemProps {
    reminder: MedicationReminder;
    onEdit: (reminder: MedicationReminder) => void;
    onDelete: (id: number) => void;
    onToggleActive: (id: number, isActive: boolean) => void;
}

const formatTimeDisplay = (timeStr: string | null | undefined) => {
    if (!timeStr) return 'N/A';
    try {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        if (isNaN(h) || isNaN(m)) return timeStr; // Return original if parsing fails
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${m < 10 ? '0' + m : m} ${ampm}`;
    } catch {
        return timeStr; // Fallback to original string if any error
    }
};

const formatDateDisplay = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch {
        return dateStr;
    }
};


const MedicationReminderListItem: React.FC<MedicationReminderListItemProps> = ({
    reminder,
    onEdit,
    onDelete,
    onToggleActive
}) => {
    return (
        <div className={`p-4 rounded-lg shadow hover:shadow-lg transition-all duration-200 ease-in-out mb-4 ${reminder.is_active ? 'bg-white border-l-4 border-primary' : 'bg-gray-100 opacity-80 border-l-4 border-gray-400'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start">
                <div className="flex-grow mb-3 sm:mb-0">
                    <div className="flex items-center mb-1">
                        {reminder.is_active ? (
                            <BellAlertIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                        ) : (
                            <BellSlashIcon className="h-5 w-5 mr-2 text-gray-500 flex-shrink-0" />
                        )}
                        <h3 className="font-semibold text-primary text-lg">
                            {reminder.medication_display?.name || 'Medication N/A'}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-700 ml-7">
                        Take: <span className="font-medium">{reminder.dosage}</span>
                    </p>
                    <p className="text-sm text-gray-600 ml-7 mt-1">
                        At: <span className="font-medium">{formatTimeDisplay(reminder.time_of_day)}</span>,
                        <span className="capitalize ml-1"> {reminder.frequency}</span>
                        {reminder.frequency === 'custom' && reminder.custom_frequency && (
                            <span className="text-xs"> ({reminder.custom_frequency})</span>
                        )}
                    </p>
                    <p className="text-xs text-muted ml-7 mt-1">
                        From: {formatDateDisplay(reminder.start_date)}
                        {reminder.end_date ? ` to ${formatDateDisplay(reminder.end_date)}` : ' (Ongoing)'}
                    </p>
                    {reminder.notes && <p className="text-xs text-gray-500 mt-2 ml-7 bg-gray-50 p-2 rounded">Notes: {reminder.notes}</p>}
                    {reminder.prescription_item_id && <p className="text-xs text-muted ml-7 mt-1">Linked to Prescription Item ID: {reminder.prescription_item_id}</p>}
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2 mt-2 sm:mt-0 flex-shrink-0">
                    <button
                        onClick={() => onToggleActive(reminder.id, !reminder.is_active)}
                        className={`p-1.5 rounded-full hover:bg-gray-200 transition-colors ${reminder.is_active ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-500 hover:text-gray-700'}`}
                        title={reminder.is_active ? "Deactivate Reminder" : "Activate Reminder"}
                    >
                        {reminder.is_active ? <BellAlertIcon className="h-5 w-5" /> : <BellSlashIcon className="h-5 w-5" />}
                    </button>
                    <button
                        onClick={() => onEdit(reminder)}
                        className="p-1.5 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-colors"
                        title="Edit Reminder"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(reminder.id)}
                        className="p-1.5 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
                        title="Delete Reminder"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicationReminderListItem;