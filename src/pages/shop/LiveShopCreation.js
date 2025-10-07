// src/pages/shop/LiveShopCreation.js - Mobile Optimized

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import ValidatedEditableText from '../../components/common/ValidatedEditableText';
import { VALIDATION_RULES, validateShopData, validateAllItems } from '../../utils/inputValidation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Plus,
  Minus, 
  Heart,
  MessageCircle,
  Users,
  RefreshCw, 
  Pin,
  X,
  ChevronDown,
  ChevronUp,
  Store,
  Home,
  LogOut,
  Check,
  Package
} from 'lucide-react';
import { useTempStore } from '../../contexts/TempStoreContext';
import EditableText from './components/EditableComponents/EditableText';
import EditableImage from './components/EditableComponents/EditableImage';
import EditableItem from './components/EditableComponents/EditableItem';
import TabPositioner from './components/TabPositioner';
import { DEFAULT_THEME } from '../../theme/config/themes';
import ThemeSelector from '../../components/ThemeSelector/ThemeSelector';
import AddressInput from '../../components/shop/AddressInput';
import { WELCOME_STYLES } from '../../theme/welcomeStyles';
import QuantitySelector from '../../components/shop/QuantitySelector';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

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

// Mobile-first styled components
const PageContainer = styled.div.attrs({ className: 'page-container' })`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#000000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  position: relative;
  overflow-x: hidden;
  
  /* Mobile-optimized background effects */
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: ${props => props.theme?.colors?.backgroundGradient || 'radial-gradient(circle at 20% 30%, rgba(128, 0, 0, 0.2) 0%, transparent 50%)'};
    opacity: 0.8;
    animation: ${props => props.theme?.animations?.backgroundAnimation || 'galaxySwirl 30s linear infinite'};
  }

  /* Simplified stars for mobile performance */
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(circle 1px, ${props => props.theme?.colors?.text || '#FFF'} 1px, transparent 1px);
    background-size: 100px 100px;
    opacity: 0.05;
    
    @media (min-width: 768px) {
      background-size: 200px 200px;
      opacity: 0.1;
    }
  }

  @keyframes galaxySwirl {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Add after existing styled components (around line 800)
const ShopNameInputContainer = styled.div`
  width: 100%;
  margin: 0.5rem 0;
  position: relative;
`;

// In LiveShopCreation.js, update the ShopNameInput styled component (around line 250)

const ShopNameInput = styled.input`
  width: 100%;
  text-align: center;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.isError ? '#ff4444' : `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
  font-size: ${props => Math.min(props.fontSize || 2.5, 2)}rem;
  font-family: ${props => props.theme?.fonts?.heading};
  color: ${props => props.theme?.colors?.accent || '#800000'};
  outline: none;
  padding: 0.5rem;
  transition: all 0.3s ease;
  caret-color: ${props => props.theme?.colors?.accent || '#800000'}; /* ADD THIS LINE */
  
  @media (min-width: 768px) {
    font-size: ${props => props.fontSize || '2.5rem'};
  }

  &:focus {
    border-bottom-color: ${props => props.isError ? '#ff4444' : props.theme?.colors?.accent || '#800000'};
    border-bottom-width: 3px;
  }

  &::placeholder {
    color: ${props => `${props.theme?.colors?.accent}60` || 'rgba(128, 0, 0, 0.4)'};
  }

  /* ADD BLINKING CURSOR ANIMATION */
  @keyframes blink {
    0%, 49% { border-right: 2px solid ${props => props.theme?.colors?.accent || '#800000'}; }
    50%, 100% { border-right: 2px solid transparent; }
  }
  
  &:focus {
    animation: blink 1s step-end infinite;
  }
`;

const ShopNameError = styled.div`
  color: #ff4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  text-align: center;
  font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
  min-height: 20px;
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ShopNameSuccess = styled.div`
  color: #4CAF50;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  text-align: center;
  font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
  min-height: 20px;
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
  }
`;

// REPLACE Header with:
const Header = styled.header`
  width: 100%;
  height: 60px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.theme?.colors?.headerBg || 'rgba(0, 0, 0, 1)'};
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  position: fixed;
  top: 0;
  z-index: 100;

  @media (min-width: 768px) {
    height: 80px;
    padding: 0 2rem;
  }
`;

// ADD these new styled components after Header:
const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HeaderTabButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.active ? 
    props.theme?.colors?.accent : 
    `${props.theme?.colors?.text}60`};
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  
  &:active {
    transform: scale(0.9);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: ${props => props.active ? '80%' : '0'};
    height: 3px;
    background: ${props => props.theme?.colors?.accent || '#800000'};
    border-radius: 2px 2px 0 0;
    transition: width 0.3s ease;
  }
  
  @media (hover: hover) {
    &:hover {
      color: ${props => props.theme?.colors?.accent};
      opacity: 1;
    }
  }
  
  svg {
    width: 22px;
    height: 22px;
    
    @media (min-width: 768px) {
      width: 24px;
      height: 24px;
    }
  }
`;

// UPDATE FloatingControls (add if doesn't exist):
const FloatingControls = styled.div`
  position: fixed;
  bottom: 100px;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 90;
  
  @media (min-width: 768px) {
    bottom: 2rem;
  }
  
  @media (max-width: 767px) {
    right: 1.5rem;
    gap: 0.75rem;
  }
`;

const FloatingButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: ${props => props.theme?.colors?.background || '#FFFFFF'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => props.isPinned && `
    background: ${props.theme?.colors?.background || '#000000'};
    color: ${props.theme?.colors?.accent || '#800000'};
    border: 2px solid ${props.theme?.colors?.accent || '#800000'};
  `}
  
  @media (max-width: 767px) {
    width: 48px;
    height: 48px;
  }
  
  &:active {
    transform: scale(0.9);
  }
  
  @media (hover: hover) {
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px ${props => `${props.theme?.colors?.accent}60` || 'rgba(128, 0, 0, 0.4)'};
    }
  }
  
  &.spinning {
    animation: spin 0.5s ease-in-out;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  svg {
    width: 24px;
    height: 24px;
    
    @media (max-width: 767px) {
      width: 20px;
      height: 20px;
    }
  }
`;

const EditModal = styled.div`
  display: none;

  @media (max-width: 767px) {
    display: flex;
    position: fixed;
    top: 95px; /* Start 1 inch below tab buttons (assuming tabs are around 60px + header 80px) */
    left: 0;
    right: 0;
    bottom: 30px; /* 1 inch from bottom (96px = 1 inch) */
    background: rgba(0, 0, 0, 0.9);
    align-items: center;
    justify-content: center;
    z-index: 999; /* Changed from 1000 to be below save button */
    padding: 1rem;
    overflow: hidden;
  }
`;

const EditModalContent = styled.div`
  background: ${props => props.theme?.colors?.background || '#000000'};
  border: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  height: 100%; /* Take full available height */
  display: flex;
  flex-direction: column;
  position: relative;
  margin: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

// Add new action buttons for the image overlay
const ImageActionButtons = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem;
  z-index: 10;
`;

const ImageActionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &.check {
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.8)'}E5`};
    color: #4CAF50;
    
    &:active {
      background: #4CAF50;
      color: white;
      transform: scale(0.95);
    }
  }
  
  &.close {
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.8)'}E5`};
    color: #ff4444;
    
    &:active {
      background: #ff4444;
      color: white;
      transform: scale(0.95);
    }
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const EditModalImageSection = styled.div`
  height: 50%;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
`;

const EditModalBody = styled.div`
  height: 50%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.colors?.accent || '#800000'};
    border-radius: 2px;
  }
`;

const SaveButtonContainer = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1000; /* Changed from 100 to 1000 to be above modal */
  
  @media (min-width: 768px) {
    bottom: 2rem;
    right: 2rem;
  }
`;

const ModalButtons = styled.div`
  position: sticky;
  bottom: 0;
  background: ${props => props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'};
  padding: 0.8rem 1.2rem; /* Changed from 1rem 1.5rem */
  border-top: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  display: flex;
  gap: 0.8rem; /* Changed from 1rem */
  justify-content: flex-end;
  z-index: 1;
`;

const CancelButton = styled.button`
  background: transparent;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  border: 1px solid ${props => `${props.theme?.colors?.accent}60` || 'rgba(255, 255, 255, 0.4)'};
  padding: 0.6rem 1.2rem; /* Changed from 0.75rem 1.5rem */
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem; /* Added */

  &:active {
    background: ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
    transform: scale(0.98);
  }
`;

// Add these new components
const TemplateCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 280px;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.colors?.accent};
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);

    .delete-button {
      opacity: 1;
    }
  }

  @media (max-width: 640px) {
    min-height: 260px;
  }
`;

const TemplateImageContainer = styled.div`
  position: relative;
  height: 180px;
  overflow: hidden;
  background: ${props => `${props.theme?.colors?.background || '#000000'}50`};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    color: ${props => props.theme?.colors?.text || '#fff'};
    opacity: 0.3;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  @media (max-width: 640px) {
    height: 160px;
  }
`;

const TemplateContent = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .item-name {
    font-size: 1rem;
    font-weight: 600;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    margin-bottom: 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-price {
    font-size: 1.2rem;
    font-weight: bold;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    text-align: right;
  }

  .empty-text {
    font-size: 0.9rem;
    color: ${props => `${props.theme?.colors?.text}60` || 'rgba(255, 255, 255, 0.4)'};
    font-style: italic;
  }
`;

const Logo = styled.div`
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

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 1rem 100px 1rem; /* Reduced from 80px by 20% */
  position: relative;
  z-index: 1;
  
  @media (min-width: 768px) {
    padding: 80px 2rem 2rem 2rem; /* Reduced from 6rem (96px) to 80px - approximately 20% less */
  }
`;

const ShopProfileSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
  margin: 1.5rem auto 3rem; /* Reduced from 2rem and 4rem */
  padding: 0.8rem; /* Reduced from 1rem */

  @media (min-width: 768px) {
    padding: 1.5rem; /* Reduced from 2rem */
  }

  .profile-image {
    margin-bottom: 1rem;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.1);
    border: 3px solid ${props => props.theme?.colors?.accent || '#800000'};
    box-shadow: 0 0 20px ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
    
    @media (min-width: 768px) {
      width: 150px;
      height: 150px;
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
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
      font-size: ${props => Math.min(props.fontSize || 2.5, 2)}rem;
      font-family: ${props => props.theme?.fonts?.heading};
      color: ${props => props.theme?.colors?.accent || '#800000'};
      outline: none;
      padding: 0.5rem;
      
      @media (min-width: 768px) {
        font-size: ${props => props.fontSize || '2.5rem'};
      }

      &:focus {
        color: ${props => props.theme?.colors?.accent || '#800000'};
      }

      &::placeholder {
        color: ${props => `${props.theme?.colors?.accent}80` || 'rgba(128, 0, 0, 0.5)'};
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
      font-size: 1rem;
      font-family: ${props => props.theme?.fonts?.body};
      color: ${props => props.theme?.colors?.text};
      opacity: 0.8;
      outline: none;
      padding: 0.5rem;
      resize: none;
      min-height: 60px;

      @media (min-width: 768px) {
        font-size: 1.1rem;
      }

      &:focus {
        opacity: 1;
      }

      &::placeholder {
        color: ${props => props.theme?.colors?.text};
        opacity: 0.5;
      }
    }
  }
`;

// View toggle container
const ViewToggleContainer = styled.div`
  position: fixed;
  bottom: 1rem;
  left: 24%;
  transform: translateX(-50%);
  z-index: 90;
  display: flex;
  background: ${props => `${props.theme?.colors?.background || '#000000'}E5`};
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.4)'};
  padding: 0.25rem;
  
  @media (min-width: 768px) {
    bottom: 2rem;
  }
`;

const ViewToggleButton = styled.button`
  background: ${props => props.active ? props.theme?.colors?.accent || '#800000' : 'transparent'};
  border: none;
  color: ${props => props.active ? 'white' : props.theme?.colors?.text || '#FFFFFF'};
  padding: 0.5rem 1rem;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
`;

// Mobile-friendly grid container
const ItemsContainer = styled.div`
  margin-top: 2rem;
`;

// CHANGE 3: Update ItemCard styled component (around line 346)
// REPLACE the entire ItemCard component with:
const ItemCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  position: relative;
  transition: all 0.3s;
  width: 100%;
  min-width: 320px;

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.colors?.accent};
  }
`;

const ItemImageContainer = styled.div`
  position: relative;
  height: 250px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => `${props.theme?.colors?.background || '#000000'}50`};

  @media (min-width: 768px) {
    height: 280px;
  }

  .image-container {
    width: 100%;
    height: 100%;
    position: relative;
    touch-action: pan-y;
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
    opacity: 0.8;
    transition: all 0.3s ease;

    @media (max-width: 767px) {
      width: 28px;
      height: 28px;
      opacity: 0.9;
      
      &:active {
        transform: translateY(-50%) scale(0.9);
      }
    }

    &:hover {
      background: ${props => `${props.theme?.colors?.accent}40` || 'rgba(0, 0, 0, 0.7)'};
      opacity: 1;
    }

    &.left {
      left: 10px;
    }

    &.right {
      right: 10px;
    }
  }

  .image-dots {
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.25rem;
    z-index: 2;
    
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${props => props.theme?.colors?.text || '#FFFFFF'};
      opacity: 0.3;
      transition: opacity 0.3s ease;
      
      &.active {
        opacity: 1;
      }
    }
  }
`;

const ItemContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  @media (min-width: 768px) {
    padding: 1.5rem;
    gap: 1rem;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  cursor: pointer;
  
  h4 {
    margin: 0;
    font-size: 1rem;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    
    @media (min-width: 768px) {
      font-size: 1.1rem;
    }
  }
`;

const ExpandButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme?.colors?.accent || '#800000'};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.9);
  }
`;

const ItemDetails = styled.div`
  max-height: ${props => props.expanded ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  
  .details-content {
    padding-top: ${props => props.expanded ? '1rem' : '0'};
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 10;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
    background: rgba(255, 0, 0, 0.5);
  }
`;

const AddItemButton = styled.button`
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: white;
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
  width: 100%;
  max-width: 300px;

  @media (min-width: 768px) {
    width: auto;
    max-width: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px ${props => `${props.theme?.colors?.accent}60` || 'rgba(128, 0, 0, 0.4)'};
  }

  &:active {
    transform: translateY(1px);
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
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  option {
    background: #1a1a1a !important;
    color: #ffffff !important;
    padding: 0.5rem;
  }
`;


const ActionButton = styled.button`
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: ${props => props.theme?.fonts?.body || 'sans-serif'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  @media (max-width: 767px) {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TabControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
  padding: 0 1rem;
  
  @media (min-width: 768px) {
    margin: 3rem 0;
    padding: 0;
  }
`;

const GlobalStyles = createGlobalStyle`
  .ping {
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: #800000;
    pointer-events: none;
    
    /* Disable on mobile for performance */
    @media (max-width: 767px) {
      display: none;
    }
  }

  .ping::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200px;
    height: 200px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(128, 0, 0, 0.4) 0%, transparent 70%);
    animation: ping 2s ease-out forwards;
  }

  @keyframes ping {
    0% {
      width: 0px;
      height: 0px;
      opacity: 1;
    }
    100% {
      width: 200px;
      height: 200px;
      opacity: 0;
    }
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  
  @media (min-width: 480px) {
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
  
  @media (min-width: 768px) {
    gap: 2rem;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }

  /* Mobile template card grid - 2 items per row */
  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr); /* Changed from repeat(3, 1fr) */
    gap: 0.75rem;
    padding: 0 0.5rem;
  }
`;

const MobileTemplateImageContainer = styled.div`
  position: relative;
  height: 120px;
  overflow: hidden;
  background: ${props => `${props.theme?.colors?.background || '#000000'}50`};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    color: ${props => props.theme?.colors?.text || '#fff'};
    opacity: 0.3;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;

    svg {
      width: 24px;
      height: 24px;
    }

    span {
      font-size: 0.75rem; /* Changed from 0.7rem and made slightly larger */
      font-weight: 500; /* Added for better readability */
    }
  }

  .mobile-carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.7)'}DD`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}40` || 'rgba(255, 255, 255, 0.2)'};
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme?.colors?.text || 'white'};
    cursor: pointer;
    z-index: 3;
    opacity: 0.8;
    transition: all 0.2s ease;

    &:active {
      opacity: 1;
      transform: translateY(-50%) scale(0.9);
      background: ${props => props.theme?.colors?.accent || '#800000'};
    }

    &.left {
      left: 0.25rem;
    }

    &.right {
      right: 0.25rem;
    }

    svg {
      width: 12px;
      height: 12px;
    }
  }

  .image-dots {
    position: absolute;
    bottom: 0.25rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.2rem;
    z-index: 2;
    
    .dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: ${props => props.theme?.colors?.text || '#FFFFFF'};
      opacity: 0.3;
      transition: opacity 0.3s ease;
      
      &.active {
        opacity: 1;
      }
    }
  }
`;

// Mobile Template Card (only shows on mobile)
const MobileTemplateCard = styled.div`
  display: none;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    background: ${props => props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'};
    border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
    overflow: hidden;
    border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;
    min-height: 200px;

    &:active {
      transform: scale(0.98);
      border-color: ${props => props.theme?.colors?.accent};
    }
  }
`;

const MobileTemplateContent = styled.div`
  padding: 0.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .item-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    margin-bottom: 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
  }

  .item-price {
    font-size: 0.85rem;
    font-weight: bold;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    text-align: right;
  }

  .empty-text {
    font-size: 0.7rem;
    color: ${props => `${props.theme?.colors?.text}60` || 'rgba(255, 255, 255, 0.4)'};
    font-style: italic;
  }
`;

const MobileDeleteButton = styled.button`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.7)'}DD`};
  border: 1px solid ${props => `${props.theme?.colors?.accent}60` || 'rgba(255, 255, 255, 0.3)'};
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff4444;
  cursor: pointer;
  z-index: 4;
  opacity: 0.9;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.9);
    background: ${props => props.theme?.colors?.accent || '#800000'};
    color: white;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;


// Desktop card - hide on mobile
const DesktopItemCard = styled(ItemCard)`
  @media (max-width: 767px) {
    display: none;
  }
`;

// Main Component
const LiveShopCreation = () => {
  const navigate = useNavigate();
  const { saveTempStore } = useTempStore();
  const { isAuthenticated } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedTheme, setSelectedTheme] = useState(WELCOME_STYLES.STYLE_1);
  const [shopNameFontSize, setShopNameFontSize] = useState(2.5);
  const [isPinned, setIsPinned] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [validationErrors, setValidationErrors] = useState({});
  const [editingItem, setEditingItem] = useState(null);

  // Add these new state variables at the top of LiveShopCreation component (around line 1000)
  const [shopNameError, setShopNameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const [shopData, setShopData] = useState({
    name: 'MyBrandName', // ADD DEFAULT NAME HERE
    description: '',
    profile: null,
    mission: '',
    items: [{
      id: Date.now().toString(),
      name: 'MyItemName',
      price: '',
      description: '',
      category: 'Other',
      images: [null, null, null],
      currentImageIndex: 0,
      address: '',
      coordinates: null,
      tags: [],
      quantity: 1
    }],
    layout: {
      namePosition: 'left',
      tabPosition: 'top'
    }
  });

  // Add this function to check username availability
  // UPDATE checkUsernameAvailability function (around line 1050)
const checkUsernameAvailability = async (shopName) => {
  // Skip check for empty or default names
  if (!shopName || shopName.trim() === '' || shopName === 'MyBrandName') {
    setShopNameError('');
    setUsernameAvailable(null);
    return;
  }

  setCheckingUsername(true);
  setShopNameError('');
  setUsernameAvailable(null);

  try {
    // Generate potential username from shop name
    const potentialUsername = shopName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);

    if (!potentialUsername) {
      setShopNameError('Shop name must contain letters or numbers');
      setUsernameAvailable(false);
      setCheckingUsername(false);
      return;
    }

    // Check if username exists
    const { usernameExists } = await import('../../firebase/firebaseService');
    const exists = await usernameExists(potentialUsername);

    if (exists) {
      setShopNameError('This shop name is already taken');
      setUsernameAvailable(false);
    } else {
      setUsernameAvailable(true);
    }
  } catch (error) {
    console.error('Error checking username:', error);
    setShopNameError('Error checking availability');
    setUsernameAvailable(false);
  } finally {
    setCheckingUsername(false);
  }
};

  // Add debounced username check
  // UPDATE the debounced username check useEffect (around line 1100)
useEffect(() => {
  // Don't check on initial mount or if name is the default placeholder
  if (!shopData?.name || shopData.name === 'MyBrandName') {
    setShopNameError('');
    setUsernameAvailable(null);
    return;
  }

  const timer = setTimeout(() => {
    checkUsernameAvailability(shopData.name);
  }, 500); // Check 500ms after user stops typing

  return () => clearTimeout(timer);
}, [shopData?.name]); // Add optional chaining


  

  // Add this useEffect for browser back button handling
  useEffect(() => {
    const handlePopState = (event) => {
      if (editingItem) {
        event.preventDefault();
        setEditingItem(null);
        // Push state again so user doesn't accidentally leave the page
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // Push initial state when modal opens
    if (editingItem) {
      window.history.pushState(null, '', window.location.pathname);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [editingItem]);

  // Add these handler functions inside your component
  const handleMobileNextImage = (e, itemId) => {
    e.stopPropagation();
    const item = shopData.items.find(i => i.id === itemId);
    if (item && item.images) {
      const validImages = item.images.filter(Boolean);
      if (validImages.length > 1) {
        const currentIndex = item.currentImageIndex || 0;
        const newIndex = (currentIndex + 1) % validImages.length;
        handleItemUpdate(itemId, { currentImageIndex: newIndex });
      }
    }
  };

  const handleMobilePrevImage = (e, itemId) => {
    e.stopPropagation();
    const item = shopData.items.find(i => i.id === itemId);
    if (item && item.images) {
      const validImages = item.images.filter(Boolean);
      if (validImages.length > 1) {
        const currentIndex = item.currentImageIndex || 0;
        const newIndex = (currentIndex - 1 + validImages.length) % validImages.length;
        handleItemUpdate(itemId, { currentImageIndex: newIndex });
      }
    }
  };

  // Theme management
  useEffect(() => {
    const pinnedStyleId = localStorage.getItem('pinnedStyleId');
    
    if (pinnedStyleId) {
      const pinnedStyle = Object.values(WELCOME_STYLES).find(
        style => style.id.toString() === pinnedStyleId
      );

      if (pinnedStyle) {
        setSelectedTheme(pinnedStyle);
        setIsPinned(true);
        return;
      }
    }

    const styles = Object.values(WELCOME_STYLES);
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    setSelectedTheme(randomStyle);
  }, []);

  const refreshTheme = () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    const styles = Object.values(WELCOME_STYLES);
    const otherStyles = styles.filter(style => style.id !== selectedTheme.id);
    
    if (otherStyles.length > 0) {
      const randomStyle = otherStyles[Math.floor(Math.random() * otherStyles.length)];
      setSelectedTheme(randomStyle);

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
        style => style.id !== selectedTheme.id
      );

      if (styles.length > 0) {
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        setSelectedTheme(randomStyle);
      }
    } else {
      localStorage.setItem('pinnedStyleId', selectedTheme.id.toString());
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

  // Item management
  const handleShopDataChange = (field, value) => {
    setShopData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemAdd = () => {
    const newItem = {
      id: Date.now().toString(),
      name: 'MyItemName',
      price: '',
      description: '',
      category: 'Other',
      images: [null, null, null],
      currentImageIndex: 0,
      address: '',
      coordinates: null,
      tags: [],
      quantity: 1
    };

    // Add to beginning instead of end
    setShopData(prev => ({
      ...prev,
      items: [newItem, ...prev.items]
    }));

    // Auto-expand on desktop
    if (window.innerWidth >= 768) {
      setExpandedItems(new Set([newItem.id]));
    }
  };

  const handleItemUpdate = (itemId, updates) => {
    setShopData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));
  };

  const handleItemDelete = (itemId) => {
    setShopData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const toggleItemExpansion = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Update handleSave function (around line 1200)
  // UPDATE handleSave function in LiveShopCreation.js (around line 1200)
const handleSave = async () => {
  // Check if shop name is still default or empty
  let finalShopName = shopData.name;
  
  if (!finalShopName || finalShopName === 'MyBrandName') {
    const adjectives = ['Cool', 'Great', 'Super', 'Amazing', 'Awesome', 'Epic', 'Prime', 'Elite'];
    const nouns = ['Shop', 'Store', 'Market', 'Bazaar', 'Outlet', 'Hub', 'Spot', 'Place'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    
    finalShopName = `${randomAdjective}${randomNoun}${randomNumber}`;
  }

  if (shopNameError || usernameAvailable === false) {
    alert('Please choose a different shop name - this one is already taken');
    return;
  }

  const shopValidation = validateShopData({ ...shopData, name: finalShopName });
  const itemsValidation = validateAllItems(shopData.items);

  if (!shopValidation.isValid || !itemsValidation.isValid) {
    setValidationErrors({
      shop: shopValidation.errors,
      items: itemsValidation.itemErrors
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert('Please fix validation errors before saving');
    return;
  }

  // Prepare data with proper profile handling
  const dataToSave = {
    ...shopData,
    name: finalShopName,
    theme: selectedTheme,
    layout: {
      namePosition: shopData.layout.namePosition,
      tabPosition: 'top',
      nameSize: shopNameFontSize
    },
    createdAt: new Date().toISOString()
  };

  // Handle profile image - ensure it's in the correct format
  if (shopData.profile) {
    if (typeof shopData.profile === 'string') {
      // Already a URL
      dataToSave.profile = shopData.profile;
    } else if (shopData.profile.file) {
      // File object with preview
      dataToSave.profile = {
        file: shopData.profile.file,
        preview: shopData.profile.preview,
        type: shopData.profile.type,
        name: shopData.profile.name
      };
    }
  }

  // Generate username
  if (dataToSave.name) {
    try {
      const { generateUsername } = await import('../../firebase/firebaseService');
      dataToSave.username = await generateUsername(dataToSave.name);
    } catch (error) {
      console.error('Error generating username:', error);
      dataToSave.username = dataToSave.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20) || 'shop';
    }
  }

  console.log('Saving data with profile:', dataToSave.profile); // Debug log

  saveTempStore(dataToSave);

  navigate('/auth', {
    state: { 
      mode: 'signup', 
      tempData: dataToSave 
    }
  });
};

  const renderShopView = () => (
    <MainContent>
      <ShopProfileSection fontSize={shopNameFontSize}>
        <div className="profile-image">
          <EditableImage
            value={shopData.profile}
            onChange={(value) => handleShopDataChange('profile', value)}
            theme={selectedTheme}
            round
            width="100%"
            height="100%"
          />
        </div>
        <div className="shop-name-container">
          <ShopNameInputContainer>
            <ShopNameInput
              value={shopData?.name || ''} // Add optional chaining and fallback
              onChange={(e) => {
                handleShopDataChange('name', e.target.value);
              }}
              placeholder="MyBrandName*" // Show asterisk in placeholder
              fontSize={shopNameFontSize}
              theme={selectedTheme}
              isError={!!shopNameError}
            />
            {checkingUsername && (
              <ShopNameError theme={selectedTheme}>
                Checking availability...
              </ShopNameError>
            )}
            {shopNameError && (
              <ShopNameError theme={selectedTheme}>
                {shopNameError}
              </ShopNameError>
            )}
            {usernameAvailable && !checkingUsername && shopData.name !== 'MyBrandName' && (
              <ShopNameSuccess theme={selectedTheme}>
                ✓ Shop name available
              </ShopNameSuccess>
            )}
          </ShopNameInputContainer>
        </div>
        <div className="shop-description-container">
          <ValidatedEditableText
            value={shopData.description}
            onChange={(value) => handleShopDataChange('description', value)}
            placeholder="Shop Description"
            multiline={false}
            validationRules={VALIDATION_RULES.shop.description}
            theme={selectedTheme}
          />
        </div>
      </ShopProfileSection>

      <AddItemButton onClick={handleItemAdd} theme={selectedTheme}>
        <Plus size={20} />
        Add Item
      </AddItemButton>

      <ItemsContainer>
        <ItemsGrid>
          {shopData.items.map(item => {
            const isExpanded = expandedItems.has(item.id);
                    
            // FIX: Get the item directly from shopData.items each time to ensure fresh data
            const currentItem = shopData.items.find(i => i.id === item.id);
            const validImages = currentItem.images.filter(Boolean);
            const currentImageIndex = currentItem.currentImageIndex || 0;
            const currentImage = validImages[currentImageIndex] || null;
                    
            return (
              <React.Fragment key={item.id}>
                {/* Mobile Template Card */}
                <MobileTemplateCard 
                  theme={selectedTheme}
                  onClick={() => {
                    // Create a deep copy of the current item
                    const itemToEdit = shopData.items.find(i => i.id === item.id);
                    console.log('Opening item for edit:', itemToEdit);
                    setEditingItem({
                      ...itemToEdit,
                      // Ensure all arrays are properly copied
                      images: [...itemToEdit.images],
                      currentImageIndex: itemToEdit.currentImageIndex || 0
                    });
                  }}
                >
                  <MobileTemplateImageContainer theme={selectedTheme}>
                    {currentImage ? (
                      <img src={currentImage} alt={currentItem.name || 'Item'} />
                    ) : (
                      <div className="placeholder">
                        <Package size={24} />
                        <span>Image</span>
                      </div>
                    )}
                
                    {/* Carousel arrows for mobile */}
                    {validImages.length > 1 && (
                      <>
                        <button 
                          className="mobile-carousel-arrow left"
                          onClick={(e) => handleMobilePrevImage(e, currentItem.id)}
                        >
                          <ChevronLeft size={12} />
                        </button>
                        <button 
                          className="mobile-carousel-arrow right"
                          onClick={(e) => handleMobileNextImage(e, currentItem.id)}
                        >
                          <ChevronRight size={12} />
                        </button>
                    
                        {/* Image dots */}
                        <div className="image-dots">
                          {validImages.map((_, index) => (
                            <div 
                              key={index}
                              className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                
                    <MobileDeleteButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemDelete(currentItem.id);
                      }}
                    >
                      <X size={12} />
                    </MobileDeleteButton>
                  </MobileTemplateImageContainer>
                    
                  <MobileTemplateContent theme={selectedTheme}>
                    <div className="item-name">
                      {currentItem.name && currentItem.name !== 'MyItemName' ? 
                        currentItem.name : 
                        <span style={{ opacity: 0.5 }}>MyItemName</span>
                      }
                    </div>
                    <div className="item-price">
                      {currentItem.price ? `$${parseFloat(currentItem.price).toFixed(2)}` : 
                        <span className="empty-text">$0.00</span>}
                    </div>
                  </MobileTemplateContent>
                </MobileTemplateCard>

                {/* Desktop Card - Original Design */}
                <DesktopItemCard theme={selectedTheme}>
                  <DeleteButton onClick={() => handleItemDelete(item.id)}>
                    <X size={16} />
                  </DeleteButton>
                    
                  <ItemImageContainer theme={selectedTheme}>
                    <div className="image-container">
                      <EditableImage
                        value={item.images[item.currentImageIndex]}
                        onChange={(value) => {
                          const newImages = [...item.images];
                          newImages[item.currentImageIndex] = value;
                          handleItemUpdate(item.id, { images: newImages });
                        }}
                        theme={selectedTheme}
                        height="100%"
                        width="100%"
                      />
                    </div>
                      
                    {validImages.length > 0 && (
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
                  </ItemImageContainer>

                  <ItemContent>
                    <ItemHeader onClick={() => toggleItemExpansion(item.id)}>
                      <h4>
                        {item.name && item.name !== 'MyItemName' ? 
                          item.name : 
                          <span style={{ opacity: 0.5 }}>MyItemName</span>
                        }
                      </h4>
                      <ExpandButton>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </ExpandButton>
                    </ItemHeader>

                    <ItemDetails expanded={isExpanded}>
                      <div className="details-content">
                        <ValidatedEditableText
                          value={item.name}
                          onChange={(value) => handleItemUpdate(item.id, { name: value })}
                          placeholder="MyItemName"
                          validationRules={VALIDATION_RULES.item.name}
                          theme={selectedTheme}
                        />
                        <ValidatedEditableText
                          value={item.price}
                          onChange={(value) => handleItemUpdate(item.id, { price: value })}
                          placeholder="Price"
                          validationRules={VALIDATION_RULES.item.price}
                          theme={selectedTheme}
                        />
                        <ValidatedEditableText
                          value={item.description}
                          onChange={(value) => handleItemUpdate(item.id, { description: value })}
                          placeholder="Item Description"
                          validationRules={VALIDATION_RULES.item.description}
                          multiline
                          theme={selectedTheme}
                        />
                        <CategorySelect
                          value={item.category || 'Other'}
                          onChange={(e) => handleItemUpdate(item.id, { category: e.target.value })}
                          theme={selectedTheme}
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
                          theme={selectedTheme}
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
                                address: location.address || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
                                coordinates: coords
                              });
                            }
                          }}
                        />
                      </div>
                    </ItemDetails>
                  </ItemContent>
                </DesktopItemCard>
              </React.Fragment>
            );
          })}
        </ItemsGrid>
      </ItemsContainer>

      {/* Mobile Edit Modal */}
      {editingItem && (
        <EditModal onClick={() => setEditingItem(null)}>
          <EditModalContent 
            theme={selectedTheme}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section - 50% */}
      <EditModalImageSection>
              {/* Action Buttons on Image */}
              <ImageActionButtons>
                <ImageActionButton 
                  className="check"
                  onClick={async () => {
                    console.log('Saving item:', editingItem);
                    
                    // Process images - extract the preview URL or keep string URLs
                    const processedImages = editingItem.images.map((img) => {
                      // If it's already a string URL, keep it
                      if (typeof img === 'string') return img;
                      
                      // If it's null or undefined, keep it
                      if (!img) return null;
                      
                      // If it's the EditableImage format with preview, use the preview
                      if (img?.preview) return img.preview;
                      
                      // If it's a File object, create blob URL
                      if (img instanceof File) {
                        return URL.createObjectURL(img);
                      }
                      
                      return img;
                    });
                    
                    const updatedItem = {
                      ...editingItem,
                      images: processedImages
                    };
                    
                    console.log('Processed item with images:', updatedItem);
                    handleItemUpdate(editingItem.id, updatedItem);
                    setEditingItem(null);
                  }}
                  title="Save changes"
                >
                  <Check size={20} />
                </ImageActionButton>
                <ImageActionButton 
                  className="close"
                  onClick={() => setEditingItem(null)}
                  title="Discard changes"
                >
                  <X size={20} />
                </ImageActionButton>
              </ImageActionButtons>
                
              <ItemImageContainer theme={selectedTheme} style={{ height: '100%' }}>
                <div className="image-container">
                  <EditableImage
                    value={editingItem.images[editingItem.currentImageIndex]}
              onChange={(value) => {
                const newImages = [...editingItem.images];
                newImages[editingItem.currentImageIndex] = value;
                setEditingItem({ ...editingItem, images: newImages });
              }}
              theme={selectedTheme}
              height="100%"
              width="100%"
                  />
                </div>

                {editingItem.images.filter(Boolean).length > 1 && (
                  <>
              <button 
                className="carousel-arrow left"
                onClick={() => {
                  const newIndex = ((editingItem.currentImageIndex - 1) + 3) % 3;
                  setEditingItem({ ...editingItem, currentImageIndex: newIndex });
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="carousel-arrow right"
                onClick={() => {
                  const newIndex = (editingItem.currentImageIndex + 1) % 3;
                  setEditingItem({ ...editingItem, currentImageIndex: newIndex });
                }}
              >
                <ChevronRight size={16} />
              </button>
                  </>
                )}
              </ItemImageContainer>
            </EditModalImageSection>
              
            {/* Scrollable Info Section - 50% */}
      <EditModalBody>
        <ValidatedEditableText
          value={editingItem.name}
          onChange={(value) => setEditingItem({ ...editingItem, name: value })}
          placeholder="MyItemName"
                validationRules={VALIDATION_RULES.item.name}
                theme={selectedTheme}
              />

              <ValidatedEditableText
          value={editingItem.price}
          onChange={(value) => setEditingItem({ ...editingItem, price: value })}
          placeholder="Price"
          validationRules={VALIDATION_RULES.item.price}
          theme={selectedTheme}
              />

              <ValidatedEditableText
                value={editingItem.description}
          onChange={(value) => setEditingItem({ ...editingItem, description: value })}
          placeholder="Item Description"
          validationRules={VALIDATION_RULES.item.description}
          multiline
                theme={selectedTheme}
        />

        <CategorySelect
          value={editingItem.category || 'Other'}
          onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                theme={selectedTheme}
              >
                {ITEM_CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
                ))}
              </CategorySelect>
              
              <QuantitySelector 
                value={parseInt(editingItem.quantity) || 1}
                onChange={(value) => setEditingItem({ ...editingItem, quantity: value })}
                theme={selectedTheme}
                min={0}
                max={9999}
              />

              <AddressInput
                address={editingItem.address || ''}
                onAddressChange={(value) => setEditingItem({ 
            ...editingItem, 
            address: value,
            coordinates: null
                })}
                onLocationSelect={(location) => {
            if (location?.coordinates?.latitude && location?.coordinates?.longitude) {
              const coords = {
                lat: location.coordinates.latitude,
                lng: location.coordinates.longitude
              };
              setEditingItem({
                ...editingItem,
                address: location.address || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
                coordinates: coords
              });
            }
                }}
              />
            </EditModalBody>
          </EditModalContent>
        </EditModal>
      )}
    </MainContent>
  );

  const renderHomeView = () => (
    <MainContent>
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h2 style={{ 
          color: selectedTheme?.colors?.accent || '#800000',
          fontFamily: selectedTheme?.fonts?.heading || 'inherit',
          marginBottom: '1.5rem',
          fontSize: '1.5rem'
        }}>
          Mission Statement
        </h2>
        <ValidatedEditableText
          value={shopData.mission}
          onChange={(value) => handleShopDataChange('mission', value)}
          placeholder="What's your shop's mission?"
          multiline
          validationRules={VALIDATION_RULES.shop.mission}
          theme={selectedTheme}
        />
      </div>
    </MainContent>
  );

  const renderCommunityView = () => (
    <MainContent>
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ 
          color: selectedTheme?.colors?.accent || '#800000',
          fontFamily: selectedTheme?.fonts?.heading || 'inherit',
          marginBottom: '1rem',
          fontSize: '1.5rem'
        }}>
          Community
        </h2>
        <p>Community features will be available after shop creation</p>
      </div>
    </MainContent>
  );

  return (
    <ThemeProvider theme={selectedTheme}>
      <GlobalStyles />
      <PageContainer className="page-container">
        <Header theme={selectedTheme}>
          <HeaderLeft>
            <Logo onClick={() => navigate('/')} theme={selectedTheme}>
              KALKODE
            </Logo>
          </HeaderLeft>

          <HeaderRight>
            <HeaderTabButton
              theme={selectedTheme}
              active={activeTab === 'shop'}
              onClick={() => setActiveTab('shop')}
              title="Shop"
            >
              <Store size={22} />
            </HeaderTabButton>

            <HeaderTabButton
              theme={selectedTheme}
              active={activeTab === 'home'}
              onClick={() => setActiveTab('home')}
              title="Home"
            >
              <Home size={22} />
            </HeaderTabButton>

            <HeaderTabButton
              theme={selectedTheme}
              active={activeTab === 'community'}
              onClick={() => setActiveTab('community')}
              title="Community"
            >
              <Users size={22} />
            </HeaderTabButton>

            {isAuthenticated && (
              <HeaderTabButton
                onClick={handleLogout}
                theme={selectedTheme}
                title="Logout"
              >
                <LogOut size={22} />
              </HeaderTabButton>
            )}
          </HeaderRight>
        </Header>
          
        {/* ADD Floating Controls before closing PageContainer */}
        <FloatingControls>
          <FloatingButton
            onClick={refreshTheme}
            theme={selectedTheme}
            className={isRefreshing ? "spinning" : ""}
            title="Random theme"
          >
            <RefreshCw size={24} />
          </FloatingButton>
          
          <FloatingButton
            onClick={togglePinStyle}
            theme={selectedTheme}
            isPinned={isPinned}
            title={isPinned ? "Unpin theme" : "Pin theme"}
          >
            <Pin size={24} />
          </FloatingButton>
        </FloatingControls>

        {activeTab === 'shop' && renderShopView()}
        {activeTab === 'home' && renderHomeView()}
        {activeTab === 'community' && renderCommunityView()}

        {/* Save Button */}
        <SaveButtonContainer>
          <ActionButton
            onClick={handleSave}
            disabled={!shopData.name}
            theme={selectedTheme}
          >
            Save / LogIn
            <ChevronRight size={20} />
          </ActionButton>
        </SaveButtonContainer>
      </PageContainer>
    </ThemeProvider>
  );
};

export default LiveShopCreation;