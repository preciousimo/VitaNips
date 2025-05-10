// src/pages/pharmacy/PharmacyOrderListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getPharmacyOrders } from '../../api/pharmacy';
import { MedicationOrder } from '../../types/pharmacy';
import PharmacyOrderListItem from '../../features/pharmacy_portal/components/PharmacyOrderListItem';

const ORDER_STATUS_CHOICES = [
    'pending', 'processing', 'ready', 'delivering', 'completed', 'cancelled'
];

const PharmacyOrderListPage: React.FC = () => {
    const [orders, setOrders] = useState<MedicationOrder[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<string>('');

    const loadInitialOrders = useCallback(async (currentStatusFilter: string) => {
        setIsLoading(true);
        setError(null);
        setOrders([]);
        setNextPageUrl(null);
        setTotalCount(0);

        const params: { status?: string } = {};
        if (currentStatusFilter) {
            params.status = currentStatusFilter;
        }

        try {
            const response = await getPharmacyOrders(params);
             if (response && Array.isArray(response.results)) {
                setOrders(response.results);
                setNextPageUrl(response.next);
                setTotalCount(response.count);
             } else {
                console.warn("Invalid order list structure:", response);
                setError("Failed to process orders.");
                setOrders([]);
             }
        } catch (err: any) {
            setError(err.message || "Failed to load orders.");
            console.error(err);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMoreOrders = async () => {
         if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
             const response = await getPharmacyOrders(nextPageUrl);
             if (response && Array.isArray(response.results)) {
                 setOrders(prev => [...prev, ...response.results]);
                 setNextPageUrl(response.next);
             } else {
                 console.warn("Invalid load more order structure:", response);
                 setError("Failed processing more orders.");
                 setNextPageUrl(null);
             }
        } catch (err: any) {
             setError(err.message || "Failed to load more orders.");
             console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        loadInitialOrders(statusFilter);
    }, [loadInitialOrders, statusFilter]);

    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(event.target.value);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Pharmacy Orders</h1>

            <div className="mb-4 bg-white p-3 rounded shadow-sm">
                <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Filter by Status:</label>
                <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={handleFilterChange}
                    className="input-field py-1 w-auto"
                    disabled={isLoading}
                >
                    <option value="">All Statuses</option>
                    {ORDER_STATUS_CHOICES.map(status => (
                        <option key={status} value={status} className="capitalize">{status}</option>
                    ))}
                </select>
            </div>

            <div>
                {isLoading ? (
                    <p className="text-muted text-center py-10">Loading orders...</p>
                ) : error && orders.length === 0 ? (
                    <p className="text-red-600 text-center py-10">{error}</p>
                ) : (
                    <>
                         {error && orders.length > 0 && <p className="text-red-600 text-center py-2">{error}</p>}
                         {totalCount > 0 && <p className="text-sm text-muted mb-2">Showing {orders.length} of {totalCount} orders.</p>}

                        {orders.length > 0 ? (
                            <div className="space-y-3">
                                {orders.map(order => (
                                    <PharmacyOrderListItem key={order.id} order={order} />
                                ))}
                            </div>
                        ) : (
                             !isLoading && !error && (
                                <p className="text-muted text-center py-10">No orders found matching the criteria.</p>
                             )
                         )}

                        {nextPageUrl && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={loadMoreOrders}
                                    disabled={isLoadingMore}
                                    className="btn-primary px-6 py-2 disabled:opacity-50"
                                >
                                    {isLoadingMore ? 'Loading...' : 'Load More Orders'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PharmacyOrderListPage;