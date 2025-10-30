// src/pages/AppointmentsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUserAppointments, cancelAppointment } from '../api/appointments';
import { Appointment } from '../types/appointments';
import AppointmentListItem from '../features/appointments/components/AppointmentListItem';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { ConfirmDialog, Button, ErrorMessage, EmptyState } from '../components/common';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const AppointmentsPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [cancelId, setCancelId] = useState<number | null>(null);

    const sortAppointments = (data: Appointment[]) => {
         return data.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.start_time || '00:00:00'}`);
            const dateB = new Date(`${b.date}T${b.start_time || '00:00:00'}`);
            const now = new Date();
            const aIsPast = isNaN(dateA.getTime()) || dateA < now || ['completed', 'cancelled', 'no_show'].includes(a.status);
            const bIsPast = isNaN(dateB.getTime()) || dateB < now || ['completed', 'cancelled', 'no_show'].includes(b.status);

            if (!aIsPast && bIsPast) return -1;
            if (aIsPast && !bIsPast) return 1;
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;
            if (!aIsPast && !bIsPast) return dateA.getTime() - dateB.getTime();
            return dateB.getTime() - dateA.getTime();
        });
    };

    const loadInitialAppointments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAppointments([]);
        setNextPageUrl(null);
        setTotalCount(0);
        try {
            const response = await getUserAppointments();
            if (response && Array.isArray(response.results)) {
                setAppointments(sortAppointments(response.results));
                setNextPageUrl(response.next);
                setTotalCount(response.count);
            } else {
                console.warn("Received unexpected appointment response:", response);
                setError("Failed to process appointment data.");
                setAppointments([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load appointments.";
            setError(errorMessage);
            console.error(err);
            setAppointments([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMoreAppointments = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            const response = await getUserAppointments(nextPageUrl);
             if (response && Array.isArray(response.results)) {
                setAppointments(prev => sortAppointments([...prev, ...response.results]));
                setNextPageUrl(response.next);
            } else {
                console.warn("Received unexpected appointment response on load more:", response);
                setError("Failed to process additional appointment data.");
                setNextPageUrl(null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load more appointments.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        loadInitialAppointments();
    }, [loadInitialAppointments]);

    const handleCancel = (id: number) => {
        setCancelId(id);
        setShowConfirmDialog(true);
    };

    const handleConfirmCancel = async () => {
        if (!cancelId) return;
        setCancellingId(cancelId);
        setError(null);
        try {
            await cancelAppointment(cancelId);
            setShowConfirmDialog(false);
            setCancelId(null);
            loadInitialAppointments();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to cancel appointment.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setCancellingId(null);
        }
    };

    const handleCancelDialog = () => {
        setShowConfirmDialog(false);
        setCancelId(null);
    };

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

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelDialog}
                onConfirm={handleConfirmCancel}
                title="Cancel Appointment"
                message="Are you sure you want to cancel this appointment? This action cannot be undone."
                confirmText="Cancel Appointment"
                cancelText="Keep Appointment"
                isLoading={!!cancellingId}
            />

             {isLoading && (
                <SkeletonList count={5} />
             )}

             {!isLoading && error && (
                <ErrorMessage message={error} onRetry={loadInitialAppointments} />
             )}

             {!isLoading && !error && (
                <>
                    {totalCount > 0 ? (
                        <p className="text-sm text-muted mb-4">Showing {appointments.length} of {totalCount} appointments.</p>
                    ) : null}

                    <div className="space-y-8">
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
                                <EmptyState
                                    icon={CalendarDaysIcon}
                                    title="No upcoming appointments"
                                    description="You have no scheduled appointments at this time."
                                />
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Past & Cancelled</h2>
                            {pastAppointments.length > 0 ? (
                                <ul className="space-y-0">
                                    {pastAppointments.map(app => (
                                        <AppointmentListItem
                                            key={app.id}
                                            appointment={app}
                                            onCancel={() => {}}
                                        />
                                    ))}
                                </ul>
                            ) : (
                                <EmptyState
                                    title="No past appointments"
                                    description="No appointment history found."
                                />
                            )}
                        </div>
                    </div>

                     {nextPageUrl && (
                        <div className="mt-8 text-center">
                            <Button
                                onClick={loadMoreAppointments}
                                isLoading={isLoadingMore}
                                disabled={isLoadingMore}
                                variant="primary"
                            >
                                Load More Appointments
                            </Button>
                        </div>
                    )}

                    {!nextPageUrl && totalCount > 0 && appointments.length === totalCount && (
                        <p className="text-center text-muted text-sm mt-6">All appointments loaded.</p>
                    )}

                    {totalCount === 0 && (
                        <EmptyState
                            icon={CalendarDaysIcon}
                            title="No appointments yet"
                            description="You haven't scheduled any appointments yet. Book your first appointment with a doctor."
                            actionLabel="Find Doctors"
                            onAction={() => window.location.href = '/doctors'}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default AppointmentsPage;