// src/features/health/components/VaccinationListItem.tsx
import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Vaccination } from '../../../types/health';

interface VaccinationListItemProps {
    vaccination: Vaccination;
    onEdit: (vaccination: Vaccination) => void; // Function to trigger edit mode
    onDelete: (id: number) => void; // Function to trigger delete
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
         // Assuming YYYY-MM-DD input
        return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-CA'); // Use UTC to avoid timezone issues, en-CA often gives YYYY-MM-DD
    } catch {
        return 'Invalid Date';
    }
};


const VaccinationListItem: React.FC<VaccinationListItemProps> = ({ vaccination, onEdit, onDelete }) => {
    return (
        <li className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-150 mb-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-primary text-md mb-1">{vaccination.vaccine_name}</h3>
                    <p className="text-sm text-gray-600">
                        Dose #{vaccination.dose_number} administered on {formatDate(vaccination.date_administered)}
                    </p>
                    {vaccination.next_dose_date && (
                         <p className="text-sm text-orange-600">Next Dose Due: {formatDate(vaccination.next_dose_date)}</p>
                     )}
                    {vaccination.administered_at && (
                        <p className="text-xs text-muted mt-1">Location: {vaccination.administered_at}</p>
                    )}
                     {vaccination.batch_number && (
                        <p className="text-xs text-muted">Batch: {vaccination.batch_number}</p>
                    )}
                     {vaccination.notes && (
                         <p className="text-xs text-muted mt-1">Notes: {vaccination.notes}</p>
                     )}
                </div>
                <div className="flex space-x-2 flex-shrink-0 ml-4">
                    <button
                        onClick={() => onEdit(vaccination)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit Vaccination"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(vaccination.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Vaccination"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </li>
    );
};

export default VaccinationListItem;