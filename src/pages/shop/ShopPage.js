// src/pages/shop/ShopPage.js - Updated with Manual Save

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import ValidatedEditableText from '../../components/common/ValidatedEditableText';
import { VALIDATION_RULES, validateShopData, validateAllItems } from '../../utils/inputValidation';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import TabPositioner from './components/TabPositioner';
import EditableText from './components/EditableComponents/EditableText';
import EditableImage from './components/EditableComponents/EditableImage';
import { DEFAULT_THEME } from '../../theme/config/themes';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { ChevronUp, ChevronDown, Plus, Minus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Trash2, Save, RotateCcw } from 'lucide-react';
import AddressInput from '../../components/shop/AddressInput';
import ThemeSelector from '../../components/ThemeSelector/ThemeSelector';
import QuantitySelector from '../../components/shop/QuantitySelector';
import { WELCOME_STYLES } from '../../theme/welcomeStyles';
import { signOut } from 'firebase/auth';
import { RefreshCw, Pin, LogOut } from 'lucide-react';
import HomePageEditor from './HomePageEditor';
import { saveHomePageConfig } from '../../firebase/firebaseService';
import {
  NewsletterWidget,
  CountdownWidget,
  TestimonialsWidget,
  GalleryWidget,
  SocialFeedWidget,
  VideoWidget,
  FAQWidget,
  TeamWidget
} from './HomePageWidgets';

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

// Updated styled components for ShopPage.js
// Reuse the existing SaveControlsContainer but make it mobile-friendly

const SaveControlsContainer = styled.div`
  position: fixed;
  z-index: 100;
  display: flex;
  gap: 0.75rem;
  
  /* Mobile: center bottom, above theme selector */
  @media (max-width: 767px) {
    bottom: 6rem;
    left: 50%;
    transform: translateX(-50%);
    flex-direction: row;
    gap: 0.5rem;
  }
  
  /* Tablet: right side */
  @media (min-width: 768px) and (max-width: 1023px) {
    bottom: 8rem;
    right: 1rem;
    flex-direction: column;
  }
  
  /* Desktop: right side */
  @media (min-width: 1024px) {
    bottom: 2rem;
    right: 2rem;
    flex-direction: column;
  }
`;

const SaveButton = styled.button`
  background: ${props => props.hasChanges ? 
    (props.theme?.colors?.accent || '#800000') : 
    'rgba(128, 128, 128, 0.5)'
  };
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 1.5rem;
  font-weight: 600;
  cursor: ${props => props.hasChanges ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: ${props => props.hasChanges ? 
    '0 4px 15px rgba(0, 0, 0, 0.3)' : 
    '0 2px 8px rgba(0, 0, 0, 0.1)'
  };
  font-family: ${props => props.theme?.fonts?.body || 'sans-serif'};
  white-space: nowrap;
  
  @media (max-width: 767px) {
    padding: 0.75rem 1.2rem;
    font-size: 0.85rem;
  }

  @media (min-width: 768px) {
    min-width: 160px;
    justify-content: center;
  }

  &:hover {
    transform: ${props => props.hasChanges ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.hasChanges ? 
      `0 6px 20px ${props.theme?.colors?.accent}4D` : 
      '0 2px 8px rgba(0, 0, 0, 0.1)'
    };
  }

  &:active {
    transform: ${props => props.hasChanges ? 'scale(0.98)' : 'none'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResetButton = styled.button`
  background: transparent;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
  border-radius: 50px;
  padding: 0.8rem 1.2rem;
  font-weight: 500;
  cursor: ${props => props.hasChanges ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: ${props => props.hasChanges ? 1 : 0.5};
  font-family: ${props => props.theme?.fonts?.body || 'sans-serif'};
  white-space: nowrap;
  
  @media (max-width: 767px) {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }

  @media (min-width: 768px) {
    min-width: 160px;
    justify-content: center;
  }

  &:hover {
    background: ${props => props.hasChanges ? 
      `${props.theme?.colors?.accent}20` : 
      'transparent'
    };
    transform: ${props => props.hasChanges ? 'translateY(-1px)' : 'none'};
  }

  &:active {
    transform: ${props => props.hasChanges ? 'scale(0.98)' : 'none'};
  }
`;

const UnsavedChangesIndicator = styled.div`
  position: fixed;
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  z-index: 99;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
  
  /* Mobile: top center below header */
  @media (max-width: 767px) {
    top: 4.5rem;
    left: 50%;
    transform: translateX(-50%);
  }
  
  /* Desktop: left side middle */
  @media (min-width: 768px) {
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
  }

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: ${props => props.show ? 'pulse 2s infinite' : 'none'};
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const ThemeContainer = styled.div`
  position: fixed;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Mobile: bottom center */
  @media (max-width: 767px) {
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }

  /* Desktop: bottom center */
  @media (min-width: 768px) {
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
  }

  & > div > div:nth-child(2) {
    bottom: calc(100% + 0.5rem);
    top: auto;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
`;

// Keep all existing styled components
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
  background: #1a1a1a !important;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '8px'};
  padding: 0.75rem;
  color: #ffffff !important;
  font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  option {
    background: #1a1a1a !important;
    color: #ffffff !important;
    padding: 0.5rem;
  }
  
  option:checked {
    background: ${props => props.theme?.colors?.accent || '#800000'} !important;
    color: #ffffff !important;
  }
`;

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

const Header = styled.header`
  width: 100%;
  height: 60px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => `${props.theme?.colors?.headerBg || 'rgba(0, 0, 0, 0.9)'}F5`};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  position: fixed;
  top: 0;
  z-index: 100;

  @media (min-width: 768px) {
    height: 80px;
    padding: 0 2rem;
  }
`;

const HeaderLogo = styled.div`
  color: ${props => props.theme?.colors?.accent || '#800000'};
  font-family: ${props => props.theme?.fonts?.heading || "'Impact', sans-serif"};
  font-size: 1.4rem;
  letter-spacing: 1px;
  transform: skew(-5deg);
  cursor: pointer;
  flex-shrink: 0;

  @media (min-width: 768px) {
    font-size: 2rem;
    letter-spacing: 2px;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HeaderButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme?.colors?.accent || '#800000'};
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  opacity: 0.8;
  
  &:active {
    transform: scale(0.9);
    opacity: 1;
  }
  
  @media (hover: hover) {
    &:hover {
      opacity: 1;
      background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
    }
  }
  
  &.pinned {
    color: ${props => props.theme?.colors?.accent || '#800000'};
    opacity: 1;
  }
  
  &.spinning {
    animation: spin 0.5s ease-in-out;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  svg {
    width: 20px;
    height: 20px;
    
    @media (min-width: 768px) {
      width: 22px;
      height: 22px;
    }
  }
`;

const HomePageEditorButton = styled.button`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  background: ${props => props.theme?.colors?.accent};
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 100;
  
  &:hover {
    transform: scale(1.1);
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
  padding: 120px 2rem 2rem;
  
  @media (max-width: 768px) {
    padding: 100px 1rem 2rem;
  }
  position: relative;
  z-index: 1;

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

const FloatingFontControls = styled.div`
  position: fixed;
  left: 2rem;
  top: 45%;
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

const HeroBannerWidget = ({ config, theme }) => (
  <div style={{
    height: '400px',
    background: `linear-gradient(135deg, ${theme?.colors?.accent}20 0%, ${theme?.colors?.background} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold'
  }}>
    {config.headline || "Welcome"}
  </div>
);

const ProductCarouselWidget = ({ config, theme, items = [] }) => (
  <div style={{ padding: '2rem 0' }}>
    <h2 style={{ marginBottom: '1.5rem', color: theme?.colors?.accent }}>
      Featured Products
    </h2>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem'
    }}>
      {items.slice(0, config.itemsToShow || 4).map((item, i) => (
        <div key={i} style={{
          background: `${theme?.colors?.surface}80`,
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h4>{item.name}</h4>
          <p>${item.price}</p>
        </div>
      ))}
    </div>
  </div>
);

const StatsWidget = ({ config, theme }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    padding: '3rem'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', color: theme?.colors?.accent }}>100+</div>
      <div>Products</div>
    </div>
  </div>
);

const AnnouncementBar = styled.div`
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: white;
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
`;

const cleanDataForFirestore = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => cleanDataForFirestore(item));
  }
  
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleanedData = {};
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof File) continue;
      if (value === null || value === undefined) continue;
      cleanedData[key] = cleanDataForFirestore(value);
    }
    return cleanedData;
  }
  
  return data;
};

const ShopPage = () => {
  const navigate = useNavigate();
  const [isPinned, setIsPinned] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shopData, setShopData] = useState(null);
  const [originalShopData, setOriginalShopData] = useState(null); // Track original data
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState('shop');
  const [saving, setSaving] = useState(false);
  const [shopNameFontSize, setShopNameFontSize] = useState(2.5);
  const [uploading, setUploading] = useState({});
  const [tabPosition, setTabPosition] = useState('top');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showHomeEditor, setShowHomeEditor] = useState(false);

  // Deep comparison utility
  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  };

  // Check for changes whenever shopData updates
  useEffect(() => {
    if (originalShopData && shopData) {
      const hasChanges = !deepEqual(shopData, originalShopData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [shopData, originalShopData]);

  // Save changes to Firestore
  const handleSave = async () => {
  if (!auth.currentUser || !hasUnsavedChanges) return;

  // Validate before saving
  const shopValidation = validateShopData(shopData);
  const itemsValidation = validateAllItems(shopData.items);
  
  if (!shopValidation.isValid || !itemsValidation.isValid) {
    setValidationErrors({
      shop: shopValidation.errors,
      items: itemsValidation.itemErrors
    });
    
    alert('Please fix validation errors before saving');
    return;
  }

  try {
    setSaving(true);
    console.log('Saving shop data to Firestore...');

    const shopRef = doc(db, 'shops', auth.currentUser.uid);
    const updateData = cleanDataForFirestore({
      ...shopData,
      updatedAt: new Date().toISOString()
    });

    await updateDoc(shopRef, updateData);
    
    setOriginalShopData(JSON.parse(JSON.stringify(shopData)));
    setHasUnsavedChanges(false);
    setValidationErrors({}); // Clear errors
    
    console.log('Shop data saved successfully');
  } catch (error) {
    console.error('Error saving shop data:', error);
  } finally {
    setSaving(false);
  }
};

  // Reset changes to original state
  const handleReset = () => {
    if (originalShopData) {
      setShopData(JSON.parse(JSON.stringify(originalShopData)));
      setHasUnsavedChanges(false);
    }
  };

  // Modified handlers that only update local state
  const handleDeleteItem = (itemId) => {
    const filteredItems = shopData.items.filter(item => item.id !== itemId);
    setShopData(prev => ({
      ...prev,
      items: filteredItems
    }));
  };

  // Theme management
  useEffect(() => {
    const pinnedStyleId = localStorage.getItem('pinnedStyleId');
    
    if (pinnedStyleId && shopData?.theme) {
      const pinnedStyle = Object.values(WELCOME_STYLES).find(
        style => style.id.toString() === pinnedStyleId
      );
      
      if (pinnedStyle) {
        setIsPinned(true);
      }
    }
  }, [shopData?.theme]);

  const refreshTheme = () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    const styles = Object.values(WELCOME_STYLES);
    const otherStyles = styles.filter(style => style.id !== shopData?.theme?.id);
    
    if (otherStyles.length > 0) {
      const randomStyle = otherStyles[Math.floor(Math.random() * otherStyles.length)];
      setShopData(prev => ({ ...prev, theme: randomStyle }));

      if (isPinned) {
        localStorage.removeItem('pinnedStyleId');
        setIsPinned(false);
      }
    }

    setTimeout(() => setIsRefreshing(false), 500);
  };

  const togglePinStyle = () => {
    if (isPinned) {
      localStorage.removeItem('pinnedStyleId');
      setIsPinned(false);

      const styles = Object.values(WELCOME_STYLES).filter(
        style => style.id !== shopData?.theme?.id
      );

      if (styles.length > 0) {
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        setShopData(prev => ({ ...prev, theme: randomStyle }));
      }
    } else {
      localStorage.setItem('pinnedStyleId', shopData?.theme?.id.toString());
      setIsPinned(true);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
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
          setOriginalShopData(JSON.parse(JSON.stringify(data))); // Deep clone
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

  // Local update handlers (no Firestore writes)
  const handleUpdateShop = (updates) => {
    setShopData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleApplyTheme = (newTheme) => {
    setShopData(prev => ({ ...prev, theme: newTheme }));
  };

  // Handle item updates locally only
  const handleItemUpdate = (itemId, updates) => {
    const updatedItems = shopData.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    setShopData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const renderPublicWidget = (widget) => {
      const props = {
        config: widget.config,
        theme: shopData?.theme
      };
  
      switch (widget.type) {
        case 'hero-banner':
          return <HeroBannerWidget {...props} />;
        case 'product-carousel':
          return <ProductCarouselWidget {...props} items={shopData?.items || []} />;
        case 'stats-dashboard':
          return <StatsWidget {...props} stats={shopData?.stats} />;
        case 'newsletter':
          return <NewsletterWidget {...props} />;
        case 'countdown-timer':
          return <CountdownWidget {...props} />;
        case 'testimonials':
          return <TestimonialsWidget {...props} />;
        case 'gallery':
          return <GalleryWidget {...props} />;
        case 'social-feed':
          return <SocialFeedWidget {...props} />;
        case 'video-section':
          return <VideoWidget {...props} />;
        case 'faq-section':
          return <FAQWidget {...props} />;
        case 'team-section':
          return <TeamWidget {...props} />;
        case 'announcement-bar':
          return <AnnouncementBar {...props} />;
        default:
          return null;
      }
    };

  const renderHomePageWidgets = () => {
    if (!shopData?.homeWidgets || shopData.homeWidgets.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 1rem',
          background: `${shopData?.theme?.colors?.surface}50`,
          borderRadius: '12px'
        }}>
          <h2>Welcome to {shopData?.name || 'Our Shop'}</h2>
          <p>{shopData?.mission || 'Start customizing your home page by adding widgets.'}</p>
        </div>
      );
    }

    return shopData.homeWidgets
      .filter(widget => widget.visible)
      .map(widget => (
        <div key={widget.id} style={{ marginBottom: '2rem' }}>
          {renderPublicWidget(widget)}
        </div>
      ));
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
      currentImageIndex: 0,
      quantity: 1
    };

    const updatedItems = [...(shopData.items || []), newItem];
    setShopData(prev => ({ ...prev, items: updatedItems }));
  };

  // Handle image uploads (these still need to upload to storage)
  const handleImageUpload = async (itemId, imageIndex, file) => {
    try {
      setUploading(prev => ({ ...prev, [itemId]: true }));
      
      const storageRef = ref(
        storage, 
        `shops/${auth.currentUser.uid}/items/${itemId}/image-${imageIndex}-${Date.now()}`
      );
      
      const metadata = {
        contentType: file.type || 'image/jpeg',
        cacheControl: 'public,max-age=3600'
      };

      const snapshot = await uploadBytes(storageRef, file, metadata);
      const imageUrl = await getDownloadURL(snapshot.ref);
      
      // Update local state only
      const currentItem = shopData.items.find(item => item.id === itemId);
      const newImages = [...currentItem.images];
      newImages[imageIndex] = imageUrl;
      
      handleItemUpdate(itemId, { images: newImages });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  return (
    <ThemeProvider theme={shopData?.theme || DEFAULT_THEME}>
      <PageContainer>      
        <Header theme={shopData?.theme}>
          <HeaderLogo onClick={() => navigate('/')} theme={shopData?.theme}>
            {shopData?.name || 'MY SHOP'}
          </HeaderLogo>

          <HeaderControls>
            <HeaderButton 
              onClick={refreshTheme}
              theme={shopData?.theme}
              className={isRefreshing ? "spinning" : ""}
              title="Random theme"
            >
              <RefreshCw size={20} />
            </HeaderButton>
            
            <HeaderButton 
              onClick={togglePinStyle} 
              theme={shopData?.theme}
              className={isPinned ? "pinned" : ""}
              title={isPinned ? "Unpin theme" : "Pin theme"}
            >
              <Pin size={20} fill={isPinned ? shopData?.theme?.colors?.accent : "none"} />
            </HeaderButton>
            
            <HeaderButton 
              onClick={handleLogout}
              theme={shopData?.theme}
              title="Logout"
            >
              <LogOut size={20} />
            </HeaderButton>
          </HeaderControls>
        </Header>

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

        {/* Unsaved Changes Indicator */}
        <UnsavedChangesIndicator show={hasUnsavedChanges} theme={shopData?.theme}>
          <span>Unsaved changes</span>
        </UnsavedChangesIndicator>

        {/* Save Controls */}
        <SaveControlsContainer>
          <SaveButton
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saving}
            hasChanges={hasUnsavedChanges}
            theme={shopData?.theme}
          >
            {saving ? <LoadingSpinner /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </SaveButton>
          
          <ResetButton
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
            hasChanges={hasUnsavedChanges}
            theme={shopData?.theme}
          >
            <RotateCcw size={18} />
            Reset
          </ResetButton>
        </SaveControlsContainer>

        <MainContent>
          {activeTab === 'shop' && (
            <>
              <ShopProfileSection>
                <div className="profile-image">
                  {shopData?.profile && typeof shopData.profile === 'string' ? (
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
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (e) => {
                          if (e.target.files?.[0]) {
                            try {
                              const file = e.target.files[0];
                              const profileRef = ref(
                                storage, 
                                `shops/${auth.currentUser.uid}/profile/profile-${Date.now()}`
                              );
                              const metadata = {
                                contentType: file.type || 'image/jpeg',
                                cacheControl: 'public,max-age=3600'
                              };
                              const snapshot = await uploadBytes(profileRef, file, metadata);
                              const imageUrl = await getDownloadURL(snapshot.ref);
                              handleUpdateShop({ profile: imageUrl });
                            } catch (error) {
                              console.error('Error uploading profile image:', error);
                            }
                          }
                        };
                        input.click();
                      }}
                    />
                  ) : (
                    <EditableImage
                      value={null}
                      onChange={async (value) => {
                        if (value instanceof File) {
                          try {
                            const profileRef = ref(
                              storage, 
                              `shops/${auth.currentUser.uid}/profile/profile-${Date.now()}`
                            );
                            const metadata = {
                              contentType: value.type || 'image/jpeg',
                              cacheControl: 'public,max-age=3600'
                            };
                            const snapshot = await uploadBytes(profileRef, value, metadata);
                            const imageUrl = await getDownloadURL(snapshot.ref);
                            handleUpdateShop({ profile: imageUrl });
                          } catch (error) {
                            console.error('Error uploading profile image:', error);
                          }
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
                  <ValidatedEditableText
                    value={shopData?.name}
                    onChange={(value) => handleUpdateShop({ name: value })}
                    placeholder="Shop Name"
                    validationRules={VALIDATION_RULES.shop.name}
                    style={{
                      fontSize: `${shopNameFontSize}rem`,
                      maxWidth: '500px',
                      margin: '0 auto'
                    }}
                  />
                </div>
                <div className="shop-description-container">
                  <ValidatedEditableText
                    value={shopData?.description}
                    onChange={(value) => handleUpdateShop({ description: value })}
                    placeholder="Shop Description"
                    validationRules={VALIDATION_RULES.shop.description}
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
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageUpload(item.id, item.currentImageIndex, e.target.files[0]);
                          }
                        }}
                      />
                    </ItemImageContainer>

                    <ItemContent>
                      <div className="editable-text">
                        <ValidatedEditableText
                          value={item.name}
                          onChange={(value) => handleItemUpdate(item.id, { name: value })}
                          placeholder="Item Name"
                          theme={shopData?.theme}
                        />
                      </div>

                      <div className="editable-text">
                        <ValidatedEditableText
                          value={item.price}
                          onChange={(value) => handleItemUpdate(item.id, { price: value })}
                          placeholder="Price"
                          theme={shopData?.theme}
                        />
                      </div>

                      <div className="editable-text">
                        <ValidatedEditableText
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
                          coordinates: null
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
          <>
            {showHomeEditor ? (
              <HomePageEditor 
                shopData={shopData}
                theme={shopData?.theme}
                onSave={async (data) => {
                  await saveHomePageConfig(auth.currentUser.uid, data.homeWidgets);
                  setShopData(prev => ({ ...prev, ...data }));
                  setShowHomeEditor(false);
                }}
              />
            ) : (
              <div>
                {/* Existing home content */}
                <button 
                  onClick={() => setShowHomeEditor(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: shopData?.theme?.colors?.accent,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '2rem'
                  }}
                >
                  Edit Home Page Layout
                </button>
              </div>
            )}
          </>
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