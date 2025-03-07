// In FeaturedItem.js

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Users, Package, Navigation, Film, Pin, ChevronLeft, ChevronRight, X, MessageCircle, ShoppingCart } from 'lucide-react';
import OrderChat from '../../components/Chat/OrderChat'; // Import the OrderChat component


// Update the ItemCard to handle expanded state
// Update the ItemCard styled component
const ItemCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(0, 0, 0, 0.4)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 390px;
  display: flex;
  flex-direction: column;
  position: ${props => props.isExpanded ? 'fixed' : 'relative'};
  z-index: ${props => props.isExpanded ? '100' : '1'};

  /* Modified expansion style */
  ${props => props.isExpanded && `
    top: calc(${props.positionY}px - 20px); /* Slightly above the original */
    left: calc(${props.positionX}px + ${props.width}px + 20px); /* To the right of the original */
    width: calc(${props.width}px * 1.75); /* 1.75x original width */
    height: calc(${props.height}px * 1.75); /* 1.75x original height */
    transform-origin: top left;
    background: ${props.theme?.colors?.surface || 'rgba(0, 0, 0, 0.4)'};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  `}
  
  &:hover {
    transform: ${props => props.isExpanded ? 'none' : 'translateY(-5px)'};
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
    box-shadow: 0 5px 15px ${props => `${props.theme?.colors?.accent || 'rgba(128, 0, 0, 0.2)'}40`};
  }
`;

// Add this for the ActionButtons container in the expanded view
const ExpandedActionButtons = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 5;
`;

// Add a ChatOverlay component
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

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.5)'}80`}; // More transparent
  z-index: 99;
  backdrop-filter: blur(2px); // Reduced blur
`;

const ItemInfo = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`};

  h3 {
    font-size: 1.2rem;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
  }

  .price {
    font-size: 1.1rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    font-weight: bold;
  }

  .shop-name {
    font-size: 0.9rem;
    color: ${props => props.theme?.colors?.text || 'rgba(255, 255, 255, 0.7)'};
    opacity: 0.7;
    margin-top: auto;
  }
`;

const ImageSection = styled.div`
  position: relative;
  height: ${props => props.isExpanded ? '100%' : '200px'};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => `${props.theme?.colors?.background || '#000000'}50`};

  img {
    width: 100%;
    height: 100%;
    object-fit: ${props => props.isExpanded ? 'contain' : 'cover'};
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
    opacity: 0;
    transition: opacity 0.3s ease;
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
  
  &:hover .carousel-arrow {
    opacity: 0.7;
  }
`;

const Distance = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.8)'}CC`};
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: ${props => props.theme?.colors?.text || 'white'};
`;

const LocationText = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme?.colors?.text || 'rgba(255, 255, 255, 0.7)'};
  opacity: 0.7;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Update the expanded view with flex layout
const ExpandedContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  
  .expanded-header {
    position: relative;
    height: 300px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .carousel-controls {
      position: absolute;
      bottom: 1rem;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }
  }
  
  .expanded-body {
    padding: 1.5rem;
  }
  
  .expanded-title {
    font-size: 1.8rem;
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    margin-bottom: 0.5rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  .expanded-price {
    font-size: 1.4rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  .expanded-description {
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
  
  .expanded-location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    opacity: 0.8;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: ${props => props.theme?.styles?.borderRadius || '8px'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
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

// Main component
// Add these styled components
const ZoomContainer = styled.div`
  position: fixed;
  z-index: 200;
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
  background: ${props => props.theme?.colors?.surface || 'rgba(0, 0, 0, 0.8)'};
  // Add max height and max width constraints
  max-height: 80vh;
  max-width: 90vw;
`;

const ZoomConnector = styled.div`
  position: fixed;
  z-index: 199;
  border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
  pointer-events: none;
  transform-origin: top left;
  opacity: 0; // Hide the connector
`;

// Update the FeaturedItem component
const FeaturedItem = ({ item, showDistance, theme }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [elementPosition, setElementPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const navigate = useNavigate();
  const cardRef = React.useRef(null);
  
  // Add state for chat functionality
  const [chatOpen, setChatOpen] = useState(false);
  
  // Use either the passed theme, the item's shop theme, or the default
  const itemTheme = theme || item.shopTheme || {};

  // Handle capturing element position for zoom positioning
  const capturePosition = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setElementPosition({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    
    // Filter out null or undefined images
    const validImages = item.images?.filter(Boolean) || [];
    
    if (validImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    }
  };
  
  const handlePrevImage = (e) => {
    e.stopPropagation();
    
    // Filter out null or undefined images
    const validImages = item.images?.filter(Boolean) || [];
    
    if (validImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    }
  };
  
  const getDisplayImage = () => {
    // Filter out null or undefined images
    const validImages = item.images?.filter(Boolean) || [];
    
    if (validImages.length > 0) {
      return validImages[currentImageIndex % validImages.length];
    }
    return '/placeholder-image.jpg';
  };

  const formatPrice = (price) => {
    try {
      return parseFloat(price).toFixed(2);
    } catch {
      return '0.00';
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    capturePosition();
    setIsZoomed(true);
  };

  // Handle Order button click
  const handleOrderClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setChatOpen(true);
  };

  // Handle Inquire button click
  const handleInquireClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    // You could implement a different chat mode or other functionality
    alert('Inquiry feature coming soon!');
  };

  // Close zoom view when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isZoomed && !event.target.closest(`.zoom-card-${item.id}`) && 
          !event.target.closest(`.item-card-${item.id}`)) {
        setIsZoomed(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isZoomed, item.id]);

  useEffect(() => {
    const handleResize = () => {
      if (isZoomed && cardRef.current) {
        capturePosition();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isZoomed]);

  useEffect(() => {
    if (isZoomed) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scrolling when zoom is closed
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isZoomed]);

  // Calculate zoom box position
  // Calculate zoom box position
  const zoomBoxStyle = () => {
    // Increase size by 75% from original
    const zoomWidth = elementPosition.width * 1.75;
    const zoomHeight = elementPosition.height * 1.75;

    // Get viewport dimensions to ensure the zoom box stays within screen
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Center the zoom box over the original item
    let top = elementPosition.y - (zoomHeight - elementPosition.height) / 2;
    let left = elementPosition.x - (zoomWidth - elementPosition.width) / 2;

    // Adjust if would go outside viewport
    if (top < 10) {
      top = 10;
    } else if (top + zoomHeight > viewportHeight - 10) {
      top = viewportHeight - zoomHeight - 10;
    }

    if (left < 10) {
      left = 10;
    } else if (left + zoomWidth > viewportWidth - 10) {
      left = viewportWidth - zoomWidth - 10;
    }

    return {
      width: zoomWidth,
      height: zoomHeight,
      top,
      left,
    };
  };

  // Calculate connector line points
  const connectorStyle = () => {
    const zoom = zoomBoxStyle();
    
    // Determine if zoom box is above or below the original item
    const isAbove = zoom.top < elementPosition.y;
    
    // Calculate connector position and dimensions
    const connectorLength = Math.abs(isAbove ? 
      elementPosition.y - (zoom.top + zoom.height) : 
      zoom.top - (elementPosition.y + elementPosition.height));
    
    return {
      width: '2px',
      height: `${connectorLength}px`,
      top: isAbove ? zoom.top + zoom.height : elementPosition.y + elementPosition.height,
      left: elementPosition.x + elementPosition.width / 2,
      transform: isAbove ? 'rotate(45deg)' : 'rotate(-45deg)',
      transformOrigin: isAbove ? 'bottom' : 'top',
    };
  };

  return (
    <>
      
      {isZoomed && <Overlay onClick={() => setIsZoomed(false)} theme={itemTheme} />}
      
      <ItemCard 
        ref={cardRef}
        onClick={isZoomed ? undefined : handleClick}
        theme={itemTheme}
        className={`item-card-${item.id}`}
      >
        <ImageSection theme={itemTheme}>
          <img 
            src={getDisplayImage()} 
            alt={item.name} 
          />
          
          {/* Only show navigation arrows if there are MULTIPLE valid images */}
          {(item.images?.filter(Boolean).length > 1) && (
            <>
              <button className="carousel-arrow left" onClick={handlePrevImage}>
                <ChevronLeft size={16} />
              </button>
              <button className="carousel-arrow right" onClick={handleNextImage}>
                <ChevronRight size={16} />
              </button>
            </>
          )}
          
          {showDistance && item.distance && (
            <Distance theme={itemTheme}>{item.distance}</Distance>
          )}
        </ImageSection>

        <ItemInfo theme={itemTheme}>
          <h3>{item.name}</h3>
          <div className="price">${formatPrice(item.price)}</div>
          <div 
            className="shop-name"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/shop/${item.shopId}/view`);
            }}
            style={{ 
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.color = itemTheme?.colors?.accent || '#800000'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            {item.shopName || 'Unknown Shop'}
          </div>
          {item.location && (
            <LocationText theme={itemTheme}>
              <Navigation size={14} />
              {item.location}
            </LocationText>
          )}
        </ItemInfo>
      </ItemCard>
      
      {/* Zoom Box and Connector Line */}
      {isZoomed && (
        <>
          <ZoomConnector 
            style={connectorStyle} 
            theme={itemTheme} 
          />
          <ZoomContainer 
            style={zoomBoxStyle()} 
            theme={itemTheme}
            className={`zoom-card-${item.id}`}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {/* Top section with image */}
              <div style={{ height: '60%', overflow: 'hidden' }}>
                <img 
                  src={getDisplayImage()} 
                  alt={item.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {(item.images?.filter(Boolean).length > 1) && (
                  <>
                    <button className="carousel-arrow left" onClick={handlePrevImage} style={{
                      position: 'absolute',
                      top: '30%',
                      left: '1rem',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer'
                    }}>
                      <ChevronLeft size={18} />
                    </button>
                    <button className="carousel-arrow right" onClick={handleNextImage} style={{
                      position: 'absolute',
                      top: '30%',
                      right: '1rem',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer'
                    }}>
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
              
              {/* Bottom section with info and buttons */}
              <div style={{ padding: '1rem', height: '40%', position: 'relative' }}>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  margin: '0 0 0.5rem 0',
                  fontFamily: itemTheme?.fonts?.heading || 'inherit'
                }}>{item.name}</h3>
                
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold',
                  color: itemTheme?.colors?.accent || '#800000',
                  marginBottom: '0.5rem'
                }}>
                  ${formatPrice(item.price)}
                </div>
                
                <div style={{ 
                  fontSize: '0.9rem', 
                  opacity: 0.8,
                  marginBottom: '0.5rem'
                }}>
                  {item.description?.slice(0, 80)}
                  {item.description?.length > 80 ? '...' : ''}
                </div>
                
                {/* Action buttons */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: '2.5rem', 
                  left: '1rem', 
                  right: '1rem',
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <ActionButton 
                    className="secondary"
                    onClick={handleInquireClick}
                    theme={itemTheme}
                  >
                    <MessageCircle size={16} />
                    Inquire
                  </ActionButton>
                  <ActionButton 
                    className="primary"
                    onClick={handleOrderClick}
                    theme={itemTheme}
                  >
                    <ShoppingCart size={16} />
                    Order
                  </ActionButton>
                </div>
                
                {/* Close button */}
                <button 
                  onClick={() => setIsZoomed(false)} 
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
                    zIndex: 10 /* Ensure it's on top of everything */
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </ZoomContainer>
        </>
      )}
      
      {/* Chat Overlay and Component */}
      <ChatOverlay 
        isOpen={chatOpen} 
        onClick={() => setChatOpen(false)}
      />
      
      {chatOpen && (
        <OrderChat 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)} 
          item={item}
          shopId={item.shopId}
          shopName={item.shopName}
          theme={itemTheme}
        />
      )}
    </>
  );
};

export default FeaturedItem;