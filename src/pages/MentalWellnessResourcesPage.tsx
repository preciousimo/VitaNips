// src/pages/MentalWellnessResourcesPage.tsx
import React, { useMemo, useState } from 'react';
import { LifebuoyIcon, PhoneIcon, LinkIcon, ShieldExclamationIcon, MagnifyingGlassIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

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
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<Resource['type'] | 'All'>('All');

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        return resources.filter(r => {
            const matchType = filter === 'All' || r.type === filter;
            const matchQuery = !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
            return matchType && matchQuery;
        });
    }, [query, filter]);

    const types: (Resource['type'] | 'All')[] = ['All', 'Helpline', 'Online Resource', 'Organization'];

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            {/* Hero */}
            <div className="hero-gradient rounded-2xl p-8 sm:p-10 text-white shadow-card">
                <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 ring-1 ring-white/20">
                        <LifebuoyIcon className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Mental Wellness Support</h1>
                        <p className="mt-2 text-white/90 text-sm sm:text-base max-w-3xl">Find trusted helplines and resources for mental health and well‑being. You’re not alone—support is available.</p>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="col-span-2 relative">
                        <MagnifyingGlassIcon className="h-5 w-5 text-white/70 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search resources (e.g., ‘suicide prevention’, ‘WHO’)"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 text-gray-800 placeholder-gray-500 shadow focus:outline-none focus:ring-2 ring-primary"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                        {types.map(t => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-3 py-2 rounded-xl text-sm transition-all border ${filter === t ? 'bg-white/90 text-gray-800' : 'bg-white/20 text-white/90 hover:bg-white/25'} border-white/30`}
                                aria-pressed={filter === t}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Immediate help banner */}
            <div className="mt-6 p-4 sm:p-5 rounded-xl border border-yellow-200 bg-yellow-50/80">
                <div className="flex items-start gap-3">
                    <ShieldExclamationIcon className="h-5 w-5 text-yellow-600 mt-0.5" aria-hidden="true" />
                    <div className="text-sm text-yellow-900">
                        If you are in immediate distress or danger, call your local emergency number or go to the nearest emergency room. This list is informational and not a substitute for professional medical advice.
                    </div>
                </div>
            </div>

            {/* Resources grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((resource, index) => (
                    <div key={index} className="card p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">{resource.name}</h2>
                                <span className="text-[11px] tracking-wide uppercase bg-primary-light text-primary px-2 py-1 rounded-full">{resource.type}</span>
                            </div>
                            {resource.url && (
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !px-2" title="Open website">
                                    <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-600" />
                                </a>
                            )}
                        </div>
                        <p className="text-sm text-gray-700 mt-3">{resource.description}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {resource.phone && (
                                <a href={`tel:${resource.phone}`} className="btn btn-outline text-sm">
                                    <PhoneIcon className="h-4 w-4 mr-2" />
                                    Call {resource.phone}
                                </a>
                            )}
                            {resource.url && (
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary text-sm">
                                    <LinkIcon className="h-4 w-4 mr-2" /> Visit Website
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Can’t find help prompt */}
            <div className="mt-10 text-center">
                <p className="text-sm text-gray-600">Can’t find what you need? Talk to a professional or reach out to our support.</p>
            </div>
        </div>
    );
};
export default MentalWellnessResourcesPage;