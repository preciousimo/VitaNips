// src/pages/admin/AdminPharmaciesPage.tsx
import React, { useState, useEffect } from 'react';
import { getAdminPharmacies, updateAdminPharmacy, AdminPharmacy } from '../../api/admin';
import { LoadingSpinner } from '../../components/common';
import { CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminPharmaciesPage: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<AdminPharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<AdminPharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchPharmacies();
  }, []);

  useEffect(() => {
    let filtered = [...pharmacies];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.address.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        p.phone_number.includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => 
        statusFilter === 'active' ? p.is_active : !p.is_active
      );
    }

    setFilteredPharmacies(filtered);
  }, [pharmacies, search, statusFilter]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const data = await getAdminPharmacies();
      setPharmacies(data.results);
    } catch {
      toast.error('Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const filterPharmacies = () => {
    let filtered = [...pharmacies];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.address.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        p.phone_number.includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => 
        statusFilter === 'active' ? p.is_active : !p.is_active
      );
    }

    setFilteredPharmacies(filtered);
  };

  const toggleStatus = async (pharmacy: AdminPharmacy) => {
    try {
      await updateAdminPharmacy(pharmacy.id, { is_active: !pharmacy.is_active });
      toast.success(`Pharmacy ${pharmacy.is_active ? 'deactivated' : 'activated'}`);
      fetchPharmacies();
    } catch {
      toast.error('Failed to update pharmacy');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      filterPharmacies();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pharmacy Management</h1>
        <p className="text-gray-600">Manage partner pharmacies</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, address, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Pharmacies</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Showing {filteredPharmacies.length} of {pharmacies.length} pharmacies
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : filteredPharmacies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No pharmacies found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pharmacy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Features</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPharmacies.map((pharmacy) => (
                  <tr key={pharmacy.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{pharmacy.name}</div>
                      <div className="text-sm text-gray-500">{pharmacy.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{pharmacy.phone_number}</div>
                      <div className="text-sm text-gray-500">{pharmacy.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {pharmacy.is_24_hours && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-1">24/7</span>}
                      {pharmacy.offers_delivery && <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Delivery</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        pharmacy.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pharmacy.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(pharmacy)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-medium ${
                          pharmacy.is_active 
                            ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {pharmacy.is_active ? (
                          <>
                            <XCircleIcon className="h-4 w-4" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
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

export default AdminPharmaciesPage;
