// Save at: src/pages/shop/LiveShopCreation.js

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Plus,
  Heart,
  MessageCircle,
  Share2,
  X
} from 'lucide-react';
import { useTempStore } from '../../contexts/TempStoreContext';
import EditableText from './components/EditableComponents/EditableText';
import EditableImage from './components/EditableComponents/EditableImage';
import EditableItem from './components/EditableComponents/EditableItem';
import TabPositioner from './components/TabPositioner';
//import { DEFAULT_THEME } from '../../theme/config/themes';
import ThemeSelector from '../../components/ThemeSelector/ThemeSelector';
import AddressInput from '../../components/shop/AddressInput';
import { THEMES, DEFAULT_THEME } from '../../constants/themes';  // Update this import
import { WELCOME_STYLES } from '../../theme/welcomeStyles';

// Theme Constants
export const ELEMENTAL_THEMES = {
  WATER: {
    id: 'water',
    name: 'Ocean Depths',
    description: 'Flowing and calm like the deep sea',
    colors: {
      background: '#1E3D59',
      text: '#FFFFFF',
      primary: '#2D6187',
      secondary: '#41B3D3',
      accent: '#41B3D3'
    },
    fonts: {
      heading: "'Quicksand', sans-serif",
      body: "'Source Sans Pro', sans-serif"
    }
  },
  FIRE: {
    id: 'fire',
    name: 'Ember Forge',
    description: 'Bold and energetic like flames',
    colors: {
      background: '#1A0F0F',
      text: '#FFFFFF',
      primary: '#CD2B2B',
      secondary: '#FF6B4A',
      accent: '#FFA07A'
    },
    fonts: {
      heading: "'Bebas Neue', sans-serif",
      body: "'Montserrat', sans-serif"
    }
  },
  EARTH: {
    id: 'earth',
    name: 'Terra Firma',
    description: 'Grounded and natural like earth',
    colors: {
      background: '#1A2213',
      text: '#E8F3E8',
      primary: '#2D4A22',
      secondary: '#5C832F',
      accent: '#98C379'
    },
    fonts: {
      heading: "'Playfair Display', serif",
      body: "'Lora', serif"
    }
  },
  AIR: {
    id: 'air',
    name: 'Sky Whisper',
    description: 'Light and ethereal like the wind',
    colors: {
      background: '#2B4865',
      text: '#FFFFFF',
      primary: '#6E85B7',
      secondary: '#C4D7E0',
      accent: '#F8F9FA'
    },
    fonts: {
      heading: "'Raleway', sans-serif",
      body: "'Open Sans', sans-serif"
    }
  }
};

// Navigation Constants
export const TAB_POSITIONS = {
  TOP: 'top',
  LEFT: 'left',
  BOTTOM: 'bottom'
};

export const SHOP_NAME_POSITIONS = {
  LEFT: 'left',
  CENTER: 'center'
};

const HiddenInput = styled.input`
  display: none;
`;

// Mock Data
const MOCK_POSTS = [
  {
    id: 1,
    type: 'media',
    author: 'ArtisanCrafts',
    content: 'Just launched our new collection! Check out these handmade pieces. 🎨',
    likes: 42,
    comments: 12,
    timeAgo: '2h ago'
  },
  {
    id: 2,
    type: 'item',
    author: 'VintageTreasures',
    item: {
      name: 'Antique Pocket Watch',
      price: 299.99,
      wants: 15
    },
    timeAgo: '4h ago'
  }
];

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || DEFAULT_THEME.colors.background};
  color: ${props => props.theme?.colors?.text || DEFAULT_THEME.colors.text};
  position: relative;
  overflow-x: hidden;
  padding-top: 80px;
`;

const ShopBanner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: ${props => `${props.theme?.colors?.background || DEFAULT_THEME.colors.background}CC`};
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 100;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent || DEFAULT_THEME.colors.accent}30`};
`;

const TabControlsContainer = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 100;
  top: 0.1rem; // Adjust to align with banner
  left: 51%;
  transform: translateX(-50%);
`;

const ThemeContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;

  & > div > div:nth-child(2) {  // This targets the dropdown content
    bottom: calc(100% + 0.5rem);
    top: auto;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
`;


const ShopName = styled.div`
  flex: 1;
  text-align: ${props => props.position};
  font-family: ${props => props.theme?.fonts?.heading || DEFAULT_THEME.fonts.heading};
  font-size: 1.8rem;
  padding: ${props => props.position === 'center' ? '0 80px' : '0'};
`;

const KalkodeLogo = styled.div`
  color: #800000;
  font-family: 'Impact', sans-serif;
  font-size: 2rem;
  letter-spacing: 2px;
  transform: skew(-5deg);
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: skew(-5deg) translateY(-2px);
  }
`;

const KalKodeLogo = styled.div`
  color: #A00000;
  font-family: 'Impact', sans-serif;
  font-size: 2rem;
  letter-spacing: 2px;
  transform: skew(-5deg);
`;

const MainContent = styled.div`
  max-width: ${props => props.theme?.styles?.containerWidth || DEFAULT_THEME.styles.containerWidth};
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
`;

const ActionButtons = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  gap: 1rem;
  z-index: 100;
`;

const ActionButton = styled.button`
  background: ${props => props.theme?.colors?.accent || DEFAULT_THEME.colors.accent};
  color: #800000; // Changed to match KalKode red
  border: none;
  border-radius: 30px;
  padding: 1rem 2rem;
  font-family: ${props => props.theme?.fonts?.heading || DEFAULT_THEME.fonts.heading};
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  font-weight: bold; // Added for better visibility

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(128, 0, 0, 0.2);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
`;

const CategoryTab = styled.button`
  background: ${props => props.active ? props.theme?.colors?.surface : 'transparent'};
  border: 1px solid ${props => props.active ? 
    props.theme?.colors?.accent || DEFAULT_THEME.colors.accent : 
    'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? 
    props.theme?.colors?.text || DEFAULT_THEME.colors.text : 
    `${props.theme?.colors?.text || DEFAULT_THEME.colors.text}80`};
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-family: ${props => props.theme?.fonts?.heading || DEFAULT_THEME.fonts.heading};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'};
    border-color: ${props => props.theme?.colors?.accent || DEFAULT_THEME.colors.accent};
  }
`;

// Shop View Styled Components
const ShopSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ShopHeader = styled.div`
  display: flex;
  gap: 2rem;
  align-items: start;
  margin-bottom: 2rem;

  .profile-section {
    flex-shrink: 0;
  }

  .info-section {
    flex: 1;
  }
`;

// Update the ItemsGrid styled component
// Update ItemsGrid back to original size
const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

// Update ItemCard
const ItemCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  height: 500px; // Fixed height to ensure rectangular shape

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.colors?.accent};
  }

  .item-content {
    padding: 1.5rem;
  }
`;

// Update ItemImageCarousel
const ItemImageCarousel = styled.div`
  position: relative;
  height: 250px; // Half of ItemCard height
  width: 100%;
  display: flex;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);

  .image-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    z-index: 2;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
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
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    z-index: 2;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }
  }
`;

const AddItemButton = styled.button`
  background: ${props => props.theme?.colors?.primary || DEFAULT_THEME.colors.primary};
  color: ${props => props.theme?.colors?.text || DEFAULT_THEME.colors.text};
  border: none;
  border-radius: ${props => props.theme?.styles?.borderRadius || DEFAULT_THEME.styles.borderRadius};
  padding: 1rem 2rem;
  font-family: ${props => props.theme?.fonts?.heading || DEFAULT_THEME.fonts.heading};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 2rem auto;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.theme?.colors?.secondary || DEFAULT_THEME.colors.secondary};
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(90deg);
  }
`;

// Home View Styled Components
const HomeSection = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;

  .mission-statement {
    text-align: center;
    margin: 3rem 0;
    
    h3 {
      font-family: ${props => props.theme?.fonts?.heading || DEFAULT_THEME.fonts.heading};
      color: ${props => props.theme?.colors?.accent || DEFAULT_THEME.colors.accent};
      margin-bottom: 1rem;
    }
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-top: 3rem;
`;

const GalleryCard = styled.div`
  background: ${props => `${props.theme?.colors?.primary || DEFAULT_THEME.colors.primary}15`};
  border-radius: ${props => props.theme?.styles?.borderRadius || DEFAULT_THEME.styles.borderRadius};
  padding: 2rem;
  text-align: center;
  border: 1px solid ${props => `${props.theme?.colors?.accent || DEFAULT_THEME.colors.accent}20`};
  transition: all 0.3s ease;

  h3 {
    font-family: ${props => props.theme?.fonts?.heading || DEFAULT_THEME.fonts.heading};
    color: ${props => props.theme?.colors?.accent || DEFAULT_THEME.colors.accent};
    margin-bottom: 1rem;
  }

  p {
    color: ${props => `${props.theme?.colors?.text || DEFAULT_THEME.colors.text}CC`};
    font-family: ${props => props.theme?.fonts?.body || DEFAULT_THEME.fonts.body};
    line-height: 1.6;
  }

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.colors?.accent || DEFAULT_THEME.colors.accent};
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

// Community View Styled Components
const CommunitySection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
`;

const FeedColumn = styled.div`
  h2 {
    font-family: ${props => props.theme?.fonts?.heading || DEFAULT_THEME.fonts.heading};
    color: ${props => props.theme?.colors?.accent || DEFAULT_THEME.colors.accent};
    margin-bottom: 2rem;
  }
`;

const PostCard = styled.div`
  background: ${props => `${props.theme?.colors?.primary || DEFAULT_THEME.colors.primary}15`};
  border-radius: ${props => props.theme?.styles?.borderRadius || DEFAULT_THEME.styles.borderRadius};
  overflow: hidden;
  border: 1px solid ${props => `${props.theme?.colors?.accent || DEFAULT_THEME.colors.accent}20`};
  margin-bottom: 2rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.colors?.accent || DEFAULT_THEME.colors.accent};
  }
`;

const PostContent = styled.div`
  padding: 1.5rem;

  h3 {
    font-family: ${props => props.theme?.fonts?.heading || DEFAULT_THEME.fonts.heading};
    color: ${props => props.theme?.colors?.text || DEFAULT_THEME.colors.text};
    margin-bottom: 1rem;
  }

  p {
    color: ${props => `${props.theme?.colors?.text || DEFAULT_THEME.colors.text}CC`};
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .timestamp {
    font-size: 0.9rem;
    color: ${props => `${props.theme?.colors?.text || DEFAULT_THEME.colors.text}80`};
  }
`;

const PostActions = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid ${props => `${props.theme?.colors?.accent || DEFAULT_THEME.colors.accent}20`};

  button {
    background: transparent;
    border: none;
    color: ${props => `${props.theme?.colors?.text || DEFAULT_THEME.colors.text}CC`};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0.5rem;
    border-radius: 4px;

    &:hover {
      color: ${props => props.theme?.colors?.accent || DEFAULT_THEME.colors.accent};
      background: ${props => `${props.theme?.colors?.accent || DEFAULT_THEME.colors.accent}15`};
    }
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

// Main Component
const LiveShopCreation = () => {
  const navigate = useNavigate();
  const { saveTempStore } = useTempStore();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [shopNamePosition, setShopNamePosition] = useState(SHOP_NAME_POSITIONS.LEFT);
  const [tabPosition, setTabPosition] = useState(TAB_POSITIONS.TOP);
  const [activeTab, setActiveTab] = useState('shop');
  const [shopNameFontSize, setShopNameFontSize] = useState(2.5);
  const [selectedTheme, setSelectedTheme] = useState(WELCOME_STYLES.STYLE_1);
  
  
  const [shopData, setShopData] = useState({
    name: '',
    description: '',
    profile: null,
    mission: '',
    location: '',
    items: [{
      id: Date.now().toString(),
      name: '',
      price: '',
      description: '',
      images: [null, null, null], // Initialize with three empty slots
      currentImageIndex: 0,
      address: '',
      coordinates: null, // Add this
      tags: [],
      wants: 0
    }],
    wants: {},
    layout: {
      namePosition: SHOP_NAME_POSITIONS.LEFT,
      tabPosition: TAB_POSITIONS.TOP
    }
  });

  // Theme Selection Handler
  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
  };

  // Shop Data Handlers
  const handleShopDataChange = (field, value) => {
  setShopData(prev => ({
    ...prev,
    [field]: value
  }));
};

const handleItemAdd = () => {
  setShopData(prev => ({
    ...prev,
    items: [...prev.items, {
      id: Date.now().toString(),
      name: '',
      price: '',
      description: '',
      images: [null, null, null],
      currentImageIndex: 0,
      address: '',
      coordinates: null,
      tags: [],
      wants: 0
    }]
  }));
};

// Update handleItemUpdate to handle coordinates
const handleItemUpdate = (itemId, updates) => {
  setShopData(prev => ({
    ...prev,
    items: prev.items.map(item => 
      item.id === itemId ? { 
        ...item, 
        ...updates,
        // Ensure coordinates are properly structured if they exist
        coordinates: updates.coordinates ? {
          lat: updates.coordinates.latitude || updates.coordinates.lat,
          lng: updates.coordinates.longitude || updates.coordinates.lng
        } : null
      } : item
    )
  }));
};

  const handleItemDelete = (itemId) => {
    setShopData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const ShopProfileSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
  margin: 2rem auto 4rem;  // Match ShopPage margin
  padding: 2rem;

  .profile-image {
    margin-bottom: 1rem;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.1);
    
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
      font-size: ${props => props.fontSize || '2.5rem'};
      font-family: ${props => props.theme?.fonts?.heading};
      background: ${props => `linear-gradient(45deg, ${props.theme?.colors?.primary}, ${props.theme?.colors?.accent})`};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      outline: none;
      padding: 0.5rem;

      &:focus {
        background: ${props => `linear-gradient(45deg, ${props.theme?.colors?.primary}, ${props.theme?.colors?.accent})`};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      &::placeholder {
        background: ${props => `linear-gradient(45deg, ${props.theme?.colors?.primary}80, ${props.theme?.colors?.accent}80)`};
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
      font-family: ${props => props.theme?.fonts?.body};
      color: ${props => props.theme?.colors?.text};
      opacity: 0.8;
      outline: none;
      padding: 0.5rem;
      resize: none;
      min-height: 60px;

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

const handleAddImage = (itemId, newImage) => {
  setShopData(prev => ({
    ...prev,
    items: prev.items.map(item => {
      if (item.id === itemId && item.images.length < 3) {
        return {
          ...item,
          images: [...item.images, newImage]
        };
      }
      return item;
    })
  }));
};

// Then update your renderShopView method

const renderShopView = () => (
  <MainContent>
    <ShopProfileSection>
  <div className="profile-image">
    <EditableImage
      value={shopData.profile}
      onChange={(value) => handleShopDataChange('profile', value)}
      theme={selectedTheme}
      round
      width="150px"
      height="150px"
    />
  </div>
  {/* Update shop name with these exact props */}
  <div className="shop-name-container">
    <EditableText
      value={shopData.name || ''}
      onChange={(value) => setShopData(prev => ({ ...prev, name: value }))}
      placeholder="Shop Name"
      style={{
        fontSize: `${shopNameFontSize}rem`,
        maxWidth: '500px',
        margin: '0 auto'
      }}
    />
  </div>
  {/* Update shop description with these exact props */}
  <div className="shop-description-container">
    <EditableText
      value={shopData.description || ''}
      onChange={(value) => setShopData(prev => ({ ...prev, description: value }))}
      placeholder="Shop Description"
      multiline={false}
    />
  </div>
</ShopProfileSection>

    <ItemsGrid>
      {shopData.items.map(item => (
        <ItemCard key={item.id}>
          <ItemImageCarousel>
            <div className="image-container">
              <EditableImage
                value={item.images[item.currentImageIndex]}
                onChange={(value) => {
                  const newImages = [...item.images];
                  newImages[item.currentImageIndex] = value;
                  handleItemUpdate(item.id, { 
                    ...item, 
                    images: newImages
                  });
                }}
                theme={selectedTheme}
                height="100%"
                width="100%"
                round={false}
              />
            </div>
              
            <button 
              className="carousel-arrow left"
              onClick={() => {
                const newIndex = ((item.currentImageIndex - 1) + 3) % 3;
                handleItemUpdate(item.id, { ...item, currentImageIndex: newIndex });
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="carousel-arrow right"
              onClick={() => {
                const newIndex = (item.currentImageIndex + 1) % 3;
                handleItemUpdate(item.id, { ...item, currentImageIndex: newIndex });
              }}
            >
              <ChevronRight size={16} />
            </button>

            {item.images[item.currentImageIndex] ? (
              <button 
                className="add-image"
                onClick={() => {
                  const newImages = [...item.images];
                  newImages[item.currentImageIndex] = null;
                  handleItemUpdate(item.id, { 
                    ...item, 
                    images: newImages
                  });
                }}
              >
                <X size={16} />
              </button>
            ) : (
              <button 
                className="add-image"
                onClick={() => {
                  const input = document.getElementById(`image-input-${item.id}`);
                  if (input) input.click();
                }}
              >
                <Plus size={16} />
              </button>
            )}
            
            {!item.images[item.currentImageIndex] && (
              <button 
                className="add-image"
                onClick={() => {
                  const input = document.getElementById(`image-input-${item.id}`);
                  if (input) input.click();
                }}
              >
                <Plus size={16} />
              </button>
            )}

            <HiddenInput
              type="file"
              id={`image-input-${item.id}`}
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const newImages = [...item.images];
                  newImages[item.currentImageIndex] = e.target.files[0];
                  handleItemUpdate(item.id, { 
                    ...item, 
                    images: newImages
                  });
                }
              }}
            />
          </ItemImageCarousel>
          
          <div className="item-content">
            <EditableText
              value={item.name}
              onChange={(value) => handleItemUpdate(item.id, { ...item, name: value })}
              placeholder="Item Name"
              theme={selectedTheme}
              fontSize="1.2rem"
              fontWeight="bold"
            />
            <EditableText
              value={item.price}
              onChange={(value) => handleItemUpdate(item.id, { ...item, price: value })}
              placeholder="Price"
              theme={selectedTheme}
            />
            <EditableText
              value={item.description}
              onChange={(value) => handleItemUpdate(item.id, { ...item, description: value })}
              placeholder="Item Description"
              multiline
              theme={selectedTheme}
            />            
            <AddressInput
              address={item.address || ''}
              onAddressChange={(value) => handleItemUpdate(item.id, { 
                address: value,
                coordinates: null // Clear coordinates when address changes
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
          </div>
        </ItemCard>
      ))}
    </ItemsGrid>

    <AddItemButton onClick={handleItemAdd} theme={selectedTheme}>
      <Plus size={20} />
      Add Item
    </AddItemButton>
    </MainContent>
  );

  const renderHomeView = () => (
    <HomeSection>
      <div className="mission-statement">
        <h3>Mission Statement</h3>
        <EditableText
          value={shopData.mission}
          onChange={(value) => handleShopDataChange('mission', value)}
          placeholder="What's your shop's mission?"
          multiline
          maxLength={500}
          theme={selectedTheme}
        />
      </div>

      <GalleryGrid>
        {['Events', 'Activities', 'Features', 'Updates'].map(section => (
          <GalleryCard key={section}>
            <h3>{section}</h3>
            <p>Content will be editable after signup</p>
          </GalleryCard>
        ))}
      </GalleryGrid>
    </HomeSection>
  );

  const renderCommunityView = () => (
    <CommunitySection>
      <FeedColumn>
        <h2>Media Posts</h2>
        {MOCK_POSTS
          .filter(post => post.type === 'media')
          .map(post => (
            <PostCard key={post.id}>
              <PostContent>
                <h3>{post.author}</h3>
                <p>{post.content}</p>
                <span className="timestamp">{post.timeAgo}</span>
              </PostContent>
              <PostActions>
                <button><Heart size={18} /> {post.likes}</button>
                <button><MessageCircle size={18} /> {post.comments}</button>
                <button><Share2 size={18} /></button>
              </PostActions>
            </PostCard>
          ))}
      </FeedColumn>

      <FeedColumn>
        <h2>Featured Items</h2>
        {MOCK_POSTS
          .filter(post => post.type === 'item')
          .map(post => (
            <PostCard key={post.id}>
              <PostContent>
                <h3>{post.author}</h3>
                <div>
                  <h4>{post.item.name}</h4>
                  <p>${post.item.price}</p>
                </div>
              </PostContent>
              <PostActions>
                <button><Heart size={18} /> {post.item.wants}</button>
                <button><Share2 size={18} /></button>
              </PostActions>
            </PostCard>
          ))}
      </FeedColumn>
    </CommunitySection>
  );

  // Main Render
  return (
    <ThemeProvider theme={selectedTheme}>
      <GlobalStyles />
    <PageContainer>
      <ShopBanner>
        <KalKodeLogo position={shopNamePosition}>
          {shopData.name || "Your Shop Name"}
        </KalKodeLogo>
        <KalKodeLogo onClick={() => navigate('/')}>
          KALKODE
        </KalKodeLogo>
      </ShopBanner>

      <TabControlsContainer>
        <TabPositioner
          position={tabPosition}
          onPositionChange={setTabPosition}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'shop', label: 'Shop' },
            { id: 'home', label: 'Home' },
            { id: 'community', label: 'Community' }
          ]}
          theme={selectedTheme}
        />
      </TabControlsContainer>

      <ThemeContainer>
        <ThemeSelector 
          currentTheme={selectedTheme}
          onThemeSelect={setSelectedTheme}
        />
      </ThemeContainer>

      <MainContent>
        {activeTab === 'shop' && renderShopView()}
        {activeTab === 'home' && renderHomeView()}
        {activeTab === 'community' && renderCommunityView()}
      </MainContent>

        <ActionButtons>
          <ActionButton
            onClick={() => {
              const shopDataToSave = {
                ...shopData,
                theme: selectedTheme,
                layout: {
                  namePosition: shopNamePosition,
                  tabPosition: tabPosition
                },
                profile: shopData.profile ? {
                  file: shopData.profile.file,
                  type: shopData.profile.type
                } : null,
                items: shopData.items.map(item => ({
                  ...item,
                  images: item.images.map(img => img ? {
                    file: img.file,
                    type: img.type
                  } : null)
                }))
              };
              console.log('Shop data being passed:', shopDataToSave);
              navigate('/auth', {
                state: { 
                  mode: 'signup', 
                  tempData: shopDataToSave 
                }
              });
            }}
            disabled={!shopData.name}
          >
            Save Shop
            <ChevronRight size={20} />
          </ActionButton>
        </ActionButtons>
      </PageContainer>
    </ThemeProvider>
  );
};

export default LiveShopCreation;