// src/pages/pharmacy/PharmacyDashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const PharmacyDashboardPage: React.FC = () => {
    // TODO: Fetch summary data (e.g., count of new orders)

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Pharmacy Dashboard</h1>
            <p className="mb-4">Welcome to the Pharmacy Portal.</p>

            {/* Example Widgets/Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                    <h2 className="text-xl font-semibold mb-2 text-primary">Incoming Orders</h2>
                    <p className="text-muted">View and manage new prescription orders.</p>
                    {/* TODO: Display count of new orders */}
                    <Link to="/portal/orders" className="text-primary hover:underline mt-4 inline-block">View Orders</Link>
                </div>
                {/* Add more widgets (e.g., Inventory Management link, Profile link) */}
            </div>
        </div>
    );
};

export default PharmacyDashboardPage;