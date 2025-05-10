// src/pages/DashboardPage.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
const { user } = useAuth();

return (
    <div>
    <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
    <p className="text-lg">Welcome back, {user?.first_name || 'User'}!</p>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-xl font-semibold mb-2 text-primary">Upcoming Appointments</h2>
            <p className="text-muted">You have no upcoming appointments.</p>
        </div>
         <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-xl font-semibold mb-2 text-primary">Medication Reminders</h2>
            <p className="text-muted">No reminders set.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-xl font-semibold mb-2 text-primary">Health Summary</h2>
            <p className="text-muted">Track your health metrics.</p>
        </div>
    </div>
    </div>
);
};

export default DashboardPage;