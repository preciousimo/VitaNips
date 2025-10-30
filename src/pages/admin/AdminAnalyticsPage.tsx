// src/pages/admin/AdminAnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import { getAdminAnalytics, AdminAnalytics } from '../../api/admin';
import { LoadingSpinner } from '../../components/common';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAdminAnalytics();
        setAnalytics(data);
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
        <p className="text-gray-600">View detailed system statistics and trends</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">User Growth (Last 12 Months)</h2>
            <div className="space-y-2">
              {analytics?.user_growth.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <span className="w-24 text-sm text-gray-600">{item.month}</span>
                  <div className="flex-1 bg-gray-200 rounded h-8 relative">
                    <div
                      className="bg-primary-500 h-8 rounded flex items-center justify-end pr-2 text-white text-sm font-semibold"
                      style={{ width: `${Math.max((item.count / 10) * 100, 5)}%` }}
                    >
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Appointments by Status</h2>
              <div className="space-y-3">
                {analytics?.appointments_by_status.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-600 capitalize">{item.status}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Top Specialties</h2>
              <div className="space-y-3">
                {analytics?.top_specialties.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-600">{item.specialties__name || 'General'}</span>
                    <span className="font-semibold">{item.count} doctors</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ChartBarIcon className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">Analytics Notice</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Advanced analytics with charts and detailed reports are coming soon.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
