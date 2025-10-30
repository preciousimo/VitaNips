// src/pages/admin/AdminDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminStats, AdminStats } from '../../api/admin';
import { LoadingSpinner } from '../../components/common';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = stats
    ? [
        {
          title: 'Total Users',
          value: stats.users.total,
          icon: UsersIcon,
          color: 'bg-blue-500',
          description: `${stats.users.active} active, ${stats.users.new_this_month} new this month`,
        },
        {
          title: 'Doctors',
          value: stats.doctors.total,
          icon: ShieldCheckIcon,
          color: 'bg-green-500',
          description: `${stats.doctors.verified} verified, ${stats.doctors.pending_verification} pending`,
        },
        {
          title: 'Pharmacies',
          value: stats.pharmacies.total,
          icon: BuildingStorefrontIcon,
          color: 'bg-purple-500',
          description: `${stats.pharmacies.active} active`,
        },
        {
          title: 'Appointments',
          value: stats.appointments.this_month,
          icon: DocumentTextIcon,
          color: 'bg-orange-500',
          description: `${stats.appointments.today} today, ${stats.appointments.total} total`,
        },
      ]
    : [];

  const quickLinks = [
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: UsersIcon,
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      link: '/admin/users',
    },
    {
      title: 'Doctor Verification',
      description: 'Review and verify doctor applications',
      icon: ShieldCheckIcon,
      color: 'bg-green-50 text-green-600 hover:bg-green-100',
      link: '/admin/doctors',
    },
    {
      title: 'Pharmacy Management',
      description: 'Manage pharmacy partners',
      icon: BuildingStorefrontIcon,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      link: '/admin/pharmacies',
    },
    {
      title: 'Content Moderation',
      description: 'Review reports and moderate content',
      icon: BellAlertIcon,
      color: 'bg-red-50 text-red-600 hover:bg-red-100',
      link: '/admin/moderation',
    },
    {
      title: 'System Analytics',
      description: 'View platform statistics and reports',
      icon: ChartBarIcon,
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
      link: '/admin/analytics',
    },
    {
      title: 'Django Admin',
      description: 'Access full Django admin panel',
      icon: ShieldCheckIcon,
      color: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
      link: '/admin/',
      external: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-300">
          Welcome back, {user?.username || 'Administrator'}. Manage your VitaNips platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="col-span-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
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
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {stat.title}
                </h3>
                <p className="text-xs text-gray-600">{stat.description}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Links Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Administration Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            if (link.external) {
              return (
                <a
                  key={index}
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-start space-x-3 p-4 rounded-lg transition-colors ${link.color}`}
                >
                  <Icon className="h-8 w-8 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{link.title}</p>
                    <p className="text-sm opacity-80 mt-1">
                      {link.description}
                    </p>
                  </div>
                </a>
              );
            }
            return (
              <Link
                key={index}
                to={link.link}
                className={`flex items-start space-x-3 p-4 rounded-lg transition-colors ${link.color}`}
              >
                <Icon className="h-8 w-8 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{link.title}</p>
                  <p className="text-sm opacity-80 mt-1">
                    {link.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Background Tasks</span>
              <span className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Running
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• No recent admin actions</p>
            <p className="text-xs text-gray-500 mt-4">
              Activity logs will appear here
            </p>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <BellAlertIcon className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-800">
              Admin Notice
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Some administrative features are still under development. 
              Use the Django admin panel for full system management capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
