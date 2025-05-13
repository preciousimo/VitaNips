// src/features/health/components/SleepLogListItem.tsx
import React from 'react';
import { SleepLog, SleepQuality } from '../../../types/healthLogs';
import { PencilSquareIcon, TrashIcon, ClockIcon, MoonIcon as SleepMoonIcon, StarIcon } from '@heroicons/react/24/outline';

interface SleepLogListItemProps {
    log: SleepLog;
    onEdit: (log: SleepLog) => void;
    onDelete: (id: number) => void;
}

const formatDateTimeShort = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    try { return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch { return isoString; }
};
const formatDateShort = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    try { return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year:'numeric' });
    } catch { return isoString; }
};


const qualityMap: Record<SleepQuality, string> = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Excellent' };
const qualityColorMap: Record<SleepQuality, string> = { 1: 'text-red-500', 2: 'text-yellow-500', 3: 'text-green-500', 4: 'text-blue-500' };

const SleepLogListItem: React.FC<SleepLogListItemProps> = ({ log, onEdit, onDelete }) => {
    const calculateDuration = (sleep: string, wake: string): string => {
        try {
            const diff = new Date(wake).getTime() - new Date(sleep).getTime();
            if (isNaN(diff) || diff < 0) return 'N/A';
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        } catch { return "N/A"; }
    };
    const durationDisplay = log.duration ? `${log.duration.toFixed(1)} hrs` : calculateDuration(log.sleep_time, log.wake_time);


    return (
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all duration-200 ease-in-out mb-3 border-l-4 border-indigo-500">
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <div className="flex items-center mb-1">
                        <SleepMoonIcon className="h-5 w-5 mr-2 flex-shrink-0 text-indigo-600" />
                        <h3 className="font-semibold text-gray-800 text-md">
                            Sleep for {formatDateShort(log.sleep_time)}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-700 ml-7">
                        <ClockIcon className="h-4 w-4 inline mr-1 text-gray-500"/>
                        {formatDateTimeShort(log.sleep_time)} - {formatDateTimeShort(log.wake_time)}
                        <span className="font-medium ml-2">({durationDisplay})</span>
                    </p>
                    <p className={`text-sm font-medium ml-7 ${qualityColorMap[log.quality] || 'text-gray-700'}`}>
                       <StarIcon className="h-4 w-4 inline mr-1"/> Quality: {qualityMap[log.quality] || 'N/A'}
                    </p>
                    {log.interruptions !== null && log.interruptions !== undefined && log.interruptions > 0 && (
                        <p className="text-xs text-gray-500 ml-7">Interruptions: {log.interruptions}</p>
                    )}
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
export default SleepLogListItem;