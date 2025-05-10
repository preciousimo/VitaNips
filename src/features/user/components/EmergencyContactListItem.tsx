// src/features/user/components/EmergencyContactListItem.tsx
import React from 'react';
import { PencilSquareIcon, TrashIcon, PhoneIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { EmergencyContact } from '../../../types/user';

interface EmergencyContactListItemProps {
    contact: EmergencyContact;
    onEdit: (contact: EmergencyContact) => void;
    onDelete: (id: number) => void;
}

const EmergencyContactListItem: React.FC<EmergencyContactListItemProps> = ({ contact, onEdit, onDelete }) => {
    return (
         <li className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-150 mb-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                     <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0"/>
                     <div>
                        <h3 className="font-semibold text-gray-800 text-md">{contact.name}</h3>
                        <p className="text-sm text-muted">{contact.relationship}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600 mt-1">
                            <a href={`tel:${contact.phone_number}`} className="inline-flex items-center hover:text-primary">
                                <PhoneIcon className="h-4 w-4 mr-1 text-muted"/>
                                {contact.phone_number}
                            </a>
                            {contact.email && (
                                <a href={`mailto:${contact.email}`} className="inline-flex items-center hover:text-primary mt-1 sm:mt-0">
                                    <EnvelopeIcon className="h-4 w-4 mr-1 text-muted"/>
                                    {contact.email}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex space-x-1 flex-shrink-0 ml-4">
                    <button onClick={() => onEdit(contact)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(contact.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </li>
    );
};

export default EmergencyContactListItem;