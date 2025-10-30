// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    HeartIcon,
    ShieldExclamationIcon,
    ShoppingBagIcon,
    FireIcon,
    MoonIcon,
    CalendarDaysIcon,
    BellAlertIcon,
    ArrowRightIcon,
    PlusIcon,
    ClockIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

import { getUserAppointments } from '../api/appointments';
import { getMedicationReminders } from '../api/medicationReminders';
import { getVitalSigns } from '../api/healthLogs';
import { getUnreadNotificationCount } from '../api/notifications';
import { Appointment } from '../types/appointments';
import { MedicationReminder } from '../types/reminders';
import { VitalSignLog } from '../types/healthLogs';
import { LoadingSpinner, ErrorMessage, SkeletonLoader } from '../components/common';

// Reusable Card Header Component
const DashboardCardHeader: React.FC<{
    icon: React.ElementType;
    title: string;
    count: number;
    isLoading: boolean;
    gradient: string;
    badgeColor: string;
}> = ({ icon: Icon, title, count, isLoading, gradient, badgeColor }) => (
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mr-3 shadow-md`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <span>{title}</span>
        </h2>
        <span className={`text-sm font-bold ${badgeColor} px-3 py-1 rounded-full`}>
            {isLoading ? <LoadingSpinner size="sm" color="primary" /> : count}
        </span>
    </div>
);

// Reusable Empty State Component
const EmptyState: React.FC<{
    icon: React.ElementType;
    message: string;
    actionLabel: string;
    actionLink: string;
}> = ({ icon: Icon, message, actionLabel, actionLink }) => (
    <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm mb-2">{message}</p>
        <Link to={actionLink} className="btn btn-outline text-sm py-2 px-4">
            {actionLabel}
        </Link>
    </div>
);

// Quick Action Button
const QuickActionButton: React.FC<{
    icon: React.ElementType;
    label: string;
    href: string;
    color: string;
    description: string;
}> = ({ icon: Icon, label, href, color, description }) => (
    <Link
        to={href}
        className="card group cursor-pointer p-5 hover:scale-[1.02] transition-all duration-200"
    >
        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3 bg-gradient-to-br ${color} shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-primary transition-colors">{label}</h3>
        <p className="text-sm text-gray-600">{description}</p>
    </Link>
);

const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
    const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(true);
    const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

    const [activeReminders, setActiveReminders] = useState<MedicationReminder[]>([]);
    const [nextReminder, setNextReminder] = useState<MedicationReminder | null>(null);
    const [remindersLoading, setRemindersLoading] = useState<boolean>(true);
    const [remindersError, setRemindersError] = useState<string | null>(null);

    const [recentVitals, setRecentVitals] = useState<VitalSignLog[]>([]);
    const [vitalsLoading, setVitalsLoading] = useState<boolean>(true);
    const [vitalsError, setVitalsError] = useState<string | null>(null);

    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [notificationsLoading, setNotificationsLoading] = useState<boolean>(true);

    const fetchDashboardData = useCallback(async () => {
        // Fetch Appointments
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

        // Fetch Medication Reminders
        setRemindersLoading(true);
        setRemindersError(null);
        try {
            const response = await getMedicationReminders({ page: 1 });
            const active = response.results.filter(rem => rem.is_active);
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

        // Fetch Recent Vital Signs (last 3)
        setVitalsLoading(true);
        setVitalsError(null);
        try {
            const response = await getVitalSigns({ page: 1 });
            const recent = response.results.slice(0, 3);
            setRecentVitals(recent);
        } catch (err) {
            console.error("Failed to fetch vitals for dashboard:", err);
            setVitalsError("Could not load vitals.");
        } finally {
            setVitalsLoading(false);
        }

        // Fetch Unread Notifications Count
        setNotificationsLoading(true);
        try {
            const countData = await getUnreadNotificationCount();
            setUnreadCount(countData.unread_count || 0);
        } catch (err) {
            console.error("Failed to fetch notification count:", err);
            setUnreadCount(0);
        } finally {
            setNotificationsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user, fetchDashboardData]);

    const healthSections = [
        { 
            name: t('healthSections.vitals.name', 'Log Vitals'), 
            path: '/health/vitals', 
            icon: HeartIcon, 
            description: t('healthSections.vitals.description', "Track your BP, heart rate, etc."),
            gradient: 'from-blue-500 to-blue-600'
        },
        { 
            name: t('healthSections.symptoms.name', 'Log Symptoms'), 
            path: '/health/symptoms', 
            icon: ShieldExclamationIcon, 
            description: t('healthSections.symptoms.description', "Record how you're feeling."),
            gradient: 'from-orange-500 to-orange-600'
        },
        { 
            name: t('healthSections.food.name', 'Food Journal'), 
            path: '/health/food', 
            icon: ShoppingBagIcon, 
            description: t('healthSections.food.description', "Keep a journal of your meals."),
            gradient: 'from-green-500 to-green-600'
        },
        { 
            name: t('healthSections.exercise.name', 'Exercise Log'), 
            path: '/health/exercise', 
            icon: FireIcon, 
            description: t('healthSections.exercise.description', "Monitor your physical activity."),
            gradient: 'from-red-500 to-red-600'
        },
        { 
            name: t('healthSections.sleep.name', 'Sleep Log'), 
            path: '/health/sleep', 
            icon: MoonIcon, 
            description: t('healthSections.sleep.description', "Track your sleep patterns."),
            gradient: 'from-purple-500 to-purple-600'
        },
    ];

    const quickActions = [
        {
            icon: PlusIcon,
            label: 'Book Appointment',
            href: '/doctors',
            color: 'from-blue-500 to-blue-600',
            description: 'Schedule with a doctor'
        },
        {
            icon: ShoppingBagIcon,
            label: 'Find Pharmacy',
            href: '/pharmacies',
            color: 'from-green-500 to-green-600',
            description: 'Locate nearby pharmacies'
        },
        {
            icon: ShieldExclamationIcon,
            label: 'Emergency Contacts',
            href: '/emergency-contacts',
            color: 'from-red-500 to-red-600',
            description: 'Manage emergency contacts'
        },
        {
            icon: BellAlertIcon,
            label: 'Set Reminders',
            href: '/medication-reminders',
            color: 'from-yellow-500 to-yellow-600',
            description: 'Create medication reminders'
        },
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
            today.setHours(0, 0, 0, 0);
            const itemDate = new Date(dateStr + 'T00:00:00Z');
            itemDate.setHours(0, 0, 0, 0);

            if (itemDate.getTime() === today.getTime()) return 'Today';
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            if (itemDate.getTime() === tomorrow.getTime()) return 'Tomorrow';

            return itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch { return 'Invalid Date'; }
    };

    const getAppointmentStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
            case 'scheduled':
                return <ClockIcon className="h-4 w-4 text-blue-500" />;
            default:
                return <ClockIcon className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Welcome Header with hero gradient */}
            <div className="hero-gradient text-white p-8 rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5" />
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
                        {t('dashboardTitle', 'Welcome back')}, {user?.first_name || user?.username || 'User'}!
                    </h1>
                    <p className="text-lg text-white/90">
                        {t('welcomeMessage', 'Here\'s what\'s happening with your health today.')}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="gradient-text">Quick Actions</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <QuickActionButton key={action.label} {...action} />
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Upcoming Appointments Card */}
                <div className="card p-6">
                    <DashboardCardHeader
                        icon={CalendarDaysIcon}
                        title="Appointments"
                        count={upcomingAppointments.length}
                        isLoading={appointmentsLoading}
                        gradient="from-blue-500 to-blue-600"
                        badgeColor="bg-blue-50 text-blue-700"
                    />
                    
                    {appointmentsLoading ? (
                        <div className="space-y-3">
                            <SkeletonLoader variant="text" width="75%" height="h-4" />
                            <SkeletonLoader variant="text" width="50%" height="h-4" />
                            <SkeletonLoader variant="text" width="65%" height="h-4" />
                        </div>
                    ) : appointmentsError ? (
                        <ErrorMessage message={appointmentsError} onRetry={fetchDashboardData} />
                    ) : upcomingAppointments.length > 0 && nextAppointment ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-700 font-medium">
                                    Next: <span className="text-primary font-semibold">Dr. {nextAppointment.doctor}</span>
                                </p>
                                {getAppointmentStatusIcon(nextAppointment.status)}
                            </div>
                            <p className="text-sm text-gray-600 flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {formatDate(nextAppointment.date)} at {formatTime(nextAppointment.start_time)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                Reason: {nextAppointment.reason}
                            </p>
                        </div>
                    ) : (
                        <EmptyState
                            icon={CalendarDaysIcon}
                            message="No upcoming appointments"
                            actionLabel="Book an appointment"
                            actionLink="/doctors"
                        />
                    )}
                    
                    <Link to="/appointments" className="mt-5 inline-flex items-center text-sm text-primary hover:text-primary-dark font-medium group">
                        View All Appointments
                        <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Medication Reminders Card */}
                <div className="card p-6">
                    <DashboardCardHeader
                        icon={BellAlertIcon}
                        title="Reminders"
                        count={activeReminders.length}
                        isLoading={remindersLoading}
                        gradient="from-green-500 to-green-600"
                        badgeColor="bg-green-50 text-green-700"
                    />
                    
                    {remindersLoading ? (
                        <div className="space-y-3">
                            <SkeletonLoader variant="text" width="75%" height="h-4" />
                            <SkeletonLoader variant="text" width="50%" height="h-4" />
                            <SkeletonLoader variant="text" width="65%" height="h-4" />
                        </div>
                    ) : remindersError ? (
                        <ErrorMessage message={remindersError} onRetry={fetchDashboardData} />
                    ) : activeReminders.length > 0 && nextReminder ? (
                        <div className="space-y-3">
                            <p className="text-gray-700 font-medium">
                                Next: <span className="text-green-600 font-semibold">{nextReminder.medication_display.name}</span>
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {formatTime(nextReminder.time_of_day)}, {nextReminder.frequency}
                            </p>
                            <p className="text-xs text-gray-500">
                                Dosage: {nextReminder.dosage}
                            </p>
                        </div>
                    ) : (
                        <EmptyState
                            icon={BellAlertIcon}
                            message="No active medication reminders"
                            actionLabel="Set up reminders"
                            actionLink="/medication-reminders"
                        />
                    )}
                    
                    <Link to="/medication-reminders" className="mt-5 inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium group">
                        Manage Reminders
                        <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Recent Vital Signs Card */}
                <div className="card p-6">
                    <DashboardCardHeader
                        icon={HeartIcon}
                        title="Vital Signs"
                        count={recentVitals.length}
                        isLoading={vitalsLoading}
                        gradient="from-red-500 to-red-600"
                        badgeColor="bg-red-50 text-red-700"
                    />
                    
                    {vitalsLoading ? (
                        <div className="space-y-3">
                            <SkeletonLoader variant="text" width="75%" height="h-4" />
                            <SkeletonLoader variant="text" width="50%" height="h-4" />
                            <SkeletonLoader variant="text" width="65%" height="h-4" />
                        </div>
                    ) : vitalsError ? (
                        <ErrorMessage message={vitalsError} onRetry={fetchDashboardData} />
                    ) : recentVitals.length > 0 ? (
                        <div className="space-y-3">
                            {recentVitals.map((vital, index) => (
                                <div key={vital.id} className={`${index > 0 ? 'border-t border-gray-100 pt-3' : ''}`}>
                                    <p className="text-sm text-gray-600 flex items-center mb-1">
                                        <ClockIcon className="h-3 w-3 mr-1" />
                                        {formatDate(vital.date_recorded.split('T')[0])}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {vital.systolic_pressure && vital.diastolic_pressure && (
                                            <div>
                                                <span className="text-gray-500">BP:</span>
                                                <span className="ml-1 font-semibold text-red-600">
                                                    {vital.systolic_pressure}/{vital.diastolic_pressure}
                                                </span>
                                            </div>
                                        )}
                                        {vital.heart_rate && (
                                            <div>
                                                <span className="text-gray-500">HR:</span>
                                                <span className="ml-1 font-semibold text-red-600">
                                                    {vital.heart_rate} bpm
                                                </span>
                                            </div>
                                        )}
                                        {vital.temperature && (
                                            <div>
                                                <span className="text-gray-500">Temp:</span>
                                                <span className="ml-1 font-semibold text-red-600">
                                                    {vital.temperature}°C
                                                </span>
                                            </div>
                                        )}
                                        {vital.weight && (
                                            <div>
                                                <span className="text-gray-500">Weight:</span>
                                                <span className="ml-1 font-semibold text-red-600">
                                                    {vital.weight} kg
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={HeartIcon}
                            message="No vital signs recorded yet"
                            actionLabel="Log vitals"
                            actionLink="/health/vitals"
                        />
                    )}
                    
                    <Link to="/health/vitals" className="mt-5 inline-flex items-center text-sm text-red-600 hover:text-red-700 font-medium group">
                        View All Vitals
                        <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Notifications Overview Card */}
            <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-md">
                            <BellAlertIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                            <p className="text-sm text-gray-600">
                                {notificationsLoading ? (
                                    <LoadingSpinner size="sm" color="primary" />
                                ) : (
                                    <>
                                        You have <span className="font-bold text-yellow-700">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                    <Link 
                        to="/settings/notifications" 
                        className="btn btn-primary text-sm py-2 px-4 whitespace-nowrap"
                    >
                        View All
                    </Link>
                </div>
            </div>

            {/* Health Tracking Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                    <span className="gradient-text">Health Tracking & Logs</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {healthSections.map((section) => (
                        <Link
                            key={section.path}
                            to={section.path}
                            className="card p-6 group hover:scale-[1.02] transition-all duration-200"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                                <section.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors">
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