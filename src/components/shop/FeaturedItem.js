// In src/components/shop/FeaturedItem.js

import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Users, Package, Navigation, Film, Pin, ChevronLeft, ChevronRight, X, MessageCircle, ShoppingCart } from 'lucide-react';

// Update the styled components to use the theme props better

const ItemCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(0, 0, 0, 0.4)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}30`};
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: ${props => props.isExpanded ? '100' : '1'};

  ${props => props.isExpanded && `
    position: fixed;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 1200px;
    height: 80vh;
    margin-top: 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: ${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.95)'};
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  `}
  
  &:hover {
    transform: ${props => props.isExpanded ? 'translate(-50%, -50%)' : 'translateY(-5px)'};
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
    box-shadow: 0 5px 15px ${props => `${props.theme?.colors?.accent || 'rgba(128, 0, 0, 0.2)'}40`};
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.8)'}CC`};
  z-index: 99;
  backdrop-filter: blur(5px);
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

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.5)'}90`};
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme?.colors?.text || 'white'};
  cursor: pointer;
  z-index: 101;
  transition: all 0.2s;

  &:hover {
    background: ${props => `${props.theme?.colors?.accent || 'rgba(255, 255, 255, 0.2)'}40`};
    transform: scale(1.1);
  }
`;

const DetailsSection = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  background: ${props => props.theme?.colors?.surface || 'transparent'};

  h2 {
    font-size: 1.8rem;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    margin: 0;
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
  }

  .price {
    font-size: 1.4rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    font-weight: bold;
  }

  .shop-name {
    font-size: 1rem;
    color: ${props => props.theme?.colors?.text || 'rgba(255, 255, 255, 0.7)'};
    opacity: 0.7;
  }

  .description {
    color: ${props => props.theme?.colors?.text || 'rgba(255, 255, 255, 0.9)'};
    line-height: 1.6;
    font-family: ${props => props.theme?.fonts?.body || 'inherit'};
  }

  .location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${props => props.theme?.colors?.text || 'rgba(255, 255, 255, 0.7)'};
    opacity: 0.7;
    font-size: 0.9rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: auto;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 1rem;
  border-radius: ${props => props.theme?.styles?.borderRadius || '8px'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: ${props => props.theme?.fonts?.body || 'inherit'};

  &.inquiry {
    background: transparent;
    border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
    color: ${props => props.theme?.colors?.accent || '#800000'};

    &:hover {
      background: ${props => `${props.theme?.colors?.accent || '#800000'}20`};
    }
  }

  &.order {
    background: ${props => props.theme?.colors?.accent || '#800000'};
    color: ${props => props.theme?.colors?.text || 'white'};
    border: none;

    &:hover {
      background: ${props => props.theme?.colors?.primary || '#600000'};
    }
  }
`;

// We need to modify the ImageSection component to always show the navigation arrows
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

const CarouselControls = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 2;
`;

const CarouselDot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? 
    props.theme?.colors?.accent || '#800000' : 
    'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 
      props.theme?.colors?.accent || '#800000' : 
      'rgba(255, 255, 255, 0.5)'};
  }
`;

const FeaturedItem = ({ item, showDistance, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  
  // Use either the passed theme, the item's shop theme, or the default
  const itemTheme = theme || item.shopTheme || {};

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
  
  // Then update the rendering logic in the return statement
  
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
    setIsExpanded(true);
  };

  return (
    <>
      {isExpanded && <Overlay onClick={() => setIsExpanded(false)} theme={itemTheme} />}
      <ItemCard 
        isExpanded={isExpanded} 
        onClick={isExpanded ? undefined : handleClick}
        theme={itemTheme}
      >
        {isExpanded && (
          <CloseButton onClick={() => setIsExpanded(false)} theme={itemTheme}>
            <X size={16} />
          </CloseButton>
        )}
        
        <ImageSection isExpanded={isExpanded} theme={itemTheme}>
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
              {/* Keep the carousel dots only for expanded view */}
              {isExpanded && (
                <CarouselControls>
                  {item.images.filter(Boolean).map((_, index) => (
                    <CarouselDot
                      key={index}
                      active={currentImageIndex === index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      theme={itemTheme}
                    />
                  ))}
                </CarouselControls>
              )}
            </>
          )}
          
          {showDistance && item.distance && (
            <Distance theme={itemTheme}>{item.distance}</Distance>
          )}
        </ImageSection>

        {isExpanded ? (
          <DetailsSection theme={itemTheme}>
            <h2>{item.name}</h2>
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
            {item.description && (
              <p className="description">{item.description}</p>
            )}
            {item.location && (
              <div className="location">
                <Navigation size={14} />
                {item.location}
              </div>
            )}
            <ActionButtons>
              <ActionButton className="inquiry" theme={itemTheme}>
                <MessageCircle size={18} />
                Inquire
              </ActionButton>
              <ActionButton className="order" theme={itemTheme}>
                <ShoppingCart size={18} />
                Order Now
              </ActionButton>
            </ActionButtons>
          </DetailsSection>
        ) : (
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
        )}
      </ItemCard>
    </>
  );
};

export default FeaturedItem;