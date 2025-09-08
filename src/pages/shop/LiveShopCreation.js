// src/pages/shop/LiveShopCreation.js

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
  RefreshCw, Pin,
  X,
  home
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

const ShopBanner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => `${props.theme?.colors?.headerBg || 'rgba(0, 0, 0, 0.9)'}F5`};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  z-index: 100;

  @media (min-width: 768px) {
    height: 80px;
    padding: 0 2rem;
  }
`;

// Replace the Logo styled component
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

// Add new HeaderControls styled component
const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

// Add new HeaderButton styled component
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

// Update MainContent for mobile padding
const MainContent = styled.div`
  max-width: ${props => props.theme?.styles?.containerWidth || '1400px'};
  margin: 0 auto;
  padding: 80px 1rem 100px 1rem;
  position: relative;
  z-index: 1;
  
  @media (min-width: 768px) {
    padding: 8rem 2rem 2rem 2rem;
  }
`;

// Update ActionButtons for mobile
const ActionButtons = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 1rem;
  z-index: 100;
  
  @media (min-width: 768px) {
    bottom: 2rem;
    right: 2rem;
  }
`;

// Update ActionButton for mobile
const ActionButton = styled.button`
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
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
  font-size: 0.9rem;

  @media (min-width: 768px) {
    padding: 1rem 2.5rem;
    font-size: 1rem;
    letter-spacing: 2px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Remove these old styled components (delete them):
// - TabControlsContainer
// - ThemeContainer
// - FloatingFontControls (move to mobile position)

// Add mobile font controls
const MobileFontControls = styled.div`
  position: fixed;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 100;
  
  @media (min-width: 768px) {
    left: 2rem;
  }
`;

const FontSizeButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.9);
    background: rgba(255, 255, 255, 0.2);
  }
  
  @media (hover: hover) {
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

// Update TabControlsContainer for mobile positioning
const TabControlsContainer = styled.div`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: 768px) {
    bottom: auto;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme?.colors?.text || "white"};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1) rotate(90deg);
    color: ${props => props.theme?.colors?.accent || "#800000"};
  }
  
  &.spinning {
    animation: spin 0.5s ease-in-out;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
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

const ThemeControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

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

// Keep all existing styled components as they were
const PageContainer = styled.div.attrs({ className: 'page-container' })`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#000000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  position: relative;
  overflow-x: hidden;
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

  & > div > div:nth-child(2) {
    bottom: calc(100% + 0.5rem);
    top: auto;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
`;

const KalKodeLogo = styled.div`
  color: #A00000;
  font-family: 'Impact', sans-serif;
  font-size: 2rem;
  letter-spacing: 2px;
  transform: skew(-5deg);
`;

const ShopName = styled.div`
  flex: 1;
  text-align: ${props => props.position};
  font-family: ${props => props.theme?.fonts?.heading || DEFAULT_THEME.fonts.heading};
  font-size: 1.8rem;
  padding: ${props => props.position === 'center' ? '0 80px' : '0'};
`;


const CategorySelect = styled.select`
  width: 100%;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`};
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '8px'};
  padding: 0.75rem;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  option {
    background: ${props => props.theme?.colors?.background || '#000000'};
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  }
`;

const TAB_POSITIONS = {
  TOP: 'top',
  LEFT: 'left',
  BOTTOM: 'bottom'
};

const SHOP_NAME_POSITIONS = {
  LEFT: 'left',
  CENTER: 'center'
};

const HiddenInput = styled.input`
  display: none;
`;

const ShopProfileSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
  margin: 2rem auto 4rem;
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
      /* Replace the background gradient with direct color */
      color: ${props => props.theme?.colors?.accent || '#800000'};
      /* Remove these two lines */
      /* -webkit-background-clip: text; */
      /* -webkit-text-fill-color: transparent; */
      outline: none;
      padding: 0.5rem;

      &:focus {
        /* Update focus state to use normal color */
        color: ${props => props.theme?.colors?.accent || '#800000'};
        /* Remove these if present */
        /* -webkit-background-clip: text; */
        /* -webkit-text-fill-color: transparent; */
      }

      &::placeholder {
        /* Make placeholder more visible */
        color: ${props => `${props.theme?.colors?.accent}80` || 'rgba(128, 0, 0, 0.5)'};
        /* Remove these if present */
        /* -webkit-background-clip: text; */
        /* -webkit-text-fill-color: transparent; */
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

const AddItemButton = styled.button`
  background: ${props => props.theme?.colors?.primary || '#800000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  border: none;
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  padding: 1rem 2rem;
  font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 2rem auto;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.theme?.colors?.secondary || '#600000'};
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(90deg);
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ItemCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  position: relative;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.colors?.accent};
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

    &:hover {
      background: ${props => `${props.theme?.colors?.accent}40` || 'rgba(0, 0, 0, 0.7)'};
    }

    &.left {
      left: 10px;
    }

    &.right {
      right: 10px;
    }
  }
`;

const ItemContent = styled.div`
  padding: 1.5rem;
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
  
  // State management optimizations
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedTheme, setSelectedTheme] = useState(WELCOME_STYLES.STYLE_1);
  const [tabPosition, setTabPosition] = useState(TAB_POSITIONS.TOP);
  const [shopNameFontSize, setShopNameFontSize] = useState(2.5);
  const [isPinned, setIsPinned] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

    // If no pinned style, select random
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
      quantity: 1  // Add this line
    }],
    layout: {
      namePosition: SHOP_NAME_POSITIONS.LEFT,
      tabPosition: TAB_POSITIONS.TOP
    }
  });

  // Optimized handlers
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
        quantity: 1 // Add this line
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

  const handleSave = () => {
    // Prepare data for storage
    const dataToSave = {
      ...shopData,
      theme: selectedTheme,
      layout: {
        namePosition: shopData.layout.namePosition,
        tabPosition: tabPosition,
        nameSize: shopNameFontSize
      },
      createdAt: new Date().toISOString()
    };
    
    // Save to temp store
    saveTempStore(dataToSave);
    
    // Navigate to auth with the temp data
    navigate('/auth', {
      state: { 
        mode: 'signup', 
        tempData: dataToSave 
      }
    });
  };

  // Background effect
  

  // Render methods
  const renderShopView = () => (
    <MainContent>
      <ShopProfileSection fontSize={shopNameFontSize}>
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
        <div className="shop-name-container">
          <EditableText
            value={shopData.name}
            onChange={(value) => handleShopDataChange('name', value)}
            placeholder="Enter Your Shop Name"
            style={{
              fontSize: `${shopNameFontSize}rem`,
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

      <ItemsGrid>
        {shopData.items.map(item => (
          <ItemCard key={item.id} theme={selectedTheme}>
            <DeleteButton
              onClick={() => handleItemDelete(item.id)}
            >
              <X size={16} />
            </DeleteButton>
            
            <ItemImageContainer theme={selectedTheme}>
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
            </ItemImageContainer>
            
            <ItemContent>
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
                  coordinates: null // Clear coordinates when address changes
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
            </ItemContent>
          </ItemCard>
        ))}
      </ItemsGrid>
    </MainContent>
  );

  const renderHomeView = () => (
    <MainContent>
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ 
          color: selectedTheme?.colors?.accent || '#800000',
          fontFamily: selectedTheme?.fonts?.heading || 'inherit',
          marginBottom: '1.5rem'
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
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ 
          color: selectedTheme?.colors?.accent || '#800000',
          fontFamily: selectedTheme?.fonts?.heading || 'inherit',
          marginBottom: '1rem'
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
        <ShopBanner>
          <ShopName position={shopData.layout.namePosition}>
            {shopData.name || "Your Shop Name"}
          </ShopName>
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
          </HeaderControls>
        </ShopBanner>
        
        {activeTab === 'shop' && renderShopView()}
        {activeTab === 'home' && renderHomeView()}
        {activeTab === 'community' && renderCommunityView()}

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

        <MobileFontControls>
          <FontSizeButton 
            onClick={() => setShopNameFontSize(prev => Math.min(6, prev + 0.5))}
          >
            <Plus size={16} />
          </FontSizeButton>
          <FontSizeButton 
            onClick={() => setShopNameFontSize(prev => Math.max(1.5, prev - 0.5))}
          >
            <Minus size={16} />
          </FontSizeButton>
        </MobileFontControls>

        

        <ActionButtons>
          <ActionButton
            onClick={handleSave}
            disabled={!shopData.name}
            theme={selectedTheme}
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