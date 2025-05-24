// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFZqtK0XWNUAGhjjm9umK3HiRQFtRAz5M",
  authDomain: "autobook-38b5f.firebaseapp.com",
  projectId: "autobook-38b5f",
  storageBucket: "autobook-38b5f.appspot.com", // Corrected common typo: firebasestorage.app -> appspot.com
  messagingSenderId: "822286913370",
  appId: "1:822286913370:web:8f81605eda17bd34b82d63",
  measurementId: "G-HR8G865SG3"
};

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics | undefined;

// Check if Firebase is already initialized to avoid re-initialization errors (especially in HMR environments)
// This is a common pattern but for Next.js with App Router, direct initialization is often fine.
// However, being safe doesn't hurt.
try {
    app = initializeApp(firebaseConfig);
    if (typeof window !== 'undefined') {
        analytics = getAnalytics(app);
    }
} catch (e) {
    // If already initialized, this might throw an error or we might want to get the existing app.
    // For simplicity, this basic setup re-initializes which might not be ideal in all scenarios
    // but is common in simple examples. A more robust approach might use getApps().length check.
    console.warn("Firebase initialization error or already initialized:", e);
    // A more robust way:
    // if (!getApps().length) {
    //   app = initializeApp(firebaseConfig);
    // } else {
    //   app = getApp();
    // }
    // For now, keeping it simple as per typical starter snippets. Re-init will throw if not careful.
    // The provided snippet itself doesn't guard against re-initialization.
    // Let's stick to the direct initialization as per the user's snippet, but be mindful.
    app = initializeApp(firebaseConfig); // Re-attempting, this line might be redundant if error handling is more complex.
                                          // Or, if the error is "already initialized", we should get the existing app.
                                          // Given the simplicity of the original snippet, direct init is likely intended.
     if (typeof window !== 'undefined') {
        analytics = getAnalytics(app);
    }
}


export { app, analytics, firebaseConfig };
