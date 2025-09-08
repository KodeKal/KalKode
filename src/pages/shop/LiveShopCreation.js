// src/pages/shop/LiveShopCreation.js - Mobile Optimized

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Plus,
  Minus, 
  Heart,
  MessageCircle,
  Share2,
  RefreshCw, 
  Pin,
  X,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  LogOut
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

// Mobile-optimized header
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

// Mobile-optimized main content
const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 1rem 100px 1rem;
  position: relative;
  z-index: 1;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem 2rem 2rem;
  }
`;

// Mobile-optimized profile section
const ShopProfileSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
  margin: 2rem auto 4rem;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
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

const ItemsGrid = styled.div`
  display: ${props => props.viewMode === 'list' ? 'block' : 'grid'};
  grid-template-columns: ${props => props.viewMode === 'gallery' ? 
    'repeat(auto-fill, minmax(280px, 1fr))' : 
    'repeat(2, 1fr)'
  };
  gap: ${props => props.viewMode === 'list' ? '1rem' : '1rem'};
  
  @media (min-width: 480px) {
    gap: ${props => props.viewMode === 'list' ? '1.5rem' : '1.5rem'};
  }
  
  @media (min-width: 768px) {
    grid-template-columns: ${props => props.viewMode === 'gallery' ? 
      'repeat(auto-fill, minmax(300px, 1fr))' : 
      'repeat(3, 1fr)'
    };
    gap: 2rem;
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: ${props => props.viewMode === 'gallery' ? 
      'repeat(auto-fill, minmax(350px, 1fr))' : 
      'repeat(4, 1fr)'
    };
  }
`;

// Mobile-optimized item card
const ItemCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  position: relative;
  transition: all 0.3s;
  width: ${props => props.viewMode === 'list' ? '100%' : 'auto'};
  height: ${props => props.viewMode === 'list' ? 'auto' : 'fit-content'};

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.colors?.accent};
  }
`;

// Mobile-optimized image container with swipe support
const ItemImageContainer = styled.div`
  position: relative;
  height: ${props => props.viewMode === 'list' ? '200px' : '250px'};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => `${props.theme?.colors?.background || '#000000'}50`};

  @media (min-width: 768px) {
    height: 250px;
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

  /* Mobile image dots */
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

// Collapsible item content for mobile
const ItemContent = styled.div`
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 1.5rem;
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

// Save button container
const SaveButtonContainer = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 100;
  
  @media (min-width: 768px) {
    bottom: 2rem;
    right: 2rem;
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Consolidated shop data
  const [shopData, setShopData] = useState({
    name: '',
    description: '',
    profile: null,
    mission: '',
    items: [{
      id: Date.now().toString(),
      name: '',
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
    setShopData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now().toString(),
        name: '',
        price: '',
        description: '',
        category: 'Other',
        images: [null, null, null],
        currentImageIndex: 0,
        address: '',
        coordinates: null,
        tags: [],
        quantity: 1
      }]
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

  const handleSave = () => {
    const dataToSave = {
      ...shopData,
      theme: selectedTheme,
      layout: {
        namePosition: shopData.layout.namePosition,
        tabPosition: 'top',
        nameSize: shopNameFontSize
      },
      createdAt: new Date().toISOString()
    };
    
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
          <EditableText
            value={shopData.name}
            onChange={(value) => handleShopDataChange('name', value)}
            placeholder="Enter Your Shop Name"
            style={{
              fontSize: `${Math.min(shopNameFontSize, 2)}rem`,
              maxWidth: '500px',
              margin: '0 auto'
            }}
          />
        </div>
        <div className="shop-description-container">
          <EditableText
            value={shopData.description}
            onChange={(value) => handleShopDataChange('description', value)}
            placeholder="Shop Description"
            multiline={false}
          />
        </div>
      </ShopProfileSection>

      <AddItemButton onClick={handleItemAdd} theme={selectedTheme}>
        <Plus size={20} />
        Add Item
      </AddItemButton>

      <ItemsContainer>
        <ItemsGrid viewMode={viewMode}>
          {shopData.items.map(item => {
            const isExpanded = expandedItems.has(item.id);
            const validImages = item.images.filter(Boolean);
            
            return (
              <ItemCard key={item.id} theme={selectedTheme} viewMode={viewMode}>
                <DeleteButton onClick={() => handleItemDelete(item.id)}>
                  <X size={16} />
                </DeleteButton>
                
                <ItemImageContainer theme={selectedTheme} viewMode={viewMode}>
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
                  
                  {/* Carousel arrows */}
                  {validImages.length > 1 && (
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

                  {/* Mobile image dots */}
                  {validImages.length > 1 && (
                    <div className="image-dots">
                      {item.images.map((img, index) => (
                        img && (
                          <div 
                            key={index}
                            className={`dot ${index === item.currentImageIndex ? 'active' : ''}`}
                            onClick={() => handleItemUpdate(item.id, { currentImageIndex: index })}
                          />
                        )
                      ))}
                    </div>
                  )}
                </ItemImageContainer>
                
                <ItemContent>
                  <ItemHeader onClick={() => toggleItemExpansion(item.id)}>
                    <h4>{item.name || 'New Item'}</h4>
                    <ExpandButton>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </ExpandButton>
                  </ItemHeader>
                  
                  <ItemDetails expanded={isExpanded}>
                    <div className="details-content">
                      <EditableText
                        value={item.name}
                        onChange={(value) => handleItemUpdate(item.id, { name: value })}
                        placeholder="Item Name"
                        theme={selectedTheme}
                      />
                      <EditableText
                        value={item.price}
                        onChange={(value) => handleItemUpdate(item.id, { price: value })}
                        placeholder="Price"
                        theme={selectedTheme}
                      />
                      <EditableText
                        value={item.description}
                        onChange={(value) => handleItemUpdate(item.id, { description: value })}
                        placeholder="Item Description"
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
              </ItemCard>
            );
          })}
        </ItemsGrid>
      </ItemsContainer>
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
        <EditableText
          value={shopData.mission}
          onChange={(value) => handleShopDataChange('mission', value)}
          placeholder="What's your shop's mission?"
          multiline
          maxLength={500}
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
          <Logo onClick={() => navigate('/')} theme={selectedTheme}>
            KALKODE
          </Logo>

          <HeaderControls>
            <HeaderButton 
              onClick={refreshTheme}
              theme={selectedTheme}
              className={isRefreshing ? "spinning" : ""}
              title="Random theme"
            >
              <RefreshCw size={20} />
            </HeaderButton>
            
            <HeaderButton 
              onClick={togglePinStyle} 
              theme={selectedTheme}
              className={isPinned ? "pinned" : ""}
              title={isPinned ? "Unpin theme" : "Pin theme"}
            >
              <Pin size={20} fill={isPinned ? selectedTheme.colors.accent : "none"} />
            </HeaderButton>
            
            {isAuthenticated && (
              <HeaderButton 
                onClick={handleLogout}
                theme={selectedTheme}
                title="Logout"
              >
                <LogOut size={20} />
              </HeaderButton>
            )}
          </HeaderControls>
        </Header>

        <TabControlsContainer>
          <TabPositioner
            position="top"
            onPositionChange={() => {}}
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

        {activeTab === 'shop' && renderShopView()}
        {activeTab === 'home' && renderHomeView()}
        {activeTab === 'community' && renderCommunityView()}

        {/* View Toggle - Only show on shop tab */}
        {activeTab === 'shop' && (
          <ViewToggleContainer theme={selectedTheme}>
            <ViewToggleButton 
              active={viewMode === 'grid'} 
              onClick={() => setViewMode('grid')}
              theme={selectedTheme}
            >
              <Grid size={16} />
              Grid
            </ViewToggleButton>
            <ViewToggleButton 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
              theme={selectedTheme}
            >
              <List size={16} />
              List
            </ViewToggleButton>
          </ViewToggleContainer>
        )}

        {/* Save Button */}
        <SaveButtonContainer>
          <ActionButton
            onClick={handleSave}
            disabled={!shopData.name}
            theme={selectedTheme}
          >
            Save Shop
            <ChevronRight size={20} />
          </ActionButton>
        </SaveButtonContainer>
      </PageContainer>
    </ThemeProvider>
  );
};

export default LiveShopCreation;