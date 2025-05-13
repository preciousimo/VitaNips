// src/features/health/components/SymptomLogListItem.tsx
import React from 'react';
import { SymptomLog, SymptomSeverity } from '../../../types/healthLogs';
import { PencilSquareIcon, TrashIcon, ClockIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'; // Using ShieldExclamation for symptom

interface SymptomLogListItemProps {
    log: SymptomLog;
    onEdit: (log: SymptomLog) => void;
    onDelete: (id: number) => void;
}

const formatDateTimeDisplay = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch { return isoString; }
};

const severityMap: Record<SymptomSeverity, string> = {
    1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'Very Severe'
};
const severityColorMap: Record<SymptomSeverity, string> = {
    1: 'text-green-600', 2: 'text-yellow-600', 3: 'text-orange-600', 4: 'text-red-600'
};


const SymptomLogListItem: React.FC<SymptomLogListItemProps> = ({ log, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all duration-200 ease-in-out mb-3 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <div className="flex items-center mb-1">
                        <ShieldExclamationIcon className={`h-5 w-5 mr-2 flex-shrink-0 ${severityColorMap[log.severity] || 'text-yellow-600'}`} />
                        <h3 className="font-semibold text-gray-800 text-md">{log.symptom}</h3>
                    </div>
                    <p className={`text-sm font-medium ml-7 ${severityColorMap[log.severity] || 'text-gray-700'}`}>
                        Severity: {severityMap[log.severity] || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-600 ml-7 mt-1 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1"/> Experienced: {formatDateTimeDisplay(log.date_experienced)}
                    </p>
                    {log.duration && (
                        <p className="text-xs text-gray-500 ml-7">Duration: {log.duration}</p>
                    )}
                    {log.notes && (
                        <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 ml-7">
                            <span className="font-medium">Notes:</span> {log.notes}
                        </p>
                    )}
                </div>
                <div className="flex flex-col space-y-1 flex-shrink-0 ml-2">
                    <button
                        onClick={() => onEdit(log)}
                        className="p-1.5 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-colors"
                        title="Edit Symptom Log"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(log.id)}
                        className="p-1.5 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
                        title="Delete Symptom Log"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SymptomLogListItem;