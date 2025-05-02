// src/utils/firebase.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

// Load config from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;
let messagingInstance: Messaging | null = null;

try {
    firebaseApp = initializeApp(firebaseConfig);
    // Check if messaging is supported before initializing
    if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
         // Check compatibility? FCM needs Service Worker support etc.
         // Consider adding import { isSupported } from "firebase/messaging";
         // if (await isSupported()) { messagingInstance = getMessaging(firebaseApp); }
        messagingInstance = getMessaging(firebaseApp);
    }
} catch (error) {
    console.error("Error initializing Firebase:", error);
    // Handle initialization error appropriately
}

export const app = firebaseApp;
export const messaging = messagingInstance;

// Export VAPID key for use in getToken
export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;