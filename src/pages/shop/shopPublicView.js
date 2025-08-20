// In src/pages/shop/shopPublicView.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
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
  X 
} from 'lucide-react';
import TabPositioner from './components/TabPositioner';

// Reuse the same styled components as in ShopPage.js
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || DEFAULT_THEME.colors.background};
  color: ${props => props.theme?.colors?.text || DEFAULT_THEME.colors.text};
  position: relative;
  overflow-x: hidden;
`;

const MainContent = styled.div`
  max-width: ${props => props.theme?.styles?.containerWidth || '1400px'};
  margin: 0 auto;
  padding: 8rem 2rem 2rem;
  position: relative;
  z-index: 1;
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
  margin-bottom: 0.5rem;
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
  top: 0.1rem;
  left: 51%;
  transform: translateX(-50%);
`;

const ShopLogoCorner = styled.div`
  position: fixed;
  top: 2rem;
  left: 2rem;
  z-index: 100;
  cursor: pointer;

  @media (max-width: 768px) {
    top: 1rem;
    left: 1rem;
  }

  @media (max-width: 480px) {
    top: 0.5rem;
    left: 0.5rem;
  }
`;

const ShopLogo = styled.div`
  color: ${props => props.theme?.colors?.accent || '#A00000'};
  font-family: ${props => props.theme?.fonts?.heading || 'Impact, sans-serif'};
  font-size: 2rem;
  letter-spacing: 2px;
  transform: skew(-5deg);
  opacity: 0.8;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  @media (max-width: 768px) {
    font-size: 1.4rem;
    letter-spacing: 1px;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
    letter-spacing: 0.5px;
  }
`;

const BackButton = styled.button`
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: transparent;
  border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
  color: ${props => props.theme?.colors?.text || 'white'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  z-index: 100;
  transition: all 0.2s;
  font-size: 0.9rem;

  &:hover {
    background: ${props => `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};
  }

  @media (max-width: 768px) {
    top: 1rem;
    right: 1rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }

  @media (max-width: 480px) {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

// Reuse the ShopProfileSection from ShopPage
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
    border: 3px solid ${props => props.theme?.colors?.accent || '#800000'};
    box-shadow: 0 0 20px ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.25)'};
    transition: all 0.3s ease;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .shop-name {
    font-size: ${props => props.fontSize || '2.5rem'};
    font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
    background: ${props => props.theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0.5rem 0;
  }

  .shop-description {
    font-size: 1.1rem;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    opacity: 0.8;
    font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
    max-width: 600px;
    margin: 0 auto;
  }
`;

// ItemGrid styled component
const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 3rem;
  margin: 4rem 0;
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

// ItemCard styled component
const ItemCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ItemImageContainer = styled.div`
  position: relative;
  height: 250px;
  width: 100%;
  overflow: hidden;
  background: ${props => `${props.theme?.colors?.background || '#000000'}80`};

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
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme?.colors?.text || 'white'};
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s;
    z-index: 2;

    &:hover {
      opacity: 1;
      background: ${props => `${props.theme?.colors?.accent || 'rgba(0, 0, 0, 0.8)'}40`};
    }

    &.left {
      left: 1rem;
    }

    &.right {
      right: 1rem;
    }
  }
`;

const ItemContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`};

  h3 {
    font-size: 1.2rem;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    margin: 0 0 0.5rem 0;
    font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
  }

  .price {
    font-size: 1.1rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .description {
    color: ${props => `${props.theme?.colors?.text}CC` || 'rgba(255, 255, 255, 0.8)'};
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1rem;
    flex: 1;
    font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
  }
`;

const ItemLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${props => `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
  margin-bottom: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: ${props => props.theme?.styles?.borderRadius || '6px'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative; /* Add this */
  z-index: 5; /* Add this */
  
  &.primary {
    background: ${props => props.theme?.colors?.accent || '#800000'};
    color: white;
    border: none;
    
    &:hover {
      background: ${props => props.theme?.colors?.primary || '#4A0404'};
    }
  }
  
  &.secondary {
    background: transparent;
    border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
    color: ${props => props.theme?.colors?.accent || '#800000'};
    
    &:hover {
      background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
    }
  }
`;

// In src/pages/shop/shopPublicView.js

// Replace the existing SearchContainer and SearchInput with these:
const SearchContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto 3rem;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
  padding: 0.75rem 0.5rem;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  
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

// Update the SearchIcon and ClearButton positions
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
  
  &:hover {
    opacity: 1;
  }
`;

const EmptyStateMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
  }
  
  p {
    color: ${props => `${props.theme?.colors?.text}CC` || 'rgba(255, 255, 255, 0.8)'};
    font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
  }
`;

// The ShopPublicView component
const ShopPublicView = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shopData, setShopData] = useState(null);
  const [activeTab, setActiveTab] = useState('shop');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
const [selectedChatItem, setSelectedChatItem] = useState(null);
const { userLocation } = useLocation();

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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
          <button onClick={() => navigate('/')}>Return to Homepage</button>
        </div>
      </PageContainer>
    );
  }

  return (
    <ThemeProvider theme={shopData?.theme || DEFAULT_THEME}>
      <PageContainer>
        <ShopLogoCorner>
          <ShopLogo>
            {shopData?.name || 'SHOP'}
          </ShopLogo>
        </ShopLogoCorner>
        
        <BackButton onClick={() => navigate('/')}>
          <ChevronLeft size={16} />
          Back to Discover
        </BackButton>
        
        <TabControlsContainer>
          <TabPositioner
            position="top"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={[
              { id: 'home', label: 'Home' },
              { id: 'community', label: 'Community' },
              { id: 'shop', label: 'Shop' }
            ]}
            theme={shopData?.theme}
          />
        </TabControlsContainer>
        
        <MainContent>
          {activeTab === 'shop' && (
            <>
              <ShopProfileSection fontSize={shopData?.layout?.nameSize || '2.5rem'}>
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
                <p className="shop-description">{shopData?.description || 'No description available.'}</p>
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
                <ItemGrid>
                  {filteredItems.map((item) => {
                    const validImages = item.images?.filter(Boolean) || [];
                    const imageIndex = currentImageIndices[item.id] || 0;
                    
                    return (
                      <ItemCard key={item.id}>
                        <ItemImageContainer>
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
                              opacity: 0.5
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
                                <ChevronLeft size={16} />
                              </button>
                              <button 
                                className="carousel-arrow right"
                                onClick={(e) => handleNextImage(e, item.id)}
                              >
                                <ChevronRight size={16} />
                              </button>
                            </>
                          )}
                        </ItemImageContainer>
                        
                        <ItemContent>
                          <h3>{item.name}</h3>
                          <div className="price">
                            ${parseFloat(item.price || 0).toFixed(2)}
                          </div>
                          <div className="description">
                            {item.description || 'No description available.'}
                          </div>

                           {item.category && item.category !== 'Other' && (
                              <CategoryBadge theme={shopData?.theme}>
                                {item.category}
                              </CategoryBadge>
                            )}

                          <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.5rem'
                            }}>
                              <h3 style={{ margin: 0 }}>{item.name}</h3>

                              {item.quantity !== undefined && parseInt(item.quantity) > 0 ? (
                                <span style={{
                                  background: `${shopData?.theme?.colors?.accent || '#800000'}30`,
                                  color: shopData?.theme?.colors?.accent || '#800000',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.85rem',
                                  fontWeight: '500',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  x{item.quantity}
                                </span>
                              ) : (
                                <span style={{
                                  background: '#FF525230',
                                  color: '#FF5252',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                }}>
                                  Sold Out
                                </span>
                              )}
                            </div>

                          
                            {item.formattedDistance && (
                              <ItemLocation>
                                <Navigation size={14} />
                                {item.formattedDistance} from you
                              </ItemLocation>
                            )}
                          
                          <ActionButtons>
                            <ActionButton className="secondary">
                              <MessageCircle size={16} />
                              Inquire
                            </ActionButton>
                            <ActionButton 
                              className="primary"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedChatItem(item);
                                setChatOpen(true);
                              }}
                            >
                              <ShoppingCart size={16} />
                              Order
                            </ActionButton>
                          </ActionButtons>
                          
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
          )}

          {activeTab === 'home' && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <h2 style={{ 
                color: shopData?.theme?.colors?.accent || '#800000',
                fontFamily: shopData?.theme?.fonts?.heading || "'Space Grotesk', sans-serif",
                marginBottom: '1rem'
              }}>
                Welcome to our Shop
              </h2>
              <p style={{ 
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: '1.6',
                color: shopData?.theme?.colors?.text || '#FFFFFF',
                fontFamily: shopData?.theme?.fonts?.body || "'Inter', sans-serif"
              }}>
                {shopData?.mission || 'Our mission is to provide quality products and excellent service to our customers.'}
              </p>
            </div>
          )}

          {activeTab === 'community' && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <h2 style={{ 
                color: shopData?.theme?.colors?.accent || '#800000',
                fontFamily: shopData?.theme?.fonts?.heading || "'Space Grotesk', sans-serif",
                marginBottom: '1rem'
              }}>
                Community
              </h2>
              <p style={{ 
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: '1.6',
                color: shopData?.theme?.colors?.text || '#FFFFFF',
                fontFamily: shopData?.theme?.fonts?.body || "'Inter', sans-serif"
              }}>
                This is where community content will appear.
              </p>
            </div>
          )}
        </MainContent>
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