// src/pages/shop/ProfilePage.js - Professional Identity & Marketplace Profile
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  User, Camera, Edit3, Save, X, MapPin, Calendar, Star, Package, 
  Award, Briefcase, GraduationCap, Target, TrendingUp, Eye, EyeOff,
  Check, AlertCircle, Phone, Mail, Globe, Plus, Trash2, DollarSign,
  Users, ShoppingBag, Heart, MessageSquare, Building, Code
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../firebase/config';
import { updateProfile } from 'firebase/auth';

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
  
  @media (min-width: 1024px) {
    grid-template-columns: 350px 1fr;
    gap: 2rem;
  }
`;

const ProfileSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProfileCard = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(128, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(128, 0, 0, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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

const AvatarSection = styled.div`
  text-align: center;
  
  .avatar-container {
    position: relative;
    display: inline-block;
    margin-bottom: 1.5rem;
    
    .avatar {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: rgba(128, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 4px solid rgba(128, 0, 0, 0.5);
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
      width: 40px;
      height: 40px;
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
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #800000;
  }
  
  .professional-title {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 0.5rem;
    color: #FFFFFF;
  }
  
  .location {
    font-size: 0.9rem;
    opacity: 0.7;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .verification-badges {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }
  
  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
    &.verified {
      background: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
      border: 1px solid rgba(76, 175, 80, 0.3);
    }
    
    &.seller {
      background: rgba(33, 150, 243, 0.2);
      color: #2196F3;
      border: 1px solid rgba(33, 150, 243, 0.3);
    }
    
    &.buyer {
      background: rgba(255, 152, 0, 0.2);
      color: #FF9800;
      border: 1px solid rgba(255, 152, 0, 0.3);
    }
  }
`;

const MarketplaceStats = styled.div`
  h3 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: #800000;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
    
    .stat-item {
      text-align: center;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      
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
  
  .rating-section {
    text-align: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    .rating-stars {
      display: flex;
      justify-content: center;
      gap: 0.25rem;
      margin-bottom: 0.5rem;
    }
    
    .rating-text {
      font-size: 0.9rem;
      opacity: 0.8;
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
`;

const SkillsSection = styled.div`
  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .skill-tag {
    background: rgba(128, 0, 0, 0.2);
    color: #800000;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    border: 1px solid rgba(128, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .remove-skill {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0;
      
      &:hover {
        opacity: 0.7;
      }
    }
  }
  
  .add-skill {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    
    input {
      flex: 1;
    }
    
    button {
      background: rgba(128, 0, 0, 0.3);
      color: #800000;
      border: 1px solid rgba(128, 0, 0, 0.5);
      padding: 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      
      &:hover {
        background: rgba(128, 0, 0, 0.5);
        color: white;
      }
    }
  }
`;

const ExperienceSection = styled.div`
  .experience-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .experience-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    .experience-header {
      display: flex;
      justify-content: between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
      
      .experience-title {
        font-weight: bold;
        color: #800000;
      }
      
      .experience-company {
        font-size: 0.9rem;
        opacity: 0.8;
      }
      
      .experience-duration {
        font-size: 0.8rem;
        opacity: 0.7;
        margin-left: auto;
      }
      
      .remove-experience {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        padding: 0.25rem;
        
        &:hover {
          color: #ff4444;
        }
      }
    }
    
    .experience-description {
      font-size: 0.9rem;
      opacity: 0.8;
      line-height: 1.4;
    }
  }
  
  .add-experience {
    background: rgba(255, 255, 255, 0.05);
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;
    
    &:hover {
      border-color: rgba(128, 0, 0, 0.5);
      color: #800000;
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
`;

const SELLER_TYPES = [
  'Product Seller',
  'Service Provider', 
  'Digital Creator',
  'Consultant',
  'Freelancer',
  'Artisan/Craftsperson',
  'Educator/Trainer',
  'Event Organizer',
  'Tech Developer',
  'Creative Professional'
];

const BUYER_TYPES = [
  'Individual Consumer',
  'Small Business Owner',
  'Corporate Buyer',
  'Reseller/Distributor',
  'Collector/Enthusiast',
  'Event Planner',
  'Content Creator',
  'Startup Founder',
  'Investor',
  'Industry Professional'
];

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    displayName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    bio: '',
    sellerType: '',
    buyerType: '',
    skills: [],
    experience: [],
    avatar: null,
    hourlyRate: '',
    responseTime: '24 hours',
    languages: []
  });
  
  // Original data for change detection
  const [originalData, setOriginalData] = useState({});
  
  // Editing states
  const [editingSections, setEditingSections] = useState({
    personal: false,
    professional: false,
    marketplace: false,
    experience: false
  });
  
  // User statistics
  const [userStats, setUserStats] = useState({
    itemsSold: 0,
    itemsBought: 0,
    totalEarnings: 0,
    rating: 0,
    reviewCount: 0,
    responseRate: 0,
    joinDate: null
  });
  
  // Form helpers
  const [newSkill, setNewSkill] = useState('');
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    duration: '',
    description: ''
  });

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userData = {};
        if (userDoc.exists()) {
          userData = userDoc.data();
        }
        
        const initialData = {
          displayName: user.displayName || userData.displayName || '',
          professionalTitle: userData.professionalTitle || '',
          email: user.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          website: userData.website || '',
          bio: userData.bio || '',
          sellerType: userData.sellerType || '',
          buyerType: userData.buyerType || '',
          skills: userData.skills || [],
          experience: userData.experience || [],
          avatar: user.photoURL || userData.avatar || null,
          hourlyRate: userData.hourlyRate || '',
          responseTime: userData.responseTime || '24 hours',
          languages: userData.languages || []
        };
        
        setProfileData(initialData);
        setOriginalData(initialData);
        
        // Load user stats
        setUserStats({
          itemsSold: userData.itemsSold || 0,
          itemsBought: userData.itemsBought || 0,
          totalEarnings: userData.totalEarnings || 0,
          rating: userData.rating || 0,
          reviewCount: userData.reviewCount || 0,
          responseRate: userData.responseRate || 0,
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
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }
    
    try {
      setSaving(true);
      
      const avatarRef = ref(storage, `avatars/${user.uid}/${Date.now()}`);
      const snapshot = await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });
      
      handleInputChange('avatar', downloadURL);
      setStatusMessage({ type: 'success', text: 'Profile photo updated!' });
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setStatusMessage({ type: 'error', text: 'Failed to upload profile photo' });
    } finally {
      setSaving(false);
    }
  };

  // Skills management
  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      handleInputChange('skills', [...profileData.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    handleInputChange('skills', profileData.skills.filter(skill => skill !== skillToRemove));
  };

  // Experience management
  const handleAddExperience = () => {
    if (newExperience.title.trim() && newExperience.company.trim()) {
      handleInputChange('experience', [...profileData.experience, { ...newExperience, id: Date.now() }]);
      setNewExperience({ title: '', company: '', duration: '', description: '' });
      setShowAddExperience(false);
    }
  };

  const handleRemoveExperience = (experienceId) => {
    handleInputChange('experience', profileData.experience.filter(exp => exp.id !== experienceId));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const userDocRef = doc(db, 'users', user.uid);
      
      await updateDoc(userDocRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
      
      if (profileData.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName
        });
      }
      
      setOriginalData({ ...profileData });
      setHasChanges(false);
      
      setEditingSections({
        personal: false,
        professional: false,
        marketplace: false,
        experience: false
      });
      
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setStatusMessage({ type: 'error', text: 'Failed to save profile changes' });
    } finally {
      setSaving(false);
    }
  };

  // Toggle editing mode
  const toggleEditing = (section) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Render star rating
  const renderStarRating = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={16} 
        fill={i < rating ? '#FFD700' : 'none'} 
        color={i < rating ? '#FFD700' : 'rgba(255,255,255,0.3)'} 
      />
    ));
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
            Professional Profile
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
            {/* Avatar & Basic Info */}
            <ProfileCard>
              <AvatarSection>
                <div className="avatar-container">
                  <div className="avatar">
                    {profileData.avatar ? (
                      <img src={profileData.avatar} alt="Profile" />
                    ) : (
                      <User size={60} />
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
                      <Camera size={18} />
                    </label>
                  </div>
                </div>
                
                <div className="display-name">
                  {profileData.displayName || 'Your Name'}
                </div>
                <div className="professional-title">
                  {profileData.professionalTitle || 'Add your professional title'}
                </div>
                <div className="location">
                  <MapPin size={14} />
                  {profileData.location || 'Add location'}
                </div>
                
                <div className="verification-badges">
                  <div className="badge verified">
                    <Check size={12} />
                    Verified
                  </div>
                  {profileData.sellerType && (
                    <div className="badge seller">
                      <Package size={12} />
                      Seller
                    </div>
                  )}
                  {profileData.buyerType && (
                    <div className="badge buyer">
                      <ShoppingBag size={12} />
                      Buyer
                    </div>
                  )}
                </div>
              </AvatarSection>
            </ProfileCard>

            {/* Marketplace Stats */}
            <ProfileCard>
              <MarketplaceStats>
                <h3>Marketplace Performance</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{userStats.itemsSold}</span>
                    <span className="stat-label">Items Sold</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{userStats.itemsBought}</span>
                    <span className="stat-label">Items Bought</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">${userStats.totalEarnings}</span>
                    <span className="stat-label">Total Earnings</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{userStats.responseRate}%</span>
                    <span className="stat-label">Response Rate</span>
                  </div>
                </div>
                
                <div className="rating-section">
                  <div className="rating-stars">
                    {renderStarRating(userStats.rating)}
                  </div>
                  <div className="rating-text">
                    {userStats.rating.toFixed(1)} out of 5 ({userStats.reviewCount} reviews)
                  </div>
                </div>
              </MarketplaceStats>
            </ProfileCard>
          </ProfileSidebar>

          {/* Main Profile Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    disabled={!editingSections.personal}
                    placeholder="Enter your full name"
                  />
                </FormField>

                <FormField editing={editingSections.personal}>
                  <label>
                    <Mail size={14} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editingSections.personal}
                    placeholder="your@email.com"
                  />
                </FormField>

                <FormField editing={editingSections.personal}>
                  <label>
                    <Phone size={14} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editingSections.personal}
                    placeholder="+1 (555) 123-4567"
                  />
                </FormField>

                <FormField editing={editingSections.personal}>
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
                  <label>
                    <Globe size={14} />
                    Website/Portfolio
                  </label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!editingSections.personal}
                    placeholder="https://yourwebsite.com"
                  />
                </FormField>

                <FormField editing={editingSections.personal} className="single-column">
                  <label>Professional Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!editingSections.personal}
                    placeholder="Tell others about your background, expertise, and what makes you unique..."
                    maxLength={500}
                  />
                  <div className="field-description">
                    {profileData.bio.length}/500 characters
                  </div>
                </FormField>
              </FormGrid>
            </ProfileCard>

            {/* Professional Details */}
            <ProfileCard>
              <div className="card-header">
                <h2>
                  <Briefcase size={20} />
                  Professional Details
                </h2>
                <button 
                  className={`edit-toggle ${editingSections.professional ? 'editing' : ''}`}
                  onClick={() => toggleEditing('professional')}
                >
                  {editingSections.professional ? <X size={16} /> : <Edit3 size={16} />}
                </button>
              </div>

              <FormGrid>
                <FormField editing={editingSections.professional}>
                  <label>
                    <Award size={14} />
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={profileData.professionalTitle}
                    onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
                    disabled={!editingSections.professional}
                    placeholder="e.g., Senior Software Developer, Marketing Consultant"
                  />
                </FormField>

                <FormField editing={editingSections.professional}>
                  <label>
                    <DollarSign size={14} />
                    Hourly Rate (Optional)
                  </label>
                  <input
                    type="text"
                    value={profileData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                    disabled={!editingSections.professional}
                    placeholder="$50/hour"
                  />
                </FormField>

                <FormField editing={editingSections.professional}>
                  <label>
                    <Target size={14} />
                    Seller Type
                  </label>
                  <select
                    value={profileData.sellerType}
                    onChange={(e) => handleInputChange('sellerType', e.target.value)}
                    disabled={!editingSections.professional}
                  >
                    <option value="">Select seller type</option>
                    {SELLER_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </FormField>

                <FormField editing={editingSections.professional}>
                  <label>
                    <Users size={14} />
                    Buyer Type
                  </label>
                  <select
                    value={profileData.buyerType}
                    onChange={(e) => handleInputChange('buyerType', e.target.value)}
                    disabled={!editingSections.professional}
                  >
                    <option value="">Select buyer type</option>
                    {BUYER_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </FormField>
              </FormGrid>

              {/* Skills Section */}
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#800000', fontSize: '1.1rem' }}>Skills & Expertise</h3>
                <SkillsSection>
                  <div className="skills-list">
                    {profileData.skills.map((skill, index) => (
                      <div key={index} className="skill-tag">
                        {skill}
                        {editingSections.professional && (
                          <button 
                            className="remove-skill"
                            onClick={() => handleRemoveSkill(skill)}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {editingSections.professional && (
                    <div className="add-skill">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <button onClick={handleAddSkill}>
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </SkillsSection>
              </div>
            </ProfileCard>

            {/* Work Experience */}
            <ProfileCard>
              <div className="card-header">
                <h2>
                  <GraduationCap size={20} />
                  Work Experience
                </h2>
                <button 
                  className={`edit-toggle ${editingSections.experience ? 'editing' : ''}`}
                  onClick={() => toggleEditing('experience')}
                >
                  {editingSections.experience ? <X size={16} /> : <Edit3 size={16} />}
                </button>
              </div>

              <ExperienceSection>
                <div className="experience-list">
                  {profileData.experience.map((exp, index) => (
                    <div key={exp.id || index} className="experience-item">
                      <div className="experience-header">
                        <div>
                          <div className="experience-title">{exp.title}</div>
                          <div className="experience-company">{exp.company}</div>
                        </div>
                        <div className="experience-duration">{exp.duration}</div>
                        {editingSections.experience && (
                          <button 
                            className="remove-experience"
                            onClick={() => handleRemoveExperience(exp.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      {exp.description && (
                        <div className="experience-description">{exp.description}</div>
                      )}
                    </div>
                  ))}
                </div>

                {editingSections.experience && !showAddExperience && (
                  <div 
                    className="add-experience"
                    onClick={() => setShowAddExperience(true)}
                  >
                    <Plus size={20} />
                    <div>Add Work Experience</div>
                  </div>
                )}

                {showAddExperience && (
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <FormGrid>
                      <FormField editing={true}>
                        <label>Job Title</label>
                        <input
                          type="text"
                          value={newExperience.title}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Senior Developer"
                        />
                      </FormField>
                      <FormField editing={true}>
                        <label>Company</label>
                        <input
                          type="text"
                          value={newExperience.company}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="e.g., TechCorp Inc."
                        />
                      </FormField>
                      <FormField editing={true}>
                        <label>Duration</label>
                        <input
                          type="text"
                          value={newExperience.duration}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., Jan 2020 - Present"
                        />
                      </FormField>
                      <FormField editing={true} className="single-column">
                        <label>Description</label>
                        <textarea
                          value={newExperience.description}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your role and achievements..."
                        />
                      </FormField>
                    </FormGrid>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        onClick={handleAddExperience}
                        style={{
                          background: 'rgba(128, 0, 0, 0.3)',
                          color: '#800000',
                          border: '1px solid rgba(128, 0, 0, 0.5)',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Add Experience
                      </button>
                      <button
                        onClick={() => {
                          setShowAddExperience(false);
                          setNewExperience({ title: '', company: '', duration: '', description: '' });
                        }}
                        style={{
                          background: 'transparent',
                          color: 'rgba(255, 255, 255, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </ExperienceSection>
            </ProfileCard>

            {/* Marketplace Preferences */}
            <ProfileCard>
              <div className="card-header">
                <h2>
                  <TrendingUp size={20} />
                  Marketplace Preferences
                </h2>
                <button 
                  className={`edit-toggle ${editingSections.marketplace ? 'editing' : ''}`}
                  onClick={() => toggleEditing('marketplace')}
                >
                  {editingSections.marketplace ? <X size={16} /> : <Edit3 size={16} />}
                </button>
              </div>

              <FormGrid>
                <FormField editing={editingSections.marketplace}>
                  <label>
                    <MessageSquare size={14} />
                    Response Time
                  </label>
                  <select
                    value={profileData.responseTime}
                    onChange={(e) => handleInputChange('responseTime', e.target.value)}
                    disabled={!editingSections.marketplace}
                  >
                    <option value="1 hour">Within 1 hour</option>
                    <option value="4 hours">Within 4 hours</option>
                    <option value="24 hours">Within 24 hours</option>
                    <option value="48 hours">Within 48 hours</option>
                    <option value="1 week">Within 1 week</option>
                  </select>
                </FormField>

                <FormField editing={editingSections.marketplace}>
                  <label>
                    <Globe size={14} />
                    Languages
                  </label>
                  <input
                    type="text"
                    value={profileData.languages.join(', ')}
                    onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(lang => lang.trim()))}
                    disabled={!editingSections.marketplace}
                    placeholder="English, Spanish, French..."
                  />
                </FormField>
              </FormGrid>

              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#800000' }}>Profile Visibility</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                  Your profile helps other users understand your expertise and build trust. Complete profiles get more engagement.
                </p>
              </div>
            </ProfileCard>
          </div>
        </ProfileGrid>
      </ProfileContent>
    </PageContainer>
  );
};

export default ProfilePage;