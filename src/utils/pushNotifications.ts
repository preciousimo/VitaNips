// src/utils/pushNotifications.ts
import { messaging, vapidKey } from './firebase'; // Get messaging instance and VAPID key
import { getToken, onMessage } from "firebase/messaging";
import { registerDevice } from '../api/notifications'; // API function

/**
 * Requests permission for notifications and registers the device if granted.
 */
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
            await registerDeviceWithToken(); // Get token and register
            setupForegroundMessageHandler(); // Listen for messages while app is open

        } else {
            console.log('Notification permission denied.');
            // Optionally inform the user how to enable it later in browser settings
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
};

/**
 * Gets the FCM token and sends it to the backend.
 */
const registerDeviceWithToken = async (): Promise<void> => {
     if (!messaging || !vapidKey) return; // Guard again

    try {
        // Check if service worker is ready - important!
        const swRegistration = await navigator.serviceWorker.ready;
        console.log('Service worker ready for token retrieval.');

        const currentToken = await getToken(messaging, {
            vapidKey: vapidKey, // Pass the public VAPID key
            serviceWorkerRegistration: swRegistration // Pass the SW registration
        });

        if (currentToken) {
            console.log('FCM Token:', currentToken);
            // Send the token to your server
            try {
                await registerDevice({ registration_id: currentToken, type: 'web' });
                console.log('Device registered successfully with backend.');
                // Optional: Store registration status locally if needed
            } catch (apiError) {
                 console.error('Failed to send token to backend:', apiError);
                 // Handle API error (e.g., retry logic, user notification)
            }
        } else {
            console.warn('No registration token available. Request permission first or check VAPID key/SW.');
            // This might happen if permission was granted but token generation failed
        }
    } catch (error) {
        console.error('An error occurred while retrieving token:', error);
        // Handle errors like missing VAPID key, SW issues, etc.
    }
};

/**
 * Sets up a listener for foreground messages.
 */
const setupForegroundMessageHandler = (): void => {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);

        // Customize notification display based on payload
        const notificationTitle = payload.notification?.title || "New Notification";
        const notificationOptions: NotificationOptions = {
            body: payload.notification?.body || "",
            icon: payload.notification?.icon || '/logo.png', // Use your app logo
            // You can add more options like 'data' to handle clicks
            data: payload.data // Pass along any data payload from backend
        };

        // Display the notification using the browser's Notification API
        // Note: This only works if the tab is active. Background handled by SW.
        const notification = new Notification(notificationTitle, notificationOptions);

        // Optional: Handle notification click
        notification.onclick = (event) => {
            event.preventDefault(); // Prevent the browser from focusing the Notification's tab
            // Example: Navigate based on data payload
             if (payload.data?.url) {
                 window.open(payload.data.url, '_blank');
             } else if (payload.data?.appointment_id) {
                // Example: Navigate within the app if possible (requires access to router history)
                 console.log("Navigate to appointment:", payload.data.appointment_id);
                // window.location.href = `/appointments/${payload.data.appointment_id}`; // Simple redirect
             }
             notification.close();
        };
    });

    console.log('Foreground message handler set up.');
};