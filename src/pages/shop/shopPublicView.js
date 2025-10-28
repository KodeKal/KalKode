// src/pages/shop/shopPublicView.js - Mobile Optimized

import { useParams, useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { DEFAULT_THEME } from '../../theme/config/themes';
import BuyDialog from '../../components/Transaction/BuyDialog';

import { useLocation } from '../../contexts/LocationContext';
import { getDistance } from 'geolib';
import { 
  ShoppingCart, 
  Heart, 
  MessageCircle, 
  Package,
  Briefcase,
  Navigation, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Store,
  X,
  RefreshCw,
  Pin,
  Plus, 
  Minus, 
  Grid,
  Columns,
  ArrowLeft,
  Home,
  Users,
  LogOut
} from 'lucide-react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TabPositioner from './components/TabPositioner';
import { WELCOME_STYLES } from '../../theme/welcomeStyles';
import {
  StreetwearTemplate,
  OrganizationTemplate,
  TechTemplate,
  MinimalistTemplate,
  LocalMarketTemplate
} from './HomePageTemplate';

import FeaturedItem from '../../components/shop/FeaturedItem';


const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0 0.5rem;
  
  @media (min-width: 768px) {
    margin-bottom: 1rem;
    padding: 0;
  }
  
  h2 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    font-size: 1.3rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    margin: 0;
    
    @media (min-width: 768px) {
      font-size: 1.8rem;
    }
  }
  
  .view-all {
    font-size: 0.8rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    opacity: 0.8;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    transition: all 0.3s ease;
    
    @media (min-width: 768px) {
      font-size: 0.9rem;
      gap: 0.5rem;
    }
    
    &:active {
      opacity: 1;
      transform: translateX(3px);
    }
  }
`;

const CategoryGridWrapper = styled.div`
  margin-bottom: 2rem;
  
  /* Desktop: Regular grid */
  @media (min-width: 769px) {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }
  
  @media (max-width: 1200px) and (min-width: 769px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 900px) and (min-width: 769px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  /* Mobile: Scrollable rows */
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

const CategoryScrollableGrid = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: ${props => props.itemCount <= 5 ? '1fr' : 'repeat(2, 1fr)'};
    grid-template-columns: ${props => {
      const cols = Math.ceil(props.itemCount / (props.itemCount <= 5 ? 1 : 2));
      return `repeat(${cols}, minmax(280px, 1fr))`;
    }};
    gap: 1rem;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 0.5rem;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    min-height: ${props => props.itemCount <= 5 ? '42.5vh' : '85vh'};
    align-items: stretch;
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
      border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${props => props.theme?.colors?.accent || '#800000'};
      border-radius: 10px;
    }
    
    > * {
      scroll-snap-align: start;
      min-width: 0;
    }
  }
  
  @media (max-width: 480px) {
    grid-template-columns: ${props => {
      const cols = Math.ceil(props.itemCount / (props.itemCount <= 5 ? 1 : 2));
      return `repeat(${cols}, minmax(240px, 1fr))`;
    }};
    gap: 0.75rem;
  }
`;

// Zoomed Item Overlay (matching WelcomePage)
const ZoomOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.95)'}F5`};
  z-index: 10000;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const ZoomContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 2 / 5;
  max-height: 85vh;
  background: ${props => props.theme?.colors?.background || '#000000'};
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    max-width: 420px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    max-width: 95%;
    border-radius: 10px;
  }
`;

const ImageCarousel = styled.div`
  position: relative;
  width: 100%;
  height: 70%;
  background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
  overflow: hidden;
  flex-shrink: 0;
  
  .image-track {
    display: flex;
    height: 100%;
    transition: transform 0.3s ease;
    transform: translateX(${props => props.currentIndex * -100}%);
  }
  
  .image-slide {
    min-width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: ${props => `${props.theme?.colors?.background || '#000000'}40`};
    }
    
    .no-image {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      color: ${props => props.theme?.colors?.text || '#FFFFFF'};
      opacity: 0.3;
      
      p {
        margin: 0;
        font-size: 0.85rem;
      }
    }
  }
  
  .carousel-dots {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.4rem;
    z-index: 2;
    padding: 0.4rem 0.75rem;
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.6)'}CC`};
    border-radius: 20px;
    backdrop-filter: blur(8px);
  }
  
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => props.theme?.colors?.text || '#FFFFFF'};
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.2);
    }
  }
  
  .carousel-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.7)'}DD`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}40` || 'rgba(255, 255, 255, 0.2)'};
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme?.colors?.text || 'white'};
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 2;
    
    &:hover {
      opacity: 1 !important;
      background: ${props => props.theme?.colors?.accent || '#800000'};
      transform: translateY(-50%) scale(1.1);
    }
    
    &.prev {
      left: 1rem;
    }
    
    &.next {
      right: 1rem;
    }
    
    &:disabled {
      opacity: 0 !important;
      cursor: not-allowed;
    }
    
    @media (max-width: 480px) {
      width: 32px;
      height: 32px;
      
      &.prev {
        left: 0.5rem;
      }
      
      &.next {
        right: 0.5rem;
      }
      
      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
  
  &:hover .carousel-button {
    opacity: 0.7;
  }
  
  .close-overlay-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.8)'}DD`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}60` || 'rgba(255, 255, 255, 0.3)'};
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);
    z-index: 3;
    opacity: 0.8;
    
    &:hover {
      opacity: 1;
      background: ${props => props.theme?.colors?.accent || '#800000'};
      border-color: ${props => props.theme?.colors?.accent || '#800000'};
      transform: scale(1.1);
    }
    
    &:active {
      transform: scale(0.95);
    }
    
    @media (max-width: 480px) {
      width: 32px;
      height: 32px;
      top: 0.75rem;
      right: 0.75rem;
      
      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
`;

const ZoomContent = styled.div`
  height: 30%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${props => props.theme?.colors?.background || '#000000'};
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => `${props.theme?.colors?.accent || '#800000'}60`};
    border-radius: 2px;
    
    &:hover {
      background: ${props => props.theme?.colors?.accent || '#800000'};
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.875rem;
    gap: 0.625rem;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}20`};
  border-radius: 6px;
  padding: 0.5rem 0.75rem;

  .quantity-label {
    fontSize: '0.8rem';
    fontWeight: '600';
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .quantity-btn {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1.5px solid ${props => props.theme?.colors?.accent || '#800000'};
      background: transparent;
      color: ${props => props.theme?.colors?.accent || '#800000'};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      
      &:active:not(:disabled) {
        transform: scale(0.9);
        background: ${props => props.theme?.colors?.accent || '#800000'};
        color: white;
      }
      
      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      
      svg {
        width: 12px;
        height: 12px;
      }
    }
    
    .quantity-display {
      font-size: 1rem;
      font-weight: bold;
      color: ${props => props.theme?.colors?.text || 'white'};
      min-width: 24px;
      text-align: center;
    }
  }
`;


// Cache shop data in memory to avoid refetching
const shopCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Prefetch function - can be called from router/link hover
export const prefetchShopData = async (shopId) => {
  const cached = shopCache.get(shopId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const shopRef = doc(db, 'shops', shopId);
  const shopSnap = await getDoc(shopRef);
  
  if (shopSnap.exists()) {
    const data = shopSnap.data();
    shopCache.set(shopId, {
      data,
      timestamp: Date.now()
    });
    return data;
  }
  return null;
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

// Mobile-first styled components following WelcomePage pattern
const PageContainer = styled.div.attrs({ className: 'page-container' })`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#000000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  position: relative;
  overflow: hidden;
  
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

// REPLACE the existing HeaderTabButton with:
const HeaderTabButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.active ? 
    props.theme?.colors?.accent : 
    `${props.theme?.colors?.text}60`};
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  transition: all 0.3s ease;
  position: relative;
  min-width: 60px;
  
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
    white-space: nowrap;
    
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

// Update HeaderLeft and HeaderRight
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

const HeaderTab = styled.button`
  background: ${props => props.active ? 
    props.theme?.colors?.tabActiveBg || 'rgba(128, 0, 0, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.active ? 
    props.theme?.colors?.tabBorder || '#800000' : 
    `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  color: ${props => props.active ? 
    props.theme?.colors?.text || '#FFFFFF' : 
    `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active ? 
      props.theme?.colors?.tabActiveBg || 'rgba(128, 0, 0, 0.2)' : 
      `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Update TabContainer to hide on desktop
const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  overflow-x: auto;
  padding: 0.5rem 0;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.colors?.accent || '#800000'};
    border-radius: 2px;
  }
  
  @media (min-width: 768px) {
    display: none; // Hide on desktop
  }
`;

const ProfileCover = styled.div`
  width: 100%;
  height: 160px; /* Reduced from 200px by 20% */
  background: ${props => props.coverImage ? 
    `url(${props.coverImage})` : 
    props.theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)'};
  background-size: cover;
  background-position: center;
  position: relative;
  margin-bottom: -48px; /* Reduced from -60px by 20% */
  
  @media (min-width: 768px) {
    height: 240px; /* Reduced from 300px by 20% */
    margin-bottom: -60px; /* Reduced from -75px by 20% */
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to bottom, transparent, ${props => props.theme?.colors?.background || '#000000'});
  }
`;

const ShopProfileSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 0 0 1.5rem 0;
  padding: 0 1rem 1rem 1rem;

  @media (max-width: 768px) {
    margin: 0 0 1rem 0;
    padding: 0 0.75rem 0.75rem 0.75rem;
  }

  .profile-image {
    margin-bottom: 1rem;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.1);
    border: 4px solid ${props => props.theme?.colors?.background || '#000000'};
    box-shadow: 0 0 20px ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
    
    @media (min-width: 768px) {
      width: 150px;
      height: 150px;
      border-width: 5px;
    }
    
    @media (max-width: 480px) {
      width: 100px;
      height: 100px;
      border-width: 3px;
      margin-bottom: 0.75rem;
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .shop-name {
    font-size: ${props => props.fontSize || '2rem'};
    font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
    background: ${props => props.theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0.5rem 0;
    
    @media (min-width: 768px) {
      font-size: ${props => props.fontSize || '2.5rem'};
    }
    
    @media (max-width: 480px) {
      font-size: 1.5rem;
      margin: 0.25rem 0;
    }
  }

  .shop-description {
    font-size: 1rem;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    opacity: 0.8;
    font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
    max-width: 600px;
    margin: 0 auto;
    
    @media (min-width: 768px) {
      font-size: 1.1rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
      line-height: 1.4;
    }
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
    padding: 0.5rem;
    border-radius: 12px;
  }
`;

const MainContent = styled.main`
  padding: 80px 1rem 2rem 1rem;
  position: relative;
  z-index: 1;
  max-width: 100%;
  overflow-x: hidden;
  
  @media (min-width: 768px) {
    max-width: 1200px;
    margin: 0 auto;
    padding: 6rem 2rem 2rem 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 70px 0.75rem 1.5rem 0.75rem;
  }
`;

const Header = styled.header`
  width: 100%;
  height: 60px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.theme?.colors?.headerBg || 'rgba(0, 0, 0, 1)'}; /* Solid, no blur */
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  position: fixed;
  top: 0;
  z-index: 100;

  @media (min-width: 768px) {
    height: 80px;
    padding: 0 2rem;
  }
`;

const Logo = styled.div`
  color: ${props => props.theme?.colors?.accent || '#800000'};
  font-family: ${props => props.theme?.fonts?.heading || "'Impact', sans-serif"};
  font-size: 1.2rem;
  letter-spacing: 1px;
  cursor: pointer;
  flex-shrink: 0;
  text-align: right;

  @media (min-width: 768px) {
    font-size: 1.5rem;
    letter-spacing: 1.5px;
  }
`;

const Tab = styled.button`
  background: ${props => props.active ? 
    props.theme?.colors?.tabActiveBg || 'rgba(128, 0, 0, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.active ? 
    props.theme?.colors?.tabBorder || '#800000' : 
    `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  color: ${props => props.active ? 
    props.theme?.colors?.text || '#FFFFFF' : 
    `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
  padding: 0.6rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  font-size: 0.8rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
  
  @media (min-width: 768px) {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
    letter-spacing: 1px;
    gap: 0.5rem;
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 14px;
    height: 14px;
    
    @media (min-width: 768px) {
      width: 16px;
      height: 16px;
    }
  }
`;

// View toggle controls
const ViewToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  
  .view-button {
    background: ${props => props.active ? 
      props.theme?.colors?.accent || '#800000' : 'transparent'};
    border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
    color: ${props => props.active ? 
      'white' : props.theme?.colors?.accent || '#800000'};
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.95);
    }
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  span {
    font-size: 0.9rem;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    margin-left: 0.5rem;
  }
`;

const ItemGrid = styled.div`
  display: ${props => props.viewMode === 'gallery' ? 'grid' : 'flex'};
  
  ${props => props.viewMode === 'gallery' ? `
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    
    @media (max-width: 480px) {
      gap: 0.5rem;
    }
    
    @media (min-width: 480px) {
      gap: 1rem;
    }
    
    @media (min-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    
    @media (min-width: 1024px) {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }
  ` : `
    overflow-x: auto;
    gap: 1rem;
    padding: 1rem 0;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    
    @media (max-width: 480px) {
      gap: 0.75rem;
      padding: 0.75rem 0;
    }
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${props.theme?.colors?.accent || '#800000'};
      border-radius: 2px;
    }
  `}
`;

const ItemCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;
  
  ${props => props.viewMode === 'gallery' ? `
    min-height: 250px;
    display: flex;
    flex-direction: column;
    
    @media (max-width: 480px) {
      min-height: 220px;
      border-radius: 8px;
    }
    
    @media (min-width: 768px) {
      min-height: 400px;
      &:hover {
        transform: translateY(-5px);
        border-color: ${props.theme?.colors?.accent};
      }
    }
  ` : `
    flex: 0 0 280px;
    height: 380px;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    
    @media (max-width: 480px) {
      flex: 0 0 260px;
      height: 360px;
    }
    
    @media (min-width: 768px) {
      flex: 0 0 350px;
      height: 450px;
    }
  `}
`;

// Mobile-optimized search container
const SearchContainer = styled.div`
  max-width: 100%;
  margin: 1.5rem 0 2rem;
  position: relative;
  
  @media (min-width: 768px) {
    max-width: 600px;
    margin: 2rem auto 3rem;
  }
  
  @media (max-width: 480px) {
    margin: 1rem 0 1.5rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
  padding: 0.75rem 2.5rem 0.75rem 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  
  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.6rem 2.5rem 0.6rem 0.5rem;
  }
  
  &:focus {
    outline: none;
    border-bottom-width: 3px;
    box-shadow: 0 6px 12px ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.4)'};
  }
  
  &::placeholder {
    color: ${props => `${props.theme?.colors?.text}60` || 'rgba(255, 255, 255, 0.4)'};
    font-style: italic;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 0.5rem;
  bottom: 0.75rem;
  color: ${props => props.theme?.colors?.accent || '#800000'};
  opacity: 0.8;
`;

const SkeletonCard = styled.div`
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-radius: 12px;
  height: 400px;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0.8; }
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 2rem;
  bottom: 0.75rem;
  background: transparent;
  border: none;
  color: ${props => props.theme?.colors?.accent || '#800000'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  
  &:active {
    opacity: 1;
    transform: scale(0.9);
  }
  
  @media (hover: hover) {
    &:hover {
      opacity: 1;
    }
  }
`;

const EmptyStateMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 0.75rem;
    border-radius: 8px;
  }
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
    
    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }
  }
  
  p {
    color: ${props => `${props.theme?.colors?.text}CC` || 'rgba(255, 255, 255, 0.8)'};
    font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
    font-size: 0.9rem;
    
    @media (min-width: 768px) {
      font-size: 1rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.85rem;
      line-height: 1.4;
    }
  }
`;


const AnnouncementBar = styled.div`
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: white;
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
`;

const ChatOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.isOpen ? 1 : 0};
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(128, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #800000;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// The ShopPublicView component
const ShopPublicView = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { userLocation } = useLocation();
  const [zoomedItem, setZoomedItem] = useState(null);
  const [currentZoomImageIndex, setCurrentZoomImageIndex] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(1);

  // REMOVE loading state entirely
  const [shopData, setShopData] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
  // Load saved tab from sessionStorage, default to 'shop'
  return sessionStorage.getItem('publicShopActiveTab') || 'shop';
});
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('gallery');
  const [isPinned, setIsPinned] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentImageIndices, setCurrentImageIndices] = useState({});

  const [selectedBuyItem, setSelectedBuyItem] = useState(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [shopContentType, setShopContentType] = useState('products');

  useEffect(() => {
    // Save active tab to sessionStorage whenever it changes
    sessionStorage.setItem('publicShopActiveTab', activeTab);
  }, [activeTab]);

  // OPTIMIZED: Fetch data immediately, use cache
  useEffect(() => {
    let mounted = true;

    const fetchShopData = async () => {
      try {
        // Check cache first
        const cached = shopCache.get(shopId);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log('✅ Using cached shop data');
          if (mounted) {
            setShopData(cached.data);
            initializeImageIndices(cached.data);
          }
          return;
        }

        // Fetch from Firestore
        const shopRef = doc(db, 'shops', shopId);
        const shopSnap = await getDoc(shopRef);
        
        if (!shopSnap.exists()) {
          if (mounted) setError('Shop not found');
          return;
        }
        
        const shop = shopSnap.data();

        // Cache the data
        shopCache.set(shopId, {
          data: shop,
          timestamp: Date.now()
        });

        if (mounted) {
          setShopData(shop);
          initializeImageIndices(shop);
        }
      } catch (err) {
        console.error('Error fetching shop data:', err);
        if (mounted) setError('Failed to load shop data');
      }
    };

    fetchShopData();

    return () => {
      mounted = false;
    };
  }, [shopId]);

  const categorizedShopItems = useMemo(() => {
  const categorizedItems = {
    'Electronics & Tech': [],
    'Clothing & Accessories': [],
    'Home & Garden': [],
    'Sports & Outdoors': [],
    'Books & Media': [],
    'Toys & Games': [],
    'Health & Beauty': [],
    'Automotive': [],
    'Collectibles & Art': [],
    'Food & Beverages': [],
    'Other': []
  };

  const items = shopContentType === 'products' ? 
    (shopData?.items || []) : 
    (shopData?.services || []);

  // Filter out deleted items and apply search
  const validItems = items.filter(item => 
    !item.deleted && 
    (searchTerm === '' || 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  // Add distance information if available
  const itemsWithDist = validItems.map(item => {
    if (userLocation && item.coordinates?.lat && item.coordinates?.lng) {
      try {
        const distanceInMeters = getDistance(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: item.coordinates.lat, longitude: item.coordinates.lng }
        );
        const distanceInMiles = (distanceInMeters / 1609.34).toFixed(1);
        
        return {
          ...item,
          distance: distanceInMeters,
          distanceInMiles,
          formattedDistance: `${distanceInMiles} mi`
        };
      } catch (e) {
        console.warn('Error calculating distance:', e);
        return item;
      }
    }
    return item;
  });

  // Featured items (first 5)
  const featuredItems = itemsWithDist.slice(0, 5);
  const remainingItems = itemsWithDist.slice(5);

  // Categorize remaining items
  remainingItems.forEach(item => {
    const category = item.category || 'Other';
    if (categorizedItems[category]) {
      categorizedItems[category].push(item);
    } else {
      categorizedItems['Other'].push(item);
    }
  });

  // Limit each category to 15 items
  Object.keys(categorizedItems).forEach(category => {
    categorizedItems[category] = categorizedItems[category].slice(0, 15);
  });

  return { featuredItems, categorizedItems };
}, [shopData?.items, shopData?.services, searchTerm, shopContentType, userLocation]);


  // Helper function
  const initializeImageIndices = (shop) => {
    if (shop.items && Array.isArray(shop.items)) {
      const indices = {};
      shop.items.forEach(item => {
        indices[item.id] = item.currentImageIndex || 0;
      });
      setCurrentImageIndices(indices);
    }
  };

  const handleItemClick = (item) => {
    setZoomedItem(item);
    setOrderQuantity(1);
    setCurrentZoomImageIndex(0);
    
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    window.lastScrollPosition = scrollY;
    
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };

  const handleCloseZoom = () => {
    setZoomedItem(null);
    setCurrentZoomImageIndex(0);

    const scrollY = window.lastScrollPosition || 0;

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    window.scrollTo({
      top: scrollY,
      left: 0,
      behavior: 'instant'
    });

    delete window.lastScrollPosition;
  };

  const adjustQuantity = (delta) => {
    const maxQuantity = parseInt(
      zoomedItem.isService ? 
        zoomedItem.slots : 
        zoomedItem.quantity
    ) || 1;

    const newQuantity = Math.max(1, Math.min(maxQuantity, orderQuantity + delta));
    setOrderQuantity(newQuantity);
  };

  const handleDirectOrder = () => {
    if (!zoomedItem) return;

    // Close zoom view
    handleCloseZoom();

    // Open buy dialog
    setSelectedBuyItem(zoomedItem);
    setBuyDialogOpen(true);
  };


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


  

const handleGoHome = () => {
  window.location.href = 'https://kalkode.com';
};


if (error) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
          <div>{error}</div>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: '#800000',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Return to Homepage
          </button>
        </div>
      </PageContainer>
    );
  }

  
  const renderShopView = () => {
  if (!shopData) {
    return (
      <CategoryGridWrapper>
        {[1, 2, 3, 4, 5].map(i => (
          <SkeletonCard key={i} theme={shopData?.theme} />
        ))}
      </CategoryGridWrapper>
    );
  }

  return (
    <>
      <ShopProfileSection fontSize={shopData?.layout?.nameSize || '2rem'}>
        <div className="profile-image">
          {shopData?.profile ? (
            <img src={shopData.profile} alt={shopData.name || 'Shop'} />
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              background: shopData?.theme?.colors?.accent || '#800000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '2rem'
            }}>
              {shopData?.name?.charAt(0) || 'S'}
            </div>
          )}
        </div>
        <h1 className="shop-name">{shopData?.name || 'Shop Name'}</h1>
        <p className="shop-description">{shopData?.description}</p>
      </ShopProfileSection>

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
          <Briefcase size={18} />
          Services
        </ShopTab>
      </ShopTabContainer>
      
      <SearchContainer>
        <SearchInput 
          placeholder={`Search ${shopContentType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm ? (
          <ClearButton onClick={() => setSearchTerm('')}>
            <X size={18} />
          </ClearButton>
        ) : (
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
        )}
      </SearchContainer>

      {/* Featured Items */}
      {categorizedShopItems.featuredItems.length > 0 && (
        <div>
          <CategoryHeader theme={shopData?.theme}>
            <h2>Featured {shopContentType === 'products' ? 'Products' : 'Services'}</h2>
            <span className="view-all">{categorizedShopItems.featuredItems.length} items</span>
          </CategoryHeader>
    
          <CategoryGridWrapper>
            <div className="desktop-grid" style={{ display: 'contents' }}>
              {categorizedShopItems.featuredItems.map(item => (
                <div key={`featured-${item.id}`} className="desktop-only" 
                     style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
                  <FeaturedItem
                    key={`featured-${item.id}`}
                    item={{
                      ...item,
                      shopId: shopId,
                      shopName: shopData.name,
                      isService: shopContentType === 'services'
                    }}
                    theme={shopData?.theme}
                    onItemClick={handleItemClick}
                    onOrderClick={handleItemClick}  // Opens zoom view
                    showDistance={true}
                    showTopBar={false}  // ADD THIS - hides top bar on public shop page
                  />
                </div>
              ))}
            </div>
            
            <CategoryScrollableGrid 
              theme={shopData?.theme} 
              className="mobile-only"
              itemCount={categorizedShopItems.featuredItems.length}
            >
              {categorizedShopItems.featuredItems.map(item => (
                <FeaturedItem
                  key={`featured-mobile-${item.id}`}
                  item={{
                    ...item,
                    shopId: shopId,
                    shopName: shopData.name,
                    isService: shopContentType === 'services'
                  }}
                  theme={shopData?.theme}
                  onItemClick={handleItemClick}
                  onOrderClick={handleItemClick}  // Opens zoom view
                  showDistance={true}
                  showTopBar={false}  // ADD THIS - hides top bar on public shop page
                />
              ))}
            </CategoryScrollableGrid>
          </CategoryGridWrapper>
        </div>
      )}

      {/* Category Sections */}
      {Object.entries(categorizedShopItems.categorizedItems).map(([categoryName, items]) => {
        if (items.length === 0) return null;
      
        return (
          <div key={categoryName} style={{ marginTop: '3rem' }}>
            <CategoryHeader theme={shopData?.theme}>
              <h2>{categoryName}</h2>
              <span className="view-all">{items.length} items</span>
            </CategoryHeader>
        
            <CategoryGridWrapper>
              <div className="desktop-grid" style={{ display: 'contents' }}>
                {items.map(item => (
                  <div key={`${categoryName}-${item.id}`} className="desktop-only"
                       style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
                    <FeaturedItem
                      key={`${categoryName}-${item.id}`}
                      item={{
                        ...item,
                        shopId: shopId,
                        shopName: shopData.name,
                        isService: shopContentType === 'services'
                      }}
                      theme={shopData?.theme}
                      onItemClick={handleItemClick}
                      onOrderClick={handleItemClick}
                      showDistance={true}
                      showTopBar={false}  // ADD THIS
                    />
                  </div>
                ))}
              </div>
              
              <CategoryScrollableGrid 
                theme={shopData?.theme} 
                className="mobile-only" 
                itemCount={items.length}
              >
                {items.map(item => (
                  <FeaturedItem
                    key={`${categoryName}-mobile-${item.id}`}
                    item={{
                      ...item,
                      shopId: shopId,
                      shopName: shopData.name,
                      isService: shopContentType === 'services'
                    }}
                    theme={shopData?.theme}
                    onItemClick={handleItemClick}
                    onOrderClick={handleItemClick}
                    showDistance={true}
                    showTopBar={false}  // ADD THIS
                  />
                ))}
              </CategoryScrollableGrid>
            </CategoryGridWrapper>
          </div>
        );
      })}

      {/* Empty State */}
      {categorizedShopItems.featuredItems.length === 0 && 
       Object.values(categorizedShopItems.categorizedItems).every(items => items.length === 0) && (
        <EmptyStateMessage theme={shopData?.theme}>
          <h3>No {shopContentType === 'products' ? 'Products' : 'Services'} Found</h3>
          <p>
            {searchTerm 
              ? `No ${shopContentType} match your search for "${searchTerm}"`
              : `This shop doesn't have any ${shopContentType} yet.`}
          </p>
        </EmptyStateMessage>
      )}
    </>
  );
};


  // In shopPublicView.js - REPLACE renderHomeView
const renderHomeView = () => {
  const templates = {
    1: StreetwearTemplate,
    2: OrganizationTemplate,
    3: TechTemplate,
    4: MinimalistTemplate,
    5: LocalMarketTemplate
  };

  const SelectedTemplate = templates[shopData?.selectedHomeTemplate || 1];

  return (
    <div style={{ 
      padding: '0',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      {SelectedTemplate && (
        <SelectedTemplate 
          shopData={shopData} 
          theme={shopData?.theme}
          sections={shopData?.homeSections || []}
          editable={false}
          onUpdateSection={null}
        />
      )}
    </div>
  );
};

  const renderCommunityView = () => (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <h2 style={{ 
        color: shopData?.theme?.colors?.accent || '#800000',
        fontFamily: shopData?.theme?.fonts?.heading || "'Space Grotesk', sans-serif",
        marginBottom: '1rem',
        fontSize: '1.5rem'
      }}>
        Community
      </h2>
      <p style={{ 
        maxWidth: '800px',
        margin: '0 auto',
        lineHeight: '1.6',
        color: shopData?.theme?.colors?.text || '#FFFFFF',
        fontFamily: shopData?.theme?.fonts?.body || "'Inter', sans-serif",
        fontSize: '1rem'
      }}>
        This is where community content will appear.
      </p>
    </div>
  );

  return (
    <ThemeProvider theme={shopData?.theme || DEFAULT_THEME}>
      <PageContainer>
        <Header theme={shopData?.theme}>
          <HeaderLeft>
            <Logo theme={shopData?.theme} onClick={handleGoHome}>
              {shopData?.name || 'SHOP'}
            </Logo>
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

        <MainContent>
          {activeTab === 'shop' && (
            <>
              <ProfileCover 
                coverImage={shopData?.coverImage}
                theme={shopData?.theme}
              />
              {renderShopView()}
            </>
          )}
          {activeTab === 'home' && renderHomeView()}
          {activeTab === 'community' && renderCommunityView()}
        </MainContent>

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

        <React.Suspense fallback={null}>
          {selectedBuyItem && buyDialogOpen && (
            <BuyDialog 
              item={selectedBuyItem}
              sellerId={shopId}
              onClose={() => {
                setBuyDialogOpen(false);
                setSelectedBuyItem(null);
              }}
              onTransactionCreated={(transactionId) => {
                console.log('Transaction created:', transactionId);
                setBuyDialogOpen(false);
                setSelectedBuyItem(null);
              }}
            />
          )}
        </React.Suspense>

        {zoomedItem && (
  <ZoomOverlay onClick={handleCloseZoom} theme={shopData?.theme}>
    <ZoomContainer 
      theme={shopData?.theme}
      onClick={(e) => e.stopPropagation()}
    >
      <ImageCarousel 
        theme={shopData?.theme} 
        currentIndex={currentZoomImageIndex}
      >
        <button 
          className="close-overlay-button"
          onClick={handleCloseZoom}
          aria-label="Close"
        >
          <X size={20} />
        </button>
      
        <div className="image-track">
          {zoomedItem.images && zoomedItem.images.filter(Boolean).length > 0 ? (
            zoomedItem.images.filter(Boolean).map((image, index) => (
              <div key={index} className="image-slide">
                <img src={image} alt={`${zoomedItem.name} ${index + 1}`} />
              </div>
            ))
          ) : (
            <div className="image-slide">
              <div className="no-image">
                <Package size={40} />
                <p>No image</p>
              </div>
            </div>
          )}
        </div>
        
        {zoomedItem.images && zoomedItem.images.filter(Boolean).length > 1 && (
          <>
            <button 
              className="carousel-button prev"
              onClick={() => setCurrentZoomImageIndex(prev => 
                prev === 0 ? zoomedItem.images.filter(Boolean).length - 1 : prev - 1
              )}
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              className="carousel-button next"
              onClick={() => setCurrentZoomImageIndex(prev => 
                prev === zoomedItem.images.filter(Boolean).length - 1 ? 0 : prev + 1
              )}
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
            
            <div className="carousel-dots">
              {zoomedItem.images.filter(Boolean).map((_, index) => (
                <button
                  key={index}
                  className="dot"
                  style={{ opacity: index === currentZoomImageIndex ? 1 : 0.3 }}
                  onClick={() => setCurrentZoomImageIndex(index)}
                  aria-label={`Image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </ImageCarousel>
      
      <ZoomContent theme={shopData?.theme}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'baseline',
          gap: '0.75rem'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            margin: 0,
            fontWeight: '600',
            color: shopData?.theme?.colors?.text || '#FFFFFF',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {zoomedItem.name}
          </h3>
          
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: shopData?.theme?.colors?.accent || '#800000',
            whiteSpace: 'nowrap'
          }}>
            ${parseFloat(zoomedItem.price || 0).toFixed(2)}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.75rem',
          flexWrap: 'wrap',
          color: shopData?.theme?.colors?.text || '#FFFFFF',
          opacity: 0.8
        }}>
          {zoomedItem.formattedDistance && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Navigation size={11} />
                <span>{zoomedItem.formattedDistance}</span>
              </div>
              <span>•</span>
            </>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Store size={11} />
            <span>{shopData?.name}</span>
          </div>
          <span>•</span>
          
          {zoomedItem.isService ? (
            parseInt(zoomedItem.slots) !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: parseInt(zoomedItem.slots) > 0 ? '#4CAF50' : '#FF5252'
                }} />
                <span style={{
                  color: parseInt(zoomedItem.slots) > 0 ? '#4CAF50' : '#FF5252',
                  fontWeight: '500'
                }}>
                  {parseInt(zoomedItem.slots) > 0 ? 
                    `${zoomedItem.slots} ${parseInt(zoomedItem.slots) === 1 ? 'slot' : 'slots'} available` : 
                    'No slots available'
                  }
                </span>
              </div>
            )
          ) : (
            zoomedItem.quantity !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: parseInt(zoomedItem.quantity) > 0 ? '#4CAF50' : '#FF5252'
                }} />
                <span style={{
                  color: parseInt(zoomedItem.quantity) > 0 ? '#4CAF50' : '#FF5252',
                  fontWeight: '500'
                }}>
                  {parseInt(zoomedItem.quantity) > 0 ? 
                    `${zoomedItem.quantity} in stock` : 
                    'Out of stock'
                  }
                </span>
              </div>
            )
          )}
        </div>
        
        <QuantitySelector theme={shopData?.theme}>
          <span className="quantity-label">
            {zoomedItem.isService ? 'Slots' : 'Qty'}
          </span>

          <div className="quantity-controls">
            <button 
              className="quantity-btn"
              onClick={() => adjustQuantity(-1)}
              disabled={orderQuantity <= 1}
            >
              <Minus size={12} />
            </button>
            
            <div className="quantity-display">
              {orderQuantity}
            </div>
          
            <button 
              className="quantity-btn"
              onClick={() => adjustQuantity(1)}
              disabled={orderQuantity >= parseInt(zoomedItem.isService ? zoomedItem.slots : zoomedItem.quantity || 1)}
            >
              <Plus size={12} />
            </button>
          </div>
        </QuantitySelector>
            
        <button 
          onClick={handleDirectOrder}
          disabled={
            zoomedItem.isService ? 
              (parseInt(zoomedItem.slots || 0) < 1 || orderQuantity > parseInt(zoomedItem.slots || 0)) :
              (parseInt(zoomedItem.quantity || 0) < 1 || orderQuantity > parseInt(zoomedItem.quantity || 0))
          }
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            background: (zoomedItem.isService ? 
              parseInt(zoomedItem.slots || 0) : 
              parseInt(zoomedItem.quantity || 0)) < 1 ? 
                `${shopData?.theme?.colors?.accent || '#800000'}40` : 
                shopData?.theme?.colors?.accent || '#800000',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: (zoomedItem.isService ? 
              parseInt(zoomedItem.slots || 0) : 
              parseInt(zoomedItem.quantity || 0)) < 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {(zoomedItem.isService ? 
            parseInt(zoomedItem.slots || 0) : 
            parseInt(zoomedItem.quantity || 0)) < 1 ? (
            <>
              <X size={16} />
              {zoomedItem.isService ? 'No Slots Available' : 'Out of Stock'}
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              {zoomedItem.isService ? 'Book' : 'Order'} {orderQuantity > 1 && `${orderQuantity} `}· ${(parseFloat(zoomedItem.price || 0) * orderQuantity).toFixed(2)}
            </>
          )}
        </button>
      </ZoomContent>
    </ZoomContainer>
  </ZoomOverlay>
)}
      </PageContainer>
    </ThemeProvider>
  );
};

export default ShopPublicView;