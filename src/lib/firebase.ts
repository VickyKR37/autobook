
// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getDatabase, type Database } from "firebase/database";
import { getStorage, type FirebaseStorage } from "firebase/storage";
// Import getAnalytics and isSupported from firebase/analytics
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
// Import additional Firebase services
import { getMessaging, type Messaging } from "firebase/messaging";
import { getRemoteConfig, type RemoteConfig } from "firebase/remote-config";
import { getPerformance, type FirebasePerformance } from "firebase/performance";
import { getFunctions, type Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const database: Database = getDatabase(app);
const storage: FirebaseStorage = getStorage(app); // Ensure Firebase Storage is enabled in the Firebase console for your project.
const functions: Functions = getFunctions(app);

// Initialize services that are typically client-side or depend on browser environment
let analytics: Analytics | null = null;
let performanceSvc: FirebasePerformance | null = null; // Renamed to avoid conflict with window.performance
let messagingSvc: Messaging | null = null; // Renamed to avoid potential conflicts
let remoteConfigSvc: RemoteConfig | null = null; // Renamed

if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      try {
        performanceSvc = getPerformance(app);
      } catch (err) {
        console.log('Failed to initialize Firebase Performance', err);
      }
      try {
        messagingSvc = getMessaging(app);
      } catch (err) {
        console.log('Failed to initialize Firebase Messaging', err);
      }
      try {
        remoteConfigSvc = getRemoteConfig(app);
        // You might want to set default Remote Config values and activate it here
        // For example:
        // remoteConfig.defaultConfig = { "welcome_message": "Hello" };
        // fetchAndActivate(remoteConfig);
      } catch (err) {
        console.log('Failed to initialize Firebase Remote Config', err);
      }
    } else {
      console.log("Firebase Analytics, Performance, Messaging, or Remote Config is not supported in this environment.");
    }
  }).catch(error => {
    console.error("Error checking Firebase service support:", error);
  });
}

export { app, auth, db, database, storage, analytics, functions, performanceSvc as performance, messagingSvc as messaging, remoteConfigSvc as remoteConfig };
