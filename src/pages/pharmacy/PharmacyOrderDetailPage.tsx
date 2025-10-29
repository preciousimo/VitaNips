// src/pages/pharmacy/PharmacyOrderDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getPharmacyOrderDetail, updatePharmacyOrder } from '../../api/pharmacy';
import { MedicationOrder, MedicationOrderUpdatePayload } from '../../types/pharmacy';
import axios from 'axios';

const PharmacyOrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();

    const [order, setOrder] = useState<MedicationOrder | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const fetchOrder = useCallback(async () => {
        if (!orderId) {
            setError("Order ID not found.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        setUpdateError(null);
        try {
            const fetchedOrder = await getPharmacyOrderDetail(parseInt(orderId, 10));
            setOrder(fetchedOrder);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load order details.";
            setError(errorMessage);
            console.error(err);
            setOrder(null);
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleStatusUpdate = async (newStatus: MedicationOrder['status']) => {
        if (!order) return;
        setIsUpdating(true);
        setUpdateError(null);
        const payload: Partial<MedicationOrderUpdatePayload> = { status: newStatus };
        try {
            const updatedOrder = await updatePharmacyOrder(order.id, payload);
            setOrder(updatedOrder);
        } catch (err) {
            let message = "Failed to update order status. Please try again.";
            if (axios.isAxiosError(err) && err.response?.data) {
                const backendError = err.response.data;
                if (backendError.detail) {
                    message = backendError.detail;
                } else if (backendError.status && Array.isArray(backendError.status) && backendError.status.length > 0) {
                    message = `Status: ${backendError.status.join(', ')}`;
                } else if (typeof backendError === 'string') {
                    message = backendError;
                } else {
                    const errorMessages = Object.values(backendError).flat();
                    if (errorMessages.length > 0) {
                        message = errorMessages.join(' ');
                    }
                }
            } else if (err instanceof Error && err.message) {
                message = err.message;
            }
            setUpdateError(message);
            console.error("Order Update Error:", axios.isAxiosError(err) ? err.response?.data || err : err);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return <p className="text-muted text-center py-10">Loading order details...</p>;
    }

    if (error) {
        return <p className="text-red-600 text-center py-10">{error}</p>;
    }

    if (!order) {
        return <p className="text-muted text-center py-10">Order not found.</p>;
    }

    return (
        <div>
            <Link to="/portal/orders" className="inline-flex items-center text-primary hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Orders
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Details #{order.id}</h1>

            {updateError && <p className="text-red-500 bg-red-50 p-2 rounded mb-3 text-sm">{updateError}</p>}

            <div className="bg-white p-6 rounded shadow space-y-4">
                {/* Basic Info */}
                <div>
                    <h3 className="font-semibold">Status: <span className={`capitalize px-2 py-0.5 rounded text-xs font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{order.status}</span></h3>
                    <p>Order Date: {new Date(order.order_date).toLocaleString()}</p>
                    <p>Patient: {order.user}</p>
                    <p>Prescription ID: {order.prescription ?? 'N/A'}</p>
                    <p>Delivery: {order.is_delivery ? 'Yes' : 'No'}</p>
                    {order.is_delivery && <p>Address: {order.delivery_address ?? 'N/A'}</p>}
                </div>

                {/* Items */}
                <div>
                    <h3 className="font-semibold border-t pt-3 mt-3">Items</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                        {order.items.map(item => (
                            <li key={item.id}>
                                {item.medication_name} ({item.dosage}) - Qty: {item.quantity}
                                {item.price_per_unit ? ` @ $${item.price_per_unit}` : ' (Price Pending)'}
                            </li>
                        ))}
                    </ul>
                    <p className='mt-2 font-medium'>Total: {order.total_amount ? `$${order.total_amount}` : 'Pending Calculation'}</p>
                </div>

                <div>
                    <h3 className="font-semibold border-t pt-3 mt-3">Notes</h3>
                    <p className='text-sm'>{order.notes || <span className='italic text-muted'>No notes</span>}</p>
                </div>

                <div className='border-t pt-4 mt-4'>
                    <h3 className="font-semibold mb-2">Update Status</h3>
                    <div className='flex gap-2'>
                        {order.status === 'pending' && (
                            <button onClick={() => handleStatusUpdate('processing')} disabled={isUpdating} className='btn-primary py-1 px-3 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50'>Mark as Processing</button>
                        )}
                        {order.status === 'processing' && (
                            <button onClick={() => handleStatusUpdate('ready')} disabled={isUpdating} className='btn-primary py-1 px-3 text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50'>Mark as Ready</button>
                        )}
                        {(order.status === 'pending' || order.status === 'processing') && (
                            <button onClick={() => handleStatusUpdate('cancelled')} disabled={isUpdating} className='px-3 py-1 border border-red-500 text-red-600 rounded text-sm hover:bg-red-50 disabled:opacity-50'>Cancel Order</button>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default PharmacyOrderDetailPage;