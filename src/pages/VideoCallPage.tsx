// src/pages/VideoCallPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTwilioToken, TwilioTokenResponse } from '../api/appointments';
import VideoCallUI from '../features/telehealth/components/VideoCallUI';
// import LoadingSpinner from '../../components/common/LoadingSpinner';
// import ErrorMessage from '../../components/common/ErrorMessage';

const VideoCallPage: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const [tokenInfo, setTokenInfo] = useState<TwilioTokenResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!appointmentId) {
            setError("Appointment ID is missing.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        getTwilioToken(parseInt(appointmentId, 10))
            .then(data => {
                setTokenInfo(data);
            })
            .catch((err: any) => {
                setError(err.message || "Failed to get video access token.");
                console.error(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [appointmentId]);

    const handleDisconnect = () => {
        console.log("Video call disconnected/ended.");
        // Navigate back to appointment list or detail page after disconnect
        navigate('/appointments'); // Or maybe back to appointment detail
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><p>Loading Video Call...</p>{/* <LoadingSpinner /> */}</div>;
    }

    if (error) {
        return (
             <div className="flex flex-col justify-center items-center h-screen p-4">
                 <p className="text-red-600 text-center mb-4">Error: {error}</p>
                 <button onClick={() => navigate('/appointments')} className='btn-primary'>Go Back</button>
            </div>
        );
    }

    if (!tokenInfo) {
         return <div className="flex justify-center items-center h-screen"><p>Could not initialize video call.</p></div>; // Should be caught by error state generally
    }


    return (
        // Render the Video UI component, passing token and room name
        <VideoCallUI
            token={tokenInfo.token}
            roomName={tokenInfo.roomName}
            onDisconnect={handleDisconnect}
        />
    );
};

export default VideoCallPage;