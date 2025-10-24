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

const ItemImageContainer = styled.div`
  position: relative;
  height: ${props => props.viewMode === 'gallery' ? '150px' : '200px'};
  overflow: hidden;
  background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
  
  @media (min-width: 768px) {
    height: ${props => props.viewMode === 'gallery' ? '250px' : '300px'};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  ${ItemCard}:hover & img {
    transform: scale(1.05);
  }
  
  .carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.5)'}90`};
    border: 1px solid ${props => `${props.theme?.colors?.accent || 'rgba(255, 255, 255, 0.2)'}40`};
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme?.colors?.text || 'white'};
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s;
    z-index: 2;

    &:active {
      opacity: 1;
      transform: translateY(-50%) scale(0.9);
    }

    @media (hover: hover) {
      &:hover {
        opacity: 1;
        background: ${props => `${props.theme?.colors?.accent || 'rgba(0, 0, 0, 0.8)'}40`};
      }
    }

    &.left {
      left: 0.5rem;
    }

    &.right {
      right: 0.5rem;
    }
    
    @media (min-width: 768px) {
      width: 32px;
      height: 32px;
      left: ${props => props.className?.includes('left') ? '1rem' : 'auto'};
      right: ${props => props.className?.includes('right') ? '1rem' : 'auto'};
    }
  }
`;

const ItemContent = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`};
  
  @media (min-width: 768px) {
    padding: 1.5rem;
  }

  h3 {
    font-size: 1rem;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    margin: 0 0 0.5rem 0;
    font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
    
    @media (min-width: 768px) {
      font-size: 1.2rem;
    }
  }

  .price {
    font-size: 1rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    font-weight: bold;
    margin-bottom: 0.5rem;
    
    @media (min-width: 768px) {
      font-size: 1.1rem;
    }
  }

  .description {
    color: ${props => `${props.theme?.colors?.text}CC` || 'rgba(255, 255, 255, 0.8)'};
    font-size: 0.8rem;
    line-height: 1.4;
    margin-bottom: 1rem;
    flex: 1;
    font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    
    @media (min-width: 768px) {
      font-size: 0.9rem;
      line-height: 1.5;
      -webkit-line-clamp: 4;
    }
  }
`;

const CategoryBadge = styled.div`
  display: inline-block;
  background: ${props => `${props.theme?.colors?.accent || '#800000'}20`};
  color: ${props => props.theme?.colors?.accent || '#800000'};
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.5rem;
  
  @media (min-width: 768px) {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
  }
`;

const ItemLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  color: ${props => `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
  margin-bottom: 0.75rem;
  
  @media (min-width: 768px) {
    font-size: 0.8rem;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.6rem;
  border-radius: ${props => props.theme?.styles?.borderRadius || '6px'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  z-index: 5;
  font-size: 0.8rem;
  
  @media (min-width: 768px) {
    padding: 0.75rem;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  
  &.primary {
    background: ${props => props.theme?.colors?.accent || '#800000'};
    color: white;
    border: none;
    
    &:active {
      background: ${props => props.theme?.colors?.primary || '#4A0404'};
      transform: scale(0.98);
    }
    
    @media (hover: hover) {
      &:hover {
        background: ${props => props.theme?.colors?.primary || '#4A0404'};
      }
    }
  }
  
  &.secondary {
    background: transparent;
    border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
    color: ${props => props.theme?.colors?.accent || '#800000'};
    
    &:active {
      background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
      transform: scale(0.98);
    }
    
    @media (hover: hover) {
      &:hover {
        background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
      }
    }
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

// Add these specific widget components
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

  // REMOVE loading state entirely
  const [shopData, setShopData] = useState(null);
  const [activeTab, setActiveTab] = useState('shop');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('gallery');
  const [isPinned, setIsPinned] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentImageIndices, setCurrentImageIndices] = useState({});

  const [selectedBuyItem, setSelectedBuyItem] = useState(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [shopContentType, setShopContentType] = useState('products');

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

  // OPTIMIZED: Calculate distances only when needed, memoized
  const itemsWithDistance = useMemo(() => {
    const items = shopContentType === 'products' ? 
      (shopData?.items || []) : 
      (shopData?.services || []);
    
    if (!items || !userLocation) return items;

    return items.map(item => {
      if (item.coordinates?.lat && item.coordinates?.lng) {
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
  }, [shopData?.items, shopData?.services, userLocation, shopContentType]);

  // OPTIMIZED: Memoize filtered items
  const filteredItems = useMemo(() => {
    return itemsWithDistance.filter(item => 
      !item.deleted && 
      (searchTerm === '' || 
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [itemsWithDistance, searchTerm]);

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

  // OPTIMIZED: Memoize callbacks
  const handleNextImage = useCallback((e, itemId) => {
    e.stopPropagation();
    setCurrentImageIndices(prev => {
      const item = shopData.items.find(i => i.id === itemId);
      if (item?.images) {
        const validImages = item.images.filter(Boolean);
        return {
          ...prev,
          [itemId]: (prev[itemId] + 1) % validImages.length
        };
      }
      return prev;
    });
  }, [shopData?.items]);

  const handlePrevImage = useCallback((e, itemId) => {
    e.stopPropagation();
    setCurrentImageIndices(prev => {
      const item = shopData.items.find(i => i.id === itemId);
      if (item?.images) {
        const validImages = item.images.filter(Boolean);
        return {
          ...prev,
          [itemId]: (prev[itemId] - 1 + validImages.length) % validImages.length
        };
      }
      return prev;
    });
  }, [shopData?.items]);

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

  
  const renderShopView = () => (
    <>
      {!shopData ? (
        <ItemGrid viewMode={viewMode}>
          {[1, 2, 3, 4].map(i => (
            <SkeletonCard key={i} theme={DEFAULT_THEME} />
          ))}
        </ItemGrid>
      ) : (
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

          {/* ADD: Products/Services Tabs */}
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
          
          {filteredItems.length > 0 ? (
            <ItemGrid viewMode={viewMode}>
              {filteredItems.map((item) => {
                const validImages = item.images?.filter(Boolean) || [];
                const imageIndex = currentImageIndices[item.id] || 0;
                
                return (
                  <ItemCard key={item.id} viewMode={viewMode}>
                    <ItemImageContainer viewMode={viewMode}>
                      {validImages.length > 0 ? (
                        <img 
                          src={validImages[imageIndex % validImages.length]} 
                          alt={item.name} 
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: shopData?.theme?.colors?.text || '#fff',
                          opacity: 0.5,
                          fontSize: '0.8rem'
                        }}>
                          No Image Available
                        </div>
                      )}
                      
                      {validImages.length > 1 && (
                        <>
                          <button 
                            className="carousel-arrow left"
                            onClick={(e) => handlePrevImage(e, item.id)}
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button 
                            className="carousel-arrow right"
                            onClick={(e) => handleNextImage(e, item.id)}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </>
                      )}
                    </ItemImageContainer>
                    
                    <ItemContent>
                      {item.category && item.category !== 'Other' && (
                        <CategoryBadge theme={shopData?.theme}>
                          {item.category}
                        </CategoryBadge>
                      )}

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem'
                      }}>
                        <h3 style={{ margin: 0, flex: 1 }}>{item.name}</h3>

                        {/* Show quantity for products, slots for services */}
                        {shopContentType === 'products' && item.quantity !== undefined && (
                          <span style={{
                            background: parseInt(item.quantity) > 0 ? 
                              `${shopData?.theme?.colors?.accent || '#800000'}30` : '#FF525230',
                            color: parseInt(item.quantity) > 0 ? 
                              shopData?.theme?.colors?.accent || '#800000' : '#FF5252',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            marginLeft: '0.5rem',
                            flexShrink: 0
                          }}>
                            {parseInt(item.quantity) > 0 ? `x${item.quantity}` : 'Sold Out'}
                          </span>
                        )}
                        
                        {shopContentType === 'services' && item.slots !== undefined && (
                          <span style={{
                            background: parseInt(item.slots) > 0 ? 
                              `${shopData?.theme?.colors?.accent || '#800000'}30` : '#FF525230',
                            color: parseInt(item.slots) > 0 ? 
                              shopData?.theme?.colors?.accent || '#800000' : '#FF5252',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            marginLeft: '0.5rem',
                            flexShrink: 0
                          }}>
                            {parseInt(item.slots) > 0 ? `${item.slots} slots` : 'Fully Booked'}
                          </span>
                        )}
                      </div>

                      {/* Only show price for products */}
                      {shopContentType === 'products' && (
                        <div className="price">
                          ${parseFloat(item.price || 0).toFixed(2)}
                        </div>
                      )}
                      
                      <div className="description">
                        {item.description}
                      </div>
                      
                      {item.formattedDistance && (
                        <ItemLocation>
                          <Navigation size={12} />
                          {item.formattedDistance} from you
                        </ItemLocation>
                      )}
                      
                      <ActionButtons>
                        {shopContentType === 'products' ? (
                          <ActionButton 
                            className="primary"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedBuyItem(item);
                              setBuyDialogOpen(true);
                            }}
                          >
                            <ShoppingCart size={14} />
                            Order
                          </ActionButton>
                        ) : (
                          <ActionButton 
                            className="primary"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // TODO: Open service booking dialog
                              alert('Service booking coming soon!');
                            }}
                          >
                            <MessageCircle size={14} />
                            Book Service
                          </ActionButton>
                        )}
                      </ActionButtons>
                    </ItemContent>
                  </ItemCard>
                );
              })}
            </ItemGrid>
          ) : (
            <EmptyStateMessage>
              <h3>No {shopContentType === 'products' ? 'Products' : 'Services'} Found</h3>
              <p>
                {searchTerm 
                  ? `No ${shopContentType} match your search for "${searchTerm}"`
                  : `This shop doesn't have any ${shopContentType} yet.`}
              </p>
            </EmptyStateMessage>
          )}
        </>
      )}
    </>
  );


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
      </PageContainer>
    </ThemeProvider>
  );
};

export default ShopPublicView;