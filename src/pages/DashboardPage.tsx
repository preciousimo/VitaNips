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
    ExclamationTriangleIcon,
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
import SkeletonLoader from '../components/common/SkeletonLoader';

// Enhanced Loading Spinner with better styling
const LoadingSpinner: React.FC<{ size?: string; className?: string }> = ({ 
    size = "h-6 w-6", 
    className = "text-primary" 
}) => (
    <svg className={`animate-spin ${size} ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// Enhanced Error Display
const ErrorDisplay: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="flex items-center justify-between text-sm text-red-600 bg-red-50 p-3 rounded-lg">
        <div className="flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            <span>{message}</span>
        </div>
        {onRetry && (
            <button 
                onClick={onRetry}
                className="text-red-700 hover:text-red-800 font-medium text-xs underline"
            >
                Retry
            </button>
        )}
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
        className={`block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border-l-4 ${color}`}
    >
        <div className="flex items-center mb-2">
            <Icon className="h-5 w-5 mr-2" />
            <span className="font-semibold text-gray-800">{label}</span>
        </div>
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
            color: 'border-blue-500'
        },
        { 
            name: t('healthSections.symptoms.name', 'Log Symptoms'), 
            path: '/health/symptoms', 
            icon: ShieldExclamationIcon, 
            description: t('healthSections.symptoms.description', "Record how you're feeling."),
            color: 'border-orange-500'
        },
        { 
            name: t('healthSections.food.name', 'Food Journal'), 
            path: '/health/food', 
            icon: ShoppingBagIcon, 
            description: t('healthSections.food.description', "Keep a journal of your meals."),
            color: 'border-green-500'
        },
        { 
            name: t('healthSections.exercise.name', 'Exercise Log'), 
            path: '/health/exercise', 
            icon: FireIcon, 
            description: t('healthSections.exercise.description', "Monitor your physical activity."),
            color: 'border-red-500'
        },
        { 
            name: t('healthSections.sleep.name', 'Sleep Log'), 
            path: '/health/sleep', 
            icon: MoonIcon, 
            description: t('healthSections.sleep.description', "Track your sleep patterns."),
            color: 'border-purple-500'
        },
    ];

    const quickActions = [
        {
            icon: PlusIcon,
            label: 'Book Appointment',
            href: '/doctors',
            color: 'border-blue-500',
            description: 'Schedule with a doctor'
        },
        {
            icon: ShoppingBagIcon,
            label: 'Find Pharmacy',
            href: '/pharmacies',
            color: 'border-green-500',
            description: 'Locate nearby pharmacies'
        },
        {
            icon: ShieldExclamationIcon,
            label: 'Emergency Contacts',
            href: '/emergency-contacts',
            color: 'border-red-500',
            description: 'Manage emergency contacts'
        },
        {
            icon: BellAlertIcon,
            label: 'Set Reminders',
            href: '/medication-reminders',
            color: 'border-yellow-500',
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
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold mb-2">
                    {t('dashboardTitle', 'Welcome back')}, {user?.first_name || user?.username || 'User'}!
                </h1>
                <p className="text-lg opacity-90">
                    {t('welcomeMessage', 'Here\'s what\'s happening with your health today.')}
                </p>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <QuickActionButton key={action.label} {...action} />
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Upcoming Appointments Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-primary flex items-center">
                            <CalendarDaysIcon className="h-6 w-6 mr-2" />
                            Upcoming Appointments
                        </h2>
                        <span className="text-sm font-bold text-primary bg-primary-light px-3 py-1 rounded-full">
                            {appointmentsLoading ? (
                                <LoadingSpinner size="h-4 w-4" className="text-primary" />
                            ) : (
                                upcomingAppointments.length
                            )}
                        </span>
                    </div>
                    
                    {appointmentsLoading ? (
                        <div className="space-y-3">
                            <SkeletonLoader variant="text" width="75%" height="h-4" />
                            <SkeletonLoader variant="text" width="50%" height="h-4" />
                            <SkeletonLoader variant="text" width="65%" height="h-4" />
                        </div>
                    ) : appointmentsError ? (
                        <ErrorDisplay message={appointmentsError} onRetry={fetchDashboardData} />
                    ) : upcomingAppointments.length > 0 && nextAppointment ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-700 font-medium">
                                    Next: <span className="text-primary">Dr. {nextAppointment.doctor}</span>
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
                        <div className="text-center py-4">
                            <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No upcoming appointments</p>
                            <Link to="/doctors" className="text-primary hover:text-primary-dark text-sm font-medium mt-2 inline-block">
                                Book an appointment
                            </Link>
                        </div>
                    )}
                    
                    <Link to="/appointments" className="mt-4 inline-flex items-center text-sm text-primary hover:text-primary-dark font-medium group">
                        View All Appointments
                        <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Medication Reminders Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-green-600 flex items-center">
                            <BellAlertIcon className="h-6 w-6 mr-2" />
                            Active Reminders
                        </h2>
                        <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            {remindersLoading ? (
                                <LoadingSpinner size="h-4 w-4" className="text-green-600" />
                            ) : (
                                activeReminders.length
                            )}
                        </span>
                    </div>
                    
                    {remindersLoading ? (
                        <div className="space-y-3">
                            <SkeletonLoader variant="text" width="75%" height="h-4" />
                            <SkeletonLoader variant="text" width="50%" height="h-4" />
                            <SkeletonLoader variant="text" width="65%" height="h-4" />
                        </div>
                    ) : remindersError ? (
                        <ErrorDisplay message={remindersError} onRetry={fetchDashboardData} />
                    ) : activeReminders.length > 0 && nextReminder ? (
                        <div className="space-y-3">
                            <p className="text-gray-700 font-medium">
                                Next: <span className="text-green-600">{nextReminder.medication_display.name}</span>
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
                        <div className="text-center py-4">
                            <BellAlertIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No active medication reminders</p>
                            <Link to="/medication-reminders" className="text-green-600 hover:text-green-700 text-sm font-medium mt-2 inline-block">
                                Set up reminders
                            </Link>
                        </div>
                    )}
                    
                    <Link to="/medication-reminders" className="mt-4 inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium group">
                        Manage Reminders
                        <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Recent Vital Signs Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-blue-600 flex items-center">
                            <HeartIcon className="h-6 w-6 mr-2" />
                            Recent Vital Signs
                        </h2>
                        <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            {vitalsLoading ? (
                                <LoadingSpinner size="h-4 w-4" className="text-blue-600" />
                            ) : (
                                recentVitals.length
                            )}
                        </span>
                    </div>
                    
                    {vitalsLoading ? (
                        <div className="space-y-3">
                            <SkeletonLoader variant="text" width="75%" height="h-4" />
                            <SkeletonLoader variant="text" width="50%" height="h-4" />
                            <SkeletonLoader variant="text" width="65%" height="h-4" />
                        </div>
                    ) : vitalsError ? (
                        <ErrorDisplay message={vitalsError} onRetry={fetchDashboardData} />
                    ) : recentVitals.length > 0 ? (
                        <div className="space-y-3">
                            {recentVitals.map((vital, index) => (
                                <div key={vital.id} className={`${index > 0 ? 'border-t pt-2' : ''}`}>
                                    <p className="text-sm text-gray-600 flex items-center mb-1">
                                        <ClockIcon className="h-3 w-3 mr-1" />
                                        {formatDate(vital.date_recorded.split('T')[0])}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {vital.systolic_pressure && vital.diastolic_pressure && (
                                            <div>
                                                <span className="text-gray-500">BP:</span>
                                                <span className="ml-1 font-medium text-blue-600">
                                                    {vital.systolic_pressure}/{vital.diastolic_pressure}
                                                </span>
                                            </div>
                                        )}
                                        {vital.heart_rate && (
                                            <div>
                                                <span className="text-gray-500">HR:</span>
                                                <span className="ml-1 font-medium text-blue-600">
                                                    {vital.heart_rate} bpm
                                                </span>
                                            </div>
                                        )}
                                        {vital.temperature && (
                                            <div>
                                                <span className="text-gray-500">Temp:</span>
                                                <span className="ml-1 font-medium text-blue-600">
                                                    {vital.temperature}°C
                                                </span>
                                            </div>
                                        )}
                                        {vital.weight && (
                                            <div>
                                                <span className="text-gray-500">Weight:</span>
                                                <span className="ml-1 font-medium text-blue-600">
                                                    {vital.weight} kg
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No vital signs recorded yet</p>
                            <Link to="/health/vitals" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
                                Log vitals
                            </Link>
                        </div>
                    )}
                    
                    <Link to="/health/vitals" className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium group">
                        View All Vitals
                        <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Notifications Overview Card */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="bg-yellow-500 text-white p-3 rounded-full mr-4">
                            <BellAlertIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                            <p className="text-sm text-gray-600">
                                {notificationsLoading ? (
                                    <LoadingSpinner size="h-4 w-4" className="text-yellow-600" />
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
                        className="bg-white text-yellow-600 hover:bg-yellow-600 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow"
                    >
                        View All
                    </Link>
                </div>
            </div>

            {/* Health Tracking Section */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-5">Health Tracking & Logs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {healthSections.map((section) => (
                        <Link
                            key={section.path}
                            to={section.path}
                            className={`block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-300 ease-in-out group transform hover:-translate-y-1 border-l-4 ${section.color}`}
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