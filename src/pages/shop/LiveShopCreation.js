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
  Package,
  Instagram,
  Twitter, 
  Facebook,
  Mail,
  Phone, 
  MapPin
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
import {
  StreetwearTemplate,
  OrganizationTemplate,
  TechTemplate,
  MinimalistTemplate,
  LocalMarketTemplate
} from './HomePageTemplate';


const templateImages = [
    'https://images.unsplash.com/photo-1662894312415-4ea3e988f63f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFiZXNoYSUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3VwZXJtYXJrZXR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900', 
    'https://images.unsplash.com/photo-1756137842382-8870b42f49ee?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aGFiZXNoYSUyMGRyZXNzfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=900'
  ];


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

const SERVICE_CATEGORIES = [
  'Professional Services',
  'Home Services',
  'Personal Care',
  'Education & Tutoring',
  'Health & Wellness',
  'Creative Services',
  'Technology Services',
  'Automotive Services',
  'Event Services',
  'Consulting',
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

const ShopProfileSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
  margin: 1.5rem auto 3rem;
  padding: 1.5rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}30`};
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  position: relative;
  z-index: 2;

  @media (min-width: 768px) {
    padding: 2rem;
  }

  .profile-image {
    margin-bottom: 1.5rem;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.1);
    border: 3px solid ${props => props.theme?.colors?.accent || '#800000'};
    box-shadow: 0 0 20px ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
    position: relative;
    z-index: 3;
    
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
    position: relative;
    z-index: 3;

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
    position: relative;
    z-index: 3;

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

// UPDATE the ItemsContainer styled component
const ItemsContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}30`};
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  position: relative;
  z-index: 2;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

// UPDATE the ShopTabContainer styled component
const ShopTabContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0 1.5rem;
  padding: 1rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}30`};
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  position: relative;
  z-index: 2;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

// UPDATE the AddItemButton styled component
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
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 3;

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

// ADD a new SectionDivider component
const SectionDivider = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.3)'} 50%,
    transparent 100%
  );
  margin: 2rem 0;
  position: relative;
  z-index: 2;
`;


const EditModal = styled.div`
  display: none;

  @media (max-width: 767px) {
    display: flex;
    position: fixed;
    top: 95px;
    left: 0;
    right: 0;
    bottom: 30px;
    background: rgba(0, 0, 0, 0.9);
    align-items: center;
    justify-content: center;
    z-index: 999;
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
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  margin: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

const ImageActionButtons = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 0.75rem;
  z-index: 10;
  background: ${props => `${props.theme?.colors?.background || '#000000'}F5`};
  backdrop-filter: blur(10px);
  padding: 0.75rem;
  justify-content: center;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
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

// NEW: Single scrollable container for both image and details
const EditModalScrollContent = styled.div`
  flex: 1;
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

const EditModalImageSection = styled.div`
  width: 100%;
  min-height: 300px;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
`;

const EditModalBody = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

// Compact Floating Controls - positioned below header on right
const FloatingControls = styled.div`
  position: fixed;
  top: 70px; 
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 90;
  
  @media (min-width: 768px) {
    top: 90px;
    right: 2rem;
  }
`;

const FloatingButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
  transition: all 0.3s ease;
  
  ${props => props.isPinned && `
    background: white;
    color: ${props.theme?.colors?.accent || '#800000'};
    border: 2px solid ${props.theme?.colors?.accent || '#800000'};
  `}
  
  @media (min-width: 768px) {
    width: 40px;
    height: 40px;
  }
  
  &:active {
    transform: scale(0.9);
  }
  
  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${props => `${props.theme?.colors?.accent}60` || 'rgba(128, 0, 0, 0.4)'};
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
    width: 18px;
    height: 18px;
    
    @media (min-width: 768px) {
      width: 20px;
      height: 20px;
    }
  }
`;

// Add after existing styled components (around line 800)
const ShopNameInputContainer = styled.div`
  width: 100%;
  margin: 0.5rem 0;
  position: relative;
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
  padding: 0.2rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.10rem;
  transition: all 0.3s ease;
  position: relative;
  min-width: 5px;
  
  /* Remove the old underline */
  &::after {
    display: none;
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
  
  .tab-label {
    font-size: 0.45rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    
    /* Neon effect when active */
    ${props => props.active && `
      color: ${props.theme?.colors?.accent || '#800000'};
      text-shadow: 
        0 0 10px ${props.theme?.colors?.accent || '#800000'},
        0 0 20px ${props.theme?.colors?.accent || '#800000'},
        0 0 30px ${props.theme?.colors?.accent || '#800000'};
      font-weight: 700;
    `}
    
    @media (min-width: 768px) {
      font-size: 0.7rem;
    }
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

  &:focus {
    animation: blink 1s step-end infinite;
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

// UPDATE the tab structure to use separate containers with independent scrolling
const TabContentContainer = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
  position: relative;
`;

// UPDATE the MainContent to remove the ref and handle scrolling differently
const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 1rem 100px 1rem;
  position: relative;
  z-index: 1;
  
  @media (min-width: 768px) {
    padding: 80px 2rem 2rem 2rem;
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
    padding: 1rem;
    
    &:hover {
      opacity: 0.8;
      background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(255, 255, 255, 0.05)'};
      
      /* Scale up the circle on hover */
      > div:first-child {
        transform: scale(1.1);
        background: ${props => `${props.theme?.colors?.accent}25`};
      }
    }
    
    &:active {
      opacity: 1;
      
      > div:first-child {
        transform: scale(0.95);
      }
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

// REPLACE the ItemsGrid with this version that uses auto-fill instead of auto-fit
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
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 0 0.5rem;
  }
`;

// UPDATE the DesktopItemCard to constrain the width
const DesktopItemCard = styled(ItemCard)`
  @media (max-width: 767px) {
    display: none;
  }
  
  /* Constrain the width so items don't stretch too much */
  max-width: 400px;
  justify-self: center;
  
  /* Ensure each card maintains its own height */
  height: fit-content;
  min-height: 400px;
  transition: all 0.3s ease;
  
  /* When expanded, allow natural height but maintain grid behavior */
  ${props => props.expanded && `
    min-height: 600px;
    height: auto;
  `}
  
  /* Make the card take full width of its grid cell on mobile */
  @media (max-width: 767px) {
    max-width: none;
    justify-self: stretch;
  }
`;

// UPDATE the ItemDetails to use max-height instead of height for smoother transitions
const ItemDetails = styled.div`
  max-height: ${props => props.expanded ? '500px' : '0'};
  opacity: ${props => props.expanded ? '1' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  
  .details-content {
    padding-top: ${props => props.expanded ? '1rem' : '0'};
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: all 0.3s ease;
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

const HomePreviewSection = styled.div`
  margin-top: 3rem;
  padding: 2rem 1rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}30`};
  border-radius: 16px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};

  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }

  .preview-header {
    text-align: center;
    margin-bottom: 2rem;
    
    h3 {
      color: ${props => props.theme?.colors?.accent || '#800000'};
      font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
      margin-bottom: 0.5rem;
      font-size: 1.3rem;
      
      @media (min-width: 768px) {
        font-size: 1.8rem;
      }
    }
    
    p {
      color: ${props => props.theme?.colors?.text || '#FFFFFF'};
      opacity: 0.7;
      font-size: 0.9rem;
      
      @media (min-width: 768px) {
        font-size: 1rem;
      }
    }
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
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


// ADD this near the top of the LiveShopCreation component if not already present
const SectionWrapper = ({ children, theme, noPadding = false, delay = 0 }) => {
  return (
    <div style={{
      position: 'relative',
      padding: noPadding ? '0' : 'clamp(1rem, 2vw, 2rem) clamp(0.5rem, 1vw, 1rem)',
      background: 'transparent',
      animation: 'fadeInUp 0.6s ease-out forwards',
      animationDelay: `${delay}s`,
      opacity: 0
    }}>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {children}
    </div>
  );
};

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


// Add after existing styled components (around line 800)
const TemplateSelectorWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }
`;

const TemplateSelectorContainer = styled.div`
  background: ${props => `${props.theme?.colors?.surface}50`};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${props => `${props.theme?.colors?.accent}40`};
  max-width: 900px;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 8px;
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
  const [heroBackgroundImage, setHeroBackgroundImage] = useState(null);
  const [shopContentType, setShopContentType] = useState('products');
  const [currentGalleryImage, setCurrentGalleryImage] = useState(0);

  useEffect(() => {
    // Use requestAnimationFrame for reliable scroll reset
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    // Multiple attempts to ensure scroll reset
    scrollToTop();
    const timeout1 = setTimeout(scrollToTop, 10);
    const timeout2 = setTimeout(scrollToTop, 50);
    const timeout3 = setTimeout(scrollToTop, 100);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [activeTab]);

  // Auto-rotate gallery images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGalleryImage((prev) => (prev + 1) % templateImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [templateImages.length]);

  const ShopTabContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 2rem 0 1.5rem;
    padding: 0 1rem;
  `;

const ShopTab = styled.button`
  background: ${props => props.active ? 
    props.theme?.colors?.accent || '#800000' : 'transparent'};
  border: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
  color: ${props => props.active ? 
    'white' : props.theme?.colors?.accent || '#800000'};
  padding: 0.75rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (min-width: 768px) {
    padding: 0.875rem 2.5rem;
    font-size: 1rem;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (hover: hover) {
    &:hover {
      background: ${props => props.active ? 
        props.theme?.colors?.primary || '#4A0404' : 
        `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};
    }
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

  const [shopData, setShopData] = useState({
    name: '', // ADD DEFAULT NAME HERE
    description: '',
    profile: null,
    mission: '',
    selectedHomeTemplate: 1,
    items: [{
      id: Date.now().toString(),
      name: 'Item Name',
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
    services: [],
    layout: {
      namePosition: 'left',
      tabPosition: 'top'
    }
  });

  // Add this function to check username availability
  // UPDATE checkUsernameAvailability function (around line 1050)
const checkUsernameAvailability = async (shopName) => {
  // Skip check for empty or default names
  if (!shopName || shopName.trim() === '' ) {
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
  if (!shopData?.name || shopData.name.trim() === '') {
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
    name: 'Item Name',
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

  // REMOVE the auto-expand logic for desktop
  // New items will start collapsed by default
};

// UPDATE the toggleItemExpansion function to only affect the clicked item
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

  // Add after handleAddItem function (around line 1400)
  const handleAddService = () => {
    const newService = {
      id: Date.now().toString(),
      name: 'Service Name',
      price: '',
      description: '',
      category: 'Other',
      images: [null, null, null],
      currentImageIndex: 0,
      address: '',
      coordinates: null,
      slots: 1
    };

    // Add to beginning
    setShopData(prev => ({
      ...prev,
      services: [newService, ...(prev.services || [])]
    }));

  };

  const handleItemUpdate = (itemId, updates) => {
    setShopData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));
  };

  const handleServiceUpdate = (serviceId, updates) => {
    setShopData(prev => ({
      ...prev,
      services: prev.services.map(service => 
        service.id === serviceId ? { ...service, ...updates } : service
      )
    }));
  };

  const handleItemDelete = (itemId) => {
    setShopData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleServiceDelete = (serviceId) => {
    setShopData(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== serviceId)
    }));
  };


// UPDATE handleSave function in LiveShopCreation.js (around line 1200)
const handleSave = async () => {
  // Check if shop name is still default or empty
  let finalShopName = shopData.name;
  
  if (!finalShopName || finalShopName === '') {
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

  

  // Template home sections that will be saved
  const homeSections = [
    {
      id: 'hero-1',
      type: 'hero-banner',
      order: 0,
      config: {
        headline: finalShopName,
        subtitle: 'Welcome to ' + finalShopName,
        backgroundImage: null,
        height: '70vh'
      }
    },
    {
      id: 'mission-1',
      type: 'mission-statement',
      order: 1,
      config: {
        title: 'Our Mission',
        content: 'We are dedicated to providing exceptional products and outstanding customer service. Every item in our collection is carefully selected to ensure the highest quality and value for our customers.'
      }
    },
    {
      id: 'featured-1',
      type: 'featured-items',
      order: 2,
      config: {
        title: 'Featured Products',
        itemCount: 4
      }
    },
    {
      id: 'gallery-1',
      type: 'photo-gallery',
      order: 3,
      config: {
        title: 'Shop Gallery',
        images: [
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
          'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800'
        ]
      }
    }
  ];

  const dataToSave = {
    ...shopData,
    name: finalShopName,
    theme: selectedTheme,
    selectedHomeTemplate: 1,
    homeSections: homeSections, // This will be used in the actual shop
    layout: {
      namePosition: shopData.layout.namePosition,
      tabPosition: 'top',
      nameSize: shopNameFontSize
    },
    items: shopData.items || [],
    services: shopData.services || [],
    createdAt: new Date().toISOString()
  };

  // Handle profile image - ensure it's in the correct format
  if (shopData.profile) {
    if (typeof shopData.profile === 'string') {
      dataToSave.profile = shopData.profile;
    } else if (shopData.profile.file) {
      dataToSave.profile = {
        file: shopData.profile.file,
        preview: shopData.profile.preview,
        type: shopData.profile.type,
        name: shopData.profile.name
      };
    }
  }

  console.log('Saving data with profile:', dataToSave.profile);
  console.log('Saving data with home widgets:', dataToSave.homeWidgets);

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
    {/* Profile Section with Backdrop */}
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
            value={shopData?.name || ''}
            onChange={(e) => {
              handleShopDataChange('name', e.target.value);
            }}
            placeholder="Enter Brand Name*"
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
          {usernameAvailable && !checkingUsername && shopData.name !== 'EnterBrandName' && (
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

    {/* Section Divider */}
    <SectionDivider theme={selectedTheme} />

    {/* Shop Content Type Tabs with Backdrop */}
    <ShopTabContainer>
      <ShopTab
        active={shopContentType === 'products'}
        onClick={() => setShopContentType('products')}
        theme={selectedTheme}
      >
        <Package size={18} />
        Products
      </ShopTab>
      <ShopTab
        active={shopContentType === 'services'}
        onClick={() => setShopContentType('services')}
        theme={selectedTheme}
      >
        <Store size={18} />
        Services
      </ShopTab>
    </ShopTabContainer>

    {/* Section Divider */}
    <SectionDivider theme={selectedTheme} />

    {/* Conditional Rendering based on shopContentType */}
    {shopContentType === 'products' ? (
      <>
        <AddItemButton onClick={handleItemAdd} theme={selectedTheme}>
          <Plus size={20} />
          Add Product
        </AddItemButton>

        <ItemsContainer>
          <ItemsGrid>
            {shopData.items.map(item => {
              const isExpanded = expandedItems.has(item.id);
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
                      const itemToEdit = shopData.items.find(i => i.id === item.id);
                      setEditingItem({
                        ...itemToEdit,
                        images: [...itemToEdit.images],
                        currentImageIndex: itemToEdit.currentImageIndex || 0,
                        isService: false
                      });
                    }}
                  >
                    <MobileTemplateImageContainer theme={selectedTheme}>
                      {currentImage ? (
                        <img src={currentImage} alt={currentItem.name || 'Item'} />
                      ) : (
                        <div className="placeholder">
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: `${selectedTheme?.colors?.accent}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.5rem'
                          }}>
                            <Package size={24} color={selectedTheme?.colors?.accent} />
                          </div>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            color: selectedTheme?.colors?.accent,
                            textAlign: 'center'
                          }}>
                            Add Photo
                          </span>
                        </div>
                      )}
                      
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
                        {currentItem.name && currentItem.name !== 'Item Name' ? 
                          currentItem.name : 
                          <span style={{ opacity: 0.5 }}>Item Name</span>
                        }
                      </div>
                      <div className="item-price">
                        {currentItem.price ? `$${parseFloat(currentItem.price).toFixed(2)}` : 
                          <span className="empty-text">$0.00</span>}
                      </div>
                    </MobileTemplateContent>
                  </MobileTemplateCard>

                  {/* Desktop Card */}
                  <DesktopItemCard theme={selectedTheme}>
                    <DeleteButton onClick={() => handleItemDelete(item.id)}>
                      <X size={16} />
                    </DeleteButton>
                    
                    <ItemImageContainer theme={selectedTheme}>
                      <div className="image-container">
                        {item.images[item.currentImageIndex] ? (
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
                        ) : (
                          <div 
                            className="placeholder"
                            onClick={() => document.getElementById(`image-upload-${item.id}-${item.currentImageIndex}`).click()}
                          >
                            <div style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '50%',
                              background: `${selectedTheme?.colors?.accent}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '0.75rem',
                              transition: 'all 0.3s ease'
                            }}>
                              <Package size={36} color={selectedTheme?.colors?.accent} />
                            </div>
                            <span style={{
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: selectedTheme?.colors?.accent,
                              marginBottom: '0.25rem'
                            }}>
                              Add Product Photo
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <input
                        type="file"
                        id={`image-upload-${item.id}-${item.currentImageIndex}`}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const newImages = [...item.images];
                              newImages[item.currentImageIndex] = {
                                file: file,
                                preview: reader.result,
                                type: file.type,
                                name: file.name
                              };
                              handleItemUpdate(item.id, { images: newImages });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      
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
                        {item.name && item.name !== 'Item Name' ? 
                          item.name : 
                          <span style={{ opacity: 0.5 }}>Item Name</span>
                        }
                      </h4>
                      <ExpandButton>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </ExpandButton>
                    </ItemHeader>
                      
                    {/* UPDATED: Smooth height transition */}
                    <ItemDetails expanded={isExpanded}>
                      <div className="details-content">
                        <ValidatedEditableText
                          value={item.name}
                          onChange={(value) => handleItemUpdate(item.id, { name: value })}
                          placeholder="Item Name"
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
                            address: value
                          })}
                          onLocationSelect={(location) => {
                            if (location?.coordinates) {
                              handleItemUpdate(item.id, {
                                address: location.address,
                                coordinates: location.coordinates
                              });
                            } else if (!location?.address) {
                              handleItemUpdate(item.id, {
                                address: '',
                                coordinates: null
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
      </>
    ) : (
      <>
        <AddItemButton onClick={handleAddService} theme={selectedTheme}>
          <Plus size={20} />
          Add Service
        </AddItemButton>

        <ItemsContainer>
          <ItemsGrid>
            {shopData.services.map(service => {
              const isExpanded = expandedItems.has(service.id);
              const currentService = shopData.services.find(s => s.id === service.id);
              const validImages = currentService.images.filter(Boolean);
              const currentImageIndex = currentService.currentImageIndex || 0;
              const currentImage = validImages[currentImageIndex] || null;

              return (
                <React.Fragment key={service.id}>
                  {/* Mobile Service Card */}
                  <MobileTemplateCard 
                    theme={selectedTheme}
                    onClick={() => {
                      const serviceToEdit = shopData.services.find(s => s.id === service.id);
                      setEditingItem({
                        ...serviceToEdit,
                        images: [...serviceToEdit.images],
                        currentImageIndex: serviceToEdit.currentImageIndex || 0,
                        isService: true
                      });
                    }}
                  >
                    <MobileTemplateImageContainer theme={selectedTheme}>
                      {currentImage ? (
                        <img src={currentImage} alt={currentService.name || 'Service'} />
                      ) : (
                        <div className="placeholder">
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: `${selectedTheme?.colors?.accent}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.5rem'
                          }}>
                            <Store size={24} color={selectedTheme?.colors?.accent} />
                          </div>
                          <span>Add Photo</span>
                        </div>
                      )}

                      {validImages.length > 1 && (
                        <>
                          <button 
                            className="mobile-carousel-arrow left"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newIndex = ((currentImageIndex - 1) + validImages.length) % validImages.length;
                              handleServiceUpdate(currentService.id, { currentImageIndex: newIndex });
                            }}
                          >
                            <ChevronLeft size={12} />
                          </button>
                          <button 
                            className="mobile-carousel-arrow right"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newIndex = (currentImageIndex + 1) % validImages.length;
                              handleServiceUpdate(currentService.id, { currentImageIndex: newIndex });
                            }}
                          >
                            <ChevronRight size={12} />
                          </button>
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
                          handleServiceDelete(currentService.id);
                        }}
                      >
                        <X size={12} />
                      </MobileDeleteButton>
                    </MobileTemplateImageContainer>
                    
                    <MobileTemplateContent theme={selectedTheme}>
                      <div className="item-name">
                        {currentService.name && currentService.name !== 'Service Name' ? 
                          currentService.name : 
                          <span style={{ opacity: 0.5 }}>Service Name</span>
                        }
                      </div>
                      <div className="item-price">
                        {currentService.price ? `$${parseFloat(currentService.price).toFixed(2)}` : 
      <                   span className="empty-text">$0.00</span>}
                      </div>
                    </MobileTemplateContent>
                  </MobileTemplateCard>

                  {/* Desktop Service Card */}
                  <DesktopItemCard theme={selectedTheme}>
                    <DeleteButton onClick={() => handleServiceDelete(service.id)}>
                      <X size={16} />
                    </DeleteButton>
                    
                    <ItemImageContainer theme={selectedTheme}>
                      <div className="image-container">
                        {service.images[service.currentImageIndex] ? (
                          <EditableImage
                            value={service.images[service.currentImageIndex]}
                            onChange={(value) => {
                              const newImages = [...service.images];
                              newImages[service.currentImageIndex] = value;
                              handleServiceUpdate(service.id, { images: newImages });
                            }}
                            theme={selectedTheme}
                            height="100%"
                            width="100%"
                          />
                        ) : (
                          <div 
                            className="placeholder"
                            onClick={() => document.getElementById(`service-image-upload-${service.id}-${service.currentImageIndex}`).click()}
                          >
                            <div style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '50%',
                              background: `${selectedTheme?.colors?.accent}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '0.75rem'
                            }}>
                              <Store size={36} color={selectedTheme?.colors?.accent} />
                            </div>
                            <span>Add Service Photo</span>
                          </div>
                        )}
                      </div>
                      
                      <input
                        type="file"
                        id={`service-image-upload-${service.id}-${service.currentImageIndex}`}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const newImages = [...service.images];
                              newImages[service.currentImageIndex] = {
                                file: file,
                                preview: reader.result,
                                type: file.type,
                                name: file.name
                              };
                              handleServiceUpdate(service.id, { images: newImages });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />

                      {validImages.length > 0 && (
                        <>
                          <button 
                            className="carousel-arrow left"
                            onClick={() => {
                              const newIndex = ((service.currentImageIndex - 1) + 3) % 3;
                              handleServiceUpdate(service.id, { currentImageIndex: newIndex });
                            }}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button 
                            className="carousel-arrow right"
                            onClick={() => {
                              const newIndex = (service.currentImageIndex + 1) % 3;
                              handleServiceUpdate(service.id, { currentImageIndex: newIndex });
                            }}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </>
                      )}
                    </ItemImageContainer>
                    
                    <ItemContent>
                      <ItemHeader onClick={() => toggleItemExpansion(service.id)}>
                        <h4>
                          {service.name && service.name !== 'Service Name' ? 
                            service.name : 
                            <span style={{ opacity: 0.5 }}>Service Name</span>
                          }
                        </h4>
                        <ExpandButton>
                          {expandedItems.has(service.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </ExpandButton>
                      </ItemHeader>
                      
                      <ItemDetails expanded={expandedItems.has(service.id)}>
                        <div className="details-content">
                          <ValidatedEditableText
                            value={service.name}
                            onChange={(value) => handleServiceUpdate(service.id, { name: value })}
                            placeholder="Service Name"
                            validationRules={VALIDATION_RULES.item.name}
                            theme={selectedTheme}
                          />
                          <ValidatedEditableText
                            value={service.price}
                            onChange={(value) => handleServiceUpdate(service.id, { price: value })}
                            placeholder="Cost"
                            validationRules={VALIDATION_RULES.item.price}
                            theme={selectedTheme}
                          />
                          <ValidatedEditableText
                            value={service.description}
                            onChange={(value) => handleServiceUpdate(service.id, { description: value })}
                            placeholder="Service Description"
                            validationRules={VALIDATION_RULES.item.description}
                            multiline
                            theme={selectedTheme}
                          />
                          <CategorySelect
                            value={service.category || 'Other'}
                            onChange={(e) => handleServiceUpdate(service.id, { category: e.target.value })}
                            theme={selectedTheme}
                          >
                            {SERVICE_CATEGORIES.map(category => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </CategorySelect>
                          <div style={{ marginBottom: '1rem' }}>
                            <QuantitySelector 
                              value={parseInt(service.slots) || 1}
                              onChange={(value) => handleServiceUpdate(service.id, { slots: value })}
                              theme={selectedTheme}
                              min={0}
                              max={9999}
                            />
                          </div>
                          <AddressInput
                            address={service.address || ''}
                            onAddressChange={(value) => handleServiceUpdate(service.id, { 
                              address: value
                            })}
                            onLocationSelect={(location) => {
                              if (location?.coordinates) {
                                handleServiceUpdate(service.id, {
                                  address: location.address,
                                  coordinates: location.coordinates
                                });
                              } else if (!location?.address) {
                                handleServiceUpdate(service.id, {
                                  address: '',
                                  coordinates: null
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
      </>
    )}

    {/* Mobile Edit Modal */}
    {editingItem && (
      <EditModal onClick={() => setEditingItem(null)}>
        <EditModalContent 
          theme={selectedTheme}
          onClick={(e) => e.stopPropagation()}
        >
          <ImageActionButtons theme={selectedTheme}>
            <ImageActionButton 
              className="check"
              onClick={async () => {
                const processedImages = editingItem.images.map((img) => {
                  if (typeof img === 'string') return img;
                  if (!img) return null;
                  if (img?.preview) return img.preview;
                  if (img instanceof File) return URL.createObjectURL(img);
                  return img;
                });

                const updatedItem = {
                  ...editingItem,
                  images: processedImages
                };

                if (editingItem.isService) {
                  handleServiceUpdate(editingItem.id, updatedItem);
                } else {
                  handleItemUpdate(editingItem.id, updatedItem);
                }
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
            
          <EditModalScrollContent theme={selectedTheme}>
            <EditModalImageSection theme={selectedTheme}>
              <ItemImageContainer theme={selectedTheme} style={{ height: '100%', minHeight: '300px' }}>
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
              
            <EditModalBody>
              <ValidatedEditableText
                value={editingItem.name}
                onChange={(value) => setEditingItem({ ...editingItem, name: value })}
                placeholder={editingItem.isService ? "Service Name" : "Item Name"}
                validationRules={VALIDATION_RULES.item.name}
                theme={selectedTheme}
              />

              <ValidatedEditableText
                value={editingItem.price}
                onChange={(value) => setEditingItem({ ...editingItem, price: value })}
                placeholder="Cost"
                validationRules={VALIDATION_RULES.item.price}
                theme={selectedTheme}
              />

              <ValidatedEditableText
                value={editingItem.description}
                onChange={(value) => setEditingItem({ ...editingItem, description: value })}
                placeholder={editingItem.isService ? "Service Description" : "Item Description"}
                validationRules={VALIDATION_RULES.item.description}
                multiline
                theme={selectedTheme}
              />

              <CategorySelect
                value={editingItem.category || 'Other'}
                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                theme={selectedTheme}
              >
                {(editingItem.isService ? SERVICE_CATEGORIES : ITEM_CATEGORIES).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </CategorySelect>
              
              <div style={{ marginBottom: '1rem' }}>
                <QuantitySelector 
                  value={parseInt(editingItem.isService ? editingItem.slots : editingItem.quantity) || 1}
                  onChange={(value) => setEditingItem({ 
                    ...editingItem, 
                    [editingItem.isService ? 'slots' : 'quantity']: value 
                  })}
                  theme={selectedTheme}
                  min={0}
                  max={9999}
                />
              </div>
                
              <AddressInput
                address={editingItem.address || ''}
                onAddressChange={(value) => setEditingItem({ 
                  ...editingItem, 
                  address: value
                })}
                onLocationSelect={(location) => {
                  if (location?.coordinates) {
                    setEditingItem({
                      ...editingItem,
                      address: location.address,
                      coordinates: location.coordinates
                    });
                  } else if (!location?.address) {
                    setEditingItem({
                      ...editingItem,
                      address: '',
                      coordinates: null
                    });
                  }
                }}
              />
            </EditModalBody>
          </EditModalScrollContent>
        </EditModalContent>
      </EditModal>
    )}
  </MainContent>
);

  // UPDATE the renderHomeView function in LiveShopCreation.js

const renderHomeView = () => {
  
  // Get filtered items for featured section (exclude empty/default items)
  const featuredItems = shopData?.items?.filter(item => 
    item && 
    item.name && 
    item.name !== 'Item Name' && 
    !item.deleted
  ).slice(0, 4) || [];

  // Get item image URL
  const getItemImage = (item) => {
    if (!item?.images || item.images.length === 0) return null;
    const validImage = item.images.find(img => {
      if (typeof img === 'string') return img;
      if (img?.preview) return img.preview;
      return null;
    });
    if (typeof validImage === 'string') return validImage;
    if (validImage?.preview) return validImage.preview;
    return null;
  };

  return (
    <MainContent>
      {/* Hero Banner Section */}
      <SectionWrapper theme={selectedTheme} noPadding delay={0}>
        <div style={{
          minHeight: '70vh',
          background: `linear-gradient(135deg, ${selectedTheme?.colors?.accent}15 0%, ${selectedTheme?.colors?.background}50 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: 'clamp(1rem, 3vw, 3rem)',
          textAlign: 'center'
        }}>
          <div style={{ 
            position: 'relative', 
            zIndex: 1, 
            padding: 'clamp(1rem, 3vw, 2rem)',
            maxWidth: '900px',
            width: '100%',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 'clamp(12px, 2.5vw, 16px)',
            backdropFilter: 'blur(10px)'
          }}>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 6vw, 4rem)',
              fontWeight: '900',
              margin: '0 0 clamp(0.5rem, 2vw, 1rem) 0',
              lineHeight: 1.1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              color: selectedTheme?.colors?.text
            }}>
              {shopData?.name || 'Your Brand Name'}
            </h1>
            <p style={{
              fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)',
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              color: selectedTheme?.colors?.text,
              lineHeight: 1.4,
              margin: 0
            }}>
              Welcome to Your Website
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* Mission Statement Section */}
      <SectionWrapper theme={selectedTheme} delay={0.2}>
        <div style={{
          background: `${selectedTheme?.colors?.surface}40`,
          borderRadius: 'clamp(10px, 2.5vw, 20px)',
          padding: 'clamp(1.5rem, 5vw, 4rem) clamp(1rem, 4vw, 3rem)',
          textAlign: 'center',
          border: `1px solid ${selectedTheme?.colors?.accent}20`,
          backdropFilter: 'blur(5px)'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.3rem, 5vw, 2.5rem)',
            color: selectedTheme?.colors?.accent,
            marginBottom: 'clamp(1rem, 3vw, 2rem)',
            fontWeight: '700'
          }}>
            Our Mission
          </h2>
          <p style={{
            fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
            lineHeight: 1.6,
            maxWidth: '800px',
            margin: '0 auto',
            opacity: 0.9,
            color: selectedTheme?.colors?.text
          }}>
            We are dedicated to providing exceptional products and outstanding customer service. 
            Every item in our collection is carefully selected to ensure the highest quality and value for our customers.
          </p>
        </div>
      </SectionWrapper>

      {/* Featured Items Section - Live from Shop Tab */}
      <SectionWrapper theme={selectedTheme} delay={0.4}>
        <div style={{ padding: '0 clamp(0.5rem, 1vw, 1rem)' }}>
          <h2 style={{
            fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: 'clamp(1rem, 2vw, 2rem)',
            textAlign: 'center',
            color: selectedTheme?.colors?.text
          }}>
            Featured Products
          </h2>

          {featuredItems.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 45vw, 280px), 1fr))',
              gap: 'clamp(0.75rem, 2.5vw, 2rem)',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {featuredItems.map((item) => {
                const itemImage = getItemImage(item);

                return (
                  <div key={item.id} style={{
                    backgroundColor: `${selectedTheme?.colors?.surface}90`,
                    borderRadius: 'clamp(8px, 2vw, 16px)',
                    overflow: 'hidden',
                    border: `1px solid ${selectedTheme?.colors?.accent}30`,
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 12px ${selectedTheme?.colors?.accent}10`,
                    cursor: 'pointer'
                  }}>
                    <div style={{
                      height: 'clamp(120px, 35vw, 280px)',
                      backgroundColor: `${selectedTheme?.colors?.background}50`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {itemImage ? (
                        <img 
                          src={itemImage} 
                          alt={item?.name || 'Product'} 
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <Package size={48} color={selectedTheme?.colors?.accent} style={{ opacity: 0.5 }} />
                      )}
                      {/* Quantity Badge */}
                      {item?.quantity !== undefined && (
                        <div style={{
                          position: 'absolute',
                          top: 'clamp(0.4rem, 1.5vw, 0.75rem)',
                          right: 'clamp(0.4rem, 1.5vw, 0.75rem)',
                          backgroundColor: parseInt(item.quantity) > 0 ? 
                            'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)',
                          color: 'white',
                          padding: 'clamp(0.2rem, 0.8vw, 0.4rem) clamp(0.4rem, 1.2vw, 0.75rem)',
                          borderRadius: 'clamp(8px, 2vw, 16px)',
                          fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)',
                          fontWeight: '700'
                        }}>
                          {parseInt(item.quantity) > 0 ? `${item.quantity} LEFT` : 'SOLD OUT'}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 'clamp(0.75rem, 2.5vw, 1.5rem)' }}>
                      <h3 style={{
                        fontSize: 'clamp(0.85rem, 2.2vw, 1.2rem)',
                        fontWeight: '700',
                        marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)',
                        color: selectedTheme?.colors?.text
                      }}>
                        {item?.name || 'Product Name'}
                      </h3>
                      <p style={{
                        fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)',
                        opacity: 0.7,
                        marginBottom: 'clamp(0.5rem, 1.5vw, 1rem)',
                        lineHeight: 1.4,
                        color: selectedTheme?.colors?.text
                      }}>
                        {item?.description || 'Product description'}
                      </p>
                      <div style={{
                        fontSize: 'clamp(1rem, 3vw, 1.6rem)',
                        fontWeight: '900',
                        color: selectedTheme?.colors?.accent
                      }}>
                        ${parseFloat(item?.price || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: 'clamp(2rem, 8vw, 5rem)',
              color: selectedTheme?.colors?.text,
              opacity: 0.6
            }}>
              <Package size={64} color={selectedTheme?.colors?.accent} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', margin: '0 0 0.5rem 0' }}>No Products Yet</h3>
              <p style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', margin: 0 }}>
                Add products in the Shop tab to see them featured here
              </p>
            </div>
          )}
        </div>
      </SectionWrapper>

      {/* Animated Gallery Section */}
      <SectionWrapper theme={selectedTheme} delay={0.6}>
        <div style={{
          padding: 'clamp(1rem, 2vw, 2rem)',
          background: `${selectedTheme?.colors?.surface}30`,
          borderRadius: 'clamp(12px, 2vw, 16px)',
          border: `1px solid ${selectedTheme?.colors?.accent}30`
        }}>
          <h2 style={{
            fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: 'clamp(1rem, 2vw, 2rem)',
            textAlign: 'center',
            color: selectedTheme?.colors?.text
          }}>
            Shop Gallery
          </h2>

          <div style={{
            position: 'relative',
            height: 'clamp(250px, 50vw, 500px)',
            borderRadius: 'clamp(10px, 2.5vw, 20px)',
            overflow: 'hidden',
            background: `${selectedTheme?.colors?.background}80`,
            border: `2px solid ${selectedTheme?.colors?.accent}40`,
            marginBottom: 'clamp(1rem, 2vw, 2rem)'
          }}>
            {/* Fading Images */}
            {templateImages.map((image, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: currentGalleryImage === index ? 1 : 0,
                  transition: 'opacity 1s ease-in-out',
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            ))}
            
            {/* Overlay Text */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              padding: 'clamp(1rem, 2vw, 2rem)',
              color: 'white',
              textAlign: 'center',
              zIndex: 2
            }}>
              
            </div>

            {/* Navigation Dots */}
            <div style={{
              position: 'absolute',
              bottom: 'clamp(0.75rem, 2vw, 1.5rem)',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 'clamp(0.3rem, 1.2vw, 0.5rem)',
              zIndex: 3
            }}>
              {templateImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentGalleryImage(index)}
                  style={{
                    width: 'clamp(8px, 2vw, 12px)',
                    height: 'clamp(8px, 2vw, 12px)',
                    borderRadius: '50%',
                    border: 'none',
                    background: currentGalleryImage === index ? 
                      selectedTheme?.colors?.accent : 
                      'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: currentGalleryImage === index ? 
                      `0 0 10px ${selectedTheme?.colors?.accent}` : 
                      'none'
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </SectionWrapper>

{/* Footer Contacts Section */}
<SectionWrapper theme={selectedTheme} delay={0.8}>
  <div style={{
    background: `${selectedTheme?.colors?.surface}80`,
    borderRadius: 'clamp(12px, 2vw, 16px)',
    padding: 'clamp(2rem, 4vw, 3rem)',
    border: `1px solid ${selectedTheme?.colors?.accent}30`,
    marginTop: 'clamp(2rem, 4vw, 4rem)'
  }}>
    {/* Footer Content */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: 'clamp(2rem, 4vw, 3rem)',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      
      {/* Brand Column */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h3 style={{
          fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
          fontWeight: '700',
          color: selectedTheme?.colors?.accent,
          marginBottom: '0.5rem'
        }}>
          {shopData?.name || 'Your Brand'}
        </h3>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '0.5rem'
        }}>
          {/* Social Media Links */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: `${selectedTheme?.colors?.accent}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: `1px solid ${selectedTheme?.colors?.accent}30`
          }}>
            <Instagram size={18} color={selectedTheme?.colors?.accent} />
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: `${selectedTheme?.colors?.accent}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: `1px solid ${selectedTheme?.colors?.accent}30`
          }}>
            <Twitter size={18} color={selectedTheme?.colors?.accent} />
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: `${selectedTheme?.colors?.accent}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: `1px solid ${selectedTheme?.colors?.accent}30`
          }}>
            <Facebook size={18} color={selectedTheme?.colors?.accent} />
          </div>
        </div>
      </div>

      {/* Contact Info Column */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h4 style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          fontWeight: '600',
          color: selectedTheme?.colors?.text,
          marginBottom: '0.5rem'
        }}>
          Contact Info
        </h4>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: selectedTheme?.colors?.text,
            opacity: 0.8
          }}>
            <Mail size={18} color={selectedTheme?.colors?.accent} />
            <span style={{ fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)' }}>
              contact@yourbrand.com
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: selectedTheme?.colors?.text,
            opacity: 0.8
          }}>
            <Phone size={18} color={selectedTheme?.colors?.accent} />
            <span style={{ fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)' }}>
              (555) 123-4567
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            color: selectedTheme?.colors?.text,
            opacity: 0.8
          }}>
            <MapPin size={18} color={selectedTheme?.colors?.accent} style={{ marginTop: '2px' }} />
            <span style={{ fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)', lineHeight: 1.4 }}>
              123 Commerce Street<br />
              City, State 12345
            </span>
          </div>
        </div>
      </div>

      {/* Business Hours Column */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h4 style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          fontWeight: '600',
          color: selectedTheme?.colors?.text,
          marginBottom: '0.5rem'
        }}>
          Business Hours
        </h4>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {[
            { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
            { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
            { day: 'Sunday', hours: 'Closed' }
          ].map((schedule, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.25rem 0'
            }}>
              <span style={{
                fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                color: selectedTheme?.colors?.text,
                opacity: 0.8
              }}>
                {schedule.day}
              </span>
              <span style={{
                fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                color: selectedTheme?.colors?.accent,
                fontWeight: '500'
              }}>
                {schedule.hours}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>

    {/* Footer Bottom */}
    <div style={{
      borderTop: `1px solid ${selectedTheme?.colors?.accent}20`,
      marginTop: 'clamp(2rem, 4vw, 3rem)',
      paddingTop: 'clamp(1rem, 2vw, 1.5rem)',
      textAlign: 'center'
    }}>
      <p style={{
        fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
        color: selectedTheme?.colors?.text,
        opacity: 0.6,
        margin: 0
      }}>
        © {new Date().getFullYear()} {shopData?.name || 'Your Brand'}. All rights reserved.
      </p>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'clamp(1rem, 2vw, 2rem)',
        marginTop: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <span style={{
          fontSize: 'clamp(0.75rem, 1.3vw, 0.85rem)',
          color: selectedTheme?.colors?.text,
          opacity: 0.6,
          cursor: 'pointer',
          transition: 'opacity 0.3s ease'
        }}>
          Privacy Policy
        </span>
        <span style={{
          fontSize: 'clamp(0.75rem, 1.3vw, 0.85rem)',
          color: selectedTheme?.colors?.text,
          opacity: 0.6,
          cursor: 'pointer',
          transition: 'opacity 0.3s ease'
        }}>
          Terms of Service
        </span>
        <span style={{
          fontSize: 'clamp(0.75rem, 1.3vw, 0.85rem)',
          color: selectedTheme?.colors?.text,
          opacity: 0.6,
          cursor: 'pointer',
          transition: 'opacity 0.3s ease'
        }}>
          Shipping Info
        </span>
        <span style={{
          fontSize: 'clamp(0.75rem, 1.3vw, 0.85rem)',
          color: selectedTheme?.colors?.text,
          opacity: 0.6,
          cursor: 'pointer',
          transition: 'opacity 0.3s ease'
        }}>
          Returns
        </span>
      </div>
    </div>
  </div>
</SectionWrapper>

      
    </MainContent>
  );
};

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

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    // The useEffect above will handle the scroll, but we can also add immediate scroll here
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <ThemeProvider theme={selectedTheme}>
      <GlobalStyles />
      <PageContainer className="page-container">
        <Header theme={selectedTheme}>
          <HeaderLeft>
            <Logo onClick={() => navigate('/')} theme={selectedTheme}>
              {shopData?.name || 'Brand Name'}
            </Logo>
          </HeaderLeft    > 

          <HeaderRight>
            <HeaderTabButton
              theme={selectedTheme}
              active={activeTab === 'home'}
              onClick={() => {
                setActiveTab('home');
                // Force scroll to top immediately
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }, 0);
              }}
              title="Home"
            >
              <Home size={22} />
              <span className="tab-label">Home</span>
            </HeaderTabButton>
            
            <HeaderTabButton
              theme={selectedTheme}
              active={activeTab === 'shop'}
              onClick={() => {
                setActiveTab('shop');
                // Force scroll to top immediately
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }, 0);
              }}
              title="Shop"
            >
              <Store size={22} />
              <span className="tab-label">Shop</span>
            </HeaderTabButton>
            
            <HeaderTabButton
              theme={selectedTheme}
              active={activeTab === 'community'}
              onClick={() => {
                setActiveTab('community');
                // Force scroll to top immediately
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }, 0);
              }}
              title="Community"
            >
              <Users size={22} />
              <span className="tab-label">Community</span>
            </HeaderTabButton>
            
            {isAuthenticated && (
              <HeaderTabButton
                onClick={handleLogout}
                theme={selectedTheme}
                title="Logout"
              >
                <LogOut size={22} />
                <span className="tab-label">Logout</span>
              </HeaderTabButton>
            )}
          </HeaderRight>
        </Header>
          
        {/* Floating Controls */}
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
        </FloatingControls    > 

        {/* Tab Content with independent display */}
        <TabContentContainer active={activeTab === 'shop'}>
          {renderShopView()}
        </TabContentContainer>
          
        <TabContentContainer active={activeTab === 'home'}>
          {renderHomeView()}
        </TabContentContainer>
          
        <TabContentContainer active={activeTab === 'community'}>
          {renderCommunityView()}
        </TabContentContainer>      

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