
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
    
    // Initialize Firestore
    db = getFirestore(app);
    console.log("System: Database Uplink Established.");
    
    // Initialize Analytics only in browser environment
    if (typeof window !== 'undefined') {
        analytics = getAnalytics(app);
    }
} catch (e) {
    console.error("CRITICAL ERROR: Firebase Connection Failed.", e);
    console.warn("Ensure Firestore is enabled in the Firebase Console and 'firebase' versions match in index.html");
}

export { db, analytics };

// Helper to check if Firebase is configured
export const isFirebaseConfigured = () => !!db;
