// src/pages/doctor/DoctorDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClipboardDocumentListIcon, 
  UserGroupIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { getDoctorEligibleAppointments } from '../../api/doctorPortal';
import { useAuth } from '../../contexts/AuthContext';

const DoctorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDoctorEligibleAppointments();
        setAppointmentCount(response.results?.length || 0);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      title: 'Pending Prescriptions',
      value: loading ? '...' : appointmentCount,
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      link: '/doctor/prescriptions',
    },
    {
      title: 'Today\'s Appointments',
      value: '-',
      icon: CalendarIcon,
      color: 'bg-green-500',
      link: '/appointments',
    },
    {
      title: 'Total Patients',
      value: '-',
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      link: '#',
    },
    {
      title: 'This Month',
      value: '-',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      link: '#',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, Dr. {user?.last_name || user?.username}
        </h1>
        <p className="text-primary-100">
          Here's your practice overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                {stat.title}
              </h3>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/doctor/prescriptions"
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">Write Prescription</p>
              <p className="text-sm text-gray-600">
                Manage patient prescriptions
              </p>
            </div>
          </Link>

          <Link
            to="/appointments"
            className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <CalendarIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-semibold text-gray-900">View Appointments</p>
              <p className="text-sm text-gray-600">
                Check your schedule
              </p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <UserGroupIcon className="h-8 w-8 text-purple-600" />
            <div>
              <p className="font-semibold text-gray-900">My Profile</p>
              <p className="text-sm text-gray-600">
                Update your information
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Appointments Requiring Prescriptions
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : appointmentCount > 0 ? (
          <div className="space-y-2">
            <p className="text-gray-600">
              You have <strong>{appointmentCount}</strong> completed appointment(s) 
              that need prescriptions.
            </p>
            <Link
              to="/doctor/prescriptions"
              className="inline-block text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </Link>
          </div>
        ) : (
          <p className="text-gray-600">
            No pending prescriptions at the moment.
          </p>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
