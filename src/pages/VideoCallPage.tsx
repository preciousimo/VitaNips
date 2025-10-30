// src/pages/VideoCallPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoCallRoom from '../features/appointments/components/VideoCallRoom';

const VideoCallPage: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();

    const handleCallEnd = () => {
        // Navigate back to appointment details or appointments list
        if (appointmentId) {
            navigate(`/appointments/${appointmentId}`);
        } else {
            navigate('/appointments');
        }
    };

    if (!appointmentId) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <p className="text-xl mb-4">Invalid appointment ID</p>
                    <button
                        onClick={() => navigate('/appointments')}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return <VideoCallRoom appointmentId={parseInt(appointmentId)} onCallEnd={handleCallEnd} />;
};

export default VideoCallPage;