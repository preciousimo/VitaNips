// src/features/prescriptions/components/PrescriptionListItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; // Assuming UserDoctorIcon exists or use a different one
import { Prescription } from '../../../types/prescriptions';

interface PrescriptionListItemProps {
    prescription: Prescription;
    isSelected: boolean;
    onSelect: (id: number) => void;
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return 'Invalid Date'; }
};

const PrescriptionListItem: React.FC<PrescriptionListItemProps> = ({ prescription, isSelected, onSelect }) => {
    return (
        <li
            className={`border rounded-lg mb-3 overflow-hidden transition-all duration-200 ease-in-out ${isSelected ? 'border-primary shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        >
            <button
                onClick={() => onSelect(prescription.id)}
                className="w-full text-left p-4 block focus:outline-none"
                aria-expanded={isSelected}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                            <CalendarDaysIcon className="h-4 w-4 mr-1.5" />
                            <span>Prescribed on: {formatDate(prescription.date_prescribed)}</span>
                        </div>
                         {/* Link to Doctor Profile */}
                        <Link
                            to={`/doctors/${prescription.doctor}`}
                            onClick={(e) => e.stopPropagation()} // Prevent button click when clicking link
                            className="text-md font-semibold text-primary hover:underline mb-1 inline-flex items-center"
                        >
                            {/* Add UserDoctorIcon or similar if you have one */}
                            {/* <UserIcon className="h-5 w-5 mr-1.5 text-gray-600"/> */}
                            Prescribing Doctor ID: {prescription.doctor} {/* Replace with name if fetched */}
                        </Link>
                        <p className="text-sm text-gray-700 line-clamp-1">
                            <span className="font-medium">Diagnosis:</span> {prescription.diagnosis || 'Not specified'}
                        </p>
                    </div>
                    <ChevronRightIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
                </div>
            </button>
        </li>
    );
};

export default PrescriptionListItem;