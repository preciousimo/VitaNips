// src/features/prescriptions/components/PrescriptionDetailView.tsx
import React from 'react';
import { Prescription } from '../../../types/prescriptions';
import { Link } from 'react-router-dom';
import { ClipboardDocumentListIcon, TagIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface PrescriptionDetailViewProps {
    prescription: Prescription;
}

const PrescriptionDetailView: React.FC<PrescriptionDetailViewProps> = ({ prescription }) => {

     const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch { return 'Invalid Date'; }
    };

    return (
        <div className="bg-indigo-50 p-4 border border-indigo-200 rounded-b-lg -mt-3 pt-6 animate-fade-in"> {/* Added subtle background and animation */}
            <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-1">Diagnosis & Notes</h4>
                <p className="text-sm text-gray-700 mb-1"><span className='font-medium'>Diagnosis:</span> {prescription.diagnosis}</p>
                {prescription.notes && (
                    <p className="text-sm text-gray-600"><span className='font-medium'>Notes:</span> {prescription.notes}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Prescribed on: {formatDate(prescription.date_prescribed)}</p>
                 {/* Optional: Link to the associated appointment */}
                 <Link to={`/appointments/${prescription.appointment}`} className="text-xs text-primary hover:underline">View Associated Appointment</Link>
            </div>

            <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-primary"/> Medications Prescribed
                </h4>
                {prescription.items && prescription.items.length > 0 ? (
                     <ul className="space-y-3 pl-1">
                        {prescription.items.map((item) => (
                            <li key={item.id} className="border-l-2 border-primary pl-3 py-1">
                                 <p className="font-medium text-gray-800">{item.medication_name}</p>
                                <p className="text-sm text-gray-600"><TagIcon className="h-3 w-3 inline mr-1 text-gray-400"/> {item.dosage} | {item.frequency} | {item.duration}</p>
                                <p className="text-xs text-gray-500 mt-1"><InformationCircleIcon className="h-3 w-3 inline mr-1 text-gray-400"/> Instructions: {item.instructions}</p>
                                {/* Add link to Medication Info page later */}
                            </li>
                         ))}
                     </ul>
                 ) : (
                    <p className="text-sm text-muted">No specific medications listed for this prescription.</p>
                 )}
            </div>

             {/* Add "Forward to Pharmacy" button here later */}
             <div className="mt-4 text-right">
                 <button className="btn-primary text-sm px-3 py-1">Forward to Pharmacy</button>
                 {/* Add onClick handler later */}
             </div>
        </div>
    );
};
// Helper style for animation (add to your src/index.css or similar)
/*
@keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
}
*/

export default PrescriptionDetailView;