// src/pages/WelcomePage.js
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef  } from 'react';
import { getFeaturedItems } from '../firebase/firebaseService';
import FeaturedItem from '..//components/shop/FeaturedItem';
import { Search, Users, Package, Navigation, Film, Pin, ChevronLeft, ChevronRight, X, MessageCircle, ShoppingCart } from 'lucide-react';
import { getDistance } from 'geolib';
import OrderChat from '../components/Chat/OrderChat'; // Import the OrderChat component

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { WELCOME_STYLES } from '../theme/welcomeStyles';
import { getShopData } from '../firebase/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import LocationDialog from '../components/LocationDialog';

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

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ProfileImage = styled.div`
  width: 200px;
  height: 189px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 6px solid ${props => props.theme?.colors?.accent || '#800000'};
  box-shadow: 0 0 30px ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
  transition: all 0.3s ease;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 0 40px ${props => `${props.theme?.colors?.accent}60` || 'rgba(128, 0, 0, 0.4)'};
  }
`;

// Update the ShopName styled component
const ShopName = styled.h2`
  font-family: ${props => props.theme?.fonts?.heading || "'Impact', sans-serif"};
  font-size: 5.4rem;
  background: ${props => props.theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 1rem 0;
  transition: all 0.3s ease;
  text-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
`;

const MotivationalMessage = styled.p`
  font-size: 1.4rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 3rem auto 0; // Increased top margin to place it below the button
  color: ${props => props.theme?.colors?.text || '#FFFFFF'}; // Use text color for subtlety
  font-weight: 400; // Lighter weight for sleeker appearance
  font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"}; // Use body font for elegance
  text-align: center;
  padding: 1.5rem 2rem;
  letter-spacing: 0.5px;
  
  /* Sleek, minimal styling */
  position: relative;
  
  /* Add subtle quotes */
  &::before, &::after {
    content: '"';
    font-family: ${props => props.theme?.fonts?.heading || "'Georgia', serif"};
    font-size: 3rem;
    position: absolute;
    opacity: 0.2;
    color: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  &::before {
    top: -1.5rem;
    left: -1rem;
  }
  
  &::after {
    bottom: -2.5rem;
    right: -1rem;
  }
  
  /* Add subtle gradient bottom border */
  border-bottom: 1px solid transparent;
  background-image: ${props => `linear-gradient(90deg, transparent, ${props.theme?.colors?.accent || '#800000'}40, transparent)`};
  background-position: bottom;
  background-size: 100% 1px;
  background-repeat: no-repeat;
`;

// Define motivational messages at the component level
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

const PageContainer = styled.div.attrs({ className: 'page-container' })`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#000000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  position: relative;
  overflow: hidden;

  /* Existing background effects remain unchanged */
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: ${props => props.theme?.colors?.backgroundGradient || 'radial-gradient(circle at 20% 30%, rgba(128, 0, 0, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(128, 0, 0, 0.15) 0%, transparent 50%)'};
    opacity: 0.8;
    animation: ${props => props.theme?.animations?.backgroundAnimation || 'galaxySwirl 30s linear infinite'};
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle 1px, ${props => props.theme?.colors?.text || '#FFF'} 1px, transparent 1px),
      radial-gradient(circle 2px, ${props => props.theme?.colors?.accent || '#800000'} 1px, transparent 2px);
    background-size: 200px 200px, 300px 300px;
    background-position: 0 0;
    opacity: 0.1;
    animation: twinkle 4s infinite alternate;
  }

  .ping {
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: ${props => props.theme?.colors?.accent || '#800000'};
    pointer-events: none;
    display: block;
    z-index: 0; 
  }

  /* Updated ping animation to be 1/3 the size */
  .ping::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px; // Reduced from 200px to about 1/3
    height: 40px; // Reduced from 200px to about 1/3
    border-radius: 50%;
    background: transparent;
    border: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.6; // Slightly reduced opacity for background effect
    animation: radarPing 3s ease-out forwards;
  }
  
  .ping::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px; // Reduced from 120px to about 1/3
    height: 40px; // Reduced from 120px to about 1/3
    border-radius: 50%;
    background: transparent;
    border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.4; // Reduced opacity
    animation: radarPing 2.5s ease-out 0.2s forwards;
  }

  // Make sure MainContent has a higher z-index
  & > main {
    position: relative;
    z-index: 1; // Higher than ping z-index
  }

  @keyframes radarPing {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.6;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
  }

  /* Other keyframes remain the same */
  @keyframes galaxySwirl {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.05; }
    50% { opacity: 0.1; }
  }
`;


const Header = styled.header`
  width: 100%;
  height: 80px;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: auto 1fr auto; // Logo, space, shop name
  grid-gap: 2rem;
  align-items: center;
  background: ${props => props.theme?.colors?.headerBg || 'rgba(0, 0, 0, 0.9)'};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  position: fixed;
  top: 0;
  z-index: 10;
`;

// Keep the Logo styled component
const Logo = styled.div`
  color: ${props => props.theme?.colors?.accent || '#800000'};
  font-family: ${props => props.theme?.fonts?.heading || "'Impact', sans-serif"};
  font-size: 2rem;
  letter-spacing: 2px;
  transform: skew(-5deg);
  cursor: pointer;
  flex-shrink: 0; // Prevent logo from shrinking
`;

// Create a styled component for the shop name on right
const ShopNameBadge = styled.div`
  font-family: ${props => props.theme?.fonts?.heading || "'Impact', sans-serif"};
  font-size: 1.2rem; // Reduced size from 1.4rem
  color: ${props => props.theme?.colors?.accent || '#800000'};
  max-width: 150px; // Limit width to prevent overflow
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; // Add ellipsis for long names
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.5); // Add subtle background
  padding: 0.4rem 0.8rem; // Add padding for better spacing
  justify-self: flex-end; // Position at the right edge of its grid area
  margin-right: 3rem; // Move it left from the far right edge
  
  &:hover {
    transform: translateY(-2px);
    background: rgba(0, 0, 0, 0.7);
  }
`;

// Update WelcomeSection
const WelcomeSection = styled.section`
  text-align: center;
  margin: 4rem 0;
  position: relative;

  h1 {
    font-family: ${props => props.theme?.fonts?.heading || "'Impact', sans-serif"};
    font-size: 4.5rem;
    margin-bottom: 1rem;
    background: ${props => props.theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
    letter-spacing: 2px;
    transform: ${props => props.theme?.id === 10 ? 'none' : 'skew(-5deg)'};
  }

  p {
    font-size: 1.2rem;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    color: ${props => `${props.theme?.colors?.text}CC` || 'rgba(255, 255, 255, 0.8)'};
    font-weight: 300;
    font-family: ${props => props.theme?.fonts?.body || 'sans-serif'};
  }
`;

// Update ActionButton
const ActionButton = styled.button`
  background: ${props => props.theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)'};
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 30px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 2rem;
  font-family: ${props => props.theme?.fonts?.body || 'sans-serif'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  }
`;

// Update Tab
const Tab = styled.button`
  background: ${props => props.active ? props.theme?.colors?.tabActiveBg || 'rgba(128, 0, 0, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.active ? props.theme?.colors?.tabBorder || '#800000' : `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  color: ${props => props.active ? props.theme?.colors?.text || '#FFFFFF' : `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
  font-family: ${props => props.theme?.fonts?.heading || "'Impact', sans-serif"};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.theme?.colors?.tabActiveBg || 'rgba(128, 0, 0, 0.2)'};
    border-color: ${props => props.theme?.colors?.tabBorder || '#800000'};
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

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

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 2rem 2rem 2rem; // Added top padding
  position: relative;
  z-index: 1;
`;

const LoginButton = styled.button`
  background: transparent;
  border: 2px solid #800000;
  color: #800000;
  padding: 0.8rem 2rem;
  border-radius: 30px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 1px;
  font-size: 1rem;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(128, 0, 0, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 2px 10px rgba(128, 0, 0, 0.2);
  }
`;

const PLACEHOLDER_LOCATIONS = {
  '77085': {
    latitude: 29.6350,
    longitude: -95.4738
  },
  '77036': {
    latitude: 29.7044,
    longitude: -95.5372
  }
};

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 3rem 0;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); // Reduce the minmax value from 300px to 250px
  gap: 2rem;
  margin-top: 2rem;
`;

const NearbyNotification = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 1.5rem 2rem;
  border-radius: 8px;
  border: 1px solid rgba(128, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  z-index: 100;
  max-width: 400px;
  width: 90%;

  ol {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  li {
    margin-bottom: 0.25rem;
  }
`;

const PermissionButton = styled.button`
  background: linear-gradient(45deg, #800000, #4A0404);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 10px rgba(128, 0, 0, 0.2);
  }
`;

const AddressSearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0.5rem 0;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const AddressInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(128, 0, 0, 0.2);
  border-radius: 20px;
  padding: 0.6rem 1.2rem;
  color: white;
  font-size: 0.9rem;
  min-width: 0; // Prevents input from overflowing container

  &:focus {
    outline: none;
    border-color: rgba(128, 0, 0, 0.4);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SearchButton = styled.button`
  background: ${props => props.variant === 'live' ? 'transparent' : 'rgba(128, 0, 0, 0.2)'};
  border: 1px solid rgba(128, 0, 0, 0.3);
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: rgba(128, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyGridMessage = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(128, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.7);
  grid-column: 1/-1;

  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: rgba(255, 255, 255, 0.9);
  }

  p {
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

// Add this to the styled components section in WelcomePage.js
const SliderContainer = styled.div`
  width: 100%;
  overflow-x: auto; /* Enable horizontal scrolling */
  position: relative;
  margin: 2rem 0;
  
  /* Customize the scrollbar appearance */
  &::-webkit-scrollbar {
    height: 10px; /* Height of the scrollbar */
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.colors?.accent || '#800000'};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme?.colors?.primary || '#600000'};
  }
`;

const Slider = styled.div`
  display: flex;
  width: fit-content;
  /* Remove transform and transition since we'll use native scrolling */
`;

const SlideItem = styled.div`
  flex: 0 0 300px;
  margin-right: 2rem;
`;

const PinButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.isPinned ? (props.theme?.colors?.accent || '#800000') : 'white'};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

// Update the StyleIndicator to include the pin button
// Update the StyleIndicator component
const StyleIndicator = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .style-number {
    font-weight: bold;
    font-size: 1.2rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
  }
`;

// Add these new styled components to your existing styled components

const CategorySlidersSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin: 3rem 0;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h2 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    font-size: 1.8rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    margin: 0;
  }
  
  .view-all {
    font-size: 0.9rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    opacity: 0.8;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    
    &:hover {
      opacity: 1;
      transform: translateX(3px);
    }
  }
`;

const ZoomOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.5)'}80`};
  z-index: 10000; // Extremely high z-index to appear over everything
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScrollButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.7)'}90`};
  color: ${props => props.theme?.colors?.text || 'white'};
  border: 1px solid ${props => `${props.theme?.colors?.accent}40` || 'rgba(255, 255, 255, 0.2)'};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  opacity: 0.7;
  transition: opacity 0.3s, background 0.3s;
  
  &:hover {
    opacity: 1;
    background: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  &.left {
    left: 1rem;
  }
  
  &.right {
    right: 1rem;
  }
`;


const ZoomContainer = styled.div`
  position: relative;
  z-index: 10001; // Even higher z-index than the overlay
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  background: ${props => props.theme?.colors?.surface || 'rgba(0, 0, 0, 0.8)'};
  max-height: 90vh;
  max-width: 90vw;
  width: 500px;
  transition: all 0.3s ease;
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

// Add this new styled component for the featured search
const FeaturedSearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 2rem auto;
  padding: 0.5rem 0;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const FeaturedSearchInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(128, 0, 0, 0.2);
  border-radius: 20px;
  padding: 0.6rem 1.2rem;
  color: white;
  font-size: 0.9rem;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: rgba(128, 0, 0, 0.4);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const FeaturedSearchButton = styled.button`
  background: rgba(128, 0, 0, 0.2);
  border: 1px solid rgba(128, 0, 0, 0.3);
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: rgba(128, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FeaturedClearButton = styled.button`
  background: transparent;
  border: 1px solid rgba(128, 0, 0, 0.3);
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(128, 0, 0, 0.1);
  }
`;


const WelcomePage = () => {
  const navigate = useNavigate(); // New
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [activeTab, setActiveTab] = useState('featured');
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const handleOpenShop = () => {
    navigate('/shop/create/template');
  };
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
  // New state for categorized items
  const [clothingItems, setClothingItems] = useState([]);
  const [electronicsItems, setElectronicsItems] = useState([]);
  const [collectiblesItems, setCollectiblesItems] = useState([]);
  const { userLocation, locationPermission, requestLocation } = useLocation();
  const [updatingLocation, setUpdatingLocation] = useState(false);

  // Add these new state variables
  const [featuredSearchTerm, setFeaturedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearchResults, setHasSearchResults] = useState(false);

  

  useEffect(() => {
    if (activeTab === 'nearby' && userLocation) {
      console.log('Auto-searching nearby items with location:', userLocation);
      fetchNearbyItems();
      setHasSearched(true); // Important: set this to true so items display
    }
  }, [activeTab, userLocation]);

  useEffect(() => {
    // Request location when component mounts
    if (locationPermission === 'pending') {
      requestLocation();
    }
  }, []);

  // Add this useEffect for cleanup
  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.removeAttribute('data-scroll-y');
    };
  }, []);
  
  // Handle location updates when userLocation changes
  useEffect(() => {
    if (userLocation) {
      // If we have location and are on the nearby tab, fetch items
      if (activeTab === 'nearby') {
        fetchNearbyItems();
        setHasSearched(true);
      }
      
      // Update items with distance information on featured tab
      if (activeTab === 'featured') {
        loadCategorizedItems();
      }
      
      // Finish updating indicator if it was in progress
      setUpdatingLocation(false);
    }
  }, [userLocation, activeTab]);
  
  // Handle location indicator click
  const handleLocationUpdate = () => {
    setUpdatingLocation(true);
    requestLocation();
  };
  
  // Get human-readable location info
  const getLocationDisplayText = () => {
    if (!userLocation) {
      return "Location: Not available";
    }
    
    // Format coordinates for display
    return `Location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
  };

  // Add this new function for searching featured items
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
      const currentUserId = user?.uid; // Get current user ID
      
      // Search through all shops for matching items
      snapshot.docs.forEach(doc => {
        const shopData = doc.data();
        
        // Skip the current user's shop entirely
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
              
              // Check if search term matches name or description
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
    
      // Calculate distances if user location is available
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

  const forceRestoreScrolling = () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.removeAttribute('data-scroll-y');
  };
  
  // Add this function to handle clearing the search
  const handleClearFeaturedSearch = () => {
    setFeaturedSearchTerm('');
    setSearchResults([]);
    setHasSearchResults(false);
    setError(null);
  };

  // Add this function to handle search input
  const handleFeaturedSearch = () => {
    if (featuredSearchTerm.trim()) {
      searchFeaturedItems(featuredSearchTerm);
    }
  };

  // Add a function to load categorized items
  const loadCategorizedItems = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const allItems = await getFeaturedItems(24);
      
      // Filter out own items FIRST before any other processing
      const currentUserId = user?.uid;
      const filteredItems = allItems.filter(item => {
        // Remove items that belong to the current user
        return item.shopId !== currentUserId;
      });
      
      // Calculate distances if user location is available
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
  
      // Categorize items (now all items are from other users)
      const clothing = [];
      const electronics = [];
      const collectibles = [];
  
      itemsWithDistance.forEach(item => {
        const name = (item.name || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
  
        // Simple keyword-based categorization
        if (name.includes('shirt') || name.includes('pant') || 
            name.includes('shoe') || name.includes('hat') ||
            name.includes('jacket') || description.includes('wear') ||
            description.includes('clothing')) {
          clothing.push(item);
        } else if (name.includes('phone') || name.includes('laptop') || 
                  name.includes('computer') || name.includes('tv') ||
                  name.includes('headphone') || description.includes('electronic') ||
                  description.includes('device')) {
          electronics.push(item);
        } else if (name.includes('card') || name.includes('figure') || 
                  name.includes('comic') || name.includes('vintage') ||
                  name.includes('rare') || description.includes('collectible') ||
                  description.includes('collection')) {
          collectibles.push(item);
        } else {
          // Distribute remaining items
          if (clothing.length <= electronics.length && clothing.length <= collectibles.length) {
            clothing.push(item);
          } else if (electronics.length <= collectibles.length) {
            electronics.push(item);
          } else {
            collectibles.push(item);
          }
        }
      });
  
      setElectronicsItems(electronics.slice(0, 8));
      setClothingItems(clothing.slice(0, 8));
      setCollectiblesItems(collectibles.slice(0, 8));
      setFeaturedItems(itemsWithDistance.slice(0, 8));
      setTotalItems(filteredItems.length);
  
      setLoading(false);
    } catch (error) {
      console.error('Error loading categorized items:', error);
      setError('Failed to load items. Please try again later.');
      setLoading(false);
    }
  };
  

  // Add these to your SliderContainer
  const handleScrollLeft = () => {
    if (sliderRef.current) {
      const container = sliderRef.current.parentElement;
      container.scrollBy({
        left: -600, // Adjust this value based on how far you want to scroll
        behavior: 'smooth'
      });
    }
  };
  
  const handleScrollRight = () => {
    if (sliderRef.current) {
      const container = sliderRef.current.parentElement;
      container.scrollBy({
        left: 600, // Adjust this value based on how far you want to scroll
        behavior: 'smooth'
      });
    }
  };

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
  
  // Handle message rotation with fade transition
  useEffect(() => {
    if (isAuthenticated) {
      // Select a random message when component mounts (page loads)
      const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
      setMotivationalMessage(MOTIVATIONAL_MESSAGES[randomIndex]);
    }
  }, [isAuthenticated]); 

  
  useEffect(() => {
    // Check if there's a pinned style in localStorage
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
    
    // If no pinned style or stored style not found, select a random one
    const styles = Object.values(WELCOME_STYLES);
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    setCurrentStyle(randomStyle);
  }, []);

  const togglePinStyle = () => {
    if (isPinned) {
      // Unpin the style
      localStorage.removeItem('pinnedStyleId');
      setIsPinned(false);
      
      // Select a new random style (different from current)
      const styles = Object.values(WELCOME_STYLES).filter(
        style => style.id !== currentStyle.id
      );
      
      if (styles.length > 0) {
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        setCurrentStyle(randomStyle);
      }
    } else {
      // Pin the current style
      localStorage.setItem('pinnedStyleId', currentStyle.id.toString());
      setIsPinned(true);
    }
  };

  const handleItemClick = (item) => {
    setZoomedItem(item);
    
    // If you're using the slider, pause it
    if (sliderAnimationRef.current) {
      cancelAnimationFrame(sliderAnimationRef.current);
    }
    
    // Save current scroll position and disable background scrolling
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden'; // Add this line
    
    // Store scroll position for restoration
    document.body.setAttribute('data-scroll-y', scrollY);
  };

// Add a handler to close the zoomed view
const handleCloseZoom = () => {
  setZoomedItem(null);
  
  // Restore scrolling properly
  const scrollY = document.body.getAttribute('data-scroll-y') || '0';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = ''; // Add this line
  document.body.removeAttribute('data-scroll-y'); // Clean up
  
  // Restore scroll position
  window.scrollTo(0, parseInt(scrollY));
  
  // Resume slider if needed
  if (sliderAnimationRef.current === null) {
    // Start slider animation again if needed
  }
};

// Handle order and inquire actions
const handleOrderClick = (item) => {
  setSelectedChatItem(item);
  setChatOpen(true);
  
  // Close zoom view and restore scrolling if it was open
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

// Update the chat close handler
const handleCloseChat = () => {
  setChatOpen(false);
  setSelectedChatItem(null);
  
  // Ensure scrolling is restored
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  document.body.removeAttribute('data-scroll-y');
};

const handleInquireClick = () => {
  alert('Inquiry feature coming soon!');
};
  
  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (sliderAnimationRef.current) {
        cancelAnimationFrame(sliderAnimationRef.current);
      }
    };
  }, []);

    // Add location permission handling
    const requestLocationPermission = () => {
      setError(null);
      
      // Use the requestLocation function from the LocationContext
      requestLocation();
      
      // These state updates should still happen to track UI state
      setLocationChecked(true);
      setShowLocationPrompt(false);
    };
  
  // Update the useEffect for tab changes
  useEffect(() => {
    const loadTabContent = async () => {
      try {
        setLoading(true);
        setError(null);
    
        switch (activeTab) {
          case 'featured':
            // Use the updated loadCategorizedItems which filters out own items
            loadCategorizedItems();
            return; // Don't set loading to false here since loadCategorizedItems handles it
          case 'nearby':
            // Don't automatically fetch nearby items
            setLoading(false);
            break;
          case 'media':
            // Fetch featured media content
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

  // Add nearby items fetching
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
      const currentUserId = user?.uid; // Get current user ID
      
      // Collect all items with valid coordinates
      snapshot.docs.forEach(doc => {
        const shopData = doc.data();
        
        // Skip the current user's shop entirely
        if (doc.id === currentUserId) {
          return;
        }
        
        if (shopData?.items && Array.isArray(shopData.items)) {
          shopData.items
            .filter(item => !item.deleted)
            .forEach(item => {
              // Get coordinates from item
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
                    theme: shopData.theme // Include theme data for styling
                  });
                } catch (e) {
                  console.warn('Error calculating distance for item:', e);
                }
              }
            });
        }
      });
  
      // Sort by distance and take top 10
      itemsInRadius.sort((a, b) => a.distance - b.distance);
      
      // For demo purposes, we'll limit to 10 items, but you can adjust this
      itemsInRadius = itemsInRadius.slice(0, 10);
  
      console.log('Found nearby items:', {
        total: itemsInRadius.length,
        items: itemsInRadius.map(item => ({
          name: item.name,
          distance: item.formattedDistance
        }))
      });
  
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
  
  // Add this function to handle live location
  const handleLiveLocation = () => {
    setSearching(true);
    setError(null);
    
    if (userLocation) {
      // We already have location from context, use it
      fetchNearbyItems();
      setHasSearched(true);
    } else {
      // Request location
      requestLocation();
      // We'll rely on the useEffect to trigger fetchNearbyItems when location is available
    }
  };
  
  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) {
      setError('Please enter an address');
      return;
    }
  
    setSearching(true);
    setError(null);
    setHasSearched(true);
    
    try {
      let coordinates;
      
      // Try getting location from Nominatim
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
      console.log('Nominatim search response:', data);
  
      if (data && data[0]) {
        coordinates = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
        
        console.log('Found coordinates:', coordinates);
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

  const handleLogin = () => {
    navigate('/auth', { 
      state: { 
        mode: 'login',
        from: window.location.pathname
      }
    });
  };

  // In WelcomePage.js, update loadFeaturedItems
  // Update the loadFeaturedItems function to get 8 items
  const loadFeaturedItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pass current user ID to filter out own items
      const items = await getFeaturedItems(8, user?.uid);
      setFeaturedItems(items);
      setTotalItems(items.length);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading featured items:', error);
      setError('Failed to load featured items. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
  if (activeTab === 'featured') {
    loadCategorizedItems();
  }
  
  // Set up refresh interval
  const refreshInterval = setInterval(() => {
    if (activeTab === 'featured') {
      loadCategorizedItems();
    }
  }, 300000); // 5 minutes

  return () => clearInterval(refreshInterval);
}, [activeTab, currentPage]);

React.useEffect(() => {
  const container = document.querySelector('.page-container');
  if (!container) return;

  const createPing = () => {
    const ping = document.createElement('div');
    ping.className = 'ping';
    
    ping.style.left = `${Math.random() * 100}%`;
    ping.style.top = `${Math.random() * 100}%`;
    ping.style.zIndex = '0'; // Ensure ping is in background
    
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
}, []); // Empty dependency array

  if (!currentStyle) return null;
  
  
  return (
    <PageContainer className="page-container" theme={currentStyle}>
      <Header theme={currentStyle}>
        <Logo onClick={() => navigate('/')} theme={currentStyle}>
          KALKODE
        </Logo>

        {isAuthenticated && shopData?.name && (
          <ShopNameBadge
            theme={currentStyle}
            onClick={() => navigate(`/shop/${user.uid}`)}
            title={`Go to ${shopData.name}`} // More descriptive tooltip
          >
            {/* Optional: Add icon */}
            {/* <Store size={14} style={{ marginRight: '6px' }} /> */}
            {shopData.name}
          </ShopNameBadge>
        )}
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

      <StyleIndicator theme={currentStyle}>
      <PinButton 
        onClick={togglePinStyle} 
        isPinned={isPinned}
        title={isPinned ? "Unpin this style" : "Pin this style"}
      >
        <Pin size={16} fill={isPinned ? currentStyle.colors.accent : "none"} />
      </PinButton>
        <span>Style <span className="style-number">{currentStyle.id}</span></span>
        <span>{currentStyle.name}</span>
      </StyleIndicator>

      <MainContent>
      <WelcomeSection theme={currentStyle}>
          {isAuthenticated && shopData ? (
            // Logged-in user view
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
              <p>Join the underground marketplace where local creators thrive. </p>
              <p>Build your empire and discover unique treasures.</p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <ActionButton theme={currentStyle} onClick={handleOpenShop}>Open Up Shop</ActionButton>
                <ActionButton 
                  theme={currentStyle}
                  onClick={handleLogin}
                  style={{ 
                    background: 'transparent',
                    border: `2px solid ${currentStyle.colors.accent}`,
                    color: currentStyle.colors.accent
                  }}
                >
                  Sign In
                </ActionButton>
              </div>
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
            Featured Items
          </Tab>
          <Tab
            theme={currentStyle} 
            active={activeTab === 'nearby'} 
            onClick={() => setActiveTab('nearby')}
          >
            <Navigation size={16} />
            Nearby Items
          </Tab>
          <Tab
            theme={currentStyle} 
            active={activeTab === 'media'} 
            onClick={() => setActiveTab('media')}
          >
            <Film size={16} />
            Featured Media
          </Tab>
        </TabContainer>

        {/* Add location permission prompt */}
        {showLocationPrompt && activeTab === 'nearby' && !locationChecked && (
          <NearbyNotification>
            <p>Enable location to see items near you</p>
            <PermissionButton onClick={requestLocationPermission}>
              Enable Location
            </PermissionButton>
          </NearbyNotification>
        )}
        
        {activeTab === 'nearby' && (
        <>
          <AddressSearchContainer>
            <AddressInput
              type="text"
              placeholder="Enter address or ZIP code..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
            />
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
              Current Location
            </SearchButton>
          </AddressSearchContainer>

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
                <p>Enter your address or ZIP code to discover items in your area</p>
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
                  onItemClick={handleItemClick} // Add this for click to expand
                />
              ))
            )}
          </GridContainer>
        </>
      )}


      {/* Featured Items Tab */}
{activeTab === 'featured' && (
  <>
    {/* Add search container */}
    <FeaturedSearchContainer>
      <FeaturedSearchInput
        type="text"
        placeholder="Search for items across all shops..."
        value={featuredSearchTerm}
        onChange={(e) => setFeaturedSearchTerm(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleFeaturedSearch()}
      />
      <FeaturedSearchButton 
        onClick={handleFeaturedSearch}
        disabled={isSearching || !featuredSearchTerm.trim()}
      >
        <Search size={16} />
        Search
      </FeaturedSearchButton>
      {hasSearchResults && (
        <FeaturedClearButton onClick={handleClearFeaturedSearch}>
          <X size={16} />
          Clear
        </FeaturedClearButton>
      )}
    </FeaturedSearchContainer>

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
      // Default categorized view
      <CategorySlidersSection>
        {/* First slider - Featured Items */}
        <div>
          <CategoryHeader theme={currentStyle}>
            <h2>Featured Items</h2>
          </CategoryHeader>

          <SliderContainer theme={currentStyle}>
            <ScrollButton className="left" onClick={handleScrollLeft} theme={currentStyle}>
              <ChevronLeft size={16} />
            </ScrollButton>

            <Slider ref={sliderRef}>
              {featuredItems.map(item => (
                <SlideItem key={`item-${item.shopId}-${item.id}`}>
                  <FeaturedItem
                    item={item}
                    theme={currentStyle}
                    onItemClick={handleItemClick}
                    showDistance={true}
                  />
                </SlideItem>
              ))}
            </Slider>
            
            <ScrollButton className="right" onClick={handleScrollRight} theme={currentStyle}>
              <ChevronRight size={16} />
            </ScrollButton>
          </SliderContainer>
        </div>
              
        {/* Second slider - Clothing & Accessories */}
        <div>
          <CategoryHeader theme={currentStyle}>
            <h2>Electronics & Tech</h2>
          </CategoryHeader>
          
          <SliderContainer theme={currentStyle}>
            <ScrollButton className="left" onClick={(e) => {
              const container = e.target.closest('.slider-container').querySelector('.slider');
              container.scrollBy({
                left: -600,
                behavior: 'smooth'
              });
            }} theme={currentStyle}>
              <ChevronLeft size={16} />
            </ScrollButton>

            <Slider className="slider">
              {electronicsItems.map(item => (
                <SlideItem key={`electronics-${item.shopId}-${item.id}`}>
                  <FeaturedItem
                    item={item}
                    theme={currentStyle}
                    onItemClick={handleItemClick}
                  />
                </SlideItem>
              ))}
            </Slider>
            
            <ScrollButton className="right" onClick={(e) => {
              const container = e.target.closest('.slider-container').querySelector('.slider');
              container.scrollBy({
                left: 600,
                behavior: 'smooth'
              });
            }} theme={currentStyle}>
              <ChevronRight size={16} />
            </ScrollButton>
          </SliderContainer>
        </div>
          
        {/* Third slider - Electronics & Tech */}
        <div>
          <CategoryHeader theme={currentStyle}>
            <h2>Clothing & Accessories</h2>
          </CategoryHeader>
            
          <SliderContainer theme={currentStyle}>
            <ScrollButton className="left" onClick={(e) => {
              const container = e.target.closest('.slider-container').querySelector('.slider');
              container.scrollBy({
                left: -600,
                behavior: 'smooth'
              });
            }} theme={currentStyle}>
              <ChevronLeft size={16} />
            </ScrollButton>

            <Slider className="slider">
              {clothingItems.map(item => (
                <SlideItem key={`clothing-${item.shopId}-${item.id}`}>
                  <FeaturedItem
                    item={item}
                    theme={currentStyle}
                    onItemClick={handleItemClick}
                  />
                </SlideItem>
              ))}
            </Slider>
            
            <ScrollButton className="right" onClick={(e) => {
              const container = e.target.closest('.slider-container').querySelector('.slider');
              container.scrollBy({
                left: 600,
                behavior: 'smooth'
              });
            }} theme={currentStyle}>
              <ChevronRight size={16} />
            </ScrollButton>
          </SliderContainer>
        </div>
          
        {/* Fourth slider - Collectibles & Rarities */}
        <div>
          <CategoryHeader theme={currentStyle}>
            <h2>Collectibles & Rarities</h2>
          </CategoryHeader>
          
          <SliderContainer theme={currentStyle} className="slider-container">
            <ScrollButton className="left" onClick={(e) => {
              const container = e.target.closest('.slider-container').querySelector('.slider');
              container.scrollBy({
                left: -600,
                behavior: 'smooth'
              });
            }} theme={currentStyle}>
              <ChevronLeft size={16} />
            </ScrollButton>

            <Slider className="slider">
              {collectiblesItems.map(item => (
                <SlideItem key={`collectibles-${item.shopId}-${item.id}`}>
                  <FeaturedItem
                    item={item}
                    theme={currentStyle}
                    onItemClick={handleItemClick}
                  />
                </SlideItem>
              ))}
            </Slider>
            
            <ScrollButton className="right" onClick={(e) => {
              const container = e.target.closest('.slider-container').querySelector('.slider');
              container.scrollBy({
                left: 600,
                behavior: 'smooth'
              });
            }} theme={currentStyle}>
              <ChevronRight size={16} />
            </ScrollButton>
          </SliderContainer>
        </div>
        </CategorySlidersSection>
      )}
    </>
  )}

  {/* Add the zoomed view overlay at the ROOT level of your return */}
  {zoomedItem && (
    <ZoomOverlay onClick={handleCloseZoom} theme={currentStyle}>
      <ZoomContainer 
        theme={currentStyle}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div style={{ position: 'relative', width: '100%' }}>
          {/* Image section */}
          <div style={{ padding: '1rem 1rem 0.5rem 1rem' }}>
            <div style={{ 
              position: 'relative', 
              borderRadius: '8px',
              overflow: 'hidden',
              aspectRatio: '4/3'
            }}>
              <img 
                src={zoomedItem.images?.filter(Boolean)[0] || '/placeholder-image.jpg'} 
                alt={zoomedItem.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
          
          {/* Content section */}
          <div style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem' }}>
            <h3 style={{ 
              fontSize: '1.3rem', 
              margin: '0 0 0.5rem 0',
              fontFamily: currentStyle?.fonts?.heading || 'inherit'
            }}>{zoomedItem.name}</h3>

            <div style={{ 
              fontSize: '1.2rem', 
              fontWeight: 'bold',
              color: currentStyle?.colors?.accent || '#800000',
              marginBottom: '0.5rem'
            }}>
              ${parseFloat(zoomedItem.price || 0).toFixed(2)}
            </div>
          
            <div style={{ 
              fontSize: '0.9rem', 
              opacity: 0.8,
              marginBottom: '1.5rem',
              maxHeight: '100px',
              overflow: 'auto'
            }}>
              {zoomedItem.description || 'No description available.'}
            </div>
          
            {/* Show distance if available */}
            {zoomedItem.formattedDistance && (
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                opacity: 0.8,
                marginBottom: '1rem'
              }}>
                <Navigation size={16} />
                {zoomedItem.formattedDistance} away
              </div>
            )}

            {/* Action buttons */}
            <div style={{ 
              display: 'flex',
              gap: '0.5rem'
            }}>
              <ActionButton 
                className="secondary"
                onClick={handleInquireClick}
                theme={currentStyle}
              >
                <MessageCircle size={16} />
                Inquire
              </ActionButton>
              <ActionButton 
                className="primary"
                onClick={() => handleOrderClick(zoomedItem)}
                theme={currentStyle}
              >
                <ShoppingCart size={16} />
                Order
              </ActionButton>
            </div>
          </div>
          
          {/* Close button */}
          <button 
            onClick={handleCloseZoom}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <X size={14} />
          </button>
        </div>
      </ZoomContainer>
    </ZoomOverlay>
  )}

  <ChatOverlay 
    isOpen={chatOpen} 
    onClick={handleCloseChat} // Use the new function instead of inline
  />

  {chatOpen && selectedChatItem && (
    <OrderChat 
      isOpen={chatOpen} 
      onClose={handleCloseChat} // Use the new function here too
      item={selectedChatItem}
      shopId={selectedChatItem.shopId}
      shopName={selectedChatItem.shopName}
      theme={currentStyle}
    />
  )}

      </MainContent>
    </PageContainer>
  );
};

export default WelcomePage;