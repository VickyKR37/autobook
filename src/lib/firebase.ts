
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

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFZqtK0XWNUAGhjjm9umK3HiRQFtRAz5M",
  authDomain: "autobook-38b5f.firebaseapp.com",
  projectId: "autobook-38b5f",
  storageBucket: "autobook-38b5f.appspot.com", // Corrected storageBucket URL
  messagingSenderId: "822286913370",
  appId: "1:822286913370:web:8f81605eda17bd34b82d63",
  measurementId: "G-HR8G865SG3"
};


// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const database: Database = getDatabase(app);
const storage: FirebaseStorage = getStorage(app);
const functions: Functions = getFunctions(app); // Initialize Firebase Functions

// Initialize services that are typically client-side or depend on browser environment
let analytics: Analytics | null = null;
let performance: FirebasePerformance | null = null;
let messaging: Messaging | null = null;
let remoteConfig: RemoteConfig | null = null;

if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      try {
        performance = getPerformance(app);
      } catch (err) {
        console.log('Failed to initialize Firebase Performance', err);
      }
      try {
        messaging = getMessaging(app);
      } catch (err) {
        console.log('Failed to initialize Firebase Messaging', err);
      }
      try {
        remoteConfig = getRemoteConfig(app);
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

export { app, auth, db, database, storage, analytics, functions, performance, messaging, remoteConfig };
