// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getDatabase, type Database } from "firebase/database";
import { getStorage, type FirebaseStorage } from "firebase/storage";
// Import getAnalytics and isSupported from firebase/analytics
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFZqtK0XWNUAGhjjm9umK3HiRQFtRAz5M",
  authDomain: "autobook-38b5f.firebaseapp.com",
  projectId: "autobook-38b5f",
  storageBucket: "autobook-38b5f.appspot.com", // Corrected storageBucket
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

let analytics: Analytics | null = null; // Initialize as null

// Conditionally initialize Analytics on the client side
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    } else {
      console.log("Firebase Analytics is not supported in this environment.");
    }
  }).catch(error => {
    // It's good practice to catch potential errors from the promise
    console.error("Error checking Firebase Analytics support:", error);
  });
}

export { app, auth, db, database, storage, analytics };
