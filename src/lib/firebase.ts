// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFZqtK0XWNUAGhjjm9umK3HiRQFtRAz5M",
  authDomain: "autobook-38b5f.firebaseapp.com",
  projectId: "autobook-38b5f",
  storageBucket: "autobook-38b5f.appspot.com", // Corrected common typo
  messagingSenderId: "822286913370",
  appId: "1:822286913370:web:8f81605eda17bd34b82d63",
  measurementId: "G-HR8G865SG3"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let analytics: Analytics | undefined;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    try {
        analytics = getAnalytics(app);
    } catch (e) {
        console.warn("Failed to initialize Analytics, possibly already initialized or not available in this environment.", e);
    }
  }
} else {
  app = getApp();
  auth = getAuth(app); // Get auth from existing app
  if (typeof window !== 'undefined' && app.options.measurementId) {
    try {
        analytics = getAnalytics(app);
    } catch (e) {
        console.warn("Failed to initialize Analytics, possibly already initialized or not available in this environment.", e);
    }
  }
}


export { app, auth, analytics, firebaseConfig };
