// src/firebase/config.js - Enhanced with better error handling

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork, doc, getDoc,  } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

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

// Initialize the app first
const app = initializeApp(firebaseConfig);

// Initialize services with error handling
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

// Enhanced connection monitoring and error handling
let isOnline = navigator.onLine;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// Network status monitoring
const handleOnline = async () => {
  console.log('Network connection restored');
  isOnline = true;
  reconnectAttempts = 0;
  
  try {
    await enableNetwork(db);
    console.log('Firestore connection restored');
  } catch (error) {
    console.error('Failed to restore Firestore connection:', error);
  }
};

const handleOffline = async () => {
  console.log('Network connection lost');
  isOnline = false;
  
  try {
    await disableNetwork(db);
    console.log('Firestore offline mode enabled');
  } catch (error) {
    console.error('Failed to enable offline mode:', error);
  }
};

// Add event listeners for network status
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

// Firestore connection state monitoring
const monitorFirestoreConnection = () => {
  let connectionState = 'connected';
  
  // This is a simplified connection monitor
  // In production, you might want to use more sophisticated monitoring
  const checkConnection = async () => {
    try {
      // Simple connectivity test
      if (!isOnline) {
        connectionState = 'offline';
        return;
      }
      
      connectionState = 'connected';
    } catch (error) {
      console.error('Connection check failed:', error);
      connectionState = 'error';
      
      // Attempt reconnection with exponential backoff
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.pow(2, reconnectAttempts) * 1000; // 1s, 2s, 4s, 8s, 16s
        reconnectAttempts++;
        
        console.log(`Attempting reconnection in ${delay}ms (attempt ${reconnectAttempts})`);
        
        setTimeout(async () => {
          try {
            await enableNetwork(db);
            reconnectAttempts = 0;
            console.log('Reconnection successful');
          } catch (retryError) {
            console.error('Reconnection failed:', retryError);
            checkConnection(); // Try again
          }
        }, delay);
      }
    }
  };
  
  // Check connection every 30 seconds
  setInterval(checkConnection, 30000);
  
  return () => connectionState;
};

// Start monitoring
const getConnectionState = monitorFirestoreConnection();

// Enhanced auth state monitoring with error handling
auth.onAuthStateChanged(
  (user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'No user');
  },
  (error) => {
    console.error('Auth state change error:', error);
    
    // Handle specific auth errors
    switch (error.code) {
      case 'auth/network-request-failed':
        console.log('Network request failed - check internet connection');
        break;
      case 'auth/too-many-requests':
        console.log('Too many requests - please wait before trying again');
        break;
      default:
        console.log('Authentication error:', error.message);
    }
  }
);

// Retry mechanism for Firestore operations
export const withRetry = async (operation, maxAttempts = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (
        error.code === 'permission-denied' ||
        error.code === 'not-found' ||
        error.code === 'already-exists'
      ) {
        throw error;
      }
      
      // Log retry attempt
      console.warn(`Operation failed (attempt ${attempt}/${maxAttempts}):`, error.message);
      
      if (attempt === maxAttempts) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Connection health check
export const checkFirestoreHealth = async () => {
  try {
    // Simple test operation
    const testDoc = doc(db, 'health-check', 'test');
    await getDoc(testDoc);
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message, 
      timestamp: new Date().toISOString() 
    };
  }
};

// Graceful error handling wrapper
export const safeFirestoreOperation = async (operation, fallbackValue = null) => {
  try {
    return await withRetry(operation);
  } catch (error) {
    console.error('Firestore operation failed:', error);
    
    // You could emit an event here for UI notification
    window.dispatchEvent(new CustomEvent('firestore-error', { 
      detail: { error: error.message, code: error.code } 
    }));
    
    return fallbackValue;
  }
};

// Export everything
export { 
  auth, 
  googleProvider, 
  db, 
  storage, 
  functions, 
  app,
  getConnectionState,
  isOnline
};