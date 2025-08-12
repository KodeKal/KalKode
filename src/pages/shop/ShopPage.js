// src/pages/shop/ShopPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import TabPositioner from './components/TabPositioner';
import EditableText from './components/EditableComponents/EditableText';
import EditableImage from './components/EditableComponents/EditableImage';
import { DEFAULT_THEME } from '../../theme/config/themes';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { ChevronUp, ChevronDown, Plus, Minus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import AddressInput from '../../components/shop/AddressInput';
import ThemeSelector from '../../components/ThemeSelector/ThemeSelector';
import QuantitySelector from '../../components/shop/QuantitySelector';
import { WELCOME_STYLES } from '../../theme/welcomeStyles';


const ITEM_CATEGORIES = [
  'Electronics & Tech',
  'Clothing & Accessories',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Media',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Collectibles & Art',
  'Food & Beverages',
  'Other'
];

const ShopProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
  margin: 2rem auto 4rem;
  padding: 2rem;

  .profile-image {
    margin-bottom: 1rem;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.1);
    border: 3px solid ${props => props.theme?.colors?.accent || '#800000'};
    box-shadow: 0 0 20px ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
    transition: all 0.3s ease;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 25px ${props => `${props.theme?.colors?.accent}60` || 'rgba(128, 0, 0, 0.4)'};
    }
  }

  .shop-name-container {
    width: 100%;
    margin: 0.5rem 0;

    input {
      width: 100%;
      text-align: center;
      background: transparent;
      border: none;
      font-size: ${props => props.fontSize || '2.5rem'};
      font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
      color: ${props => props.theme?.colors?.accent || '#800000'};
      background: ${props => props.theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)'};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      outline: none;
      padding: 0.5rem;
      transition: all 0.3s ease;

      &:focus {
        transform: scale(1.02);
      }

      &::placeholder {
        background: ${props => props.theme?.colors?.accentGradient ? 
          `${props.theme.colors.accentGradient.replace(')', '80)')}` : 
          'linear-gradient(45deg, rgba(128, 0, 0, 0.8), rgba(74, 4, 4, 0.8))'};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  }

  .shop-description-container {
    width: 100%;
    margin-top: 0.25rem;

    textarea {
      width: 100%;
      text-align: center;
      background: transparent;
      border: none;
      font-size: 1.1rem;
      font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
      color: ${props => props.theme?.colors?.text || '#FFFFFF'};
      opacity: 0.8;
      outline: none;
      padding: 0.5rem;
      resize: none;
      min-height: 60px;
      transition: all 0.3s ease;

      &:focus {
        opacity: 1;
      }

      &::placeholder {
        color: ${props => props.theme?.colors?.text || '#FFFFFF'};
        opacity: 0.5;
      }
    }
  }
`;

// Now, let's update the AddItemButton to better complement theme changes
const AddItemButton = styled.button`
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: ${props => props.theme?.colors?.background || '#000000'};
  border: none;
  border-radius: ${props => props.theme?.styles?.borderRadius || '8px'};
  padding: 1rem 1.5rem;
  font-weight: 600;
  font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin: 1rem auto 2rem;
  transition: all 0.3s ease;
  justify-content: center;
  box-shadow: 0 4px 10px ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg, 
      transparent, 
      rgba(255, 255, 255, 0.2), 
      transparent
    );
    transition: left 0.7s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px ${props => `${props.theme?.colors?.accent}60` || 'rgba(128, 0, 0, 0.4)'};
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 5px ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
  }
`;

const CategorySelect = styled.select`
  width: 100%;
  background: #1a1a1a !important; /* Force dark background */
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '8px'};
  padding: 0.75rem;
  color: #ffffff !important; /* Force white text */
  font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  option {
    background: #1a1a1a !important; /* Force dark background for options */
    color: #ffffff !important; /* Force white text for options */
    padding: 0.5rem;
  }
  
  /* Webkit browsers (Chrome, Safari) */
  option:checked {
    background: ${props => props.theme?.colors?.accent || '#800000'} !important;
    color: #ffffff !important;
  }
`;


// Let's also update the ItemCard to better respond to theme changes
const ItemCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

    .delete-button {
      opacity: 1;
    }
  }
`;

// Update the DeleteButton for better theme integration
const DeleteButton = styled.button`
  position: absolute;
  top: -15px;
  right: 10px;
  background: ${props => props.theme?.colors?.background || 'rgba(0, 0, 0, 0.5)'};
  border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme?.colors?.accent || '#ff4444'};
  cursor: pointer;
  z-index: 2;
  opacity: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: ${props => `${props.theme?.colors?.accent}20` || 'rgba(0, 0, 0, 0.8)'};
    transform: scale(1.1);
    color: #ff4444;
  }
`;

// Update ItemImageContainer for better theme integration
const ItemImageContainer = styled.div`
  position: relative;
  height: 250px;
  width: 100%;
  aspect-ratio: 4/3;
  display: flex;
  overflow: hidden;
  background: ${props => `${props.theme?.colors?.background || '#000000'}80`};

  .image-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: ${props => props.theme?.colors?.text || '#fff'};
    opacity: 0.5;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      opacity: 0.8;
      background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(255, 255, 255, 0.05)'};
    }
    
    span {
      font-size: 0.9rem;
      font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
    }
  }

  .carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}40` || 'rgba(255, 255, 255, 0.2)'};
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme?.colors?.text || 'white'};
    cursor: pointer;
    z-index: 2;
    transition: all 0.3s ease;
    opacity: 0.7;

    &:hover {
      background: ${props => props.theme?.colors?.accent || 'rgba(0, 0, 0, 0.8)'};
      opacity: 1;
    }

    &.left {
      left: 10px;
    }

    &.right {
      right: 10px;
    }
  }

  .add-image {
    position: absolute;
    top: 10px;
    right: 10px;
    background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}40` || 'rgba(255, 255, 255, 0.2)'};
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme?.colors?.text || 'white'};
    cursor: pointer;
    z-index: 2;
    transition: all 0.3s ease;
    opacity: 0.7;

    &:hover {
      background: ${props => props.theme?.colors?.accent || 'rgba(0, 0, 0, 0.8)'};
      opacity: 1;
    }
  }
`;

// Update ItemContent for better theme integration
const ItemContent = styled.div`
  padding: 1rem 1.5rem; 
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}70`};

  .editable-text {
    width: 100%;
    
    input {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
      padding: 0.5rem 0;
      color: ${props => props.theme?.colors?.text || '#FFFFFF'};
      font-size: 1rem;
      font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
      transition: all 0.3s ease;
      text-align: left;
      
      &:focus {
        border-bottom-color: ${props => props.theme?.colors?.accent || '#800000'};
      }

      &::placeholder {
        color: ${props => `${props.theme?.colors?.text}90` || 'rgba(255, 255, 255, 0.5)'};
      }
    }

    textarea {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
      padding: 0.5rem 0;
      color: ${props => props.theme?.colors?.text || '#FFFFFF'};
      font-size: 1rem;
      font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
      transition: all 0.3s ease;
      resize: none;
      text-align: left;
      
      &:focus {
        border-bottom-color: ${props => props.theme?.colors?.accent || '#800000'};
      }

      &::placeholder {
        color: ${props => `${props.theme?.colors?.text}90` || 'rgba(255, 255, 255, 0.5)'};
      }
    }
  }
`;

const DeleteSection = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
`;

const DeleteItemButton = styled.button`
  background: transparent;
  border: none;
  color: #ff4444;
  opacity: 0.6;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || DEFAULT_THEME.colors.background};
  color: ${props => props.theme?.colors?.text || DEFAULT_THEME.colors.text};
  position: relative;
  overflow-x: hidden;
`;

const MainContent = styled.div`
  max-width: ${props => props.theme?.styles?.containerWidth || '1400px'};
  margin: 0 auto;
  padding: 8rem 2rem 2rem;
  position: relative;
  z-index: 1;

  // Add gap between major sections
  > div {
    margin-bottom: 4rem;
  }
`;

const FontSizeButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const FontSizeControls = styled.div`
  position: absolute;
  right: -3rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
`;

const FloatingFontControls = styled.div`
  position: fixed;
  left: 2rem;
  top: 45%;  // Position it a bit higher than middle
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.3s;
  z-index: 100;

  &:hover {
    opacity: 1;
  }
`;

const KalKodeCorner = styled.div`
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 100;
  cursor: pointer;
`;

const TabControlsContainer = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 100;
  top: 0.1rem;
  left: 51%;
  transform: translateX(-50%);
`;

const ThemeContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;

  & > div > div:nth-child(2) {
    bottom: calc(100% + 0.5rem);
    top: auto;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
`;

const KalKodeLogo = styled.div`
  color: #A00000;
  font-family: 'Impact', sans-serif;
  font-size: 2rem;
  letter-spacing: 2px;
  transform: skew(-5deg);
`;

const TabControls = styled.div`
  position: fixed;
  top: 2rem;
  right: 8rem; // Position it to the left of KalKode logo
  display: flex;
  gap: 1rem;
  z-index: 100;
`;

const PositionButton = styled.button`
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.active ? props.theme?.colors?.accent : 'transparent'};
  border-radius: 15px;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  color: ${props => props.active ? props.theme?.colors?.accent : props.theme?.colors?.text};
  cursor: pointer;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ShopBanner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: ${props => `${props.theme?.colors?.background || DEFAULT_THEME.colors.background}CC`};
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 100;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent || DEFAULT_THEME.colors.accent}30`};
`;

const UploadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 3;
`;



const ShopName = styled.div`
  flex: 1;
  text-align: ${props => props.position};
  font-family: ${props => props.theme?.fonts?.heading || DEFAULT_THEME.fonts.heading};
  font-size: 1.8rem;
  padding: ${props => props.position === 'center' ? '0 80px' : '0'};
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

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 3rem; 
  margin: 4rem 0;
`;

const ShopLogoCorner = styled.div`
  position: fixed;
  top: 2rem;
  left: 2rem;
  z-index: 100;
  cursor: pointer;
`;

const ShopLogo = styled.div`
  color: #A00000;
  font-family: 'Impact', sans-serif;
  font-size: 2rem;
  letter-spacing: 2px;
  transform: skew(-5deg);
  opacity: 0.8;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const TabButtons = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const PositionArrow = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.active ? props.theme?.colors?.accent : props.theme?.colors?.text};
  opacity: 0.6;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  &:focus {
    outline: none;
  }
`;

const ZipCodeInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem 0;
  color: ${props => props.theme?.colors?.text};
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-bottom-color: ${props => props.theme?.colors?.accent};
  }
`;

const cleanDataForFirestore = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => cleanDataForFirestore(item));
  }
  
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleanedData = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip file objects
      if (value instanceof File) continue;
      // Skip null/undefined values
      if (value === null || value === undefined) continue;
      cleanedData[key] = cleanDataForFirestore(value);
    }
    return cleanedData;
  }
  
  return data;
};


const ShopPage = () => {
  const navigate = useNavigate();
  const [shopData, setShopData] = useState(null); // Keep as null initially
  const [isReady, setIsReady] = useState(false);  // Add this state
  const [activeTab, setActiveTab] = useState('shop');
  const [saving, setSaving] = useState(false);
  const [shopNameFontSize, setShopNameFontSize] = useState(2.5);
  const [uploading, setUploading] = useState({});
  const [tabPosition, setTabPosition] = useState('top');
  const [currentTheme, setCurrentTheme] = useState(WELCOME_STYLES.STYLE_1);

  const handleDeleteItem = async (itemId) => {
    if (!auth.currentUser) return;
    
    try {
      setSaving(true);
      
      // Update the UI immediately
      const filteredItems = shopData.items.filter(item => item.id !== itemId);
      
      // Update local state
      setShopData(prev => ({
        ...prev,
        items: filteredItems
      }));
      
      // Get reference to the shop document
      const shopRef = doc(db, 'shops', auth.currentUser.uid);
      
      // Update Firestore directly without fetching first
      await updateDoc(shopRef, {
        items: filteredItems,
        updatedAt: new Date().toISOString()
      });
      
      console.log('Item successfully deleted:', itemId);
    } catch (error) {
      console.error('Error deleting item:', error);
      
      // Revert the local state change if the update failed
      const shopDoc = await getDoc(doc(db, 'shops', auth.currentUser.uid));
      if (shopDoc.exists()) {
        setShopData(shopDoc.data());
      }
    } finally {
      setSaving(false);
    }
  };
  
  useEffect(() => {
    if (shopData?.layout?.tabPosition) {
      setTabPosition(shopData.layout.tabPosition);
    }
  }, [shopData]);

  useEffect(() => {
    const loadShopData = async (userId) => {
      try {
        const shopDoc = await getDoc(doc(db, 'shops', userId));
        if (shopDoc.exists()) {
          const data = shopDoc.data();
          
          // Filter out deleted items
          if (data.items) {
            data.items = data.items.filter(item => !item.deleted);
          }
          
          setShopData(data);
        }
        setIsReady(true);
      } catch (error) {
        console.error('Error loading shop data:', error);
        setIsReady(true);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/auth');
        return;
      }
      loadShopData(user.uid);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Don't render anything until ready
  if (!isReady) {
    return null;
  }

  // In ShopPage.js, inside the component but before the return statement
  const handleUpdateShop = async (updates) => {
    if (!auth.currentUser) return;

    try {
      setSaving(true);
      console.log('Updating shop with:', updates);

      let finalUpdates = { ...updates };

      // Handle profile image upload
      if (updates.profile?.file instanceof File) {
        const file = updates.profile.file;
        const metadata = {
          contentType: file.type || 'image/jpeg',
          cacheControl: 'public,max-age=3600',
          customMetadata: {
            'Access-Control-Allow-Origin': '*'
          }
        };

        const profileRef = ref(
          storage, 
          `shops/${auth.currentUser.uid}/profile/profile-${Date.now()}`
        );

        const snapshot = await uploadBytes(profileRef, file, metadata);
        const imageUrl = await getDownloadURL(snapshot.ref);

        finalUpdates = {
          ...finalUpdates,
          profile: imageUrl
        };
      } 

      // Update Firestore
      const shopRef = doc(db, 'shops', auth.currentUser.uid);
      await updateDoc(shopRef, {
        ...finalUpdates,
        updatedAt: new Date().toISOString()
      }); 

      // Update local state
      setShopData(prev => ({
        ...prev,
        ...finalUpdates
      }));  

      console.log('Shop update successful:', finalUpdates);
    } catch (error) {
      console.error('Error updating shop:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTheme = async (newTheme) => {
    try {
      await handleUpdateShop({ theme: newTheme });
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  const logImageState = (image) => {
    if (!image) return 'null';
    if (typeof image === 'string') return `URL: ${image}`;
    if (image instanceof File) return `File: ${image.name}`;
    if (image?.file instanceof File) return `File Object: ${image.file.name}`;
    return `Unknown type: ${typeof image}`;
  };

  // Handle item updates
  // In ShopPage.js, update handleItemUpdate
  const handleItemUpdate = async (itemId, updates) => {
    if (!auth.currentUser) return;
  
    try {
      setSaving(true);
      console.log('Starting item update:', {
        itemId,
        updates
      });
      
      const currentItem = shopData.items.find(item => item.id === itemId);
      let updatedItem = { ...currentItem, ...updates };
  
      console.log('Item after updates:', updatedItem);
  
      const shopRef = doc(db, 'shops', auth.currentUser.uid);
      const updatedItems = shopData.items.map(item =>
        item.id === itemId ? updatedItem : item
      );
  
      await updateDoc(shopRef, {
        items: updatedItems,
        updatedAt: new Date().toISOString()
      });
  
      console.log('Firestore update successful');
  
      setShopData(prev => ({
        ...prev,
        items: updatedItems
      }));
  
      console.log('Local state updated');
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setSaving(false);
    }
  };
  
    // Save shop data
    const saveShopData = async (updates) => {
      if (!auth.currentUser) return;
      setSaving(true);
      try {
        const shopRef = doc(db, 'shops', auth.currentUser.uid);
        
        // If we're updating items array, properly mark deleted items
        if (updates.items) {
          // Get current shop data to compare items
          const currentShop = await getDoc(shopRef);
          const currentItems = currentShop.data()?.items || [];
          
          // Find deleted items and mark them properly
          const deletedItemIds = currentItems
            .filter(item => !updates.items.find(newItem => newItem.id === item.id))
            .map(item => item.id);
          
          // Update the items array with deleted flags
          updates.items = updates.items.map(item => ({
            ...item,
            deleted: false,
            lastUpdated: new Date().toISOString()
          }));
          
          // Add deleted items with deleted flag
          const deletedItems = currentItems
            .filter(item => deletedItemIds.includes(item.id))
            .map(item => ({
              ...item,
              deleted: true,
              lastUpdated: new Date().toISOString()
            }));
          
          updates.items = [...updates.items, ...deletedItems];
        }
    
        await updateDoc(shopRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        setShopData(prev => ({ ...prev, ...updates }));
      } catch (error) {
        console.error('Error saving shop data:', error);
      } finally {
        setSaving(false);
      }
    };
    

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: 'Item Name',
      price: '',
      description: '',
      category: 'Other',
      zipCode: '',
      images: [null, null, null],
      currentImageIndex: 0
    };

    const updatedItems = [...(shopData.items || []), newItem];
    saveShopData({ items: updatedItems });
  };

  return (
    <ThemeProvider theme={shopData?.theme || DEFAULT_THEME}>
    <PageContainer>      
      <ShopLogoCorner>
        <ShopLogo>
          {shopData?.name || 'MY SHOP'}
        </ShopLogo>
      </ShopLogoCorner>

      <KalKodeCorner>
        <KalKodeLogo onClick={() => navigate('/')}>
          KALKODE
        </KalKodeLogo>
      </KalKodeCorner>  

      <FloatingFontControls>
        <FontSizeButton 
          onClick={() => setShopNameFontSize(prev => Math.min(6, prev + 0.5))}
        >
          <Plus size={16} />
        </FontSizeButton>
        <FontSizeButton 
          onClick={() => setShopNameFontSize(prev => Math.max(1.5, prev - 0.5))}
        >
          <Minus size={16} />
        </FontSizeButton>
      </FloatingFontControls>    

      <TabControlsContainer>
        <TabPositioner
          position="top"
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'home', label: 'Home' },
            { id: 'community', label: 'Community' },
            { id: 'shop', label: 'Shop' }
          ]}
          theme={shopData?.theme}
        />
      </TabControlsContainer>

      <ThemeContainer>
        <ThemeSelector 
          currentTheme={shopData?.theme || DEFAULT_THEME}
          onThemeSelect={(theme) => setShopData(prev => ({ ...prev, theme }))}
          isAuthenticated={true}
          onApplyTheme={handleApplyTheme}
        />
      </ThemeContainer>

        <MainContent>
        {activeTab === 'shop' && (
          <>
            <ShopProfileSection>
            <div className="profile-image">
              {shopData?.profile && typeof shopData.profile === 'string' ? (
                // If we have a URL string, show the image directly
                <img 
                  src={shopData.profile} 
                  alt="Profile" 
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    // Allow changing the image by clicking on it
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      if (e.target.files?.[0]) {
                        handleUpdateShop({ 
                          profile: {
                            file: e.target.files[0],
                            type: e.target.files[0].type
                          }
                        });
                      }
                    };
                    input.click();
                  }}
                />
              ) : (
                // If no image URL, show the EditableImage component
                <EditableImage
                  value={null}
                  onChange={(value) => {
                    console.log('Profile image update:', value);
                    if (value instanceof File) {
                      handleUpdateShop({ 
                        profile: {
                          file: value,
                          type: value.type
                        }
                      });
                    }
                  }}
                  theme={shopData?.theme}
                  round
                  width="150px"
                  height="150px"
                  style={{ 
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              )}
            </div>
            <div className="shop-name-container">
              <EditableText
                value={shopData?.name}
                onChange={(value) => handleUpdateShop({ name: value })}
                placeholder="Shop Name"
                style={{
                  fontSize: `${shopNameFontSize}rem`,
                  maxWidth: '500px',
                  margin: '0 auto'
                }}
              />
            </div>
            <div className="shop-description-container">
              <EditableText
                value={shopData?.description}
                onChange={(value) => handleUpdateShop({ description: value })}
                placeholder="Shop Description"
                multiline={false} 
              />
            </div>
            </ShopProfileSection>

            <AddItemButton onClick={handleAddItem} theme={shopData?.theme}>
                <Plus size={20} />
                Add Item
              </AddItemButton>

            <ItemGrid>
              {shopData?.items?.map(item => (
                <ItemCard key={item.id}>
                  
                  <ItemImageContainer>
                    {uploading[item.id] && (
                      <UploadingOverlay>
                        <LoadingSpinner />
                      </UploadingOverlay>
                    )}
                    <div 
                      className="image-container"
                      onClick={() => {
                        if (!item.images[item.currentImageIndex]) {
                          document.getElementById(`image-upload-${item.id}-${item.currentImageIndex}`).click();
                        }
                      }}
                    >
                      {item.images[item.currentImageIndex] ? (
                        <img 
                          src={item.images[item.currentImageIndex]} 
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            console.error('Image failed to load:', {
                              src: e.target.src,
                              itemId: item.id,
                              currentIndex: item.currentImageIndex
                            });
                          }}
                        />
                      ) : (
                        <div className="placeholder">
                          <Plus size={24} />
                          <span>Upload Image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Only show carousel arrows if there are images */}
                    {item.images.some(img => img) && (
                      <>
                        <button 
                          className="carousel-arrow left"
                          onClick={() => {
                            const newIndex = ((item.currentImageIndex - 1) + 3) % 3;
                            handleItemUpdate(item.id, { currentImageIndex: newIndex });
                          }}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button 
                          className="carousel-arrow right"
                          onClick={() => {
                            const newIndex = (item.currentImageIndex + 1) % 3;
                            handleItemUpdate(item.id, { currentImageIndex: newIndex });
                          }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}

                    {/* Add/Remove button */}
                    {item.images[item.currentImageIndex] && (
                      <button 
                        className="add-image"
                        onClick={() => {
                          const newImages = [...item.images];
                          newImages[item.currentImageIndex] = null;
                          handleItemUpdate(item.id, { images: newImages });
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}

                    <input
                      type="file"
                      id={`image-upload-${item.id}-${item.currentImageIndex}`}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          try {
                            setUploading(prev => ({ ...prev, [item.id]: true }));
                            
                            const file = e.target.files[0];
                            console.log('File selected:', {
                              name: file.name,
                              type: file.type,
                              size: file.size
                            });
                      
                            const storageRef = ref(
                              storage, 
                              `shops/${auth.currentUser.uid}/items/${item.id}/image-${item.currentImageIndex}-${Date.now()}`
                            );
                            
                            const metadata = {
                              contentType: file.type || 'image/jpeg',
                              cacheControl: 'public,max-age=3600'
                            };
                      
                            const snapshot = await uploadBytes(storageRef, file, metadata);
                            const imageUrl = await getDownloadURL(snapshot.ref);
                            
                            console.log('Image uploaded, got URL:', imageUrl);
                      
                            const newImages = [...item.images];
                            newImages[item.currentImageIndex] = imageUrl;
                            
                            console.log('Updating images array:', {
                              oldImages: item.images,
                              newImages: newImages
                            });
                      
                            await handleItemUpdate(item.id, { images: newImages });
                          } catch (error) {
                            console.error('Error uploading image:', error);
                          } finally {
                            setUploading(prev => ({ ...prev, [item.id]: false }));
                          }
                        }
                      }}
                    />
                  </ItemImageContainer>
                    <ItemContent>
                      <div className="editable-text">
                        <EditableText
                          value={item.name}
                          onChange={(value) => handleItemUpdate(item.id, { name: value })}
                          placeholder="Item Name"
                          theme={shopData?.theme}
                        />
                      </div>

                      <div className="editable-text">
                        <EditableText
                          value={item.price}
                          onChange={(value) => handleItemUpdate(item.id, { price: value })}
                          placeholder="Price"
                          theme={shopData?.theme}
                        />
                      </div>

                      <div className="editable-text">
                        <EditableText
                          value={item.description}
                          onChange={(value) => handleItemUpdate(item.id, { description: value })}
                          placeholder="Item Description"
                          multiline
                          theme={shopData?.theme}
                        />
                      </div>

                      <CategorySelect
                        value={item.category || 'Other'}
                        onChange={(e) => handleItemUpdate(item.id, { category: e.target.value })}
                        theme={shopData?.theme}
                      >
                        {ITEM_CATEGORIES.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </CategorySelect>

                      <QuantitySelector 
                        value={parseInt(item.quantity) || 1}
                        onChange={(value) => handleItemUpdate(item.id, { quantity: value })}
                        theme={shopData?.theme}
                        min={0}
                        max={9999}
                      />

                      <AddressInput
                        address={item.address || ''}
                        onAddressChange={(value) => handleItemUpdate(item.id, { 
                          address: value,
                          coordinates: null // Clear coordinates when address changes
                        })}
                        onLocationSelect={(location) => {
                          if (location?.coordinates?.latitude && location?.coordinates?.longitude) {
                            const coords = {
                              lat: location.coordinates.latitude,
                              lng: location.coordinates.longitude
                            };
                            handleItemUpdate(item.id, {
                              address: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
                              coordinates: coords
                            });
                          }
                        }}
                      />
                      <DeleteSection>
                      <DeleteItemButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                      >
                        <Trash2 size={16} />
                        Remove Item
                      </DeleteItemButton>
                      </DeleteSection>
                    </ItemContent>
                </ItemCard>
              ))}
            </ItemGrid>              
            </>
          )}

          {activeTab === 'home' && (
            <div>
              <EditableText
                value={shopData?.mission}
                onChange={(value) => saveShopData({ mission: value })}
                placeholder="Your Shop's Mission"
                multiline
                theme={shopData?.theme}
              />
              {/* Add more home page customization options */}
            </div>
          )}

          {activeTab === 'community' && (
            <div>
              {/* Add community customization options */}
            </div>
          )}
        </MainContent>
      </PageContainer>
    </ThemeProvider>
  );
};

export default ShopPage;