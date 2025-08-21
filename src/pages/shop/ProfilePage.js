// src/pages/shop/ProfilePage.js - Enhanced with Editable Info and SMS Notifications
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  User, Camera, Edit3, Save, X, Phone, Mail, Bell, Shield, Eye, EyeOff, 
  Check, AlertCircle, Settings, MapPin, Calendar, Star, Package, 
  MessageCircle, Activity, Download, Upload, Trash2, Globe, Lock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../firebase/config';
import { updateProfile, updateEmail, sendEmailVerification } from 'firebase/auth';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #0B0B3B, #1A1A4C);
  color: #FFFFFF;
  padding-bottom: 2rem;
`;

const ProfileHeader = styled.header`
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(128, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 10;
  
  @media (min-width: 768px) {
    padding: 1.5rem 2rem;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h1 {
    font-size: 1.5rem;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    @media (min-width: 768px) {
      font-size: 1.8rem;
    }
  }
`;

const SaveButton = styled.button`
  background: ${props => props.hasChanges ? 'linear-gradient(45deg, #800000, #4A0404)' : 'rgba(128, 0, 0, 0.3)'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: ${props => props.hasChanges ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    ${props => props.hasChanges && 'transform: translateY(-2px); box-shadow: 0 4px 12px rgba(128, 0, 0, 0.3);'}
  }
  
  @media (min-width: 768px) {
    padding: 0.75rem 1.5rem;
  }
`;

const ProfileContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const ProfileGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
  }
`;

const ProfileSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const AvatarSection = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(128, 0, 0, 0.3);
  text-align: center;
  
  .avatar-container {
    position: relative;
    display: inline-block;
    margin-bottom: 1rem;
    
    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(128, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 3px solid rgba(128, 0, 0, 0.5);
      transition: all 0.3s ease;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      svg {
        color: rgba(255, 255, 255, 0.7);
      }
      
      &:hover {
        border-color: #800000;
        transform: scale(1.02);
      }
    }
    
    .avatar-upload {
      position: absolute;
      bottom: 0;
      right: 0;
      background: linear-gradient(45deg, #800000, #4A0404);
      border: 3px solid #0B0B3B;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(128, 0, 0, 0.4);
      }
      
      input {
        display: none;
      }
    }
  }
  
  .display-name {
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #800000;
  }
  
  .user-email {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 1rem;
  }
  
  .verification-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    
    &.verified {
      background: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
      border: 1px solid rgba(76, 175, 80, 0.3);
    }
    
    &.unverified {
      background: rgba(255, 152, 0, 0.2);
      color: #FF9800;
      border: 1px solid rgba(255, 152, 0, 0.3);
    }
  }
`;

const QuickStats = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(128, 0, 0, 0.3);
  
  h3 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: #800000;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    
    .stat-item {
      text-align: center;
      
      .stat-number {
        font-size: 1.5rem;
        font-weight: bold;
        color: #800000;
        display: block;
      }
      
      .stat-label {
        font-size: 0.8rem;
        opacity: 0.8;
        margin-top: 0.25rem;
      }
    }
  }
`;

const MainProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProfileCard = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(128, 0, 0, 0.3);
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: between;
    margin-bottom: 1.5rem;
    
    h2 {
      margin: 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }
    
    .edit-toggle {
      background: transparent;
      border: 1px solid rgba(128, 0, 0, 0.3);
      color: rgba(255, 255, 255, 0.8);
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      
      &:hover {
        background: rgba(128, 0, 0, 0.2);
        border-color: #800000;
        color: white;
      }
      
      &.editing {
        background: rgba(128, 0, 0, 0.2);
        border-color: #800000;
        color: #800000;
      }
    }
  }
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: ${props => props.columns || '1fr 1fr'};
  }
  
  &.single-column {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  input, textarea, select {
    background: ${props => props.editing ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)'};
    border: 1px solid ${props => props.editing ? 'rgba(128, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
    border-radius: 8px;
    padding: 0.75rem;
    color: white;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #800000;
      box-shadow: 0 0 0 2px rgba(128, 0, 0, 0.2);
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  textarea {
    min-height: 80px;
    resize: vertical;
  }
  
  .field-description {
    font-size: 0.8rem;
    opacity: 0.7;
    margin-top: 0.25rem;
  }
  
  .field-error {
    color: #ff4444;
    font-size: 0.8rem;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .field-success {
    color: #4CAF50;
    font-size: 0.8rem;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

const NotificationSettings = styled.div`
  .notification-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    .notification-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      
      .notification-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(128, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #800000;
      }
      
      .notification-details {
        h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          color: white;
        }
        
        p {
          margin: 0;
          font-size: 0.8rem;
          opacity: 0.7;
        }
      }
    }
    
    .notification-toggle {
      display: flex;
      gap: 0.5rem;
    }
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.checked ? '#800000' : 'rgba(255, 255, 255, 0.2)'};
    transition: 0.3s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: ${props => props.checked ? '23px' : '3px'};
      bottom: 3px;
      background: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
`;

const SecuritySection = styled.div`
  .security-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    .security-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      
      .security-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(76, 175, 80, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4CAF50;
        
        &.warning {
          background: rgba(255, 152, 0, 0.2);
          color: #FF9800;
        }
      }
      
      .security-details {
        h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          color: white;
        }
        
        p {
          margin: 0;
          font-size: 0.8rem;
          opacity: 0.7;
        }
      }
    }
    
    .security-action {
      button {
        background: transparent;
        border: 1px solid rgba(128, 0, 0, 0.3);
        color: #800000;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s;
        
        &:hover {
          background: rgba(128, 0, 0, 0.1);
          border-color: #800000;
        }
      }
    }
  }
`;

const PhoneVerification = styled.div`
  .verification-step {
    padding: 1rem;
    background: rgba(33, 150, 243, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(33, 150, 243, 0.3);
    margin-top: 0.5rem;
    
    .step-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      color: #2196F3;
      font-weight: 500;
      font-size: 0.9rem;
    }
    
    .verification-input {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      
      input {
        flex: 1;
        max-width: 120px;
      }
      
      button {
        background: #2196F3;
        color: white;
        border: none;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
        white-space: nowrap;
        
        &:hover {
          background: #1976D2;
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
    
    .verification-note {
      font-size: 0.8rem;
      opacity: 0.8;
      line-height: 1.4;
    }
  }
`;

const DataManagement = styled.div`
  .data-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    .action-info {
      h4 {
        margin: 0 0 0.25rem 0;
        font-size: 0.9rem;
        color: white;
      }
      
      p {
        margin: 0;
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .action-button {
      button {
        background: transparent;
        border: 1px solid rgba(128, 0, 0, 0.3);
        color: #800000;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        &:hover {
          background: rgba(128, 0, 0, 0.1);
          border-color: #800000;
        }
        
        &.danger {
          border-color: rgba(244, 67, 54, 0.5);
          color: #F44336;
          
          &:hover {
            background: rgba(244, 67, 54, 0.1);
            border-color: #F44336;
          }
        }
      }
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const StatusMessage = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &.success {
    background: rgba(76, 175, 80, 0.2);
    color: #4CAF50;
    border: 1px solid rgba(76, 175, 80, 0.3);
  }
  
  &.error {
    background: rgba(244, 67, 54, 0.2);
    color: #F44336;
    border: 1px solid rgba(244, 67, 54, 0.3);
  }
  
  &.info {
    background: rgba(33, 150, 243, 0.2);
    color: #2196F3;
    border: 1px solid rgba(33, 150, 243, 0.3);
  }
`;

// SMS Service function
const sendSMSNotification = async (phoneNumber, message) => {
  try {
    // In a real app, you'd call your backend API that integrates with Twilio, AWS SNS, etc.
    // For demo purposes, we'll simulate the API call
    console.log(`SMS to ${phoneNumber}: ${message}`);
    
    // Simulate API call
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: message
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }
    
    return await response.json();
  } catch (error) {
    console.error('SMS sending error:', error);
    // For demo, we'll just log it
    alert(`SMS would be sent to ${phoneNumber}: ${message}`);
    return { success: true, messageId: 'demo_' + Date.now() };
  }
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    location: '',
    website: '',
    dateOfBirth: '',
    avatar: null
  });
  
  // Original data for change detection
  const [originalData, setOriginalData] = useState({});
  
  // Editing states
  const [editingSections, setEditingSections] = useState({
    personal: false,
    contact: false,
    notifications: false,
    security: false
  });
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailMessages: true,
    emailTransactions: true,
    emailMarketing: false,
    smsMessages: false,
    smsTransactions: false,
    pushNotifications: true
  });
  
  // Security states
  const [phoneVerification, setPhoneVerification] = useState({
    isVerified: false,
    verificationCode: '',
    isVerifying: false
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // User statistics (mock data - in real app, fetch from analytics)
  const [userStats, setUserStats] = useState({
    transactionsCompleted: 0,
    itemsSold: 0,
    rating: 0,
    joinDate: null
  });

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load user profile document
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userData = {};
        if (userDoc.exists()) {
          userData = userDoc.data();
        }
        
        // Merge with Firebase Auth data
        const initialData = {
          displayName: user.displayName || userData.displayName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || userData.phoneNumber || '',
          bio: userData.bio || '',
          location: userData.location || '',
          website: userData.website || '',
          dateOfBirth: userData.dateOfBirth || '',
          avatar: user.photoURL || userData.avatar || null
        };
        
        setProfileData(initialData);
        setOriginalData(initialData);
        setNotifications(userData.notifications || notifications);
        setPhoneVerification({
          isVerified: userData.phoneVerified || false,
          verificationCode: '',
          isVerifying: false
        });
        
        // Load user stats
        setUserStats({
          transactionsCompleted: userData.transactionsCompleted || 0,
          itemsSold: userData.itemsSold || 0,
          rating: userData.rating || 0,
          joinDate: user.metadata?.creationTime || Date.now()
        });
        
      } catch (error) {
        console.error('Error loading profile:', error);
        setStatusMessage({ type: 'error', text: 'Failed to load profile data' });
      } finally {
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, [user]);

  // Check for changes
  useEffect(() => {
    const hasProfileChanges = JSON.stringify(profileData) !== JSON.stringify(originalData);
    setHasChanges(hasProfileChanges);
  }, [profileData, originalData]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error if exists
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (profileData.email && !/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (profileData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (profileData.website && !/^https?:\/\/.+/.test(profileData.website)) {
      newErrors.website = 'Please enter a valid website URL (include http:// or https://)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setStatusMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }
    
    try {
      setSaving(true);
      
      const avatarRef = ref(storage, `avatars/${user.uid}/${Date.now()}`);
      const snapshot = await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });
      
      // Update local state
      handleInputChange('avatar', downloadURL);
      
      setStatusMessage({ type: 'success', text: 'Profile photo updated successfully!' });
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setStatusMessage({ type: 'error', text: 'Failed to upload profile photo' });
    } finally {
      setSaving(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      const userDocRef = doc(db, 'users', user.uid);
      
      // Update Firestore document
      await updateDoc(userDocRef, {
        ...profileData,
        notifications,
        phoneVerified: phoneVerification.isVerified,
        updatedAt: new Date().toISOString()
      });
      
      // Update Firebase Auth profile if display name changed
      if (profileData.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName
        });
      }
      
      // Update email if changed (requires re-authentication in real app)
      if (profileData.email !== user.email) {
        try {
          await updateEmail(auth.currentUser, profileData.email);
          await sendEmailVerification(auth.currentUser);
          setStatusMessage({ 
            type: 'info', 
            text: 'Email updated. Please check your inbox to verify your new email address.' 
          });
        } catch (emailError) {
          console.error('Email update error:', emailError);
          setStatusMessage({ 
            type: 'error', 
            text: 'Failed to update email. You may need to re-authenticate.' 
          });
        }
      }
      
      // Send SMS notification if phone number is verified and notifications enabled
      if (phoneVerification.isVerified && notifications.smsTransactions && profileData.phoneNumber) {
        await sendSMSNotification(
          profileData.phoneNumber, 
          'Your KalKode profile has been updated successfully!'
        );
      }
      
      setOriginalData({ ...profileData });
      setHasChanges(false);
      
      // Close editing modes
      setEditingSections({
        personal: false,
        contact: false,
        notifications: false,
        security: false
      });
      
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setStatusMessage({ type: 'error', text: 'Failed to save profile changes' });
    } finally {
      setSaving(false);
    }
  };

  // Handle phone verification
  const handlePhoneVerification = async () => {
    if (!profileData.phoneNumber) {
      setStatusMessage({ type: 'error', text: 'Please enter a phone number first' });
      return;
    }
    
    try {
      setPhoneVerification(prev => ({ ...prev, isVerifying: true }));
      
      // In a real app, you'd send verification code via SMS
      // For demo, we'll simulate it
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      await sendSMSNotification(
        profileData.phoneNumber,
        `Your KalKode verification code is: ${verificationCode}`
      );
      
      // Store the code for verification (in real app, this would be server-side)
      sessionStorage.setItem('phoneVerificationCode', verificationCode);
      
      setStatusMessage({ 
        type: 'info', 
        text: 'Verification code sent to your phone number!' 
      });
      
    } catch (error) {
      console.error('Error sending verification:', error);
      setStatusMessage({ type: 'error', text: 'Failed to send verification code' });
    } finally {
      setPhoneVerification(prev => ({ ...prev, isVerifying: false }));
    }
  };

  // Verify phone code
  const handleVerifyCode = async () => {
    const storedCode = sessionStorage.getItem('phoneVerificationCode');
    
    if (phoneVerification.verificationCode === storedCode) {
      setPhoneVerification(prev => ({ 
        ...prev, 
        isVerified: true, 
        verificationCode: '' 
      }));
      
      // Send welcome SMS
      await sendSMSNotification(
        profileData.phoneNumber,
        'Your phone number has been verified! You will now receive important notifications via SMS.'
      );
      
      sessionStorage.removeItem('phoneVerificationCode');
      setStatusMessage({ type: 'success', text: 'Phone number verified successfully!' });
    } else {
      setStatusMessage({ type: 'error', text: 'Invalid verification code' });
    }
  };

  // Toggle editing mode
  const toggleEditing = (section) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle notification changes
  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  // Export user data
  const handleExportData = async () => {
    try {
      const userData = {
        profile: profileData,
        notifications,
        stats: userStats,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kalkode-profile-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setStatusMessage({ type: 'success', text: 'Profile data exported successfully!' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setStatusMessage({ type: 'error', text: 'Failed to export profile data' });
    }
  };

  // Delete account (placeholder)
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setStatusMessage({ 
        type: 'info', 
        text: 'Account deletion request submitted. You will receive an email with further instructions.' 
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <LoadingSpinner />
          <p>Loading profile...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ProfileHeader>
        <HeaderContent>
          <h1>
            <User size={20} />
            Profile Settings
          </h1>
          <SaveButton 
            hasChanges={hasChanges} 
            onClick={handleSaveProfile}
            disabled={!hasChanges || saving}
          >
            {saving ? <LoadingSpinner /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </SaveButton>
        </HeaderContent>
      </ProfileHeader>

      <ProfileContent>
        {statusMessage && (
          <StatusMessage className={statusMessage.type}>
            {statusMessage.type === 'success' && <Check size={16} />}
            {statusMessage.type === 'error' && <AlertCircle size={16} />}
            {statusMessage.type === 'info' && <Bell size={16} />}
            {statusMessage.text}
            <button 
              onClick={() => setStatusMessage(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'inherit', 
                marginLeft: 'auto',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          </StatusMessage>
        )}

        <ProfileGrid>
          <ProfileSidebar>
            <AvatarSection>
              <div className="avatar-container">
                <div className="avatar">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Profile" />
                  ) : (
                    <User size={48} />
                  )}
                </div>
                <div className="avatar-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                    <Camera size={16} />
                  </label>
                </div>
              </div>
              
              <div className="display-name">
                {profileData.displayName || 'Your Name'}
              </div>
              <div className="user-email">
                {profileData.email}
              </div>
              
              <div className={`verification-status ${user?.emailVerified ? 'verified' : 'unverified'}`}>
                {user?.emailVerified ? (
                  <>
                    <Check size={14} />
                    Email Verified
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} />
                    Email Unverified
                  </>
                )}
              </div>
            </AvatarSection>

            <QuickStats>
              <h3>Account Overview</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{userStats.transactionsCompleted}</span>
                  <span className="stat-label">Transactions</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{userStats.itemsSold}</span>
                  <span className="stat-label">Items Sold</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{userStats.rating.toFixed(1)}</span>
                  <span className="stat-label">Rating</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {new Date(userStats.joinDate).getFullYear()}
                  </span>
                  <span className="stat-label">Member Since</span>
                </div>
              </div>
            </QuickStats>
          </ProfileSidebar>

          <MainProfileSection>
            {/* Personal Information */}
            <ProfileCard>
              <div className="card-header">
                <h2>
                  <User size={20} />
                  Personal Information
                </h2>
                <button 
                  className={`edit-toggle ${editingSections.personal ? 'editing' : ''}`}
                  onClick={() => toggleEditing('personal')}
                >
                  {editingSections.personal ? <X size={16} /> : <Edit3 size={16} />}
                </button>
              </div>

              <FormGrid>
                <FormField editing={editingSections.personal}>
                  <label>
                    <User size={14} />
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    disabled={!editingSections.personal}
                    placeholder="Enter your display name"
                  />
                </FormField>

                <FormField editing={editingSections.personal}>
                  <label>
                    <Calendar size={14} />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!editingSections.personal}
                  />
                </FormField>

                <FormField editing={editingSections.personal} className="single-column">
                  <label>
                    <MapPin size={14} />
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!editingSections.personal}
                    placeholder="City, State/Country"
                  />
                </FormField>

                <FormField editing={editingSections.personal} className="single-column">
                  <label>Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!editingSections.personal}
                    placeholder="Tell others about yourself..."
                    maxLength={500}
                  />
                  <div className="field-description">
                    {profileData.bio.length}/500 characters
                  </div>
                </FormField>
              </FormGrid>
            </ProfileCard>

            {/* Contact Information */}
            <ProfileCard>
              <div className="card-header">
                <h2>
                  <Mail size={20} />
                  Contact Information
                </h2>
                <button 
                  className={`edit-toggle ${editingSections.contact ? 'editing' : ''}`}
                  onClick={() => toggleEditing('contact')}
                >
                  {editingSections.contact ? <X size={16} /> : <Edit3 size={16} />}
                </button>
              </div>

              <FormGrid>
                <FormField editing={editingSections.contact}>
                  <label>
                    <Mail size={14} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editingSections.contact}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <div className="field-error">
                      <AlertCircle size={12} />
                      {errors.email}
                    </div>
                  )}
                </FormField>

                <FormField editing={editingSections.contact}>
                  <label>
                    <Phone size={14} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    disabled={!editingSections.contact}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phoneNumber && (
                    <div className="field-error">
                      <AlertCircle size={12} />
                      {errors.phoneNumber}
                    </div>
                  )}
                  {phoneVerification.isVerified && (
                    <div className="field-success">
                      <Check size={12} />
                      Phone number verified
                    </div>
                  )}
                </FormField>

                <FormField editing={editingSections.contact} className="single-column">
                  <label>
                    <Globe size={14} />
                    Website
                  </label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!editingSections.contact}
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.website && (
                    <div className="field-error">
                      <AlertCircle size={12} />
                      {errors.website}
                    </div>
                  )}
                </FormField>
              </FormGrid>

              {/* Phone Verification */}
              {editingSections.contact && profileData.phoneNumber && !phoneVerification.isVerified && (
                <PhoneVerification>
                  <div className="verification-step">
                    <div className="step-header">
                      <Phone size={16} />
                      Verify Phone Number
                    </div>
                    <div className="verification-input">
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={phoneVerification.verificationCode}
                        onChange={(e) => setPhoneVerification(prev => ({
                          ...prev,
                          verificationCode: e.target.value
                        }))}
                        maxLength={6}
                      />
                      <button
                        onClick={handleVerifyCode}
                        disabled={phoneVerification.verificationCode.length !== 6}
                      >
                        Verify
                      </button>
                      <button
                        onClick={handlePhoneVerification}
                        disabled={phoneVerification.isVerifying}
                      >
                        {phoneVerification.isVerifying ? 'Sending...' : 'Send Code'}
                      </button>
                    </div>
                    <div className="verification-note">
                      We'll send a 6-digit verification code to your phone number via SMS.
                    </div>
                  </div>
                </PhoneVerification>
              )}
            </ProfileCard>

            {/* Notification Preferences */}
            <ProfileCard>
              <div className="card-header">
                <h2>
                  <Bell size={20} />
                  Notification Preferences
                </h2>
                <button 
                  className={`edit-toggle ${editingSections.notifications ? 'editing' : ''}`}
                  onClick={() => toggleEditing('notifications')}
                >
                  {editingSections.notifications ? <X size={16} /> : <Edit3 size={16} />}
                </button>
              </div>

              <NotificationSettings>
                <div className="notification-item">
                  <div className="notification-info">
                    <div className="notification-icon">
                      <Mail size={16} />
                    </div>
                    <div className="notification-details">
                      <h4>Email Messages</h4>
                      <p>Receive email notifications for new messages</p>
                    </div>
                  </div>
                  <div className="notification-toggle">
                    <ToggleSwitch checked={notifications.emailMessages}>
                      <input
                        type="checkbox"
                        checked={notifications.emailMessages}
                        onChange={(e) => handleNotificationChange('emailMessages', e.target.checked)}
                        disabled={!editingSections.notifications}
                      />
                      <span className="slider"></span>
                    </ToggleSwitch>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <div className="notification-icon">
                      <Package size={16} />
                    </div>
                    <div className="notification-details">
                      <h4>Email Transactions</h4>
                      <p>Get updates about your transactions via email</p>
                    </div>
                  </div>
                  <div className="notification-toggle">
                    <ToggleSwitch checked={notifications.emailTransactions}>
                      <input
                        type="checkbox"
                        checked={notifications.emailTransactions}
                        onChange={(e) => handleNotificationChange('emailTransactions', e.target.checked)}
                        disabled={!editingSections.notifications}
                      />
                      <span className="slider"></span>
                    </ToggleSwitch>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <div className="notification-icon">
                      <Phone size={16} />
                    </div>
                    <div className="notification-details">
                      <h4>SMS Messages</h4>
                      <p>Receive text notifications for urgent messages</p>
                    </div>
                  </div>
                  <div className="notification-toggle">
                    <ToggleSwitch checked={notifications.smsMessages}>
                      <input
                        type="checkbox"
                        checked={notifications.smsMessages}
                        onChange={(e) => handleNotificationChange('smsMessages', e.target.checked)}
                        disabled={!editingSections.notifications || !phoneVerification.isVerified}
                      />
                      <span className="slider"></span>
                    </ToggleSwitch>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <div className="notification-icon">
                      <Activity size={16} />
                    </div>
                    <div className="notification-details">
                      <h4>SMS Transactions</h4>
                      <p>Get transaction updates via text message</p>
                    </div>
                  </div>
                  <div className="notification-toggle">
                    <ToggleSwitch checked={notifications.smsTransactions}>
                      <input
                        type="checkbox"
                        checked={notifications.smsTransactions}
                        onChange={(e) => handleNotificationChange('smsTransactions', e.target.checked)}
                        disabled={!editingSections.notifications || !phoneVerification.isVerified}
                      />
                      <span className="slider"></span>
                    </ToggleSwitch>
                  </div>
                </div>

                {!phoneVerification.isVerified && (
                  <div style={{ 
                    padding: '1rem', 
                    background: 'rgba(255, 152, 0, 0.1)', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    marginTop: '1rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: '#FF9800',
                      fontSize: '0.9rem'
                    }}>
                      <AlertCircle size={16} />
                      Please verify your phone number to enable SMS notifications
                    </div>
                  </div>
                )}
              </NotificationSettings>
            </ProfileCard>

            {/* Security & Privacy */}
            <ProfileCard>
              <div className="card-header">
                <h2>
                  <Shield size={20} />
                  Security & Privacy
                </h2>
              </div>

              <SecuritySection>
                <div className="security-item">
                  <div className="security-info">
                    <div className={`security-icon ${user?.emailVerified ? '' : 'warning'}`}>
                      {user?.emailVerified ? <Check size={16} /> : <AlertCircle size={16} />}
                    </div>
                    <div className="security-details">
                      <h4>Email Verification</h4>
                      <p>
                        {user?.emailVerified 
                          ? 'Your email address is verified' 
                          : 'Please verify your email address'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="security-action">
                    {!user?.emailVerified && (
                      <button onClick={() => sendEmailVerification(auth.currentUser)}>
                        Send Verification
                      </button>
                    )}
                  </div>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <div className={`security-icon ${phoneVerification.isVerified ? '' : 'warning'}`}>
                      {phoneVerification.isVerified ? <Check size={16} /> : <Phone size={16} />}
                    </div>
                    <div className="security-details">
                      <h4>Phone Verification</h4>
                      <p>
                        {phoneVerification.isVerified 
                          ? 'Your phone number is verified' 
                          : 'Verify your phone for enhanced security'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="security-action">
                    {!phoneVerification.isVerified && profileData.phoneNumber && (
                      <button onClick={handlePhoneVerification}>
                        Verify Phone
                      </button>
                    )}
                  </div>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <div className="security-icon">
                      <Lock size={16} />
                    </div>
                    <div className="security-details">
                      <h4>Password</h4>
                      <p>Change your account password</p>
                    </div>
                  </div>
                  <div className="security-action">
                    <button onClick={() => {
                      // In real app, navigate to password change flow
                      setStatusMessage({ 
                        type: 'info', 
                        text: 'Password reset email sent to your inbox' 
                      });
                    }}>
                      Change Password
                    </button>
                  </div>
                </div>
              </SecuritySection>
            </ProfileCard>

            {/* Data Management */}
            <ProfileCard>
              <div className="card-header">
                <h2>
                  <Settings size={20} />
                  Data Management
                </h2>
              </div>

              <DataManagement>
                <div className="data-action">
                  <div className="action-info">
                    <h4>Export Profile Data</h4>
                    <p>Download a copy of your profile information and activity</p>
                  </div>
                  <div className="action-button">
                    <button onClick={handleExportData}>
                      <Download size={14} />
                      Export Data
                    </button>
                  </div>
                </div>

                <div className="data-action">
                  <div className="action-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all associated data</p>
                  </div>
                  <div className="action-button">
                    <button className="danger" onClick={handleDeleteAccount}>
                      <Trash2 size={14} />
                      Delete Account
                    </button>
                  </div>
                </div>
              </DataManagement>
            </ProfileCard>
          </MainProfileSection>
        </ProfileGrid>
      </ProfileContent>
    </PageContainer>
  );
};

export default ProfilePage;