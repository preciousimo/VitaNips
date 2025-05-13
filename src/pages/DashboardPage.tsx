// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    ChartBarIcon,
    HeartIcon,
    ShieldExclamationIcon,
    ShoppingBagIcon,
    FireIcon,
    MoonIcon,
    CalendarDaysIcon,
    BellAlertIcon,
    ArrowRightIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { getUserAppointments } from '../api/appointments';
import { getMedicationReminders } from '../api/medicationReminders';
import { Appointment } from '../types/appointments';
import { MedicationReminder } from '../types/reminders';

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = "h-6 w-6" }) => (
    <svg className={`animate-spin text-primary ${size}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center text-xs text-red-600">
        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
        {message}
    </div>
);

const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
    const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(true);
    const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

    const [activeReminders, setActiveReminders] = useState<MedicationReminder[]>([]);
    const [nextReminder, setNextReminder] = useState<MedicationReminder | null>(null);
    const [remindersLoading, setRemindersLoading] = useState<boolean>(true);
    const [remindersError, setRemindersError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        setAppointmentsLoading(true);
        setAppointmentsError(null);
        try {
            const response = await getUserAppointments({ page: 1, ordering: 'date,start_time' });
            const now = new Date();
            const upcoming = response.results.filter(app => {
                const appDateTime = new Date(`${app.date}T${app.start_time}`);
                return appDateTime >= now && (app.status === 'scheduled' || app.status === 'confirmed');
            });
            setUpcomingAppointments(upcoming);
            if (upcoming.length > 0) {
                setNextAppointment(upcoming[0]);
            }
        } catch (err) {
            console.error("Failed to fetch appointments for dashboard:", err);
            setAppointmentsError("Could not load appointments.");
        } finally {
            setAppointmentsLoading(false);
        }

        setRemindersLoading(true);
        setRemindersError(null);
        try {
            const response = await getMedicationReminders({ page: 1 });
            const active = response.results.filter(rem => rem.is_active);
            // Sort active reminders by time to find the "next" one for today or soonest
            const sortedActive = active.sort((a, b) => {
                const timeA = a.time_of_day;
                const timeB = b.time_of_day;
                return timeA.localeCompare(timeB);
            });
            setActiveReminders(sortedActive);
            if (sortedActive.length > 0) {
                setNextReminder(sortedActive[0]);
            }
        } catch (err) {
            console.error("Failed to fetch reminders for dashboard:", err);
            setRemindersError("Could not load reminders.");
        } finally {
            setRemindersLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user, fetchDashboardData]);

    const healthSections = [
        { name: 'Log Vitals', path: '/health/vitals', icon: HeartIcon, description: "Track your BP, heart rate, etc." },
        { name: 'Log Symptoms', path: '/health/symptoms', icon: ShieldExclamationIcon, description: "Record how you're feeling." },
        { name: 'Food Journal', path: '/health/food', icon: ShoppingBagIcon, description: "Keep a journal of your meals." },
        { name: 'Exercise Log', path: '/health/exercise', icon: FireIcon, description: "Monitor your physical activity." },
        { name: 'Sleep Log', path: '/health/sleep', icon: MoonIcon, description: "Track your sleep patterns." },
    ];

    const formatTime = (timeStr: string | null | undefined): string => {
        if (!timeStr) return '';
        try {
            const [hours, minutes] = timeStr.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } catch { return timeStr; }
    };
    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'N/A';
        try {
            const today = new Date();
            today.setHours(0,0,0,0);
            const itemDate = new Date(dateStr + 'T00:00:00Z');
            itemDate.setHours(0,0,0,0);

            if (itemDate.getTime() === today.getTime()) return 'Today';
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            if (itemDate.getTime() === tomorrow.getTime()) return 'Tomorrow';

            return itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch { return 'Invalid Date'; }
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-lg text-gray-600 mt-1">
                    Welcome back, {user?.first_name || user?.username || 'User'}!
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Appointments Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-semibold text-primary flex items-center">
                            <CalendarDaysIcon className="h-6 w-6 mr-2" />
                            Upcoming Appointments
                        </h2>
                        <span className="text-sm font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                            {appointmentsLoading ? <LoadingSpinner size="h-4 w-4 inline-block"/> : upcomingAppointments.length}
                        </span>
                    </div>
                    {appointmentsLoading ? (
                        <div className="flex justify-center items-center h-20"><LoadingSpinner /></div>
                    ) : appointmentsError ? (
                        <ErrorDisplay message={appointmentsError} />
                    ) : upcomingAppointments.length > 0 && nextAppointment ? (
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                Next: <span className="font-medium">Dr. (ID: {nextAppointment.doctor})</span>
                            </p>
                            <p className="text-sm text-gray-600">
                                {formatDate(nextAppointment.date)} at {formatTime(nextAppointment.start_time)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">Reason: {nextAppointment.reason}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">You have no upcoming appointments scheduled.</p>
                    )}
                    <Link to="/appointments" className="mt-4 inline-flex items-center text-sm text-primary hover:text-primary-dark font-medium group">
                        View All Appointments
                        <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Medication Reminders Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                     <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-semibold text-green-600 flex items-center">
                            <BellAlertIcon className="h-6 w-6 mr-2" />
                            Active Reminders
                        </h2>
                         <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            {remindersLoading ? <LoadingSpinner size="h-4 w-4 inline-block"/> : activeReminders.length}
                        </span>
                    </div>
                    {remindersLoading ? (
                        <div className="flex justify-center items-center h-20"><LoadingSpinner /></div>
                    ) : remindersError ? (
                        <ErrorDisplay message={remindersError} />
                    ) : activeReminders.length > 0 && nextReminder ? (
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                Next: <span className="font-medium">{nextReminder.medication_display.name}</span> ({nextReminder.dosage})
                            </p>
                            <p className="text-sm text-gray-600">
                                At {formatTime(nextReminder.time_of_day)}, {nextReminder.frequency}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">You have no active medication reminders.</p>
                    )}
                    <Link to="/medication-reminders" className="mt-4 inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium group">
                        Manage Reminders
                        <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Health Tracking Section */}
            <div className="mt-10">
                <h2 className="text-2xl font-semibold text-gray-700 mb-5">Health Tracking & Logs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {healthSections.map((section) => (
                        <Link
                            key={section.path}
                            to={section.path}
                            className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-300 ease-in-out group transform hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-center mb-4 bg-primary-light text-primary rounded-full h-12 w-12 group-hover:bg-primary group-hover:text-white transition-colors">
                                <section.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-primary-dark transition-colors">
                                {section.name}
                            </h3>
                            <p className="text-sm text-gray-600">{section.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;