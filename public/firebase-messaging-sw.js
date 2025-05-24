
// Import the Firebase app and messaging services
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// Your web app's Firebase configuration
// This should be the same as in your src/lib/firebase.ts
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
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Optional: Handle background messages
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    icon: payload.notification?.icon || '/firebase-logo.png' // Optional: add a default icon to public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: If you want to log that the service worker is active
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activated.');
});
