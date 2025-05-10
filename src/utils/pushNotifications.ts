// src/utils/pushNotifications.ts
import { messaging, vapidKey } from './firebase';
import { getToken, onMessage } from "firebase/messaging";
import { registerDevice } from '../api/notifications';


export const initializePushNotifications = async (): Promise<void> => {
    if (!messaging || !vapidKey) {
        console.warn('Firebase Messaging or VAPID key not available. Push notifications disabled.');
        return;
    }

    console.log('Requesting notification permission...');
    try {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('Notification permission granted.');
            await registerDeviceWithToken();
            setupForegroundMessageHandler();

        } else {
            console.log('Notification permission denied.');
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
};


const registerDeviceWithToken = async (): Promise<void> => {
     if (!messaging || !vapidKey) return;

    try {
        const swRegistration = await navigator.serviceWorker.ready;
        console.log('Service worker ready for token retrieval.');

        const currentToken = await getToken(messaging, {
            serviceWorkerRegistration: swRegistration
        });

        if (currentToken) {
            console.log('FCM Token:', currentToken);
            try {
                await registerDevice({ registration_id: currentToken, type: 'web' });
                console.log('Device registered successfully with backend.');
            } catch (apiError) {
                 console.error('Failed to send token to backend:', apiError);
            }
        } else {
            console.warn('No registration token available. Request permission first or check VAPID key/SW.');
        }
    } catch (error) {
        console.error('An error occurred while retrieving token:', error);
    }
};

const setupForegroundMessageHandler = (): void => {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);

        const notificationTitle = payload.notification?.title || "New Notification";
        const notificationOptions: NotificationOptions = {
            body: payload.notification?.body || "",
            icon: payload.notification?.icon || '/logo.png',
            data: payload.data
        };

        const notification = new Notification(notificationTitle, notificationOptions);

        notification.onclick = (event) => {
            event.preventDefault();
             if (payload.data?.url) {
                 window.open(payload.data.url, '_blank');
             } else if (payload.data?.appointment_id) {
                 console.log("Navigate to appointment:", payload.data.appointment_id);
             }
             notification.close();
        };
    });

    console.log('Foreground message handler set up.');
};