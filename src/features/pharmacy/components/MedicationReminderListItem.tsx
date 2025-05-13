// src/features/pharmacy/components/MedicationReminderListItem.tsx
import React from 'react';
import { MedicationReminder } from '../../../types/reminders';
import { PencilSquareIcon, TrashIcon, BellAlertIcon, BellSlashIcon } from '@heroicons/react/24/outline';

interface MedicationReminderListItemProps {
    reminder: MedicationReminder;
    onEdit: (reminder: MedicationReminder) => void;
    onDelete: (id: number) => void;
    onToggleActive?: (id: number, isActive: boolean) => void; // Optional: for quick toggle
}

const formatTimeDisplay = (timeStr: string) => {
    if (!timeStr) return 'N/A';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${m < 10 ? '0' + m : m} ${ampm}`;
};

const MedicationReminderListItem: React.FC<MedicationReminderListItemProps> = ({
    reminder,
    onEdit,
    onDelete,
    onToggleActive
}) => {
    return (
        <li className={`p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-150 mb-3 ${reminder.is_active ? 'bg-white' : 'bg-gray-100 opacity-70'}`}>
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <h3 className="font-semibold text-primary text-md mb-1">
                        {reminder.medication.name}
                        <span className="text-sm text-gray-600 font-normal ml-2">({reminder.dosage})</span>
                    </h3>
                    <p className="text-sm text-gray-700">
                        Time: <span className="font-medium">{formatTimeDisplay(reminder.time_of_day)}</span>
                    </p>
                    <p className="text-sm text-gray-700 capitalize">
                        Frequency: <span className="font-medium">{reminder.frequency}</span>
                        {reminder.frequency === 'custom' && reminder.custom_frequency && ` (${reminder.custom_frequency})`}
                    </p>
                    <p className="text-xs text-muted mt-1">
                        Effective: {new Date(reminder.start_date + 'T00:00:00').toLocaleDateString()}
                        {reminder.end_date ? ` - ${new Date(reminder.end_date + 'T00:00:00').toLocaleDateString()}` : ' (Ongoing)'}
                    </p>
                    {reminder.notes && <p className="text-xs text-gray-500 mt-1">Notes: {reminder.notes}</p>}
                </div>
                <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-2">
                     {onToggleActive && (
                        <button
                            onClick={() => onToggleActive(reminder.id, !reminder.is_active)}
                            className={`p-1 rounded ${reminder.is_active ? 'text-green-600 hover:text-green-800' : 'text-gray-500 hover:text-gray-700'}`}
                            title={reminder.is_active ? "Deactivate Reminder" : "Activate Reminder"}
                        >
                            {reminder.is_active ? <BellAlertIcon className="h-5 w-5" /> : <BellSlashIcon className="h-5 w-5" />}
                        </button>
                     )}
                    <button
                        onClick={() => onEdit(reminder)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit Reminder"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(reminder.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Reminder"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </li>
    );
};

export default MedicationReminderListItem;