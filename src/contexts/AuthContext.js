// Save at: src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  getRedirectResult 
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear any error messages
  const clearError = () => setError(null);

  // Sign in with Google
  const signInWithGoogle = async () => {
    clearError();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError(error.message);
      throw error;
    }
  };

  // Sign in with email/password
  const emailSignIn = async (email, password) => {
    clearError();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing in with email:', error);
      setError(error.message);
      throw error;
    }
  };

  // Sign up with email/password
  const emailSignUp = async (email, password, displayName) => {
    clearError();
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      return result.user;
    } catch (error) {
      console.error('Error signing up with email:', error);
      setError(error.message);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    clearError();
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    clearError();
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    clearError();
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        // Force refresh the user object
        setUser({ ...auth.currentUser });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
      throw error;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });

    // Handle redirect result
    getRedirectResult(auth).catch(error => {
      console.error('Error getting redirect result:', error);
      setError(error.message);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    error,
    clearError,
    signInWithGoogle,
    emailSignIn,
    emailSignUp,
    logout,
    resetPassword,
    updateUserProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};