// src/features/emergency/components/SOSButton.tsx
import React, { useState } from 'react';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { triggerSOS } from '../../../api/emergency';
import toast from 'react-hot-toast';

interface SOSButtonProps {
}

const SOSButton: React.FC<SOSButtonProps> = () => {
    const [isSending, setIsSending] = useState(false);

    const handleSOSClick = () => {
        if (!window.confirm(
            "ARE YOU SURE?\n\nThis will immediately attempt to notify your emergency contacts with your current location.\n\nUse only in a genuine emergency."
        )) {
            return;
        }

        setIsSending(true);
        toast.loading('Getting location and sending SOS...', { id: 'sos-toast' });

        if (!navigator.geolocation) {
             toast.error('Geolocation is not supported by your browser.', { id: 'sos-toast' });
             setIsSending(false);
             return;
         }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log("SOS Location:", latitude, longitude);

                try {
                    const response = await triggerSOS({
                        latitude,
                        longitude,
                    });
                    toast.success(response.status || 'SOS Alert Sent!', { id: 'sos-toast', duration: 5000 });
                } catch (error: any) {
                     console.error("SOS API Error:", error);
                     toast.error(`SOS Failed: ${error.message || 'Could not contact server.'}`, { id: 'sos-toast' });
                } finally {
                    setIsSending(false);
                }
            },
            (geoError) => {
                console.error("SOS Geolocation Error:", geoError);
                let errorMsg = 'Could not get location.';
                switch(geoError.code) {
                    case geoError.PERMISSION_DENIED:
                        errorMsg = "Location permission denied."; break;
                    case geoError.POSITION_UNAVAILABLE:
                        errorMsg = "Location information is unavailable."; break;
                    case geoError.TIMEOUT:
                         errorMsg = "Location request timed out."; break;
                }
                toast.error(`SOS Failed: ${errorMsg}`, { id: 'sos-toast' });
                setIsSending(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };


    return (
        <button
            onClick={handleSOSClick}
            disabled={isSending}
            className={`fixed bottom-5 right-5 z-50 p-4 rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-red-300 ${
                isSending
                 ? 'bg-yellow-500 cursor-wait'
                 : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            aria-label="Send SOS Alert"
            title="Send SOS Alert to Emergency Contacts"
        >
            <ShieldExclamationIcon className={`h-8 w-8 ${isSending ? 'animate-pulse text-black': 'text-white'}`} />
            <span className="ml-2 font-bold hidden sm:inline">SOS</span>
        </button>
    );
};

export default SOSButton;