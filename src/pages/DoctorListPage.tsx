// src/pages/DoctorListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getDoctors } from '../api/doctors';
import { Doctor } from '../types/doctors';
import DoctorCard from '../features/doctors/components/DoctorCard';

const DoctorListPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchInitialDoctors = useCallback(async (currentSearchTerm: string) => {
        setIsLoading(true);
        setError(null);
        setDoctors([]);
        setNextPageUrl(null);
        setTotalCount(0);

        try {
            const params: { search?: string } = {};
            if (currentSearchTerm) {
                params.search = currentSearchTerm;
            }
            const response = await getDoctors(params);

            if (response && Array.isArray(response.results)) {
                setDoctors(response.results);
                setNextPageUrl(response.next);
                setTotalCount(response.count);
            } else {
                console.warn("Received unexpected response structure:", response);
                setError("Received invalid data from server.");
                setDoctors([]);
            }
        } catch (err: any) {
            console.error("Error fetching doctors:", err);
            setError(err.message || 'Failed to load doctors. Please try again later.');
            setDoctors([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMoreDoctors = async () => {
        if (!nextPageUrl || isLoadingMore) return;

        setIsLoadingMore(true);
        setError(null);

        try {
            const response = await getDoctors(nextPageUrl);

            if (response && Array.isArray(response.results)) {
                setDoctors(prevDoctors => [...prevDoctors, ...response.results]);
                setNextPageUrl(response.next);
            } else {
                 console.warn("Received unexpected response structure on load more:", response);
                 setError("Received invalid data while loading more.");
                 setNextPageUrl(null);
            }
        } catch (err: any) {
            console.error("Error loading more doctors:", err);
            setError(err.message || 'Failed to load more doctors.');
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchInitialDoctors(searchTerm);
    }, [fetchInitialDoctors]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        fetchInitialDoctors(searchTerm);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Find a Doctor</h1>
            <div className="mb-8 bg-white p-4 rounded-lg shadow">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search by name, specialty, bio..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="input-field pl-10 w-full"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <button type="submit" className="btn-primary w-full md:w-auto px-6" disabled={isLoading}>
                        {isLoading && !isLoadingMore ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            <div>
                {isLoading ? (
                    <div className="text-center py-10">
                        <p className="text-muted">Loading doctors...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10 bg-red-50 text-red-700 p-4 rounded-md">
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        {totalCount > 0 && (
                             <p className="text-sm text-muted mb-4">Showing {doctors.length} of {totalCount} doctors.</p>
                         )}
                        {doctors.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {doctors.map((doctor) => (
                                    <DoctorCard key={doctor.id} doctor={doctor} />
                                ))}
                            </div>
                        ) : (
                            !isLoading && !error && (
                                <div className="text-center py-10">
                                    <p className="text-muted">No doctors found matching your criteria.</p>
                                </div>
                            )
                        )}

                        {nextPageUrl && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={loadMoreDoctors}
                                    disabled={isLoadingMore}
                                    className="btn-primary px-6 py-2 disabled:opacity-50"
                                >
                                    {isLoadingMore ? 'Loading...' : 'Load More Doctors'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DoctorListPage;