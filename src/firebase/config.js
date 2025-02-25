// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// First, define your config
const firebaseConfig = {
    apiKey: "AIzaSyAMdHkSu5K95Gg2lRQw7OmgsI7EQCx3E9s",
    authDomain: "kalkode-febcd.firebaseapp.com",
    projectId: "kalkode-febcd",
    storageBucket: "kalkode-febcd.firebasestorage.app",
    messagingSenderId: "925389817906",
    appId: "1:925389817906:web:61c4e1686e570098ccd42b",
    measurementId: "G-T8C12GQF80"
};

// Then initialize the app first
const app = initializeApp(firebaseConfig);
app.automaticDataCollectionEnabled = true;

// Then initialize other services using the app instance
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

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
export { auth, googleProvider, db, storage };