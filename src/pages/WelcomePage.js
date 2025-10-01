// src/pages/WelcomePage.js - Mobile-Optimized Version
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getFeaturedItems } from '../firebase/firebaseService';
import FeaturedItem from '../components/shop/FeaturedItem';
import { Search, Package, Navigation, Film, Store, Plus, Minus, Pin, ChevronLeft, ChevronRight, X, MessageCircle, ShoppingCart, RefreshCw, LogOut } from 'lucide-react';
import { getDistance } from 'geolib';
import OrderChat from '../components/Chat/OrderChat';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { WELCOME_STYLES } from '../theme/welcomeStyles';
import { getShopData } from '../firebase/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import LocationDialog from '../components/LocationDialog';
import ThemeDecorations from '../components/ThemeDecorations';
import { TransactionService } from '../services/TransactionService';
import { signOut } from 'firebase/auth';

// Mobile-first styled components
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

  /* Reduced ping animations on mobile for performance */
  .ping {
    display: none;
    
    @media (min-width: 768px) {
      display: block;
      position: absolute;
      width: 2px;
      height: 2px;
      border-radius: 50%;
      background: ${props => props.theme?.colors?.accent || '#800000'};
      pointer-events: none;
      z-index: 0;
    }
  }

  @keyframes galaxySwirl {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Simplified header with just logo and right-side controls
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
  
  svg {
    width: 20px;
    height: 20px;
    
    @media (min-width: 768px) {
      width: 22px;
      height: 22px;
    }
  }
`;

// Improved mobile main content with better spacing
const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 1rem 100px 1rem;
  position: relative;
  z-index: 1;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem 2rem 2rem;
  }
`;

// Mobile-optimized welcome section
const WelcomeSection = styled.section`
  text-align: center;
  margin: 2rem 0;
  position: relative;

  h1 {
    font-family: ${props => props.theme?.fonts?.heading || "'Impact', sans-serif"};
    font-size: 2.5rem;
    margin-bottom: 1rem;
    background: ${props => props.theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 1px;
    line-height: 1.2;
    
    @media (min-width: 768px) {
      font-size: 4.5rem;
      letter-spacing: 2px;
    }
  }

  p {
    font-size: 1rem;
    line-height: 1.5;
    max-width: 600px;
    margin: 0 auto;
    color: ${props => `${props.theme?.colors?.text}CC` || 'rgba(255, 255, 255, 0.8)'};
    padding: 0 1rem;
    
    @media (min-width: 768px) {
      font-size: 1.2rem;
      line-height: 1.6;
      max-width: 800px;
    }
  }
`;

// Update ZoomOverlay styled component
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
  padding: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 768px) {
    align-items: flex-end;
    padding: 0;
  }
`;

// Update ZoomContainer styled component
const ZoomContainer = styled.div`
  position: relative;
  z-index: 10001;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  background: ${props => props.theme?.colors?.background || '#000000'};
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  margin: auto;
  
  @media (max-width: 768px) {
    border-radius: 20px 20px 0 0;
    border: none;
    border-top: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
    max-height: 85vh;
    height: auto;
    max-width: 100%;
    margin: 0;
  }
  
  @media (min-width: 1024px) {
    max-width: 650px;
    max-height: 85vh;
  }
`;

// Update ZoomContent for better scrolling
const ZoomContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem;
  -webkit-overflow-scrolling: touch;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => `${props.theme?.colors?.accent || '#800000'}60`};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.theme?.colors?.accent || '#800000'};
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.875rem;
  }
`;

// Update ImageCarousel for consistent sizing
// Update ZoomHeader - Remove it entirely or hide it
const ZoomHeader = styled.div`
  display: none; // Hide the header completely
`;

// Update ImageCarousel for border-to-border image
const ImageCarousel = styled.div`
  position: relative;
  width: 100%;
  height: 280px;
  background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
  overflow: hidden;
  flex-shrink: 0;
  border-radius: 12px 12px 0 0; // Only round top corners
  
  @media (max-width: 768px) {
    height: 240px;
    border-radius: 20px 20px 0 0; // Match container top radius on mobile
  }
  
  @media (max-width: 480px) {
    height: 200px;
  }
  
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
      object-fit: cover; // Changed from contain to cover for border-to-border
      background: ${props => `${props.theme?.colors?.background || '#000000'}40`};
    }
    
    .no-image {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      color: ${props => props.theme?.colors?.text || '#FFFFFF'};
      opacity: 0.5;
      
      p {
        margin: 0;
        font-size: 0.9rem;
      }
    }
  }
  
  .carousel-dots {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    z-index: 2;
    padding: 0.5rem;
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.5)'}80`};
    border-radius: 20px;
    backdrop-filter: blur(4px);
  }
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.theme?.colors?.text || '#FFFFFF'};
    border: none;
    padding: 0;
    cursor: pointer;
    transition: opacity 0.3s ease;
  }
  
  .carousel-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.7)'}90`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}40` || 'rgba(255, 255, 255, 0.2)'};
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme?.colors?.text || 'white'};
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s;
    z-index: 2;
    
    &:active {
      transform: translateY(-50%) scale(0.9);
    }
    
    @media (hover: hover) {
      &:hover {
        opacity: 1;
        background: ${props => props.theme?.colors?.accent || '#800000'};
      }
    }
    
    &.prev {
      left: 0.5rem;
    }
    
    &.next {
      right: 0.5rem;
    }
    
    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    @media (max-width: 480px) {
      width: 32px;
      height: 32px;
      
      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
  
  /* Add close button overlay on image */
  .close-overlay-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.8)'}CC`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}40` || 'rgba(255, 255, 255, 0.2)'};
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
    z-index: 3;
    
    &:active {
      transform: scale(0.9);
    }
    
    @media (hover: hover) {
      &:hover {
        background: ${props => props.theme?.colors?.accent || '#800000'};
        border-color: ${props => props.theme?.colors?.accent || '#800000'};
      }
    }
    
    @media (max-width: 480px) {
      width: 32px;
      height: 32px;
      top: 0.75rem;
      right: 0.75rem;
      
      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
`;


// Mobile-optimized profile section
const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 4px solid ${props => props.theme?.colors?.accent || '#800000'};
  box-shadow: 0 0 20px ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
  
  @media (min-width: 768px) {
    width: 200px;
    height: 189px;
    border: 6px solid ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Add to styled components section in WelcomePage.js
const LocationIndicator = styled.div`
  position: relative;
  top: 90px; // Position it below the header
  left: 2rem;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  backdrop-filter: blur(4px);
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  font-size: 0.9rem;
  z-index: 10;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 300px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translateY(-2px);
  }
  
  .location-icon {
    color: ${props => props.theme?.colors?.accent || '#800000'};
    margin-right: 0.75rem;
  }
  
  .location-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .updating {
    margin-left: 0.5rem;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(128, 0, 0, 0.2);
    border-radius: 50%;
    border-top-color: ${props => props.theme?.colors?.accent || '#800000'};
    animation: spin 1s linear infinite;
  }
`;

const ShopName = styled.h2`
  font-family: ${props => props.theme?.fonts?.heading || "'Impact', sans-serif"};
  font-size: 2.5rem;
  background: ${props => props.theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  
  @media (min-width: 768px) {
    font-size: 5.4rem;
    margin: 0 0 1rem 0;
  }
`;

// Mobile-friendly action buttons
const ActionButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
  margin: 2rem auto;
  
  @media (min-width: 480px) {
    flex-direction: row;
    justify-content: center;
    max-width: none;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'outline' ? 'transparent' : 
    props.theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)'};
  border: ${props => props.variant === 'outline' ? 
    `2px solid ${props.theme?.colors?.accent || '#800000'}` : 'none'};
  padding: 1rem 1.5rem;
  border-radius: 30px;
  color: ${props => props.variant === 'outline' ? 
    props.theme?.colors?.accent || '#800000' : 'white'};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
  width: 100%;
  
  @media (min-width: 480px) {
    width: auto;
    padding: 1rem 2.5rem;
    font-size: 1rem;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
    }
  }
`;

// Mobile-optimized tab container with horizontal scroll
const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 2rem 0;
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
    justify-content: center;
    gap: 1rem;
    overflow-x: visible;
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

// Mobile-optimized grid with better touch targets
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding: 0 0.25rem;
  
  @media (min-width: 480px) {
    gap: 1rem;
    padding: 0;
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
  }
`;

// Mobile search with better UX
const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  padding: 0 0.5rem;
  
  @media (min-width: 600px) {
    flex-direction: row;
    align-items: center;
    max-width: 800px;
    margin: 0 auto;
    padding: 0;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(128, 0, 0, 0.2);
  border-radius: 25px;
  padding: 0.8rem 1rem;
  color: white;
  font-size: 1rem;
  -webkit-appearance: none;
  
  &:focus {
    outline: none;
    border-color: rgba(128, 0, 0, 0.4);
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  @media (min-width: 600px) {
    flex: 1;
  }
`;

const SearchButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
  
  @media (min-width: 600px) {
    width: auto;
  }
`;

const SearchButton = styled.button`
  flex: 1;
  background: ${props => props.variant === 'live' ? 'transparent' : 'rgba(128, 0, 0, 0.2)'};
  border: 1px solid rgba(128, 0, 0, 0.3);
  padding: 0.8rem 1rem;
  border-radius: 25px;
  color: white;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  
  @media (min-width: 600px) {
    flex: unset;
    padding: 0.8rem 1.2rem;
  }

  &:active {
    transform: scale(0.98);
    background: rgba(128, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Mobile-friendly slider with native scroll
const SliderContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  margin: 1.5rem 0;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  
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
  
  /* Hide scroll buttons on mobile */
  .scroll-button {
    display: none;
    
    @media (min-width: 768px) {
      display: flex;
    }
  }
`;

const Slider = styled.div`
  display: flex;
  width: fit-content;
  padding: 0.5rem 0;
`;

const SlideItem = styled.div`
  flex: 0 0 160px;
  margin-right: 0.75rem;
  scroll-snap-align: start;
  
  @media (min-width: 480px) {
    flex: 0 0 200px;
    margin-right: 1rem;
  }
  
  @media (min-width: 768px) {
    flex: 0 0 250px;
    margin-right: 1.5rem;
  }
  
  @media (min-width: 1024px) {
    flex: 0 0 300px;
    margin-right: 2rem;
  }
`;

// Add styles for better item display
const ItemDetailsSection = styled.div`
  margin-bottom: 1.5rem;
`;

const ItemHeader = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 1.5rem;
    margin: 0 0 0.5rem 0;
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    
    @media (min-width: 768px) {
      font-size: 1.8rem;
    }
  }

  .price {
    font-size: 1.3rem;
    font-weight: bold;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    margin-bottom: 1rem;
    
    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;

const CategoryBadge = styled.div`
  display: inline-block;
  background: ${props => `${props.theme?.colors?.accent || '#800000'}20`};
  color: ${props => props.theme?.colors?.accent || '#800000'};
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
`;

const StockStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  
  .stock-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.inStock ? '#4CAF50' : '#FF5252'};
  }
  
  .stock-text {
    color: ${props => props.inStock ? '#4CAF50' : '#FF5252'};
    font-weight: 500;
  }
`;

const ItemDescription = styled.div`
  font-size: 0.95rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
`;

const ItemLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 1.5rem;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
`;

const ShopInfo = styled.div`
  padding: 0.75rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  
  strong {
    color: ${props => props.theme?.colors?.accent || '#800000'};
  }
`;

// Update ActionButtons to only show Order button
const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  
  button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    
    @media (min-width: 768px) {
      padding: 1rem;
      font-size: 1rem;
    }
    
    &.order {
      background: ${props => props.theme?.colors?.accent || '#800000'};
      color: white;
      
      &:hover:not(:disabled) {
        background: ${props => props.theme?.colors?.primary || '#4A0404'};
        transform: translateY(-2px);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

// Mobile-friendly floating controls - removed since they're now in header
const StyleIndicator = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: ${props => `${props.theme?.colors?.background || '#000000'}E5`};
  backdrop-filter: blur(10px);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.4)'};
  z-index: 90;
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
  }
  
  .style-number {
    font-weight: bold;
    font-size: 1rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    
    @media (min-width: 768px) {
      font-size: 1.2rem;
    }
  }
`;

// Quantity selector optimized for mobile
const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
  
  .quantity-label {
    font-weight: bold;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    font-size: 0.9rem;
  }
  
  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .quantity-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
      background: transparent;
      color: ${props => props.theme?.colors?.accent || '#800000'};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      -webkit-tap-highlight-color: transparent;
      
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
        width: 18px;
        height: 18px;
      }
    }
    
    .quantity-display {
      font-size: 1.3rem;
      font-weight: bold;
      color: ${props => props.theme?.colors?.text || 'white'};
      min-width: 40px;
      text-align: center;
    }
  }
`;

// Other styled components remain the same but with mobile optimizations...
const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  margin: 2rem auto;
  border: 3px solid rgba(128, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #800000;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyGridMessage = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(128, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.7);
  grid-column: 1/-1;

  h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: rgba(255, 255, 255, 0.9);
  }

  p {
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const MotivationalMessage = styled.p`
  font-size: 1.1rem;
  line-height: 1.5;
  max-width: 600px;
  margin: 2rem auto 0;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  font-weight: 400;
  text-align: center;
  padding: 1rem 1.5rem;
  letter-spacing: 0.3px;
  position: relative;
  
  @media (min-width: 768px) {
    font-size: 1.4rem;
    line-height: 1.6;
    max-width: 800px;
    margin: 3rem auto 0;
    padding: 1.5rem 2rem;
    letter-spacing: 0.5px;
  }
  
  &::before, &::after {
    content: '"';
    font-family: ${props => props.theme?.fonts?.heading || "'Georgia', serif"};
    font-size: 2rem;
    position: absolute;
    opacity: 0.2;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    
    @media (min-width: 768px) {
      font-size: 3rem;
    }
  }
  
  &::before {
    top: -0.5rem;
    left: 0.5rem;
    
    @media (min-width: 768px) {
      top: -1.5rem;
      left: -1rem;
    }
  }
  
  &::after {
    bottom: -1.5rem;
    right: 0.5rem;
    
    @media (min-width: 768px) {
      bottom: -2.5rem;
      right: -1rem;
    }
  }
`;

// 1. Replace the CategoryGrid styled component with these two new components:

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

// Replace the CategoryScrollableGrid styled component with this corrected version:

const CategoryScrollableGrid = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: grid;
    grid-auto-flow: column; /* Changed: Make items flow in columns */
    grid-template-rows: repeat(2, 1fr); /* 2 rows */
    grid-template-columns: repeat(5, minmax(200px, 1fr)); /* 5 columns with min-width */
    gap: 0.75rem;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 0.5rem;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    
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
      min-width: 0; /* Allow items to shrink */
    }
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(5, minmax(160px, 1fr));
    gap: 0.5rem;
  }
`;

// 4. Add this CSS to handle responsive display (add to your styled components section):
const GlobalStyle = styled.div`
  @media (min-width: 769px) {
    .mobile-only {
      display: none !important;
    }
  }
  
  @media (max-width: 768px) {
    .desktop-only {
      display: none !important;
    }
  }
`;

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

// Motivational messages
const MOTIVATIONAL_MESSAGES = [
  "Build your vision, Elevate humanity.",
  "Create greatness, Inspire progress.",
  "Master your craft, Serve with passion.",
  "Own your success, Empower those around you.",
  "Rule with wisdom, Lead with heart.",
  "Shape your future, Change lives along the way.",
  "Rise above, Lift others higher.",
  "Conquer your dreams, Build a better world.",
  "Lead by example, Serve with strength.",
  "Pursue greatness, Give back in abundance."
];

const WelcomePage = () => {
  const navigate = useNavigate();
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [activeTab, setActiveTab] = useState('featured');
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nearbyItems, setNearbyItems] = useState([]);
  const [featuredMedia, setFeaturedMedia] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [locationChecked, setLocationChecked] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [currentZipCode, setCurrentZipCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [currentStyle, setCurrentStyle] = useState(null);
  const itemsPerPage = 6;
  const [isPinned, setIsPinned] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  
  const { user, isAuthenticated } = useAuth();
  const [shopData, setShopData] = useState(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isMessageVisible, setIsMessageVisible] = useState(true);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const sliderRef = useRef(null);
  const sliderAnimationRef = useRef(null);
  const [zoomedItem, setZoomedItem] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedChatItem, setSelectedChatItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { userLocation, locationPermission, requestLocation } = useLocation();
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [featuredSearchTerm, setFeaturedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const [categories, setCategories] = useState({
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
  });

  // Handle opening shop
  const handleOpenShop = () => {
    navigate('/shop/create/template');
  };

  // Refresh theme
  const refreshTheme = () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    const styles = Object.values(WELCOME_STYLES);
    const otherStyles = styles.filter(style => style.id !== currentStyle.id);
    
    if (otherStyles.length > 0) {
      const randomStyle = otherStyles[Math.floor(Math.random() * otherStyles.length)];
      setCurrentStyle(randomStyle);
      
      if (isPinned) {
        localStorage.removeItem('pinnedStyleId');
        setIsPinned(false);
      }
    }
    
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Toggle pin style
  const togglePinStyle = () => {
    if (isPinned) {
      localStorage.removeItem('pinnedStyleId');
      setIsPinned(false);
      
      const styles = Object.values(WELCOME_STYLES).filter(
        style => style.id !== currentStyle.id
      );
      
      if (styles.length > 0) {
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        setCurrentStyle(randomStyle);
      }
    } else {
      localStorage.setItem('pinnedStyleId', currentStyle.id.toString());
      setIsPinned(true);
    }
  };

  // Handle location update
  const handleLocationUpdate = () => {
    setUpdatingLocation(true);
    requestLocation();
  };

  // Get location display text
  const getLocationDisplayText = () => {
    if (!userLocation) {
      return "Location: Not available";
    }
    return `Location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
  };

  // Search featured items
  const searchFeaturedItems = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearchResults(false);
      return;
    }
  
    try {
      setIsSearching(true);
      setError(null);
    
      const shopsRef = collection(db, 'shops');
      const snapshot = await getDocs(shopsRef);
      
      let allMatchingItems = [];
      const currentUserId = user?.uid;
      
      snapshot.docs.forEach(doc => {
        const shopData = doc.data();
        
        if (doc.id === currentUserId) {
          return;
        }
        
        if (shopData?.items && Array.isArray(shopData.items)) {
          shopData.items
            .filter(item => !item.deleted)
            .forEach(item => {
              const itemName = (item.name || '').toLowerCase();
              const itemDescription = (item.description || '').toLowerCase();
              const searchLower = searchTerm.toLowerCase();
              
              if (itemName.includes(searchLower) || itemDescription.includes(searchLower)) {
                allMatchingItems.push({
                  ...item,
                  shopId: doc.id,
                  shopName: shopData.name || 'Unknown Shop',
                  shopTheme: shopData.theme
                });
              }
            });
        }
      });
    
      if (userLocation) {
        allMatchingItems = allMatchingItems.map(item => {
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
    
      setSearchResults(allMatchingItems);
      setHasSearchResults(true);
      
      if (allMatchingItems.length === 0) {
        setError(`No items found matching "${searchTerm}"`);
      }
    } catch (error) {
      console.error('Error searching items:', error);
      setError('Failed to search items. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle featured search
  const handleFeaturedSearch = () => {
    if (featuredSearchTerm.trim()) {
      searchFeaturedItems(featuredSearchTerm);
    }
  };

  const handleRowScroll = (categoryName, rowNumber, scrollLeft) => {
  const row1Id = `${categoryName}-row1`;
  const row2Id = `${categoryName}-row2`;
  
  const row1Element = document.getElementById(row1Id);
  const row2Element = document.getElementById(row2Id);
  
  if (rowNumber === 1 && row2Element) {
    row2Element.scrollLeft = scrollLeft;
  } else if (rowNumber === 2 && row1Element) {
    row1Element.scrollLeft = scrollLeft;
  }
};

  const handleClearFeaturedSearch = () => {
    setFeaturedSearchTerm('');
    setSearchResults([]);
    setHasSearchResults(false);
    setError(null);
  };

  // Load categorized items
  const loadCategorizedItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const allItems = await getFeaturedItems(48);
      const currentUserId = user?.uid;
      const filteredItems = allItems.filter(item => item.shopId !== currentUserId);

      let itemsWithDistance = filteredItems;
      if (userLocation) {
        itemsWithDistance = filteredItems.map(item => {
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

      itemsWithDistance.forEach(item => {
        const category = item.category || 'Other';
        if (categorizedItems[category]) {
          categorizedItems[category].push(item);
        } else {
          categorizedItems['Other'].push(item);
        }
      });

      Object.keys(categorizedItems).forEach(category => {
        categorizedItems[category] = categorizedItems[category].slice(0, 10);
      });

      setCategories(categorizedItems);
      setFeaturedItems(itemsWithDistance.slice(0, 10));
      setTotalItems(filteredItems.length);

      setLoading(false);
    } catch (error) {
      console.error('Error loading categorized items:', error);
      setError('Failed to load items. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch nearby items
  const fetchNearbyItems = async () => {
    if (!userLocation) {
      setError('Location information is not available');
      setSearching(false);
      return;
    }
  
    try {
      setLoading(true);
      const shopsRef = collection(db, 'shops');
      const snapshot = await getDocs(shopsRef);
      
      let itemsInRadius = [];
      const currentUserId = user?.uid;
      
      snapshot.docs.forEach(doc => {
        const shopData = doc.data();
        
        if (doc.id === currentUserId) {
          return;
        }
        
        if (shopData?.items && Array.isArray(shopData.items)) {
          shopData.items
            .filter(item => !item.deleted)
            .forEach(item => {
              let itemCoords = item.coordinates;
              if (!itemCoords && item.address) {
                const coordsMatch = item.address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
                if (coordsMatch) {
                  itemCoords = {
                    lat: parseFloat(coordsMatch[1]),
                    lng: parseFloat(coordsMatch[2])
                  };
                }
              }
  
              if (itemCoords?.lat && itemCoords?.lng) {
                try {
                  const distanceInMeters = getDistance(
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                    { latitude: itemCoords.lat, longitude: itemCoords.lng }
                  );
  
                  const distanceInMiles = (distanceInMeters / 1609.34).toFixed(1);
                  
                  itemsInRadius.push({
                    ...item,
                    shopId: doc.id,
                    shopName: shopData.name || 'Unknown Shop',
                    coordinates: itemCoords,
                    distance: distanceInMeters,
                    distanceInMiles,
                    formattedDistance: `${distanceInMiles} mi`,
                    theme: shopData.theme
                  });
                } catch (e) {
                  console.warn('Error calculating distance for item:', e);
                }
              }
            });
        }
      });
  
      itemsInRadius.sort((a, b) => a.distance - b.distance);
      itemsInRadius = itemsInRadius.slice(0, 10);
  
      setNearbyItems(itemsInRadius);
      setHasSearched(true);
      
      if (itemsInRadius.length === 0) {
        setError('No items found in your area');
      }
    } catch (error) {
      console.error('Error fetching nearby items:', error);
      setError('Failed to load nearby items. Please try again later.');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Handle live location
  const handleLiveLocation = () => {
    setSearching(true);
    setError(null);
    
    if (userLocation) {
      fetchNearbyItems();
      setHasSearched(true);
    } else {
      requestLocation();
    }
  };

  // Handle address search
  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) {
      setError('Please enter an address');
      return;
    }
  
    setSearching(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const encodedAddress = encodeURIComponent(searchAddress);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'KalKode Marketplace'
          }
        }
      );
      
      const data = await response.json();
  
      if (data && data[0]) {
        const coordinates = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
        
        await fetchNearbyItems(coordinates);
      } else {
        throw new Error('Location not found. Please try a different address.');
      }
  
    } catch (error) {
      console.error('Error searching address:', error);
      setError(error.message || 'Unable to search this location. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Handle item click
  const handleItemClick = (item) => {
    setZoomedItem(item);
    setOrderQuantity(1);
    setCurrentImageIndex(0); // Reset image index
    
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    document.body.setAttribute('data-scroll-y', scrollY);
  };

  // Handle close zoom
  const handleCloseZoom = () => {
    setZoomedItem(null);
    setCurrentImageIndex(0);
    
    const scrollY = document.body.getAttribute('data-scroll-y') || '0';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.removeAttribute('data-scroll-y');
    
    window.scrollTo(0, parseInt(scrollY));
  };

  // Adjust quantity
  const adjustQuantity = (delta) => {
    const maxQuantity = parseInt(zoomedItem?.quantity) || 1;
    const newQuantity = Math.max(1, Math.min(maxQuantity, orderQuantity + delta));
    setOrderQuantity(newQuantity);
  };

  // Handle direct order
  const handleDirectOrder = async () => {
    if (!zoomedItem) return;
    
    try {
      const result = await TransactionService.initiateQuantityTransaction(
        zoomedItem.id,
        zoomedItem.shopId,
        parseFloat(zoomedItem.price),
        orderQuantity,
        'inperson'
      );
      
      if (result.transactionId) {
        handleCloseZoom();
        navigate(`/messages?chat=${result.transactionId}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order: ' + error.message);
    }
  };

  // Handle order click
  const handleOrderClick = (item) => {
    setSelectedChatItem(item);
    setChatOpen(true);
    
    if (zoomedItem) {
      setZoomedItem(null);
      const scrollY = document.body.getAttribute('data-scroll-y') || '0';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.removeAttribute('data-scroll-y');
      window.scrollTo(0, parseInt(scrollY));
    }
  };

  // Handle close chat
  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedChatItem(null);
    
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.removeAttribute('data-scroll-y');
  };

  // Handle inquire click
  const handleInquireClick = () => {
    alert('Inquiry feature coming soon!');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle login
  const handleLogin = () => {
    navigate('/auth', { 
      state: { 
        mode: 'login',
        from: window.location.pathname
      }
    });
  };

  // Effects
  useEffect(() => {
    const fetchShopData = async () => {
      if (user && user.uid) {
        try {
          const data = await getShopData(user.uid);
          setShopData(data);
        } catch (error) {
          console.error('Error fetching shop data:', error);
        }
      }
    };
    
    if (isAuthenticated) {
      fetchShopData();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
      setMotivationalMessage(MOTIVATIONAL_MESSAGES[randomIndex]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const pinnedStyleId = localStorage.getItem('pinnedStyleId');
    
    if (pinnedStyleId) {
      const pinnedStyle = Object.values(WELCOME_STYLES).find(
        style => style.id.toString() === pinnedStyleId
      );
      
      if (pinnedStyle) {
        setCurrentStyle(pinnedStyle);
        setIsPinned(true);
        return;
      }
    }
    
    const styles = Object.values(WELCOME_STYLES);
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    setCurrentStyle(randomStyle);
  }, []);

  useEffect(() => {
    if (activeTab === 'nearby' && userLocation) {
      fetchNearbyItems();
      setHasSearched(true);
    }
  }, [activeTab, userLocation]);

  useEffect(() => {
    if (locationPermission === 'pending') {
      requestLocation();
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      if (activeTab === 'nearby') {
        fetchNearbyItems();
        setHasSearched(true);
      }
      
      if (activeTab === 'featured') {
        loadCategorizedItems();
      }
      
      setUpdatingLocation(false);
    }
  }, [userLocation, activeTab]);

  useEffect(() => {
    const loadTabContent = async () => {
      try {
        setLoading(true);
        setError(null);
    
        switch (activeTab) {
          case 'featured':
            loadCategorizedItems();
            return;
          case 'nearby':
            setLoading(false);
            break;
          case 'media':
            setLoading(false);
            break;
          default:
            setLoading(false);
        }
      } catch (error) {
        console.error('Error loading content:', error);
        setError('Failed to load content. Please try again later.');
        setLoading(false);
      }
    };
  
    loadTabContent();
  }, [activeTab, user?.uid]);

  useEffect(() => {
    if (activeTab === 'featured') {
      loadCategorizedItems();
    }
    
    const refreshInterval = setInterval(() => {
      if (activeTab === 'featured') {
        loadCategorizedItems();
      }
    }, 300000);

    return () => clearInterval(refreshInterval);
  }, [activeTab, currentPage]);

  // Ping animation effect (disabled on mobile for performance)
  useEffect(() => {
    if (window.innerWidth < 768) return;
    
    const container = document.querySelector('.page-container');
    if (!container) return;

    const createPing = () => {
      const ping = document.createElement('div');
      ping.className = 'ping';
      
      ping.style.left = `${Math.random() * 100}%`;
      ping.style.top = `${Math.random() * 100}%`;
      ping.style.zIndex = '0';
      
      container.appendChild(ping);
      
      setTimeout(() => {
        if (ping && ping.parentNode) {
          ping.remove();
        }
      }, 3000);
    };

    const createPingGroup = (count) => {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          createPing();
        }, i * 200);
      }
    };

    const pingCounts = [10, 30, 20];
    let currentIndex = 0;

    const interval = setInterval(() => {
      const count = pingCounts[currentIndex];
      createPingGroup(count);
      currentIndex = (currentIndex + 1) % pingCounts.length;
    }, 3000);
    
    return () => {
      clearInterval(interval);
      const pings = container.getElementsByClassName('ping');
      while (pings.length > 0) {
        pings[0].remove();
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.removeAttribute('data-scroll-y');
      
      if (sliderAnimationRef.current) {
        cancelAnimationFrame(sliderAnimationRef.current);
      }
    };
  }, []);

  if (!currentStyle) return null;

  return (
    <PageContainer className="page-container" theme={currentStyle}>
      <ThemeDecorations theme={currentStyle} />
      <Header theme={currentStyle}>
        <Logo onClick={() => navigate('/')} theme={currentStyle}>
          KALKODE
        </Logo>

        <HeaderControls>
          <HeaderButton 
            onClick={refreshTheme}
            theme={currentStyle}
            title="Random theme"
          >
            <RefreshCw size={20} className={isRefreshing ? "spinning" : ""} />
          </HeaderButton>
          
          <HeaderButton 
            onClick={togglePinStyle} 
            theme={currentStyle}
            className={isPinned ? "pinned" : ""}
            title={isPinned ? "Unpin theme" : "Pin theme"}
          >
            <Pin size={20} fill={isPinned ? currentStyle.colors.accent : "none"} />
          </HeaderButton>
          
          {isAuthenticated && (
            <HeaderButton 
              onClick={handleLogout}
              theme={currentStyle}
              title="Logout"
            >
              <LogOut size={20} />
            </HeaderButton>
          )}
        </HeaderControls>
      </Header>

      {/* Add Location Indicator */}
      <LocationIndicator 
        onClick={handleLocationUpdate}
        theme={currentStyle}
      >
        <Navigation size={18} className="location-icon" />
        <span className="location-text">
          {getLocationDisplayText()}
        </span>
        {updatingLocation && <div className="updating" />}
      </LocationIndicator>

      <MainContent isAuthenticated={isAuthenticated}>
        <WelcomeSection theme={currentStyle}>
          {isAuthenticated && shopData ? (
            <>
              <ProfileSection>
                <ProfileImage theme={currentStyle}>
                  {shopData.profile ? (
                    <img src={shopData.profile} alt={shopData.name || 'Shop Profile'} />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      background: currentStyle?.colors?.accent || '#800000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '2rem'
                    }}>
                      {(shopData.name?.charAt(0) || user.email?.charAt(0) || 'S').toUpperCase()}
                    </div>
                  )}
                </ProfileImage>
                <ShopName theme={currentStyle}>{shopData.name || 'My Shop'}</ShopName>
              </ProfileSection>         

              <MotivationalMessage theme={currentStyle}>
                {motivationalMessage}
              </MotivationalMessage>
            </>
          ) : (
            <>
              <h1>Welcome to KalKode</h1>
              <p>Trade with Your Community.</p>

              <ActionButtonContainer>
                <ActionButton theme={currentStyle} onClick={handleOpenShop}>
                  Open Up Shop
                </ActionButton>
                <ActionButton 
                  theme={currentStyle}
                  onClick={handleLogin}
                  variant="outline"
                >
                  Sign In
                </ActionButton>
              </ActionButtonContainer>
            </>
          )}
        </WelcomeSection>

        <TabContainer>
          <Tab 
            theme={currentStyle}
            active={activeTab === 'featured'} 
            onClick={() => setActiveTab('featured')}
          >
            <Package size={16} />
            Featured
          </Tab>
          <Tab
            theme={currentStyle} 
            active={activeTab === 'nearby'} 
            onClick={() => setActiveTab('nearby')}
          >
            <Navigation size={16} />
            Nearby
          </Tab>
          <Tab
            theme={currentStyle} 
            active={activeTab === 'media'} 
            onClick={() => setActiveTab('media')}
          >
            <Film size={16} />
            Media
          </Tab>
        </TabContainer>

        {/* Nearby Items Tab */}
        {activeTab === 'nearby' && (
          <>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Enter address or ZIP code..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
              />
              <SearchButtonGroup>
                <SearchButton 
                  onClick={handleAddressSearch}
                  disabled={searching || !searchAddress.trim()}
                >
                  <Navigation size={16} />
                  Search
                </SearchButton>
                <SearchButton 
                  onClick={handleLiveLocation}
                  disabled={searching}
                  variant="live"
                >
                  <Navigation size={16} />
                  Current
                </SearchButton>
              </SearchButtonGroup>
            </SearchContainer>

            <GridContainer>
              {error ? (
                <EmptyGridMessage>
                  <h3>Oops!</h3>
                  <p>{error}</p>
                </EmptyGridMessage>
              ) : loading ? (
                <div style={{ textAlign: 'center', gridColumn: '1/-1' }}>
                  <LoadingSpinner />
                </div>
              ) : !hasSearched ? (
                <EmptyGridMessage>
                  <h3>Find Items Near You</h3>
                  <p>Enter your address or use current location to discover items in your area</p>
                </EmptyGridMessage>
              ) : nearbyItems.length === 0 ? (
                <EmptyGridMessage>
                  <h3>No Items Found</h3>
                  <p>No items found in this location. Try searching a different area.</p>
                </EmptyGridMessage>
              ) : (              
                nearbyItems.map(item => (
                  <FeaturedItem 
                    key={`${item.shopId}-${item.id}`} 
                    item={{
                      ...item,
                      location: item.formattedDistance
                    }}
                    showDistance={true}
                    theme={currentStyle}
                    onItemClick={handleItemClick}
                  />
                ))
              )}
            </GridContainer>
          </>
        )}

        {/* Featured Items Tab */}
        {activeTab === 'featured' && (
          <>
            {/* Search container */}
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Search for items..."
                value={featuredSearchTerm}
                onChange={(e) => setFeaturedSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFeaturedSearch()}
              />
              <SearchButtonGroup>
                <SearchButton 
                  onClick={handleFeaturedSearch}
                  disabled={isSearching || !featuredSearchTerm.trim()}
                >
                  <Search size={16} />
                  Search
                </SearchButton>
                {hasSearchResults && (
                  <SearchButton onClick={handleClearFeaturedSearch} variant="live">
                    <X size={16} />
                    Clear
                  </SearchButton>
                )}
              </SearchButtonGroup>
            </SearchContainer>

            {/* Show search results or default categorized view */}
            {hasSearchResults ? (
              <div>
                <CategoryHeader theme={currentStyle}>
                  <h2>Search Results ({searchResults.length})</h2>
                </CategoryHeader>

                {error ? (
                  <EmptyGridMessage>
                    <h3>No Results Found</h3>
                    <p>{error}</p>
                  </EmptyGridMessage>
                ) : isSearching ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <LoadingSpinner />
                  </div>
                ) : searchResults.length === 0 ? (
                  <EmptyGridMessage>
                    <h3>No Items Found</h3>
                    <p>No items match your search criteria.</p>
                  </EmptyGridMessage>
                ) : (
                  <GridContainer>
                    {searchResults.map(item => (
                      <FeaturedItem 
                        key={`search-${item.shopId}-${item.id}`} 
                        item={item}
                        theme={currentStyle}
                        onItemClick={handleItemClick}
                        showDistance={true}
                      />
                    ))}
                  </GridContainer>
                )}
              </div>
            ) : (
              <div>
                {/* Featured Items Slider */}
                <CategoryHeader theme={currentStyle}>
                  <h2>Featured Items</h2>
                  <span className="view-all">
                    {featuredItems.length} items
                  </span>
                </CategoryHeader>

                <CategoryGridWrapper>
                {/* Desktop: Show all items in grid */}
                <div className="desktop-grid" style={{ display: 'contents' }}>
                  {featuredItems.map(item => (
                    <div key={`featured-${item.shopId}-${item.id}`} className="desktop-only" 
                         style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
                      <FeaturedItem
                        item={item}
                        theme={currentStyle}
                        onItemClick={handleItemClick}
                        showDistance={true}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Mobile: Show all 10 items in a 2-row scrollable grid */}
                <CategoryScrollableGrid theme={currentStyle} className="mobile-only">
                  {featuredItems.map(item => (
                    <FeaturedItem
                      key={`featured-mobile-${item.shopId}-${item.id}`}
                      item={item}
                      theme={currentStyle}
                      onItemClick={handleItemClick}
                      showDistance={true}
                    />
                  ))}
                </CategoryScrollableGrid>
              </CategoryGridWrapper>
                
              {Object.entries(categories).map(([categoryName, items]) => {
          if (items.length === 0) return null;
                      
          return (
            <div key={categoryName} style={{ marginTop: '3rem' }}>
              <CategoryHeader theme={currentStyle}>
                <h2>{categoryName}</h2>
                <span className="view-all">
                  {items.length} items
                </span>
              </CategoryHeader>
          
              <CategoryGridWrapper>
                {/* Desktop: Show all items in grid */}
                <div className="desktop-grid" style={{ display: 'contents' }}>
                  {items.map(item => (
                    <div key={`${categoryName}-${item.shopId}-${item.id}`} className="desktop-only"
                         style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
                      <FeaturedItem
                        item={item}
                        theme={currentStyle}
                        onItemClick={handleItemClick}
                        showDistance={true}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Mobile: Show all items in a scrollable grid (1 or 2 rows based on count) */}
                <CategoryScrollableGrid theme={currentStyle} className="mobile-only" itemCount={items.length}>
                  {items.map(item => (
                    <FeaturedItem
                      key={`${categoryName}-mobile-${item.shopId}-${item.id}`}
                      item={item}
                      theme={currentStyle}
                      onItemClick={handleItemClick}
                      showDistance={true}
                    />
                  ))}
                </CategoryScrollableGrid>
              </CategoryGridWrapper>
            </div>
          );
        })}
              </div>
            )}
          </>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <EmptyGridMessage>
            <h3>Featured Media</h3>
            <p>Coming soon! Discover videos and content from local creators.</p>
          </EmptyGridMessage>
        )}
      </MainContent>

      {/* Style Indicator Only */}
      <StyleIndicator theme={currentStyle}>
        <span className="style-number">{currentStyle.id}</span>
        <span>{currentStyle.name}</span>
      </StyleIndicator>

      {/* Zoomed Item View - Updated to match ShopPublicView */}
      {zoomedItem && (
      <ZoomOverlay onClick={handleCloseZoom} theme={currentStyle}>
        <ZoomContainer 
          theme={currentStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Remove ZoomHeader entirely */}
          
          {/* Image Carousel with close button overlay */}
          <ImageCarousel 
            theme={currentStyle} 
            currentIndex={currentImageIndex}
          >
            {/* Close button overlaid on image */}
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
                    <Package size={48} style={{ opacity: 0.3 }} />
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigation Arrows */}
            {zoomedItem.images && zoomedItem.images.filter(Boolean).length > 1 && (
              <>
                <button 
                  className="carousel-button prev"
                  onClick={() => setCurrentImageIndex(prev => 
                    prev === 0 ? zoomedItem.images.filter(Boolean).length - 1 : prev - 1
                  )}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  className="carousel-button next"
                  onClick={() => setCurrentImageIndex(prev => 
                    prev === zoomedItem.images.filter(Boolean).length - 1 ? 0 : prev + 1
                  )}
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
                
                {/* Dots Indicator */}
                <div className="carousel-dots">
                  {zoomedItem.images.filter(Boolean).map((_, index) => (
                    <button
                      key={index}
                      className="dot"
                      style={{ opacity: index === currentImageIndex ? 1 : 0.3 }}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </ImageCarousel>
          
          {/* Scrollable Content - rest remains the same */}
          <ZoomContent theme={currentStyle}>
            {/* All your existing content here */}
            {/* Item Header */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{
                fontSize: '1.4rem',
                margin: '0 0 0.5rem 0',
                lineHeight: '1.3',
                color: currentStyle?.colors?.text || '#FFFFFF',
                fontFamily: currentStyle?.fonts?.heading || 'inherit'
              }}>
                {zoomedItem.name}
              </h3>
              
              {/* Category Badge */}
              {zoomedItem.category && zoomedItem.category !== 'Other' && (
                <CategoryBadge theme={currentStyle}>
                  {zoomedItem.category}
                </CategoryBadge>
              )}
            </div>
            
            {/* Price Section - Compact */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: '0.5rem',
              marginBottom: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                fontSize: '1.6rem',
                fontWeight: 'bold',
                color: currentStyle?.colors?.accent || '#800000',
                lineHeight: '1'
              }}>
                ${parseFloat(zoomedItem.price || 0).toFixed(2)}
              </div>
              {orderQuantity > 1 && (
                <div style={{ 
                  fontSize: '0.85rem', 
                  opacity: 0.7,
                  color: currentStyle?.colors?.text || '#FFFFFF'
                }}>
                  × {orderQuantity} = ${(parseFloat(zoomedItem.price || 0) * orderQuantity).toFixed(2)}
                </div>
              )}
            </div>
            
            {/* Stock Status - Compact */}
            {zoomedItem.quantity !== undefined && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: parseInt(zoomedItem.quantity) > 0 ? '#4CAF50' : '#FF5252'
                }} />
                <span style={{
                  color: parseInt(zoomedItem.quantity) > 0 ? '#4CAF50' : '#FF5252',
                  fontWeight: '500'
                }}>
                  {parseInt(zoomedItem.quantity) > 0 ? 
                    `${zoomedItem.quantity} available` : 
                    'Out of stock'
                  }
                </span>
              </div>
            )}
    
            {/* Description */}
            {zoomedItem.description && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: 0.5,
                  marginBottom: '0.5rem',
                  color: currentStyle?.colors?.text || '#FFFFFF'
                }}>
                  Description
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  opacity: 0.9,
                  color: currentStyle?.colors?.text || '#FFFFFF'
                }}>
                  {zoomedItem.description}
                </div>
              </div>
            )}
    
            {/* Location & Shop Info - Combined */}
            <div style={{
              background: `${currentStyle?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}40`,
              borderRadius: '8px',
              padding: '0.875rem',
              marginBottom: '1rem'
            }}>
              {/* Distance */}
              {zoomedItem.formattedDistance && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: zoomedItem.shopName ? '0.75rem' : '0',
                  fontSize: '0.85rem',
                  color: currentStyle?.colors?.text || '#FFFFFF'
                }}>
                  <Navigation size={14} style={{ opacity: 0.7 }} />
                  <span style={{ fontWeight: '500' }}>
                    {zoomedItem.formattedDistance} away
                  </span>
                </div>
              )}
              
              {/* Shop Name - Now clickable */}
              {zoomedItem.shopName && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/shop/${zoomedItem.shopId}/view`);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = currentStyle?.colors?.accent || '#800000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = currentStyle?.colors?.text || '#FFFFFF';
                  }}
                >
                  <Store size={14} style={{ opacity: 0.7 }} />
                  <div>
                    <span style={{ opacity: 0.6, marginRight: '0.375rem' }}>by</span>
                    <strong style={{ 
                      textDecoration: 'underline',
                      textDecorationColor: 'transparent',
                      transition: 'text-decoration-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecorationColor = currentStyle?.colors?.accent || '#800000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecorationColor = 'transparent';
                    }}
                    >
                      {zoomedItem.shopName}
                    </strong>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quantity Selector - Compact */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: `${currentStyle?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}40`,
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontWeight: '600',
                fontSize: '0.9rem',
                color: currentStyle?.colors?.text || '#FFFFFF'
              }}>
                Quantity
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <button 
                  onClick={() => adjustQuantity(-1)}
                  disabled={orderQuantity <= 1}
                  aria-label="Decrease quantity"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `2px solid ${currentStyle?.colors?.accent || '#800000'}`,
                    background: 'transparent',
                    color: currentStyle?.colors?.accent || '#800000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: orderQuantity <= 1 ? 'not-allowed' : 'pointer',
                    opacity: orderQuantity <= 1 ? 0.3 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <Minus size={16} />
                </button>
                
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: currentStyle?.colors?.text || 'white',
                  minWidth: '32px',
                  textAlign: 'center'
                }}>
                  {orderQuantity}
                </div>
              
                <button 
                  onClick={() => adjustQuantity(1)}
                  disabled={orderQuantity >= parseInt(zoomedItem.quantity || 1)}
                  aria-label="Increase quantity"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `2px solid ${currentStyle?.colors?.accent || '#800000'}`,
                    background: 'transparent',
                    color: currentStyle?.colors?.accent || '#800000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: orderQuantity >= parseInt(zoomedItem.quantity || 1) ? 'not-allowed' : 'pointer',
                    opacity: orderQuantity >= parseInt(zoomedItem.quantity || 1) ? 0.3 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
                
            {/* Order Button */}
            <button 
              onClick={handleDirectOrder}
              disabled={parseInt(zoomedItem.quantity || 0) < 1 || orderQuantity > parseInt(zoomedItem.quantity || 0)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: 'none',
                background: parseInt(zoomedItem.quantity || 0) < 1 ? 
                  `${currentStyle?.colors?.accent || '#800000'}40` : 
                  currentStyle?.colors?.accent || '#800000',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: parseInt(zoomedItem.quantity || 0) < 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                marginBottom: '1rem'
              }}
            >
              {parseInt(zoomedItem.quantity || 0) < 1 ? (
                <>
                  <X size={18} />
                  Out of Stock
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Order {orderQuantity > 1 ? `${orderQuantity} items` : '1 item'} · ${(parseFloat(zoomedItem.price || 0) * orderQuantity).toFixed(2)}
                </>
              )}
            </button>
            
            {/* Info Footer - Compact */}
            <div style={{
              padding: '0.75rem',
              background: `${currentStyle?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}20`,
              borderRadius: '8px',
              fontSize: '0.75rem',
              opacity: 0.6,
              lineHeight: '1.5',
              color: currentStyle?.colors?.text || '#FFFFFF',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}>
              <MessageCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Orders start a conversation with the seller to arrange details.</span>
            </div>
          </ZoomContent>
        </ZoomContainer>
      </ZoomOverlay>
    )}

      {/* Chat Overlay */}
      <ChatOverlay isOpen={chatOpen} onClick={handleCloseChat} />
      
      {selectedChatItem && (
        <OrderChat 
          isOpen={chatOpen} 
          onClose={handleCloseChat} 
          item={selectedChatItem}
          shopId={selectedChatItem.shopId}
          shopName={selectedChatItem.shopName}
          theme={currentStyle}
        />
      )}
    </PageContainer>
  );
};

export default WelcomePage;