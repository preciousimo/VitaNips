// src/pages/pharmacy/PharmacyDashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const PharmacyDashboardPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Pharmacy Dashboard</h1>
            <p className="mb-4">Welcome to the Pharmacy Portal.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                    <h2 className="text-xl font-semibold mb-2 text-primary">Incoming Orders</h2>
                    <p className="text-muted">View and manage new prescription orders.</p>
                    <Link to="/portal/orders" className="text-primary hover:underline mt-4 inline-block">View Orders</Link>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                    <h2 className="text-xl font-semibold mb-2 text-primary">Inventory Management</h2>
                    <p className="text-muted">Check and manage your pharmacy inventory.</p>
                    <Link to="/portal/inventory" className="text-primary hover:underline mt-4 inline-block">Manage Inventory</Link>
                </div>
                
            </div>
        </div>
    );
};

export default PharmacyDashboardPage;