// src/pages/shop/ShopPublicView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ShoppingCart, Heart, Share2, MessageCircle, Navigation, ChevronLeft } from 'lucide-react';
import { DEFAULT_THEME } from '../../theme/config/themes';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || DEFAULT_THEME.colors.background};
  color: ${props => props.theme?.colors?.text || DEFAULT_THEME.colors.text};
`;

const ShopHeader = styled.div`
  padding-top: 80px;
  background: ${props => props.theme?.colors?.background || DEFAULT_THEME.colors.background};
  position: relative;
`;

const HeaderBanner = styled.div`
  height: 200px;
  background: ${props => `linear-gradient(45deg, ${props.theme?.colors?.primary || '#800000'}, ${props.theme?.colors?.secondary || '#4A0404'})`};
  position: relative;
`;

const ShopInfoSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: flex-start;
  margin-top: -60px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid ${props => props.theme?.colors?.background || DEFAULT_THEME.colors.background};
  margin-right: 2rem;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 1rem;
  }
`;

const ShopDetails = styled.div`
  flex: 1;
  
  h1 {
    font-family: ${props => props.theme?.fonts?.heading || DEFAULT_THEME.fonts.heading};
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
    background: ${props => `linear-gradient(45deg, ${props.theme?.colors?.primary || '#800000'}, ${props.theme?.colors?.accent || '#800000'})`};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: ${props => props.theme?.colors?.text || DEFAULT_THEME.colors.text};
    font-family: ${props => props.theme?.fonts?.body || DEFAULT_THEME.fonts.body};
    margin-bottom: 1rem;
    max-width: 600px;
  }
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ShopStats = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  
  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${props => `${props.theme?.colors?.text}99` || 'rgba(255,255,255,0.6)'};
    
    strong {
      color: ${props => props.theme?.colors?.text || DEFAULT_THEME.colors.text};
    }
  }
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ContentSection = styled.div`
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 2rem;
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

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

const ItemImage = styled.div`
  height: 220px;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  ${ItemCard}:hover & img {
    transform: scale(1.05);
  }
`;

const ItemDetails = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ItemTitle = styled.h3`
  font-family: ${props => props.theme?.fonts?.heading || DEFAULT_THEME.fonts.heading};
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
  color: ${props => props.theme?.colors?.text || DEFAULT_THEME.colors.text};
`;

const ItemPrice = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  color: ${props => props.theme?.colors?.accent || '#800000'};
  margin-bottom: 0.5rem;
`;

const ItemDescription = styled.p`
  color: ${props => `${props.theme?.colors?.text}CC` || 'rgba(255,255,255,0.8)'};
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  flex: 1;
`;

const ItemLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${props => `${props.theme?.colors?.text}99` || 'rgba(255,255,255,0.6)'};
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
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: ${props => props.theme?.fonts?.body || DEFAULT_THEME.fonts.body};
  
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

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? 
    props.theme?.colors?.accent || '#800000' : 
    'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 
    props.theme?.colors?.accent || '#800000' : 
    'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? 
    'white' : 
    props.theme?.colors?.text || DEFAULT_THEME.colors.text};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
  }
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  color: ${props => props.theme?.colors?.text || DEFAULT_THEME.colors.text};
  width: 250px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  &::placeholder {
    color: ${props => `${props.theme?.colors?.text}80` || 'rgba(255,255,255,0.5)'};
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 95px;
  left: 2rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: translateX(-3px);
  }
`;

const EmptyStateMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  p {
    color: ${props => `${props.theme?.colors?.text}CC` || 'rgba(255,255,255,0.8)'};
  }
`;

const ShopPublicView = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shopData, setShopData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch shop details
        const shopRef = doc(db, 'shops', shopId);
        const shopSnap = await getDoc(shopRef);
        
        if (!shopSnap.exists()) {
          setError('Shop not found');
          setLoading(false);
          return;
        }
        
        const shop = shopSnap.data();
        setShopData(shop);
        
        // Process items from the shop data
        if (shop.items && Array.isArray(shop.items)) {
          const activeItems = shop.items.filter(item => !item.deleted);
          setItems(activeItems);
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
  }, [shopId]);

  // Filter and search items
  const filteredItems = items.filter(item => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply category filter
    const matchesFilter = filter === 'all' || (item.category === filter);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading shop data...</div>
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

  if (!shopData) {
    return null;
  }

  const handleOrderClick = (item) => {
    // Placeholder for order functionality
    alert(`Order placed for ${item.name}`);
  };

  const handleInquiryClick = (item) => {
    // Placeholder for inquiry functionality
    alert(`Inquiry sent for ${item.name}`);
  };

  return (
    <PageContainer theme={shopData.theme}>
      <ShopHeader theme={shopData.theme}>
        <HeaderBanner theme={shopData.theme} />
        <BackButton onClick={() => navigate('/')}>
          <ChevronLeft size={20} />
        </BackButton>
        
        <ShopInfoSection>
          <ProfileImage theme={shopData.theme}>
            {shopData.profile ? (
              <img src={shopData.profile} alt={shopData.name} />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: shopData.theme?.colors?.accent || '#800000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem'
              }}>
                {shopData.name?.charAt(0) || 'S'}
              </div>
            )}
          </ProfileImage>
          
          <ShopDetails theme={shopData.theme}>
            <h1>{shopData.name}</h1>
            <p>{shopData.description}</p>
            
            <ShopStats theme={shopData.theme}>
              <div>
                <span>Items:</span>
                <strong>{items.length}</strong>
              </div>
              <div>
                <span>Since:</span>
                <strong>
                  {shopData.createdAt ? new Date(shopData.createdAt).toLocaleDateString() : 'Unknown'}
                </strong>
              </div>
            </ShopStats>
          </ShopDetails>
        </ShopInfoSection>
      </ShopHeader>

      <ContentSection>
        <FilterBar>
          <FilterSection>
            <FilterButton 
              active={filter === 'all'} 
              onClick={() => setFilter('all')}
              theme={shopData.theme}
            >
              All Items
            </FilterButton>
            
            {/* Add more filter buttons based on categories if needed */}
          </FilterSection>
          
          <SearchInput 
            placeholder="Search items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            theme={shopData.theme}
          />
        </FilterBar>

        {filteredItems.length > 0 ? (
          <ItemsGrid>
            {filteredItems.map((item) => (
              <ItemCard key={item.id} theme={shopData.theme}>
                <ItemImage>
                  {item.images && item.images[0] ? (
                    <img src={item.images[0]} alt={item.name} />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: `${shopData.theme?.colors?.surface || 'rgba(0,0,0,0.2)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: shopData.theme?.colors?.text || '#fff'
                    }}>
                      No Image
                    </div>
                  )}
                </ItemImage>
                
                <ItemDetails>
                  <ItemTitle theme={shopData.theme}>{item.name}</ItemTitle>
                  <ItemPrice theme={shopData.theme}>${parseFloat(item.price).toFixed(2)}</ItemPrice>
                  <ItemDescription theme={shopData.theme}>
                    {item.description || 'No description available.'}
                  </ItemDescription>
                  
                  {item.address && (
                    <ItemLocation theme={shopData.theme}>
                      <Navigation size={14} />
                      {item.address}
                    </ItemLocation>
                  )}
                  
                  <ActionButtons>
                    <ActionButton 
                      className="secondary"
                      onClick={() => handleInquiryClick(item)}
                      theme={shopData.theme}
                    >
                      <MessageCircle size={16} />
                      Inquire
                    </ActionButton>
                    <ActionButton 
                      className="primary"
                      onClick={() => handleOrderClick(item)}
                      theme={shopData.theme}
                    >
                      <ShoppingCart size={16} />
                      Order
                    </ActionButton>
                  </ActionButtons>
                </ItemDetails>
              </ItemCard>
            ))}
          </ItemsGrid>
        ) : (
          <EmptyStateMessage theme={shopData.theme}>
            <h3>No items found</h3>
            <p>This shop doesn't have any items matching your search criteria.</p>
          </EmptyStateMessage>
        )}
      </ContentSection>
    </PageContainer>
  );
};

export default ShopPublicView;