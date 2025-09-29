// Updated FeaturedItem.js with mobile-responsive styling

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Users, Package, Navigation, Store, Edit, ChevronLeft, ChevronRight, X, MessageCircle, ShoppingCart } from 'lucide-react';
import OrderChat from '../../components/Chat/OrderChat';

const CategoryBadge = styled.div`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: ${props => `${props.theme?.colors?.accent || '#800000'}90`};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 2;
  backdrop-filter: blur(4px);
  
  /* Mobile responsive */
  @media (max-width: 480px) {
    top: 0.5rem;
    left: 0.5rem;
    padding: 0.2rem 0.5rem;
    font-size: 0.65rem;
    border-radius: 8px;
  }
`;

// Updated ItemCard with mobile responsiveness
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
  position: relative;
  z-index: 1;
  
  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
    box-shadow: 0 5px 15px ${props => `${props.theme?.colors?.accent || 'rgba(128, 0, 0, 0.2)'}40`};
  }
  
  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    min-height: 320px;
    border-radius: 10px;
    
    &:hover {
      transform: translateY(-3px);
    }
  }
  
  @media (max-width: 480px) {
    min-height: 280px;
    border-radius: 8px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 3px 10px ${props => `${props.theme?.colors?.accent || 'rgba(128, 0, 0, 0.2)'}30`};
    }
  }
  
  @media (max-width: 360px) {
    min-height: 260px;
    
    &:hover {
      transform: none; /* Disable hover transform on very small screens */
      box-shadow: 0 2px 8px ${props => `${props.theme?.colors?.accent || 'rgba(128, 0, 0, 0.2)'}20`};
    }
  }
`;

const ExpandedActionButtons = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 5;
  
  @media (max-width: 480px) {
    bottom: 0.75rem;
    left: 0.75rem;
    right: 0.75rem;
    gap: 0.4rem;
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

const ItemInfo = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}`};

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
    line-height: 1.3;
  }

  .price {
    font-size: 1.1rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    font-weight: bold;
  }

  .shop-name {
    font-size: 0.9rem;
    color: ${props => props.theme?.colors?.text || 'rgba(255, 255, 255, 0.7)'};
    margin-top: auto;
  }

  .distance {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    padding: 1.2rem;
    gap: 0.6rem;
    
    h3 {
      font-size: 1.1rem;
    }
    
    .price {
      font-size: 1.05rem;
    }
    
    .shop-name {
      font-size: 0.85rem;
    }
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    gap: 0.5rem;
    
    h3 {
      font-size: 1rem;
      -webkit-line-clamp: 2; /* Limit to 2 lines on mobile */
    }
    
    .price {
      font-size: 1rem;
    }
    
    .shop-name {
      font-size: 0.8rem;
    }
    
    .distance {
      font-size: 0.8rem;
      gap: 0.4rem;
    }
  }
  
  @media (max-width: 360px) {
    padding: 0.75rem;
    gap: 0.4rem;
    
    h3 {
      font-size: 0.95rem;
      -webkit-line-clamp: 1; /* Limit to 1 line on very small screens */
    }
    
    .price {
      font-size: 0.95rem;
    }
    
    .shop-name {
      font-size: 0.75rem;
    }
    
    .distance {
      font-size: 0.75rem;
    }
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
  
  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    height: ${props => props.isExpanded ? '100%' : '180px'};
    
    .carousel-arrow {
      width: 28px;
      height: 28px;
      
      &.left {
        left: 0.75rem;
      }
      
      &.right {
        right: 0.75rem;
      }
    }
  }
  
  @media (max-width: 480px) {
    height: ${props => props.isExpanded ? '100%' : '150px'};
    
    .carousel-arrow {
      width: 24px;
      height: 24px;
      
      &.left {
        left: 0.5rem;
      }
      
      &.right {
        right: 0.5rem;
      }
      
      svg {
        width: 14px;
        height: 14px;
      }
    }
    
    /* Always show arrows on mobile for better UX */
    &:not(:hover) .carousel-arrow {
      opacity: 0.5;
    }
  }
  
  @media (max-width: 360px) {
    height: ${props => props.isExpanded ? '100%' : '130px'};
    
    .carousel-arrow {
      width: 20px;
      height: 20px;
      
      svg {
        width: 12px;
        height: 12px;
      }
    }
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
  
  /* Mobile responsive */
  @media (max-width: 480px) {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.4rem;
    font-size: 0.75rem;
    border-radius: 3px;
  }
  
  @media (max-width: 360px) {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.3rem;
    font-size: 0.7rem;
  }
`;

const LocationText = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme?.colors?.text || 'rgba(255, 255, 255, 0.7)'};
  opacity: 0.7;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  /* Mobile responsive */
  @media (max-width: 480px) {
    font-size: 0.8rem;
    gap: 0.4rem;
  }
  
  @media (max-width: 360px) {
    font-size: 0.75rem;
    gap: 0.3rem;
  }
`;

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
  
  /* Mobile responsive */
  @media (max-width: 480px) {
    .expanded-header {
      height: 250px;
    }
    
    .expanded-body {
      padding: 1rem;
    }
    
    .expanded-title {
      font-size: 1.5rem;
    }
    
    .expanded-price {
      font-size: 1.2rem;
    }
    
    .expanded-description {
      font-size: 0.9rem;
      line-height: 1.5;
    }
    
    .expanded-location {
      font-size: 0.8rem;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  /* Mobile responsive */
  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-top: 1rem;
  }
  
  @media (max-width: 360px) {
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
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
  
  /* Mobile responsive */
  @media (max-width: 480px) {
    padding: 0.6rem;
    font-size: 0.8rem;
    gap: 0.4rem;
    border-radius: 6px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
  
  @media (max-width: 360px) {
    padding: 0.5rem;
    font-size: 0.75rem;
    gap: 0.3rem;
    border-radius: 4px;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const ZoomContainer = styled.div`
  position: relative;
  z-index: 10001;
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  background: ${props => props.theme?.colors?.background || '#000000'};
  max-height: 95vh;
  max-width: 95vw;
  width: 600px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    width: 90vw;
    max-height: 90vh;
    border-radius: 8px;
  }
  
  @media (max-width: 480px) {
    width: 95vw;
    max-height: 95vh;
    border-radius: 6px;
    border-width: 1px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.5)'}80`};
  z-index: 9999;
  backdrop-filter: blur(2px);
`;

// Keep the rest of your FeaturedItem component logic exactly the same
const FeaturedItem = ({ item, showDistance, theme, onItemClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const itemTheme = theme || item.shopTheme || {};

  const handleNextImage = (e) => {
    e.stopPropagation();
    const validImages = item.images?.filter(Boolean) || [];
    if (validImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    }
  };
  
  const handlePrevImage = (e) => {
    e.stopPropagation();
    const validImages = item.images?.filter(Boolean) || [];
    if (validImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    }
  };
  
  const getDisplayImage = () => {
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
    if (onItemClick) onItemClick(item);
  };

  return (
    <ItemCard 
      onClick={handleClick}
      theme={itemTheme}
      className={`item-card-${item.id}`}
    >
      <ImageSection theme={itemTheme}>
        <img src={getDisplayImage()} alt={item.name} />
        
        
        
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
        
        {item.formattedDistance && (
          <Distance theme={itemTheme}>{item.formattedDistance}</Distance>
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
        {item.quantity !== undefined && (
          <div className="item-availability">
            <span 
              className="status-indicator" 
              style={{ 
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: parseInt(item.quantity) > 0 ? '#4CAF50' : '#FF5252',
                marginRight: '6px'
              }}
            ></span>
            <span 
              className="status-text"
              style={{ 
                fontSize: '0.85rem',
                fontWeight: '500',
                color: parseInt(item.quantity) > 0 ? '#4CAF50' : '#FF5252' 
              }}
            >
              {parseInt(item.quantity) > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        )}
      
        {item.formattedDistance && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            color: itemTheme?.colors?.accent || '#800000'
          }}>
            <Navigation size={14} />
            {item.formattedDistance} away
          </div>
        )}
      </ItemInfo>
    </ItemCard>
  );      
};

export default FeaturedItem;