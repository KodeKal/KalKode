// src/pages/WelcomePage.js
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getFeaturedItems } from '../firebase/firebaseService';
import FeaturedItem from '..//components/shop/FeaturedItem';
import { Users, Package, Navigation, Film, Pin } from 'lucide-react';
import { getDistance } from 'geolib';
import { collection, getDocs } from 'firebase/firestore';
import Pagination from '../components/common/Pagination';
import { LocationFormat } from '../utils/locationUtils';
import { db } from '../firebase/config';
import { WELCOME_STYLES } from '../theme/welcomeStyles';
import { getShopData } from '../firebase/firebaseService';
import { useAuth } from '../contexts/AuthContext';

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ProfileImage = styled.div`
  width: 200px; /* Increased from 120px (3x larger) */
  height: 189px; /* Increased from 120px (3x larger) */
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1.5rem; /* Increased margin for better spacing */
  border: 6px solid ${props => props.theme?.colors?.accent || '#800000'}; /* Increased border width */
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
  font-size: 5.4rem; /* Increased from 1.8rem (3x larger) */
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
    display: ${props => props.theme?.animations?.pingAnimation ? 'block' : 'none'};
    z-index: 0; // Set a low z-index to ensure it's behind other content
  }

  /* Updated ping animation to be 1/3 the size */
  .ping::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 67px; // Reduced from 200px to about 1/3
    height: 67px; // Reduced from 200px to about 1/3
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

// Update the BannerShopName component
const BannerShopName = styled.div`
  font-family: ${props => props.theme?.fonts?.heading || "'Impact', sans-serif"};
  font-size: 1.4rem;
  color: ${props => props.theme?.colors?.accent || '#800000'};
  margin-left: 1rem;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap; // Prevent line breaks
  overflow: hidden; // Hide overflow
  text-overflow: ellipsis; // Add ellipsis for overflow text
  max-width: 200px; // Limit width
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &::before {
    content: '•';
    margin-right: 0.5rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    flex-shrink: 0; // Prevent bullet from shrinking
  }
`;

// Create a wrapper for the Header content
const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  justify-content: space-between; // Space between logo+shop name and any other elements
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

const getZipCodeFromCoordinates = async (coordinates) => {
  if (!coordinates?.lat || !coordinates?.lng) return null;
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=AIzaSyAXi8mf4tBi2cajWajJB-jwBbctlikXMbo`
    );
    const data = await response.json();
    
    if (data.results && data.results[0]) {
      // Find postal code from address components
      const postalComponent = data.results[0].address_components.find(
        component => component.types.includes('postal_code')
      );
      return postalComponent ? postalComponent.long_name : null;
    }
    return null;
  } catch (error) {
    console.error('Error getting ZIP code:', error);
    return null;
  }
};

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
  const [userLocation, setUserLocation] = useState(null);
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


  // Add the handlePageChange function
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadFeaturedItems(newPage);
    // Scroll to top of grid
    const gridElement = document.querySelector('.featured-grid');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add location permission handling
  const requestLocationPermission = () => {
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setShowLocationPrompt(false);
          setLocationChecked(true);
          fetchNearbyItems(position.coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Handle specific error codes
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              setError(
                <div>
                  Location access was denied. To enable:
                  <ol style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                    <li>Click the lock icon 🔒 in your browser's address bar</li>
                    <li>Click "Site settings"</li>
                    <li>Change location permission to "Allow"</li>
                    <li>Refresh the page</li>
                  </ol>
                </div>
              );
              break;
            case 2: // POSITION_UNAVAILABLE
              setError('Could not detect your current location. Please try again.');
              break;
            case 3: // TIMEOUT
              setError('Location request timed out. Please try again.');
              break;
            default:
              setError('Unable to access your location. Please enable location services.');
          }
          setLocationChecked(true);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLocationChecked(true);
    }
  };
  
  // Update the useEffect for tab changes
  useEffect(() => {
    const loadTabContent = async () => {
      try {
        setLoading(true);
        setError(null);
    
        switch (activeTab) {
          case 'featured':
            const items = await getFeaturedItems(6);
            setFeaturedItems(items);
            break;
          case 'nearby':
            // Don't automatically fetch nearby items
            setLoading(false);
            break;
          case 'media':
            // Fetch featured media content
            break;
        }
      } catch (error) {
        console.error('Error loading content:', error);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    loadTabContent();
  }, [activeTab]);

  // Add nearby items fetching
  const fetchNearbyItems = async (coordinates) => {
    if (!coordinates || typeof coordinates.latitude !== 'number' || typeof coordinates.longitude !== 'number') {
      setError('Invalid location coordinates');
      setSearching(false);
      return;
    }
  
    try {
      setLoading(true);
      const shopsRef = collection(db, 'shops');
      const snapshot = await getDocs(shopsRef);
      
      let itemsInRadius = [];
      
      // Collect all items with valid coordinates
      snapshot.docs.forEach(doc => {
        const shopData = doc.data();
        if (shopData?.items && Array.isArray(shopData.items)) {
          shopData.items
            .filter(item => !item.deleted)
            .forEach(item => {
              // Get coordinates either from coordinates object or parse from address
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
                    { latitude: coordinates.latitude, longitude: coordinates.longitude },
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
                    formattedDistance: `${distanceInMiles} mi`
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
      itemsInRadius = itemsInRadius.slice(0, 10);
  
      console.log('Found nearby items:', {
        total: itemsInRadius.length,
        items: itemsInRadius.map(item => ({
          name: item.name,
          distance: item.formattedDistance
        }))
      });
  
      setNearbyItems(itemsInRadius);
      
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
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
  
          console.log('Got user coordinates:', coordinates);
  
          try {
            await fetchNearbyItems(coordinates);
            // Set address display for reference
            setSearchAddress(`${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`);
          } catch (error) {
            console.error('Error finding nearby items:', error);
            setError('Error finding nearby items. Please try again.');
          }
          setSearching(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to access your location. Please enable location services.');
          setSearching(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setSearching(false);
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
  const loadFeaturedItems = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const shopsRef = collection(db, 'shops');
      const snapshot = await getDocs(shopsRef);
      const GOOGLE_MAPS_API_KEY = 'AIzaSyAXi8mf4tBi2cajWajJB-jwBbctlikXMbo';
    
      let allItems = [];
      for (const doc of snapshot.docs) {
        const shopData = doc.data();
        if (shopData.items) {
          const shopItems = await Promise.all(shopData.items
            .filter(item => !item.deleted)
            .map(async item => {
              console.log('Processing item:', {
                name: item.name,
                address: item.address,
                coordinates: item.coordinates
              });
          
              // First parse coordinates from address if it's in coordinate format
              let coordinates = item.coordinates;
              let zipCode = null;
          
              if (item.address) {
                const coordsMatch = item.address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
                if (coordsMatch) {
                  coordinates = {
                    lat: parseFloat(coordsMatch[1]),
                    lng: parseFloat(coordsMatch[2])
                  };
                  console.log('Parsed coordinates from address:', coordinates);
                }
              }
          
              // Now try to get ZIP code if we have coordinates
              if (coordinates?.lat && coordinates?.lng) {
                try {
                  console.log('Attempting to fetch ZIP for coordinates:', coordinates);
                  const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${GOOGLE_MAPS_API_KEY}`
                  );
                  const data = await response.json();
                  
                  console.log('Geocoding API response:', data); // Add this to see the full response
                  
                  if (data.results && data.results[0]) {
                    console.log('Address components:', data.results[0].address_components); // Add this to see components
                    const postalComponent = data.results[0].address_components.find(
                      component => component.types.includes('postal_code')
                    );
                    zipCode = postalComponent ? postalComponent.long_name : null;
                    console.log('Successfully found ZIP code:', zipCode);
                  } else {
                    console.log('No results found in geocoding response');
                  }
                } catch (error) {
                  console.warn('Error fetching ZIP from coordinates:', error);
                  console.log('Full error details:', {
                    message: error.message,
                    coordinates: coordinates
                  });
                }
              }
                        
              const processedItem = {
                ...item,
                shopId: doc.id,
                shopName: shopData.name || 'Unknown Shop',
                shopTheme: shopData.theme || {},
                coordinates, // Add the parsed coordinates
                zipCode
              };
          
              console.log('Final processed item:', {
                name: processedItem.name,
                address: processedItem.address,
                coordinates: processedItem.coordinates,
                zipCode: processedItem.zipCode
              });
          
              return processedItem;
            }));
          allItems = [...allItems, ...shopItems];
        }
      }
    
      // Filter by ZIP code if one is selected
      if (currentZipCode) {
        allItems = allItems.filter(item => item.zipCode === currentZipCode);
      }
    
      // Sort by most recent first
      allItems.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
    
      setTotalItems(allItems.length);
    
      // Calculate pagination and prepare items for display
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      
      const itemsToDisplay = await Promise.all(allItems.slice(startIndex, endIndex).map(async item => {
        // Previous coordinate parsing code...
      
        let locationDisplay = undefined;
        let coords = item.coordinates;
        
        if (coords?.lat && coords?.lng) {
          try {
            console.log(`Fetching location data for ${item.name}:`, coords);
            
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`,
              {
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'KalKode Marketplace'
                }
              }
            );
            
            const data = await response.json();
            console.log(`Nominatim response for ${item.name}:`, data);
      
            if (data.address?.postcode) {
              locationDisplay = `ZIP: ${data.address.postcode}`;
            } else {
              locationDisplay = `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°W`;
            }
          } catch (error) {
            console.error(`Error getting location for ${item.name}:`, error);
            locationDisplay = `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°W`;
          }
        }
      
        console.log('Final item state:', {
          name: item.name,
          locationDisplay,
          coords
        });
      
        // Return with locationDisplay directly in the item
        return {
          ...item,
          location: locationDisplay  // Set location directly
        };
      }));

      setFeaturedItems(itemsToDisplay);
    } catch (error) {
      console.error('Error loading featured items:', error);
      setError('Failed to load featured items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (activeTab === 'featured') {
    loadFeaturedItems(currentPage);
  }
  
  // Set up refresh interval
  const refreshInterval = setInterval(() => {
    if (activeTab === 'featured') {
      loadFeaturedItems(currentPage);
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
            onClick={() => navigate('/shop/dashboard')}
            title={`Go to ${shopData.name} Dashboard`} // More descriptive tooltip
          >
            {/* Optional: Add icon */}
            {/* <Store size={14} style={{ marginRight: '6px' }} /> */}
            {shopData.name}
          </ShopNameBadge>
        )}
      </Header>

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
                <ProfileImage>
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
                <ShopName>{shopData.name || 'My Shop'}</ShopName>
              </ProfileSection>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <ActionButton theme={currentStyle} onClick={() => navigate('/shop/dashboard')}>
                  My Dashboard
                </ActionButton>
              </div>

              <MotivationalMessage>
                {motivationalMessage}
              </MotivationalMessage>
            </>
          ) : (
            // Non-logged in view (original)
            <>
              <h1>Welcome to KalKode</h1>
              <p>Join the underground marketplace where local creators thrive. </p>
              <p>Build your empire and discover unique treasures.</p>
            </>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            {isAuthenticated ? (
              <ActionButton theme={currentStyle} onClick={() => navigate('/shop/dashboard')}>
                My Dashboard
              </ActionButton>
            ) : (
              <>
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
              </>
            )}
          </div>
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
                  showDistance
                />
              ))
            )}
          </GridContainer>
        </>
      )}

      {/* Featured Items Tab */}
      {activeTab === 'featured' && (
        <>
          <GridContainer className="featured-grid">
            {error ? (
              <div style={{ textAlign: 'center', gridColumn: '1/-1', color: '#ff4444' }}>
                {error}
              </div>
            ) : loading ? (
              <div style={{ textAlign: 'center', gridColumn: '1/-1' }}>
                <LoadingSpinner />
              </div>
            ) : featuredItems.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                gridColumn: '1/-1',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                No items available yet. Be the first to add items!
              </div>
            ) : (
              featuredItems.map(item => (
                <FeaturedItem 
                  key={`${item.shopId}-${item.id}`} 
                  item={item}  // Pass the entire item as is
                />
              ))
            )}
          </GridContainer>
          
          {!loading && featuredItems.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / itemsPerPage)}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentLocation={currentZipCode}
              onClearLocation={() => {
                setCurrentZipCode(null);
                loadFeaturedItems(1);
              }}
            />
          )}
        </>
      )}

      </MainContent>
    </PageContainer>
  );
};

export default WelcomePage;