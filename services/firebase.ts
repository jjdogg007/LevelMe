
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7XxATDBNgJMqBLUPMjya_HXcCgG5z_pI",
  authDomain: "leveling-57414.firebaseapp.com",
  projectId: "leveling-57414",
  storageBucket: "leveling-57414.firebasestorage.app",
  messagingSenderId: "46098440880",
  appId: "1:46098440880:web:a6f3abc2569873cc289175",
  measurementId: "G-8JB33VXE1Q"
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore | null = null;
let analytics: Analytics | undefined;

try {
    // Prevent double initialization in hot-reload environments
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }
    
    // Try to Initialize Firestore
    try {
        db = getFirestore(app);
        console.log("System: Database Uplink Established.");
    } catch (dbError) {
        // This specific error happens if versions mismatch or service is down.
        // We catch it here so the app treats it as "Offline Mode" rather than a crash.
        console.warn("System: Database Uplink Failed. Switching to Local Storage Mode.");
        db = null;
    }
    
    // Initialize Analytics only in browser environment
    if (typeof window !== 'undefined') {
        try {
            analytics = getAnalytics(app);
        } catch (e) {
            // Analytics failures are non-critical
        }
    }
} catch (e) {
    console.warn("System: Firebase Unavailable. Running in Local Mode.");
}

export { db, analytics };

// Helper to check if Firebase is configured and connected
export const isFirebaseConfigured = () => !!db;
