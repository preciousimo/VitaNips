// src/pages/AppointmentsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUserAppointments, cancelAppointment } from '../api/appointments';
import { Appointment } from '../types/appointments';
import AppointmentListItem from '../features/appointments/components/AppointmentListItem';
// Import Loading/Error components

const AppointmentsPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null); // Track which appointment is being cancelled

    const loadAppointments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getUserAppointments();
            // Sort: upcoming first (by date/time), then past descending
            data.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.start_time}`);
                const dateB = new Date(`${b.date}T${b.start_time}`);
                const now = new Date();

                const aIsPast = dateA < now || ['completed', 'cancelled', 'no_show'].includes(a.status);
                const bIsPast = dateB < now || ['completed', 'cancelled', 'no_show'].includes(b.status);

                if (!aIsPast && bIsPast) return -1; // a is upcoming, b is past
                if (aIsPast && !bIsPast) return 1;  // a is past, b is upcoming
                if (!aIsPast && !bIsPast) return dateA.getTime() - dateB.getTime(); // both upcoming: sort earliest first
                return dateB.getTime() - dateA.getTime(); // both past: sort latest first
            });
            setAppointments(data);
        } catch (err) {
            setError("Failed to load appointments.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    const handleCancel = async (id: number) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) {
            return;
        }
        setCancellingId(id);
        setError(null); // Clear previous errors
        try {
            await cancelAppointment(id);
            // Refresh the list to show the updated status
            await loadAppointments();
        } catch (err) {
            setError("Failed to cancel appointment.");
            console.error(err);
        } finally {
            setCancellingId(null);
        }
    };

    // Separate appointments into upcoming and past for display
    const now = new Date();
    const upcomingAppointments = appointments.filter(app =>
        !(['completed', 'cancelled', 'no_show'].includes(app.status)) && new Date(`${app.date}T${app.start_time}`) >= now
    );
    const pastAppointments = appointments.filter(app =>
        (['completed', 'cancelled', 'no_show'].includes(app.status)) || new Date(`${app.date}T${app.start_time}`) < now
    );


    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Appointments</h1>

            {isLoading ? (
                <p className="text-muted text-center py-4">Loading appointments...</p>
            ) : error ? (
                <p className="text-red-600 text-center py-4">{error}</p>
            ) : (
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
            )}
        </div>
    );
};

export default AppointmentsPage;