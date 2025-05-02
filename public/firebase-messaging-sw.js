// public/firebase-messaging-sw.js

// Import the Firebase app and messaging scripts (adjust paths if needed, but usually these work)
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js'); // Use compat version for SW
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// --- IMPORTANT ---
// You MUST paste your firebaseConfig *again* here.
// Environment variables from `.env` are NOT available in the service worker directly.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",             // PASTE ACTUAL VALUE HERE
    authDomain: "YOUR_AUTH_DOMAIN",       // PASTE ACTUAL VALUE HERE
    projectId: "YOUR_PROJECT_ID",         // PASTE ACTUAL VALUE HERE
    storageBucket: "YOUR_STORAGE_BUCKET", // PASTE ACTUAL VALUE HERE
    messagingSenderId: "YOUR_SENDER_ID",// PASTE ACTUAL VALUE HERE
    appId: "YOUR_APP_ID"             // PASTE ACTUAL VALUE HERE
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Service Worker: Firebase App Initialized");

    // Retrieve an instance of Firebase Messaging so that it can handle background messages.
    const messaging = firebase.messaging();
    console.log("Service Worker: Firebase Messaging Initialized");

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);

        // Customize notification here
        const notificationTitle = payload.notification?.title || 'VitaNips Notification';
        const notificationOptions = {
            body: payload.notification?.body || 'You have a new update.',
            icon: payload.notification?.icon || '/logo192.png', // Path relative to origin
            // Add data for click handling
            data: payload.data || {} // Pass through any data sent from backend
        };

        // Show notification using Service Worker's registration
        self.registration.showNotification(notificationTitle, notificationOptions);
    });

    // Optional: Handle notification click in Service Worker
    self.addEventListener('notificationclick', (event) => {
        console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification.data);

        event.notification.close(); // Close the notification

        // Example: Open a specific URL based on data payload
        const urlToOpen = event.notification.data?.url; // Check if backend sent a URL

        if (urlToOpen) {
            // eslint-disable-next-line no-undef
            event.waitUntil(clients.openWindow(urlToOpen));
        } else {
            // Example: Focus existing window or open default page
            // eslint-disable-next-line no-undef
             event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
                 // Check if there is already a window/tab open with the target URL
                 const existingClient = windowClients.find(client => client.url === '/' /* or specific app URL */ && 'focus' in client);
                 if (existingClient) {
                     return existingClient.focus(); // Focus if found
                 } else if (clients.openWindow) {
                     return clients.openWindow('/'); // Open root URL if not found
                 }
             }));
        }
    });

} catch (error) {
    console.error("Error initializing Firebase in Service Worker:", error);
}