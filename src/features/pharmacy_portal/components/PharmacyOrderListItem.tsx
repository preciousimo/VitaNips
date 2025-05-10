// src/features/pharmacy_portal/components/PharmacyOrderListItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MedicationOrder } from '../../../types/pharmacy';
import { ClockIcon, UserIcon, TruckIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short'});
    } catch { return 'Invalid Date'; }
};

const getStatusClass = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'ready': return 'bg-green-100 text-green-800';
        case 'delivering': return 'bg-purple-100 text-purple-800';
        case 'completed': return 'bg-gray-100 text-gray-500';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

interface PharmacyOrderListItemProps {
    order: MedicationOrder & { patient_name?: string };
}

const PharmacyOrderListItem: React.FC<PharmacyOrderListItemProps> = ({ order }) => {
    return (
        <Link
            to={`/portal/orders/${order.id}`}
            className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-150"
        >
            <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2">
                <div className="flex-1 min-w-[150px]">
                    <p className="font-semibold text-primary">Order #{order.id}</p>
                    <p className="text-xs text-muted flex items-center mt-1">
                        <ClockIcon className="h-3 w-3 mr-1" /> {formatDateTime(order.order_date)}
                    </p>
                </div>

                <div className="flex-1 min-w-[150px]">
                     <p className="text-sm text-gray-700 flex items-center">
                       <UserIcon className="h-4 w-4 mr-1.5 text-gray-500"/> Patient: {order.patient_name || `User ID ${order.user}`}
                    </p>
                     <p className="text-xs text-muted mt-1">Prescription ID: {order.prescription ?? 'N/A'}</p>
                </div>

                 <div className="flex-shrink-0 text-sm flex items-center">
                     {order.is_delivery ? (
                         <><TruckIcon className="h-4 w-4 mr-1.5 text-blue-600"/> Delivery</>
                     ) : (
                          <><BuildingStorefrontIcon className="h-4 w-4 mr-1.5 text-green-600"/> Pickup</>
                      )}
                 </div>

                <div className="flex-shrink-0">
                    <span className={`capitalize px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                        {order.status}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default PharmacyOrderListItem;