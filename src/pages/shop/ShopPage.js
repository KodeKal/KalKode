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
import { ChevronUp, ChevronDown, Plus, Users, ChevronLeft, ChevronRight, X, GripVertical, Package, Home, Store } from 'lucide-react';
import { Trash2, Save, RotateCcw } from 'lucide-react';
import AddressInput from '../../components/shop/AddressInput';
import ThemeSelector from '../../components/ThemeSelector/ThemeSelector';
import QuantitySelector from '../../components/shop/QuantitySelector';
import { WELCOME_STYLES } from '../../theme/welcomeStyles';
import { signOut } from 'firebase/auth';
import { RefreshCw, Pin, LogOut } from 'lucide-react';
import { compressProfileImage } from '../../utils/imageCompression';
import { saveHomePageConfig } from '../../firebase/firebaseService';
import SubdomainInfo from '../../components/SubdomainDisplay';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  StreetwearTemplate,
  OrganizationTemplate,
  TechTemplate,
  MinimalistTemplate,
  LocalMarketTemplate,
  SECTION_TYPES,
  HeroBannerSection,
  FeaturedItemsSection,
  PhotoGallerySection,
  FeaturedVideoSection,
  MissionStatementSection,
  CalendarEventsSection,
  ServicesGridSection,
  ContactSection,
  TextBlockSection
} from './HomePageTemplate';


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


const SectionTypeModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(20px);
  border: 2px solid ${props => props.theme?.colors?.accent};
  border-radius: 16px;
  padding: 1.5rem;
  z-index: 1001;
  max-width: 90vw;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  @media (max-width: 768px) {
    width: calc(100vw - 2rem);
    max-height: 70vh;
    padding: 1.25rem;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.colors?.accent};
    border-radius: 3px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  opacity: ${props => props.show ? 1 : 0};
  pointer-events: ${props => props.show ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
`;

const SectionTypeOption = styled.button`
  width: 100%;
  background: ${props => props.theme?.colors?.background || 'rgba(0, 0, 0, 0.3)'};
  border: 2px solid ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 0.875rem;
    gap: 0.75rem;
    margin-bottom: 0.625rem;
  }

  &:hover {
    border-color: ${props => props.theme?.colors?.accent};
    background: ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.2)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => `${props.theme?.colors?.accent}40`};
  }

  &:active {
    transform: translateY(0);
  }

  .icon {
    font-size: 1.5rem;
    
    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }

  .info {
    flex: 1;
    
    .label {
      color: ${props => props.theme?.colors?.text};
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
      
      @media (max-width: 768px) {
        font-size: 0.875rem;
      }
    }
  }
`;

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

// Compact Floating Controls - positioned below header on right
const FloatingControls = styled.div`
  position: fixed;
  top: 70px; /* Just below header */
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 90;
  
  @media (min-width: 768px) {
    top: 90px;
    right: 2rem;
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

const LivePreviewContainer = styled.div`
  background: ${props => `${props.theme?.colors?.surface}30`};
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid ${props => `${props.theme?.colors?.accent}40`};
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    border-radius: 12px;
  }
`;

const LivePreviewHeader = styled.h3`
  text-align: center;
  margin-bottom: 2rem;
  color: ${props => props.theme?.colors?.accent};
  font-size: 1.1rem;
  
  @media (min-width: 768px) {
    font-size: 1.3rem;
  }
`;

const SectionWrapper = styled.div`
  background: ${props => `${props.theme?.colors?.surface}30`};
  border: 2px solid ${props => `${props.theme?.colors?.accent}30`};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  transition: all 0.3s ease;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 8px;
  }

  &:hover {
    border-color: ${props => props.theme?.colors?.accent};

    .section-controls {
      opacity: 1;
    }
  }
`;

const SectionControls = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
  background: ${props => `${props.theme?.colors?.background}E5`};
  backdrop-filter: blur(10px);
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}40`};

  @media (max-width: 768px) {
    opacity: 1;
    top: 0.25rem;
    right: 0.25rem;
    padding: 0.25rem;
    gap: 0.25rem;
  }
`;

const SectionControlButton = styled.button`
  background: transparent;
  border: 1px solid ${props => props.theme?.colors?.accent};
  color: ${props => props.theme?.colors?.accent};
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 32px;
  min-height: 32px;

  @media (max-width: 768px) {
    min-width: 28px;
    min-height: 28px;
    padding: 0.35rem;
  }

  &:hover {
    background: ${props => `${props.theme?.colors?.accent}20`};
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &.delete {
    border-color: #ff4444;
    color: #ff4444;

    &:hover {
      background: rgba(255, 68, 68, 0.2);
    }
  }

  svg {
    width: 16px;
    height: 16px;
    
    @media (max-width: 768px) {
      width: 14px;
      height: 14px;
    }
  }
`;
const AddSectionCard = styled.div`
  background: ${props => `${props.theme?.colors?.surface}30`};
  border: 2px dashed ${props => `${props.theme?.colors?.accent}40`};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;

  @media (min-width: 768px) {
    padding: 2rem;
    min-height: 150px;
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    margin-bottom: 1rem;
    min-height: 100px;
    gap: 0.75rem;
  }

  &:hover {
    border-color: ${props => props.theme?.colors?.accent};
    background: ${props => `${props.theme?.colors?.accent}10`};
  }

  &:active {
    transform: scale(0.98);
  }

  .plus-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${props => `${props.theme?.colors?.accent}20`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme?.colors?.accent};
    transition: all 0.3s ease;
    
    @media (min-width: 768px) {
      width: 48px;
      height: 48px;
    }
    
    @media (max-width: 768px) {
      width: 36px;
      height: 36px;
    }

    svg {
      width: 24px;
      height: 24px;
      
      @media (min-width: 768px) {
        width: 28px;
        height: 28px;
      }
      
      @media (max-width: 768px) {
        width: 20px;
        height: 20px;
      }
    }
  }

  &:hover .plus-icon {
    background: ${props => props.theme?.colors?.accent};
    color: white;
    transform: scale(1.1);
  }

  &:active .plus-icon {
    transform: scale(1.05);
  }

  .add-text {
    color: ${props => props.theme?.colors?.text};
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0.8;
    transition: opacity 0.3s ease;
    
    @media (min-width: 768px) {
      font-size: 1rem;
    }
    
    @media (max-width: 768px) {
      font-size: 0.85rem;
    }
  }

  &:hover .add-text {
    opacity: 1;
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

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#000000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  position: relative;
  overflow-x: hidden;
  
  /* Zoom level adjustments */
  @media (min-resolution: 1.5dppx) {
    font-size: 14px;
  }
  
  @media (min-resolution: 2dppx) {
    font-size: 13px;
  }
`;

// Add after existing styled components in ShopPage.js (around line 800)
const ShopNameInputContainer = styled.div`
  width: 100%;
  margin: 0.5rem 0;
  position: relative;
`;

const ShopNameInput = styled.input`
  width: 100%;
  text-align: center;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.isError ? '#ff4444' : `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
  font-size: ${props => props.fontSize || '2.5rem'};
  font-family: ${props => props.theme?.fonts?.heading};
  color: ${props => props.theme?.colors?.accent || '#800000'};
  background: ${props => props.theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  outline: none;
  padding: 0.5rem;
  transition: all 0.3s ease;

  &:focus {
    border-bottom-color: ${props => props.isError ? '#ff4444' : props.theme?.colors?.accent || '#800000'};
    border-bottom-width: 3px;
    transform: scale(1.02);
  }

  &::placeholder {
    background: ${props => props.theme?.colors?.accentGradient ? 
      `${props.theme.colors.accentGradient.replace(')', '80)')}` : 
      'linear-gradient(45deg, rgba(128, 0, 0, 0.8), rgba(74, 4, 4, 0.8))'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
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

// ADD after existing Header styled component:
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

// ADD after the existing HeaderRight component definition:
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
  
  &:active {
    transform: scale(0.95);
  }
  
  /* Remove old underline */
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
    font-size: 0.65rem;
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

const EditorHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${props => `${props.theme?.colors?.headerBg || 'rgba(0, 0, 0, 0.9)'}F5`};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  padding: clamp(0.5rem, 1.5vw, 1rem) clamp(0.75rem, 2vw, 1.5rem);
  
  /* Handle different zoom levels */
  @media (max-width: 1600px) and (min-width: 1024px) {
    padding: 0.75rem 1.25rem;
  }
  
  @media (max-width: 1366px) and (min-width: 1024px) {
    padding: 0.6rem 1rem;
  }
`;

const EditorControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 1rem);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
  
  /* Zoom adjustments */
  @media (max-width: 1366px) and (min-width: 1024px) {
    gap: 0.5rem;
  }
`;

const SaveButton = styled.button`
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: white;
  border: none;
  padding: clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.8rem, 2vw, 1.5rem);
  border-radius: clamp(6px, 1vw, 8px);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.3rem, 0.8vw, 0.5rem);
  transition: all 0.3s ease;
  font-size: clamp(0.8rem, 1.5vw, 1rem);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => `${props.theme?.colors?.accent}60` || 'rgba(128, 0, 0, 0.4)'};
  }

  svg {
    width: clamp(14px, 2.5vw, 16px);
    height: clamp(14px, 2.5vw, 16px);
  }
  
  /* Zoom level specific */
  @media (max-width: 1366px) and (min-width: 1024px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
`;

const EditorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vw, 1.5rem);
  padding: clamp(0.75rem, 2vw, 2rem);
  min-height: calc(100vh - clamp(60px, 10vh, 100px));
  max-width: 100vw;
  overflow-x: hidden;
  
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: ${props => props.showLibrary ? 
      'minmax(240px, 280px) 1fr' : '1fr'};
    gap: clamp(1rem, 2vw, 2rem);
  }

  @media (min-width: 1440px) and (max-width: 1920px) {
    grid-template-columns: ${props => props.showLibrary ? 
      'minmax(260px, 300px) 1fr' : '1fr'};
    max-width: 95vw;
    margin: 0 auto;
  }

  @media (min-width: 1921px) {
    grid-template-columns: ${props => props.showLibrary ? 
      '320px 1fr' : '1fr'};
    max-width: 1800px;
    margin: 0 auto;
  }
  
  /* Handle zoomed-in displays */
  @media (max-width: 1366px) and (min-width: 1024px) {
    grid-template-columns: ${props => props.showLibrary ? 
      '220px 1fr' : '1fr'};
    gap: 1rem;
    padding: 1rem;
  }
`;

const WidgetLibrary = styled.div`
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-radius: clamp(8px, 1.5vw, 12px);
  padding: clamp(0.75rem, 1.5vw, 1.5rem);
  height: fit-content;
  max-height: calc(100vh - clamp(100px, 15vh, 140px));
  overflow-y: auto;
  overflow-x: hidden;
  
  @media (min-width: 1024px) {
    position: sticky;
    top: clamp(80px, 12vh, 110px);
  }

  /* Zoom adjustments */
  @media (max-width: 1366px) and (min-width: 1024px) {
    padding: 0.75rem;
    max-height: calc(100vh - 110px);
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: clamp(4px, 0.8vw, 6px);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.colors?.accent || '#800000'};
    border-radius: 3px;
  }
`;

const LibraryTitle = styled.h3`
  font-size: clamp(0.9rem, 1.8vw, 1.1rem);
  margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  display: flex;
  align-items: center;
  gap: clamp(0.3rem, 0.8vw, 0.5rem);
  
  svg {
    width: clamp(16px, 2.5vw, 20px);
    height: clamp(16px, 2.5vw, 20px);
  }
`;

const WidgetItem = styled.div`
  background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  border-radius: clamp(6px, 1vw, 8px);
  padding: clamp(0.6rem, 1.2vw, 1rem);
  margin-bottom: clamp(0.4rem, 0.8vw, 0.75rem);
  cursor: grab;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
    transform: translateX(clamp(2px, 0.5vw, 4px));
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const WidgetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(0.4rem, 0.8vw, 0.75rem);
  margin-bottom: 0.5rem;
  
  .icon {
    color: ${props => props.theme?.colors?.accent || '#800000'};
    flex-shrink: 0;
    width: clamp(16px, 2.5vw, 18px);
    height: clamp(16px, 2.5vw, 18px);
  }
  
  .name {
    font-weight: 600;
    font-size: clamp(0.8rem, 1.5vw, 0.95rem);
    line-height: 1.2;
  }
`;

const WidgetDescription = styled.p`
  font-size: clamp(0.7rem, 1.3vw, 0.8rem);
  color: ${props => `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
  margin: 0;
  line-height: 1.3;
`;

const PreviewArea = styled.div`
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}30`};
  border-radius: clamp(8px, 1.5vw, 12px);
  overflow: hidden;
  min-height: 400px;
  width: 100%;
  max-width: 100%;
`;

const PreviewHeader = styled.div`
  background: ${props => `${props.theme?.colors?.headerBg || 'rgba(0, 0, 0, 0.9)'}F5`};
  backdrop-filter: blur(10px);
  padding: clamp(0.6rem, 1.2vw, 1rem) clamp(0.75rem, 1.5vw, 1.5rem);
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(0.3rem, 0.8vw, 0.5rem);

  h3 {
    margin: 0;
    font-size: clamp(0.85rem, 1.6vw, 1rem);
  }

  span {
    font-size: clamp(0.75rem, 1.4vw, 0.9rem);
    opacity: 0.7;
  }
`;

const WidgetContainer = styled.div`
  padding: ${props => props.noPadding ? '0' : 'clamp(0.75rem, 2vw, 2rem)'};
  position: relative;
  opacity: ${props => props.isHidden ? 0.5 : 1};
  transition: all 0.3s ease;
  max-width: 100%;
  overflow-x: hidden;
  
  ${props => props.isDragging && `
    background: ${props.theme?.colors?.accent}10;
    border: 2px dashed ${props.theme?.colors?.accent};
    border-radius: clamp(6px, 1vw, 8px);
  `}
`;

const WidgetControls = styled.div`
  position: absolute;
  top: clamp(0.4rem, 1vw, 1rem);
  right: clamp(0.4rem, 1vw, 1rem);
  display: flex;
  gap: clamp(0.2rem, 0.5vw, 0.5rem);
  background: ${props => `${props.theme?.colors?.background || '#000000'}E5`};
  backdrop-filter: blur(10px);
  padding: clamp(0.2rem, 0.5vw, 0.5rem);
  border-radius: clamp(6px, 1vw, 8px);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
  
  ${WidgetContainer}:hover & {
    opacity: 1;
  }
`;

const WidgetButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  padding: clamp(0.2rem, 0.5vw, 0.4rem);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  min-width: clamp(24px, 4vw, 32px);
  min-height: clamp(24px, 4vw, 32px);
  
  &:hover {
    background: ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  }
  
  svg {
    width: clamp(12px, 2vw, 16px);
    height: clamp(12px, 2vw, 16px);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: clamp(250px, 40vh, 400px);
  padding: clamp(1.5rem, 3vw, 3rem) clamp(1rem, 2vw, 2rem);
  text-align: center;
  
  svg {
    width: clamp(36px, 6vw, 48px);
    height: clamp(36px, 6vw, 48px);
    color: ${props => props.theme?.colors?.accent || '#800000'};
    margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
    opacity: 0.5;
  }
  
  h3 {
    font-size: clamp(1rem, 2vw, 1.2rem);
    margin-bottom: clamp(0.4rem, 0.8vw, 0.5rem);
  }
  
  p {
    color: ${props => `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
    font-size: clamp(0.8rem, 1.5vw, 0.9rem);
  }
`;

const AnnouncementBar = styled.div`
  background: ${props => props.style === 'supreme' ? 
    props.theme?.colors?.accent || '#FF0000' : 
    props.theme?.colors?.accentGradient || 'linear-gradient(90deg, #FF006E 0%, #8338EC 50%, #3A86FF 100%)'};
  color: white;
  padding: clamp(0.6rem, 1.2vw, 0.75rem);
  text-align: center;
  font-weight: 600;
  position: ${props => props.position === 'fixed' ? 'fixed' : 'relative'};
  top: ${props => props.position === 'fixed' ? '0' : 'auto'};
  width: 100%;
  z-index: 1000;
  font-size: clamp(0.8rem, 1.6vw, 1rem);
`;

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

const ShopProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
  margin: 1.5rem auto 3rem; /* Reduced top margin from 2rem and bottom from 4rem */
  padding: 1.5rem; /* Reduced from 2rem */

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

const MainContent = styled.div`
  max-width: ${props => props.theme?.styles?.containerWidth || '1400px'};
  margin: 0 auto;
  padding: 96px 2rem 2rem; /* Reduced from 120px by 20% */
  
  @media (max-width: 768px) {
    padding: 80px 1rem 2rem; /* Reduced from 100px by 20% */
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

const WelcomeHeader = styled.div`
  text-align: center;
  margin: 2rem auto 1rem;
  padding: 1rem;
  max-width: 800px;
  
  h2 {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
    margin-bottom: 0.5rem;
    font-weight: 400;
    
    .shop-name-text {
      background: ${props => props.theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)'};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
      font-size: clamp(1.5rem, 4vw, 2.2rem);
    }
  }
  
  .url-display {
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    color: ${props => `${props.theme?.colors?.text}80` || 'rgba(255, 255, 255, 0.5)'};
    font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
    margin-top: 0.25rem;
    font-weight: 300;
    letter-spacing: 0.5px;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  }
  
  h3 {
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
  max-height: ${props => props.expanded ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.4s ease;
  
  .details-content {
    padding-top: ${props => props.expanded ? '1rem' : '0'};
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 3rem; 
  margin: 4rem 0;
`;

// Update HeroBannerWidget
const HeroBannerWidget = ({ config, theme, editable, onUpdate }) => {
  const styles = {
    apple: {
      height: config.height === 'fullscreen' ? '100vh' : 
              config.height === 'large' ? 'clamp(50vh, 60vh, 70vh)' : 
              'clamp(30vh, 40vh, 50vh)',
      background: `linear-gradient(135deg, ${theme?.colors?.accent}20 0%, ${theme?.colors?.background} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: 'clamp(1rem, 3vw, 2rem)'
    }
  };

  return (
    <div style={styles[config.style]}>
      {editable ? (
        <ValidatedEditableText
          value={config.headline || "Welcome to Our Shop"}
          onChange={(value) => onUpdate({ ...config, headline: value })}
          placeholder="Enter headline"
          style={{
            fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
            fontWeight: 'bold',
            textAlign: 'center',
            color: theme?.colors?.text,
            lineHeight: 1.2
          }}
        />
      ) : (
        <h1 style={{ 
          fontSize: 'clamp(1.5rem, 5vw, 3.5rem)', 
          fontWeight: 'bold', 
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: '90%'
        }}>
          {config.headline || "Welcome to Our Shop"}
        </h1>
      )}
    </div>
  );
};

// Update ProductCarouselWidget
const ProductCarouselWidget = ({ config, theme, items = [], editable }) => {
  return (
    <div style={{ padding: 'clamp(0.75rem, 2vw, 2rem) 0' }}>
      <h2 style={{ 
        marginBottom: 'clamp(0.75rem, 1.5vw, 1.5rem)', 
        color: theme?.colors?.accent, 
        fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)',
        paddingLeft: 'clamp(0.5rem, 1vw, 1rem)'
      }}>
        Featured Products
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(150px, 20vw, 220px), 1fr))',
        gap: 'clamp(0.75rem, 1.5vw, 1.5rem)',
        padding: '0 clamp(0.5rem, 1vw, 1rem)'
      }}>
        {items.slice(0, config.itemsToShow).map((item, index) => (
          <div key={index} style={{
            background: `${theme?.colors?.surface}80`,
            borderRadius: 'clamp(6px, 1vw, 8px)',
            padding: 'clamp(0.75rem, 1.5vw, 1rem)',
            border: `1px solid ${theme?.colors?.accent}30`
          }}>
            <div style={{ 
              height: 'clamp(120px, 20vw, 180px)', 
              background: `${theme?.colors?.background}50`, 
              borderRadius: '4px', 
              marginBottom: 'clamp(0.5rem, 1vw, 1rem)' 
            }} />
            <h3 style={{ 
              fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)', 
              marginBottom: '0.5rem' 
            }}>
              {item.name || `Product ${index + 1}`}
            </h3>
            <p style={{ 
              color: theme?.colors?.accent, 
              fontWeight: 'bold',
              fontSize: 'clamp(0.9rem, 1.6vw, 1.1rem)'
            }}>
              ${item.price || '0.00'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Update StatsWidget
const StatsWidget = ({ config, theme, stats = {} }) => {
  const defaultStats = {
    totalSales: stats.totalSales || 0,
    customers: stats.customers || 0,
    rating: stats.rating || 4.5,
    products: stats.products || 0
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(120px, 20vw, 180px), 1fr))',
      gap: 'clamp(1rem, 2vw, 2rem)',
      padding: 'clamp(1.5rem, 3vw, 3rem)'
    }}>
      {Object.entries(defaultStats).map(([key, value]) => (
        <div key={key} style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
            fontWeight: 'bold', 
            color: theme?.colors?.accent,
            lineHeight: 1.2
          }}>
            {key === 'rating' ? `${value}★` : value}
          </div>
          <div style={{ 
            fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)', 
            opacity: 0.7, 
            textTransform: 'capitalize',
            marginTop: 'clamp(0.25rem, 0.5vw, 0.5rem)'
          }}>
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </div>
        </div>
      ))}
    </div>
  );
};

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
  // Add these state variables at the top of ShopPage component (around line 1000)
  const [shopNameError, setShopNameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [originalUsername, setOriginalUsername] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedSectionType, setSelectedSectionType] = React.useState('');

  const [shopContentType, setShopContentType] = useState('products');
  const [selectedHomeTemplate, setSelectedHomeTemplate] = useState(1);
  const [homeSections, setHomeSections] = useState([]);
  const [showSectionTypeModal, setShowSectionTypeModal] = useState(false); // ADD THIS LINE


  // REPLACE renderHomeView (around line 1400)
// REPLACE renderHomeView
const renderHomeView = () => {
  const renderSectionWithControls = (section, index) => {
    const sectionProps = {
      config: section.config,
      theme: shopData?.theme,
      shopItems: shopData?.items,
      editable: true,
      onUpdate: (newConfig) => handleUpdateSection(section.id, newConfig)
    };

    let SectionComponent;
    switch (section.type) {
      case 'hero-banner':
        SectionComponent = HeroBannerSection;
        break;
      case 'featured-items':
        SectionComponent = FeaturedItemsSection;
        break;
      case 'photo-gallery':
        SectionComponent = PhotoGallerySection;
        break;
      case 'featured-video':
        SectionComponent = FeaturedVideoSection;
        break;
      case 'mission-statement':
        SectionComponent = MissionStatementSection;
        break;
      case 'calendar-events':
        SectionComponent = CalendarEventsSection;
        break;
      case 'services-grid':
        SectionComponent = ServicesGridSection;
        break;
      case 'contact':
        SectionComponent = ContactSection;
        break;
      case 'text-block':
        SectionComponent = TextBlockSection;
        break;
      default:
        return null;
    }

    return (
      <SectionWrapper key={section.id} theme={shopData?.theme}>
        <SectionControls className="section-controls">
          <SectionControlButton
            theme={shopData?.theme}
            onClick={() => handleMoveSection(section.id, 'up')}
            disabled={index === 0}
            title="Move up"
          >
            <ChevronUp size={16} />
          </SectionControlButton>
          
          <SectionControlButton
            theme={shopData?.theme}
            onClick={() => handleMoveSection(section.id, 'down')}
            disabled={index === homeSections.length - 1}
            title="Move down"
          >
            <ChevronDown size={16} />
          </SectionControlButton>
          
          <SectionControlButton
            theme={shopData?.theme}
            className="delete"
            onClick={() => handleRemoveSection(section.id)}
            title="Delete section"
          >
            <Trash2 size={16} />
          </SectionControlButton>
        </SectionControls>

        <SectionComponent {...sectionProps} />
      </SectionWrapper>
    );
  };

  return (
    <>
      {/* Template Selector - Centered */}
      <TemplateSelector />

      {/* Live Preview with Editable Sections */}
      <LivePreviewContainer theme={shopData?.theme}>
        <LivePreviewHeader theme={shopData?.theme}>
          Live Preview - Edit Sections Below
        </LivePreviewHeader>

        {homeSections.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            color: shopData?.theme?.colors?.text,
            opacity: 0.6
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              No sections yet
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              Click the + button below to add your first section
            </p>
          </div>
        ) : (
          homeSections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => renderSectionWithControls(section, index))
        )}

        {/* Add Section Card */}
        <AddSectionCard
          theme={shopData?.theme}
          onClick={() => setShowSectionTypeModal(true)}
        >
          <div className="plus-icon">
            <Plus size={24} />
          </div>
          <div className="add-text">Add New Section</div>
        </AddSectionCard>
      </LivePreviewContainer>

      {/* Section Type Modal */}
      <ModalOverlay 
        show={showSectionTypeModal} 
        onClick={() => setShowSectionTypeModal(false)}
      />
      {showSectionTypeModal && (
        <SectionTypeModal theme={shopData?.theme}>
          <h3 style={{
            margin: '0 0 1.5rem 0',
            color: shopData?.theme?.colors?.accent,
            fontSize: '1.1rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Choose Section Type
          </h3>
          
          {SECTION_TYPES.map(type => (
            <SectionTypeOption
              key={type.value}
              theme={shopData?.theme}
              onClick={() => {
                handleAddSection(type.value);
                setShowSectionTypeModal(false);
              }}
            >
              <span className="icon">{type.icon}</span>
              <div className="info">
                <div className="label">{type.label}</div>
              </div>
            </SectionTypeOption>
          ))}
        </SectionTypeModal>
      )}
    </>
  );
};

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

  const updatedServices = [...(shopData.services || []), newService];
  setShopData(prev => ({ ...prev, services: updatedServices }));
};

const handleServiceUpdate = (serviceId, updates) => {
  const updatedServices = shopData.services.map(service =>
    service.id === serviceId ? { ...service, ...updates } : service
  );

  setShopData(prev => ({
    ...prev,
    services: updatedServices
  }));
};

const handleServiceDelete = (serviceId) => {
  setShopData(prev => ({
    ...prev,
    services: prev.services.filter(service => service.id !== serviceId)
  }));
};

const handleAddSection = (sectionType) => {
  const newSection = {
    id: `section-${Date.now()}`,
    type: sectionType,
    order: homeSections.length,
    config: getDefaultSectionConfig(sectionType)
  };
  
  setHomeSections([...homeSections, newSection]);
};

const getDefaultSectionConfig = (type) => {
  switch (type) {
    case 'hero-banner':
      return {
        headline: shopData?.name || 'Welcome',
        subtitle: 'Discover amazing products',
        backgroundImage: null,
        height: '70vh'
      };
    case 'featured-items':
      return {
        title: 'Featured Items',
        itemCount: 4
      };
    case 'photo-gallery':
      return {
        title: 'Gallery',
        images: [],
        displayStyle: 'grid'
      };
    case 'featured-video':
      return {
        title: 'Featured Video',
        youtubeUrl: '',
        videoId: null
      };
    case 'mission-statement':
      return {
        title: 'Our Mission',
        content: shopData?.mission || ''
      };
    case 'calendar-events':
      return {
        title: 'Upcoming Events',
        events: []
      };
    case 'services-grid':
      return {
        title: 'Our Services',
        services: []
      };
    case 'contact':
      return {
        title: 'Get In Touch',
        email: '',
        phone: '',
        address: ''
      };
    case 'text-block':
      return {
        title: '',
        content: '',
        alignment: 'left'
      };
    default:
      return {};
  }
};

const handleUpdateSection = (sectionId, newConfig) => {
  setHomeSections(homeSections.map(section =>
    section.id === sectionId ? { ...section, config: newConfig } : section
  ));
};

const handleRemoveSection = (sectionId) => {
  setHomeSections(homeSections.filter(section => section.id !== sectionId));
};

const handleReorderSections = (result) => {
  if (!result.destination) return;

  const items = Array.from(homeSections);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);

  // Update order property
  const reorderedItems = items.map((item, index) => ({
    ...item,
    order: index
  }));

  setHomeSections(reorderedItems);
};

const handleMoveSection = (sectionId, direction) => {
  const currentIndex = homeSections.findIndex(s => s.id === sectionId);
  if (currentIndex === -1) return;

  const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (newIndex < 0 || newIndex >= homeSections.length) return;

  const items = Array.from(homeSections);
  const [movedItem] = items.splice(currentIndex, 1);
  items.splice(newIndex, 0, movedItem);

  const reorderedItems = items.map((item, index) => ({
    ...item,
    order: index
  }));

  setHomeSections(reorderedItems);
};

  
// ADD toggle function:
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

  // Store original username when shop loads
  useEffect(() => {
    if (shopData?.username) {
      setOriginalUsername(shopData.username);
    }
  }, [shopData?.username]);

  // Add username checking function
  const checkUsernameAvailability = async (shopName, currentUsername) => {
    if (!shopName) {
      setShopNameError('Shop name is required');
      setUsernameAvailable(null);
      return;
    }

    // If shop name hasn't changed from what generated the current username, skip check
    const potentialUsername = shopName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);

    if (potentialUsername === currentUsername) {
      setShopNameError('');
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    setShopNameError('');
    setUsernameAvailable(null);

    try {
      if (!potentialUsername) {
        setShopNameError('Shop name must contain letters or numbers');
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
    } finally {
      setCheckingUsername(false);
    }
  };

  // Add debounced username check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (shopData?.name) {
        checkUsernameAvailability(shopData.name, originalUsername);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [shopData?.name, originalUsername]);


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
      selectedHomeTemplate,
      homeSections, // ADD THIS LINE
      updatedAt: new Date().toISOString()
    });

    await updateDoc(shopRef, updateData);
    
    setOriginalShopData(JSON.parse(JSON.stringify(shopData)));
    setHasUnsavedChanges(false);
    setValidationErrors({});
    
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

  // Update the loadShopData function (around line 1100)
// Update the loadShopData useEffect (around line 1100)
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
        
        // ADD: Filter out deleted services
        if (data.services) {
          data.services = data.services.filter(service => !service.deleted);
        } else {
          // Initialize services array if it doesn't exist
          data.services = [];
        }
        
        setShopData(data);
        setOriginalShopData(JSON.parse(JSON.stringify(data)));
        
        if (data.selectedHomeTemplate) {
          setSelectedHomeTemplate(data.selectedHomeTemplate);
        }
        
        // Load or initialize sections
        if (data.homeSections && data.homeSections.length > 0) {
          setHomeSections(data.homeSections);
        } else {
          const defaultSections = getDefaultSectionsForTemplate(data.selectedHomeTemplate || 1);
          setHomeSections(defaultSections);
          
          const shopRef = doc(db, 'shops', userId);
          await updateDoc(shopRef, {
            homeSections: defaultSections,
            selectedHomeTemplate: data.selectedHomeTemplate || 1,
            updatedAt: new Date().toISOString()
          });
          console.log('✅ Initialized home sections');
        }
        
        console.log('✅ Shop data loaded:', {
          items: data.items?.length || 0,
          services: data.services?.length || 0
        });
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
  // Update handleUpdateShop function (around line 1200)
  const handleUpdateShop = async (updates) => {
    // If shop name is being updated, check username
    if (updates.name && updates.name !== shopData.name) {
      if (shopNameError || usernameAvailable === false) {
        alert('Please choose a different shop name - this one is already taken');
        return;
      }

      // Generate new username
      try {
        const { generateUsername } = await import('../../firebase/firebaseService');
        updates.username = await generateUsername(updates.name);
        setOriginalUsername(updates.username);
      } catch (error) {
        console.error('Error generating username:', error);
      }
    }

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

  // Add this function in ShopPage.js if it doesn't exist (around line 1300)
const getDefaultSectionsForTemplate = (templateId) => {
  const baseHero = {
    id: 'hero-1',
    type: 'hero-banner',
    order: 0,
    config: {
      headline: shopData?.name || 'Welcome',
      subtitle: 'Discover amazing products',
      backgroundImage: null,
      height: '70vh'
    }
  };

  const baseFeatured = {
    id: 'featured-1',
    type: 'featured-items',
    order: 1,
    config: {
      title: 'Featured Items',
      itemCount: 4
    }
  };

  const baseMission = {
    id: 'mission-1',
    type: 'mission-statement',
    order: 2,
    config: {
      title: 'Our Mission',
      content: shopData?.mission || 'We are dedicated to providing exceptional products and services.'
    }
  };

  switch (templateId) {
    case 1: // Streetwear
      return [
        baseHero,
        baseFeatured,
        {
          id: 'services-1',
          type: 'services-grid',
          order: 2,
          config: {
            title: 'Why Choose Us',
            services: [
              { id: '1', icon: 'Truck', title: 'Fast Shipping', description: 'Quick delivery to your door' },
              { id: '2', icon: 'Shield', title: 'Secure Payment', description: 'Your payment is safe' },
              { id: '3', icon: 'Clock', title: '24/7 Support', description: 'Always here to help' },
              { id: '4', icon: 'Award', title: 'Quality Guarantee', description: 'Top-notch products' }
            ]
          }
        }
      ];
    
    case 2: // Organization
      return [
        baseHero,
        baseMission,
        {
          id: 'events-1',
          type: 'calendar-events',
          order: 2,
          config: {
            title: 'Upcoming Events',
            events: []
          }
        }
      ];
    
    case 3: // Tech
      return [
        baseHero,
        baseFeatured,
        {
          id: 'video-1',
          type: 'featured-video',
          order: 2,
          config: {
            title: 'Featured Tech',
            youtubeUrl: '',
            videoId: null
          }
        }
      ];
    
    case 4: // Minimalist
      return [
        baseHero,
        baseFeatured,
        baseMission
      ];
    
    case 5: // Local Market
      return [
        baseHero,
        baseFeatured,
        {
          id: 'contact-1',
          type: 'contact',
          order: 2,
          config: {
            title: 'Visit Us',
            email: '',
            phone: '',
            address: ''
          }
        }
      ];
    
    default:
      return [baseHero, baseFeatured, baseMission];
  }
};
  
  // UPDATE handleAddItem function in ShopPage.js (around line 1400)
  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: 'Item Name', // ADD DEFAULT ITEM NAME
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
  // REPLACE the entire handleImageUpload function
  const handleImageUpload = async (itemId, imageIndex, file) => {
    try {
      setUploading(prev => ({ ...prev, [itemId]: true }));

      // ADD: Import compression utility
      const { compressImage } = await import('../../utils/imageCompression');

      // Compress the image before upload
      const compressedFile = await compressImage(file);

      const storageRef = ref(
        storage, 
        `shops/${auth.currentUser.uid}/items/${itemId}/image-${imageIndex}-${Date.now()}`
      );

      const metadata = {
        contentType: compressedFile.type || 'image/jpeg',
        cacheControl: 'public, max-age=31536000'
      };

      const snapshot = await uploadBytes(storageRef, compressedFile, metadata);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // FIX: Check both items and services
      const currentItem = shopData.items?.find(item => item.id === itemId);
      const currentService = shopData.services?.find(service => service.id === itemId);

      if (currentItem) {
        // Update item image
        const newImages = [...currentItem.images];
        newImages[imageIndex] = imageUrl;
        handleItemUpdate(itemId, { images: newImages });
      } else if (currentService) {
        // Update service image
        const newImages = [...currentService.images];
        newImages[imageIndex] = imageUrl;
        handleServiceUpdate(itemId, { images: newImages });
      } else {
        console.error('Item/Service not found:', itemId);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const templates = [
    { id: 1, name: 'Streetwear', desc: 'Bold & Urban', component: StreetwearTemplate },
    { id: 2, name: 'Organization', desc: 'Events & Calendar', component: OrganizationTemplate },
    { id: 3, name: 'Tech', desc: 'Futuristic', component: TechTemplate },
    { id: 4, name: 'Minimalist', desc: 'Clean & Elegant', component: MinimalistTemplate },
    { id: 5, name: 'Local Market', desc: 'Community', component: LocalMarketTemplate }
  ];

// Replace TemplateSelector component
const TemplateSelector = () => {
  const templates = [
    { id: 1, name: 'Streetwear', desc: 'Bold & Urban' },
    { id: 2, name: 'Organization', desc: 'Events & Calendar' },
    { id: 3, name: 'Tech', desc: 'Futuristic' },
    { id: 4, name: 'Minimalist', desc: 'Clean & Elegant' },
    { id: 5, name: 'Local Market', desc: 'Community' }
  ];

  const handleTemplateChange = (templateId) => {
    setSelectedHomeTemplate(templateId);
    const defaultSections = getDefaultSectionsForTemplate(templateId);
    setHomeSections(defaultSections);
  };

  return (
    <TemplateSelectorWrapper>
      <TemplateSelectorContainer theme={shopData?.theme}>
        <h3 style={{
          fontSize: '1.2rem',
          marginBottom: '1rem',
          color: shopData?.theme?.colors?.accent,
          fontWeight: '600',
          textAlign: 'center'
        }}>
          Select Home Page Template
        </h3>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => handleTemplateChange(template.id)}
              style={{
                background: selectedHomeTemplate === template.id ? 
                  shopData?.theme?.colors?.accent : 'transparent',
                color: selectedHomeTemplate === template.id ? 
                  'white' : shopData?.theme?.colors?.text,
                border: `2px solid ${shopData?.theme?.colors?.accent}`,
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
            >
              <div>{template.name}</div>
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.8,
                marginTop: '0.25rem'
              }}>
                {template.desc}
              </div>
            </button>
          ))}
        </div>
      </TemplateSelectorContainer>
    </TemplateSelectorWrapper>
  );
};


  const SelectedTemplate = templates[selectedHomeTemplate];

  // Add this function in ShopPage component
const initializeHomeSections = (data) => {
  // If shop already has sections, return data as-is
  if (data.homeSections && Array.isArray(data.homeSections) && data.homeSections.length > 2) {
    return data;
  }

  // Otherwise, add default sections
  const templateId = data.selectedHomeTemplate || 1;
  const defaultSections = getDefaultSectionsForTemplate(templateId);
  
  return {
    ...data,
    homeSections: defaultSections,
    selectedHomeTemplate: templateId
  };
};




  return (
    <ThemeProvider theme={shopData?.theme || DEFAULT_THEME}>
      <PageContainer>      
        <Header theme={shopData?.theme}>
          <HeaderLeft>
            <HeaderLogo onClick={() => navigate('/')} theme={shopData?.theme}>
              {shopData?.name || 'MY SHOP'}
            </HeaderLogo>
          </HeaderLeft>

          <HeaderRight>
            <HeaderTabButton
              theme={shopData?.theme}
              active={activeTab === 'home'}
              onClick={() => setActiveTab('home')}
              title="Home"
            >
              <Home size={22} />
              <span className="tab-label">Home</span>
            </HeaderTabButton>

            <HeaderTabButton
              theme={shopData?.theme}
              active={activeTab === 'shop'}
              onClick={() => setActiveTab('shop')}
              title="Shop"
            >
              <Store size={22} />
              <span className="tab-label">Shop</span>
            </HeaderTabButton>

            <HeaderTabButton
              theme={shopData?.theme}
              active={activeTab === 'community'}
              onClick={() => setActiveTab('community')}
              title="Community"
            >
              <Users size={22} />
              <span className="tab-label">Community</span>
            </HeaderTabButton>
            
          </HeaderRight>
        </Header>   

        {/* REPLACE or ADD Floating Controls before ThemeContainer */}
        <FloatingControls>
          <FloatingButton
            onClick={refreshTheme}
            theme={shopData?.theme}
            className={isRefreshing ? "spinning" : ""}
            title="Random theme"
          >
            <RefreshCw size={24} />
          </FloatingButton>       

          <FloatingButton
            onClick={togglePinStyle}
            theme={shopData?.theme}
            isPinned={isPinned}
            title={isPinned ? "Unpin theme" : "Pin theme"}
          >
            <Pin size={24} />
          </FloatingButton>
        </FloatingControls>

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
                      onClick={async () => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (e) => {
                          if (e.target.files?.[0]) {
                            try {
                              const file = e.target.files[0];                     

                              // Compress profile image (smaller size for profiles)
                              const compressedFile = await compressProfileImage(file);                      

                              // Create preview
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleUpdateShop({ 
                                  profile: {
                                    file: compressedFile, // Use compressed
                                    preview: reader.result,
                                    type: compressedFile.type,
                                    name: compressedFile.name
                                  }
                                });
                              };
                              reader.readAsDataURL(compressedFile);                     

                              // Upload to Firebase
                              const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                              const { storage, auth } = await import('../../firebase/config');                      

                              const profileRef = ref(
                                storage, 
                                `shops/${auth.currentUser.uid}/profile/profile-${Date.now()}`
                              );
                              
                              const snapshot = await uploadBytes(profileRef, compressedFile, {
                                contentType: compressedFile.type,
                                cacheControl: 'public, max-age=31536000'
                              });
                              
                              const imageUrl = await getDownloadURL(snapshot.ref);
                              handleUpdateShop({ profile: imageUrl });
                            } catch (error) {
                              console.error('Error uploading profile image:', error);
                              alert('Failed to upload profile image');
                            }
                          }
                        };
                        input.click();
                      }}
                    />
                  ) : shopData?.profile?.preview ? (
                    // Show preview if exists
                    <img 
                      src={shopData.profile.preview} 
                      alt="Profile Preview" 
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

                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleUpdateShop({ 
                                  profile: {
                                    file: file,
                                    preview: reader.result,
                                    type: file.type,
                                    name: file.name
                                  }
                                });
                              };
                              reader.readAsDataURL(file);

                              const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                              const { storage } = await import('../../firebase/config');
                              const { auth } = await import('../../firebase/config');

                              const profileRef = ref(
                                storage, 
                                `shops/${auth.currentUser.uid}/profile/profile-${Date.now()}`
                              );
                              const metadata = {
                                contentType: file.type || 'image/jpeg',
                                cacheControl: 'public,max-age=31536000'
                              };
                              const snapshot = await uploadBytes(profileRef, file, metadata);
                              const imageUrl = await getDownloadURL(snapshot.ref);

                              handleUpdateShop({ profile: imageUrl });
                            } catch (error) {
                              console.error('Error uploading profile image:', error);
                              alert('Failed to upload profile image');
                            }
                          }
                        };
                        input.click();
                      }}
                    />
                  ) : (
                    // Use EditableImage for initial upload
                    <EditableImage
                      value={null}
                      onChange={async (value) => {
                        if (value?.file) {
                          try {
                            // Update local state with preview first
                            handleUpdateShop({ profile: value });

                            // Upload to Firebase
                            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                            const { storage } = await import('../../firebase/config');
                            const { auth } = await import('../../firebase/config');

                            const profileRef = ref(
                              storage, 
                              `shops/${auth.currentUser.uid}/profile/profile-${Date.now()}`
                            );
                            const metadata = {
                              contentType: value.type || 'image/jpeg',
                              cacheControl: 'public,max-age=31536000'
                            };
                            const snapshot = await uploadBytes(profileRef, value.file, metadata);
                            const imageUrl = await getDownloadURL(snapshot.ref);

                            // Update with actual URL
                            handleUpdateShop({ profile: imageUrl });
                          } catch (error) {
                            console.error('Error uploading profile image:', error);
                            alert('Failed to upload profile image');
                          }
                        }
                      }}
                      theme={shopData?.theme}
                      round
                      width="150px"
                      height="150px"
                    />
                  )}
                </div>
                <div className="shop-name-container">
                  <ShopNameInputContainer>
                    <ShopNameInput
                      value={shopData?.name || ''}
                      onChange={(e) => handleUpdateShop({ name: e.target.value })}
                      placeholder="Shop Name"
                      fontSize={shopNameFontSize}
                      theme={shopData?.theme}
                      isError={!!shopNameError}
                    />
                    {checkingUsername && (
                      <ShopNameError theme={shopData?.theme}>
                        Checking availability...
                      </ShopNameError>
                    )}
                    {shopNameError && (
                      <ShopNameError theme={shopData?.theme}>
                        {shopNameError}
                      </ShopNameError>
                    )}
                  </ShopNameInputContainer>
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

            {/* Shop Content Type Tabs */}
            <ShopTabContainer>
              <ShopTab
                active={shopContentType === 'products'}
                onClick={() => setShopContentType('products')}
                theme={shopData?.theme}
              >
                <Package size={18} />
                Products
              </ShopTab>
              <ShopTab
                active={shopContentType === 'services'}
                onClick={() => setShopContentType('services')}
                theme={shopData?.theme}
              >
                <Store size={18} />
                Services
              </ShopTab>
            </ShopTabContainer>

            {/* Conditional rendering based on shopContentType */}
            {shopContentType === 'products' ? (
              <>
                <AddItemButton onClick={handleAddItem} theme={shopData?.theme}>
                  <Plus size={20} />
                  Add Product
                </AddItemButton>
            
                <ItemGrid>
                  {shopData?.items?.map(item => {
                    const isExpanded = expandedItems.has(item.id);
                  
                    return (
                      <ItemCard key={item.id}>
                        <DeleteButton onClick={() => handleDeleteItem(item.id)}>
                          <X size={16} />
                        </DeleteButton>
                    
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
                          <ItemHeader onClick={() => toggleItemExpansion(item.id)}>
                            <h3>
                              {item.name && item.name !== 'Item Name' ? 
                                item.name : 
                                <span style={{ opacity: 0.5 }}>Item Name</span>
                              }
                            </h3>
                            <ExpandButton>
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </ExpandButton>
                          </ItemHeader>
                            
                          <ItemDetails expanded={isExpanded}>
                            <div className="details-content">
                              <ValidatedEditableText
                                value={item.name}
                                onChange={(value) => handleItemUpdate(item.id, { name: value })}
                                placeholder="Item Name"
                                theme={shopData?.theme}
                              />
                              <ValidatedEditableText
                                value={item.price}
                                onChange={(value) => handleItemUpdate(item.id, { price: value })}
                                placeholder="Price"
                                theme={shopData?.theme}
                              />
                              <ValidatedEditableText
                                value={item.description}
                                onChange={(value) => handleItemUpdate(item.id, { description: value })}
                                placeholder="Item Description"
                                multiline
                                theme={shopData?.theme}
                              />
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
                            </div>
                          </ItemDetails>
                        </ItemContent>
                      </ItemCard>
                    );
                  })}
                </ItemGrid>
              </>
            ) : (
              <>
                <AddItemButton onClick={handleAddService} theme={shopData?.theme}>
                  <Plus size={20} />
                  Add Service
                </AddItemButton>
            
                <ItemGrid>
                  {shopData?.services?.map(service => {
                    const isExpanded = expandedItems.has(service.id);
                  
                    return (
                      <ItemCard key={service.id}>
                        <DeleteButton onClick={() => handleServiceDelete(service.id)}>
                          <X size={16} />
                        </DeleteButton>
                    
                        <ItemImageContainer>
                          {uploading[service.id] && (
                            <UploadingOverlay>
                              <LoadingSpinner />
                            </UploadingOverlay>
                          )}
                          <div 
                            className="image-container"
                            onClick={() => {
                              if (!service.images[service.currentImageIndex]) {
                                document.getElementById(`service-image-upload-${service.id}-${service.currentImageIndex}`).click();
                              }
                            }}
                          >
                            {service.images[service.currentImageIndex] ? (
                              <img 
                                src={service.images[service.currentImageIndex]} 
                                alt={service.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="placeholder">
                                <Store size={24} />
                                <span>Upload Image</span>
                              </div>
                            )}
                          </div>
                          
                          {service.images.some(img => img) && (
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

                          <input
                            type="file"
                            id={`service-image-upload-${service.id}-${service.currentImageIndex}`}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(service.id, service.currentImageIndex, e.target.files[0]);
                              }
                            }}
                          />
                        </ItemImageContainer>
                          
                        <ItemContent>
                          <ItemHeader onClick={() => toggleItemExpansion(service.id)}>
                            <h3>
                              {service.name && service.name !== 'Service Name' ? 
                                service.name : 
                                <span style={{ opacity: 0.5 }}>Service Name</span>
                              }
                            </h3>
                            <ExpandButton>
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </ExpandButton>
                          </ItemHeader>
                            
                          <ItemDetails expanded={isExpanded}>
                            <div className="details-content">
                              <ValidatedEditableText
                                value={service.name}
                                onChange={(value) => handleServiceUpdate(service.id, { name: value })}
                                placeholder="Service Name"
                                theme={shopData?.theme}
                              />
                              <ValidatedEditableText
                                value={service.price}
                                onChange={(value) => handleServiceUpdate(service.id, { price: value })}
                                placeholder="Price"
                                theme={shopData?.theme}
                              />
                              <ValidatedEditableText
                                value={service.description}
                                onChange={(value) => handleServiceUpdate(service.id, { description: value })}
                                placeholder="Service Description"
                                multiline
                                theme={shopData?.theme}
                              />
                              <CategorySelect
                                value={service.category || 'Other'}
                                onChange={(e) => handleServiceUpdate(service.id, { category: e.target.value })}
                                theme={shopData?.theme}
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
                                  theme={shopData?.theme}
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
                              <DeleteSection>
                                <DeleteItemButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleServiceDelete(service.id);
                                  }}
                                >
                                  <Trash2 size={16} />
                                  Remove Service
                                </DeleteItemButton>
                              </DeleteSection>
                            </div>
                          </ItemDetails>
                        </ItemContent>
                      </ItemCard>
                    );
                  })}
                </ItemGrid>
              </>
            )}
          </>
        )}

          {activeTab === 'home' && renderHomeView()}

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