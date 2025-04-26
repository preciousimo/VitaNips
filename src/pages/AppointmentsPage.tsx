// src/pages/AppointmentsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUserAppointments, cancelAppointment } from '../api/appointments';
import { Appointment } from '../types/appointments'; // Keep this
import AppointmentListItem from '../features/appointments/components/AppointmentListItem';
// Assuming PaginatedResponse is defined in src/types/common.ts
// import { PaginatedResponse } from '../types/common';
// Import Loading/Error components if available

const AppointmentsPage: React.FC = () => {
    // State for accumulated results
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    // State for pagination
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    // Initial loading and error state
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // State for cancellation action
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const sortAppointments = (data: Appointment[]) => {
         // Sort: upcoming first (by date/time), then past descending
         return data.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.start_time || '00:00:00'}`); // Add default time if missing
            const dateB = new Date(`${b.date}T${b.start_time || '00:00:00'}`); // Add default time if missing
            const now = new Date();
            // Determine if past (handle potential invalid dates)
            const aIsPast = isNaN(dateA.getTime()) || dateA < now || ['completed', 'cancelled', 'no_show'].includes(a.status);
            const bIsPast = isNaN(dateB.getTime()) || dateB < now || ['completed', 'cancelled', 'no_show'].includes(b.status);

            if (!aIsPast && bIsPast) return -1; // a is upcoming, b is past
            if (aIsPast && !bIsPast) return 1;  // a is past, b is upcoming
            // If both upcoming or both past, sort by date (handle invalid dates)
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;
            if (!aIsPast && !bIsPast) return dateA.getTime() - dateB.getTime(); // both upcoming: sort earliest first
            return dateB.getTime() - dateA.getTime(); // both past: sort latest first
        });
    };


    const loadInitialAppointments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAppointments([]); // Reset
        setNextPageUrl(null);
        setTotalCount(0);
        try {
            // Fetch first page
            const response = await getUserAppointments(); // Pass params if needed
            if (response && Array.isArray(response.results)) {
                setAppointments(sortAppointments(response.results));
                setNextPageUrl(response.next);
                setTotalCount(response.count);
            } else {
                console.warn("Received unexpected appointment response:", response);
                setError("Failed to process appointment data.");
                setAppointments([]);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load appointments.");
            console.error(err);
            setAppointments([]);
        } finally {
            setIsLoading(false);
        }
    }, []); // Dependency array is empty, sortAppointments is stable

    const loadMoreAppointments = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            // Fetch next page using the URL
            const response = await getUserAppointments(nextPageUrl);
             if (response && Array.isArray(response.results)) {
                // Append and re-sort (might be inefficient for large lists, but ensures order)
                setAppointments(prev => sortAppointments([...prev, ...response.results]));
                setNextPageUrl(response.next);
            } else {
                console.warn("Received unexpected appointment response on load more:", response);
                setError("Failed to process additional appointment data.");
                setNextPageUrl(null); // Stop loading more
            }
        } catch (err: any) {
            setError(err.message || "Failed to load more appointments.");
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        loadInitialAppointments();
    }, [loadInitialAppointments]);

    const handleCancel = async (id: number) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) {
            return;
        }
        setCancellingId(id);
        setError(null);
        try {
            await cancelAppointment(id);
            // Refresh the list to show the updated status
            // Instead of full reload, update the specific item's status optimistically
            // or just refetch the initial page for simplicity if needed
            loadInitialAppointments(); // Reload first page after cancel
        } catch (err: any) {
            setError(err.message || "Failed to cancel appointment.");
            console.error(err);
        } finally {
            setCancellingId(null);
        }
    };

    // Separate appointments into upcoming and past for display (using current state)
    const now = new Date();
    const upcomingAppointments = appointments.filter(app =>
        !(['completed', 'cancelled', 'no_show'].includes(app.status)) && new Date(`${app.date}T${app.start_time || '00:00:00'}`) >= now
    );
    const pastAppointments = appointments.filter(app =>
        (['completed', 'cancelled', 'no_show'].includes(app.status)) || new Date(`${app.date}T${app.start_time || '00:00:00'}`) < now
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Appointments</h1>

             {/* Loading State */}
             {isLoading && (
                <p className="text-muted text-center py-4">Loading appointments...</p>
             )}

             {/* Error State */}
             {!isLoading && error && (
                <p className="text-red-600 text-center py-4 bg-red-50 rounded">{error}</p>
             )}

             {/* Content Area */}
             {!isLoading && !error && (
                <>
                    {totalCount > 0 ? (
                        <p className="text-sm text-muted mb-4">Showing {appointments.length} of {totalCount} appointments.</p>
                    ) : null}

                    <div className="space-y-8">
                        {/* Upcoming Appointments Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Upcoming</h2>
                            {upcomingAppointments.length > 0 ? (
                                <ul className="space-y-0">
                                    {upcomingAppointments.map(app => (
                                        <AppointmentListItem
                                            key={app.id}
                                            appointment={app}
                                            onCancel={handleCancel}
                                            isCancelling={cancellingId === app.id}
                                        />
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted text-center py-5 px-3 bg-gray-50 rounded-md">
                                    You have no upcoming appointments.
                                </p>
                            )}
                        </div>

                        {/* Past Appointments Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Past & Cancelled</h2>
                            {pastAppointments.length > 0 ? (
                                <ul className="space-y-0">
                                    {pastAppointments.map(app => (
                                        <AppointmentListItem
                                            key={app.id}
                                            appointment={app}
                                            onCancel={() => {}} // No cancel action for past
                                        />
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted text-center py-5 px-3 bg-gray-50 rounded-md">
                                    No past appointment history found.
                                </p>
                            )}
                        </div>
                    </div>

                     {/* Load More Button - Loads ALL appointments, filtering happens client side */}
                     {nextPageUrl && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={loadMoreAppointments}
                                disabled={isLoadingMore}
                                className="btn-primary px-6 py-2 disabled:opacity-50"
                            >
                                {isLoadingMore ? 'Loading...' : 'Load More Appointments'}
                            </button>
                        </div>
                    )}

                    {/* Message if everything is loaded */}
                    {!nextPageUrl && totalCount > 0 && appointments.length === totalCount && (
                        <p className="text-center text-muted text-sm mt-6">All appointments loaded.</p>
                    )}

                    {/* Message if no appointments at all */}
                    {totalCount === 0 && (
                        <p className="text-center text-muted text-lg mt-10">You haven't scheduled any appointments yet.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default AppointmentsPage;