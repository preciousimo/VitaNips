// src/features/health/components/VitalSignLogListItem.tsx
import React from 'react';
import { VitalSignLog } from '../../../types/healthLogs';
import { PencilSquareIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';

interface VitalSignLogListItemProps {
    log: VitalSignLog;
    onEdit: (log: VitalSignLog) => void;
    onDelete: (id: number) => void;
}

const formatDateTimeDisplay = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return isoString;
    }
};

const VitalSignLogListItem: React.FC<VitalSignLogListItemProps> = ({ log, onEdit, onDelete }) => {
    const renderDetail = (label: string, value: string | number | null | undefined, unit: string = '') => {
        if (value === null || value === undefined || String(value).trim() === '') return null;
        return <p className="text-xs text-gray-600"><span className="font-medium">{label}:</span> {value}{unit}</p>;
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all duration-200 ease-in-out mb-3 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-semibold text-blue-700 flex items-center mb-1">
                        <ClockIcon className="h-4 w-4 mr-1.5"/>
                        Recorded: {formatDateTimeDisplay(log.date_recorded)}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mt-2">
                        {renderDetail("HR", log.heart_rate, " bpm")}
                        {renderDetail("BP", `<span class="math-inline">\{log\.systolic\_pressure \|\| 'N/A'\}/</span>{log.diastolic_pressure || 'N/A'}`, " mmHg")}
                        {renderDetail("Temp", log.temperature, " °C")}
                        {renderDetail("SpO2", log.oxygen_saturation, "%")}
                        {renderDetail("Resp", log.respiratory_rate, " /min")}
                        {renderDetail("Glucose", log.blood_glucose, " mg/dL")}
                        {renderDetail("Weight", log.weight, " kg")}
                    </div>
                    {log.notes && (
                        <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                            <span className="font-medium">Notes:</span> {log.notes}
                        </p>
                    )}
                </div>
                <div className="flex flex-col space-y-1 flex-shrink-0 ml-2">
                    <button
                        onClick={() => onEdit(log)}
                        className="p-1.5 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-colors"
                        title="Edit Vitals Log"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(log.id)}
                        className="p-1.5 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
                        title="Delete Vitals Log"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VitalSignLogListItem;