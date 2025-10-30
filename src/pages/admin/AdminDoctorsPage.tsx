// src/pages/admin/AdminDoctorsPage.tsx
import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { getAdminDoctors, verifyDoctor, AdminDoctor } from '../../api/admin';
import { LoadingSpinner } from '../../components/common';
import toast from 'react-hot-toast';

const AdminDoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const filters: Parameters<typeof getAdminDoctors>[0] = {};
      
      if (verifiedFilter !== 'all') filters.verified = verifiedFilter === 'verified';
      if (search) filters.search = search;
      
      const data = await getAdminDoctors(filters);
      setDoctors(data.results);
    } catch (error) {
      toast.error('Failed to load doctors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedFilter]);

  const handleVerification = async (doctor: AdminDoctor, verified: boolean) => {
    try {
      await verifyDoctor(doctor.id, verified);
      toast.success(`Doctor ${verified ? 'verified' : 'unverified'} successfully`);
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to update verification status');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Doctor Verification</h1>
        <p className="text-gray-600">Review and verify doctor applications</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Doctors</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDoctors()}
                className="input-field"
              />
              <button onClick={fetchDoctors} className="btn btn-primary px-4">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value as typeof verifiedFilter)}
              className="input-field"
            >
              <option value="all">All Doctors</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending Verification</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No doctors found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialties</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        Dr. {doctor.first_name} {doctor.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{doctor.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {doctor.specialties.map((spec) => (
                          <span key={spec.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {spec.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doctor.years_of_experience} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        doctor.is_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doctor.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {!doctor.is_verified ? (
                        <button
                          onClick={() => handleVerification(doctor, true)}
                          className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Verify
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerification(doctor, false)}
                          className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Unverify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDoctorsPage;
