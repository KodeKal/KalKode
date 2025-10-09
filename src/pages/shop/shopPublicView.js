// src/pages/shop/shopPublicView.js - Mobile Optimized

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { DEFAULT_THEME } from '../../theme/config/themes';
import BuyDialog from '../../components/Transaction/BuyDialog';
import OrderChat from '../../components/Chat/OrderChat';
import { useLocation } from '../../contexts/LocationContext';
import { getDistance } from 'geolib';
import { 
  ShoppingCart, 
  Heart, 
  MessageCircle, 
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
import {
  CountdownWidget,
  TestimonialsWidget,
  GalleryWidget,
  SocialFeedWidget,
  VideoWidget,
  FAQWidget,
  TeamWidget
} from './HomePageWidgets';
import TabPositioner from './components/TabPositioner';
import { WELCOME_STYLES } from '../../theme/welcomeStyles';



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
  
  /* Bottom underline indicator */
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
  margin: 0 0 1.5rem 0; /* Reduced from 2rem */
  padding: 0 1rem 1rem 1rem;

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

const MainContent = styled.main`
  padding: 80px 1rem 2rem 1rem; /* Back to original padding */
  position: relative;
  z-index: 1;
  
  @media (min-width: 768px) {
    max-width: 1200px;
    margin: 0 auto;
    padding: 6rem 2rem 2rem 2rem;
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

// Mobile-friendly item grid
const ItemGrid = styled.div`
  display: ${props => props.viewMode === 'gallery' ? 'grid' : 'flex'};
  
  ${props => props.viewMode === 'gallery' ? `
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    
    @media (min-width: 480px) {
      gap: 1rem;
    }
    
    @media (min-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }
  ` : `
    overflow-x: auto;
    gap: 1rem;
    padding: 1rem 0;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    
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
    
    @media (min-width: 768px) {
      min-height: 400px;
      &:hover {
        transform: translateY(-5px);
        border-color: ${props.theme?.colors?.accent};
      }
    }
  ` : `
    flex: 0 0 300px;
    height: 400px;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    
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
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
    
    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
  
  p {
    color: ${props => `${props.theme?.colors?.text}CC` || 'rgba(255, 255, 255, 0.8)'};
    font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
    font-size: 0.9rem;
    
    @media (min-width: 768px) {
      font-size: 1rem;
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
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  const [shopData, setShopData] = useState(null);
  const [activeTab, setActiveTab] = useState('shop');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('gallery');
  const [isPinned, setIsPinned] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedChatItem, setSelectedChatItem] = useState(null);
  const { userLocation } = useLocation();
  const { isAuthenticated } = useAuth(); // ADD THIS LINE

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

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const shopRef = doc(db, 'shops', shopId);
        const shopSnap = await getDoc(shopRef);
        
        if (!shopSnap.exists()) {
          setError('Shop not found');
          setLoading(false);
          return;
        }
        
        const shop = shopSnap.data();

        if (userLocation && shop.items && Array.isArray(shop.items)) {
          shop.items = shop.items.map(item => {
            if (item.coordinates && item.coordinates.lat && item.coordinates.lng) {
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
                console.warn('Error calculating distance for item:', e);
                return item;
              }
            }
            return item;
          });
        }
        
        setShopData(shop);
        
        // Initialize current image indices for items
        if (shop.items && Array.isArray(shop.items)) {
          const indices = {};
          shop.items.forEach(item => {
            indices[item.id] = item.currentImageIndex || 0;
          });
          setCurrentImageIndices(indices);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shop data:', err);
        setError('Failed to load shop data');
        setLoading(false);
      }
    };
    
    if (shopId) {
      fetchShopData();
    }
  }, [shopId, userLocation]);

  const handleNextImage = (e, itemId) => {
    e.stopPropagation();
    const item = shopData.items.find(i => i.id === itemId);
    if (item && item.images && item.images.filter(Boolean).length > 0) {
      const validImages = item.images.filter(Boolean);
      setCurrentImageIndices(prev => ({
        ...prev,
        [itemId]: (prev[itemId] + 1) % validImages.length
      }));
    }
  };

const handleGoHome = () => {
  window.location.href = 'https://kalkode.com';
};

  const handlePrevImage = (e, itemId) => {
    e.stopPropagation();
    const item = shopData.items.find(i => i.id === itemId);
    if (item && item.images && item.images.filter(Boolean).length > 0) {
      const validImages = item.images.filter(Boolean);
      setCurrentImageIndices(prev => ({
        ...prev,
        [itemId]: (prev[itemId] - 1 + validImages.length) % validImages.length
      }));
    }
  };

  // Filter items based on search term
  const filteredItems = shopData?.items?.filter(item => 
    !item.deleted && 
    (searchTerm === '' || 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  ) || [];

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
          <LoadingSpinner />
          <div>Loading shop...</div>
        </div>
      </PageContainer>
    );
  }

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
      
      <SearchContainer>
        <SearchInput 
          placeholder="Search items..."
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

                    {item.quantity !== undefined && (
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
                  </div>

                  <div className="price">
                    ${parseFloat(item.price || 0).toFixed(2)}
                  </div>
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
                    <ActionButton 
                      className="primary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // CHECK AUTHENTICATION
                        if (!isAuthenticated) {
                          // Redirect to LiveShopCreation
                              navigate('/auth', { 
      state: { 
        mode: 'login',
        from: window.location.pathname
      }
    });
                          return;
                        }

                        // Proceed with order if authenticated
                        setSelectedChatItem(item);
                        setChatOpen(true);
                      }}
                    >
                      <ShoppingCart size={14} />
                      Order
                    </ActionButton>
                  </ActionButtons>
                </ItemContent>
              </ItemCard>
            );
          })}
        </ItemGrid>
      ) : (
        <EmptyStateMessage>
          <h3>No Items Found</h3>
          <p>
            {searchTerm 
              ? `No items match your search for "${searchTerm}"`
              : "This shop doesn't have any items yet."}
          </p>
        </EmptyStateMessage>
      )}
    </>
  );

  const renderHomeView = () => {
    if (shopData?.homeWidgets && shopData.homeWidgets.length > 0) {
      return (
        <div>
          {shopData.homeWidgets
            .filter(widget => widget.visible)
            .map(widget => (
              <div key={widget.id} style={{ marginBottom: '2rem' }}>
                {renderPublicWidget(widget)}
              </div>
            ))}
        </div>
      );
    }
  
    // Fallback to existing home view content
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 style={{ 
          color: shopData?.theme?.colors?.accent || '#800000',
          fontFamily: shopData?.theme?.fonts?.heading,
          marginBottom: '1rem',
          fontSize: '1.5rem'
        }}>
          Welcome to our Shop
        </h2>
        <p style={{ 
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          {shopData?.mission || 'Our mission is to provide quality products and excellent service.'}
        </p>
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
          {/* Left: Shop Name/Logo */}
          <HeaderLeft>
            <Logo theme={shopData?.theme} onClick={handleGoHome}>
              {shopData?.name || 'SHOP'}
            </Logo>
          </HeaderLeft>

          {/* Right: Tab Buttons */}
          <HeaderRight>
            <HeaderTabButton
              theme={shopData?.theme}
              active={activeTab === 'home'}
              onClick={() => setActiveTab('home')}
              title="Home"
            >
              <Home size={22} />
            </HeaderTabButton>

            <HeaderTabButton
              theme={shopData?.theme}
              active={activeTab === 'shop'}
              onClick={() => setActiveTab('shop')}
              title="Shop"
            >
              <Store size={22} />
            </HeaderTabButton>

            <HeaderTabButton
              theme={shopData?.theme}
              active={activeTab === 'community'}
              onClick={() => setActiveTab('community')}
              title="Community"
            >
              <Users size={22} />
            </HeaderTabButton>
          </HeaderRight>
        </Header>

        <MainContent>
          {/* Profile Cover and Shop View */}
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

        {/* Floating Controls - Bottom Right */}
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

        <ChatOverlay 
          isOpen={chatOpen} 
          onClick={() => {
            setChatOpen(false);
            setSelectedChatItem(null);
          }}
        />

        {selectedChatItem && (
          <OrderChat 
            isOpen={chatOpen} 
            onClose={() => {
              setChatOpen(false);
              setSelectedChatItem(null);
            }} 
            item={selectedChatItem}
            shopId={shopId}
            shopName={shopData?.name}
            theme={shopData?.theme}
          />
        )}
      </PageContainer>
    </ThemeProvider>
  );
};

export default ShopPublicView;