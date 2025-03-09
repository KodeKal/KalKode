// src/firebase/config.js (Updated)
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// First, define your config
const firebaseConfig = {
  apiKey: "AIzaSyDfQfvgNPUQPtSvJEgXkwWBxmBZgVkY5Wg",
  authDomain: "kalkode-8b160.firebaseapp.com",
  databaseURL: "https://kalkode-8b160-default-rtdb.firebaseio.com",
  projectId: "kalkode-8b160",
  storageBucket: "kalkode-8b160.firebasestorage.app",
  messagingSenderId: "357593143871",
  appId: "1:357593143871:web:8a6388d7f9e03fade1f68a",
  measurementId: "G-3Z5HWMXRKW"
};

// Then initialize the app first
const app = initializeApp(firebaseConfig);
app.automaticDataCollectionEnabled = true;

// Then initialize other services using the app instance
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Add error logging
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user ? 'User logged in' : 'No user');
});

// Export everything at the end
export { auth, googleProvider, db, storage, functions, app };