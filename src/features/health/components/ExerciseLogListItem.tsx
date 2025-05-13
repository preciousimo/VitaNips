// src/features/health/components/ExerciseLogListItem.tsx
import React from 'react';
import { ExerciseLog } from '../../../types/healthLogs';
import { PencilSquareIcon, TrashIcon, ClockIcon, FireIcon, MapIcon } from '@heroicons/react/24/outline'; // Fire for calories, Map for distance

interface ExerciseLogListItemProps {
    log: ExerciseLog;
    onEdit: (log: ExerciseLog) => void;
    onDelete: (id: number) => void;
}

const formatDateTimeDisplay = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return isoString; }
};

const ExerciseLogListItem: React.FC<ExerciseLogListItemProps> = ({ log, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all duration-200 ease-in-out mb-3 border-l-4 border-red-500">
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                     <div className="flex items-center mb-1">
                        <FireIcon className="h-5 w-5 mr-2 flex-shrink-0 text-red-600" />
                        <h3 className="font-semibold text-gray-800 text-md">{log.activity_type}</h3>
                    </div>
                    <p className="text-xs text-gray-600 ml-7 mt-1 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1"/> On: {formatDateTimeDisplay(log.datetime)}
                    </p>
                    <p className="text-sm text-gray-700 ml-7">
                        Duration: <span className="font-medium">{log.duration} minutes</span>
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 ml-7 mt-1 text-xs text-gray-500">
                        {log.calories_burned && <span><FireIcon className="h-3 w-3 inline mr-0.5 text-orange-500"/> {log.calories_burned} kcal</span>}
                        {log.distance && <span><MapIcon className="h-3 w-3 inline mr-0.5 text-blue-500"/> {log.distance} km</span>}
                    </div>
                    {log.notes && (
                        <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 ml-7">
                            Notes: {log.notes}
                        </p>
                    )}
                </div>
                <div className="flex flex-col space-y-1 flex-shrink-0 ml-2">
                    <button onClick={() => onEdit(log)} className="p-1.5 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-100" title="Edit Log"><PencilSquareIcon className="h-5 w-5" /></button>
                    <button onClick={() => onDelete(log.id)} className="p-1.5 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100" title="Delete Log"><TrashIcon className="h-5 w-5" /></button>
                </div>
            </div>
        </div>
    );
};
export default ExerciseLogListItem;