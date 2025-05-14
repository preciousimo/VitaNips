// src/pages/MentalWellnessResourcesPage.tsx
import React from 'react';
import { LifebuoyIcon, PhoneIcon, LinkIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface Resource {
    name: string;
    description: string;
    url?: string;
    phone?: string;
    type: 'Helpline' | 'Online Resource' | 'Organization';
}

const resources: Resource[] = [
    {
        name: "Nigeria Suicide Prevention Initiative (NSPI)",
        description: "Provides support for individuals in distress or considering suicide.",
        phone: "+2348062106493", // Example - verify actual numbers
        type: "Helpline",
    },
    {
        name: "Mentally Aware Nigeria Initiative (MANI)",
        description: "Raises awareness about mental health and provides support.",
        url: "https://www.mentallyaware.org/", // Example - verify actual URLs
        type: "Organization",
    },
    {
        name: "WHO Mental Health Resources",
        description: "Information and resources from the World Health Organization.",
        url: "https://www.who.int/teams/mental-health-and-substance-use/promotion-prevention/",
        type: "Online Resource",
    },
    // Add more relevant local and international resources
];

const MentalWellnessResourcesPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                <LifebuoyIcon className="h-12 w-12 text-primary mx-auto mb-2" />
                <h1 className="text-3xl font-bold text-gray-800">Mental Wellness Support</h1>
                <p className="mt-2 text-lg text-gray-600">Find resources and helplines for mental health and well-being.</p>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ShieldExclamationIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm">
                            If you are in immediate distress or danger, please call your local emergency number or go to the nearest emergency room.
                            This list is for informational purposes and not a substitute for professional medical advice.
                        </p>
                    </div>
                </div>
            </div>


            <div className="mt-8 space-y-6">
                {resources.map((resource, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold text-primary mb-1">{resource.name}</h2>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mb-2 inline-block">{resource.type}</span>
                        <p className="text-sm text-gray-700 mb-3">{resource.description}</p>
                        <div className="space-y-1">
                            {resource.phone && (
                                <a href={`tel:${resource.phone}`} className="flex items-center text-sm text-green-600 hover:text-green-700 hover:underline">
                                    <PhoneIcon className="h-4 w-4 mr-2" /> {resource.phone}
                                </a>
                            )}
                            {resource.url && (
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline">
                                    <LinkIcon className="h-4 w-4 mr-2" /> Visit Website
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default MentalWellnessResourcesPage;