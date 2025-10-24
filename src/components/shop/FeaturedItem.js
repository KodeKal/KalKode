// Updated FeaturedItem.js with mobile-responsive styling

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Users, Package, Navigation, Store, Edit, ChevronLeft, ChevronRight, X, MessageCircle, ShoppingCart } from 'lucide-react';
import OrderChat from '../../components/Chat/OrderChat';
import { getSubdomainUrl } from '../../utils/subdomainRouter';

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

const ItemCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(0, 0, 0, 0.4)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  
  /* ✅ FIXED: Let card height adapt to content naturally */
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
    box-shadow: 0 5px 15px ${props => `${props.theme?.colors?.accent || 'rgba(128, 0, 0, 0.2)'}40`};
  }
  
  @media (max-width: 768px) {
    border-radius: 10px;
    
    &:hover {
      transform: translateY(-3px);
    }
  }
  
  @media (max-width: 480px) {
    border-radius: 8px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 3px 10px ${props => `${props.theme?.colors?.accent || 'rgba(128, 0, 0, 0.2)'}30`};
    }
  }
  
  @media (max-width: 360px) {
    &:hover {
      transform: none;
      box-shadow: 0 2px 8px ${props => `${props.theme?.colors?.accent || 'rgba(128, 0, 0, 0.2)'}20`};
    }
  }
`;

// ✅ ADD: Skinny top bar for shop name and distance
const TopBar = styled.div`
  padding: 0.4rem 0.75rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(0, 0, 0, 0.6)'}CC`};
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  height: 32px;
  flex-shrink: 0;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}15` || 'rgba(255, 255, 255, 0.05)'};
  
  .shop-name {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    
    &:hover {
      opacity: 0.8;
      transform: translateX(2px);
    }
    
    svg {
      flex-shrink: 0;
    }
  }
  
  .distance {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.7rem;
    font-weight: 500;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    opacity: 0.8;
    white-space: nowrap;
    
    svg {
      flex-shrink: 0;
    }
  }
  
  @media (max-width: 768px) {
    padding: 0.35rem 0.65rem;
    height: 30px;
    
    .shop-name {
      font-size: 0.7rem;
      gap: 0.25rem;
      
      svg {
        width: 11px;
        height: 11px;
      }
    }
    
    .distance {
      font-size: 0.65rem;
      gap: 0.25rem;
      
      svg {
        width: 10px;
        height: 10px;
      }
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.3rem 0.6rem;
    height: 28px;
    
    .shop-name {
      font-size: 0.65rem;
    }
    
    .distance {
      font-size: 0.6rem;
    }
  }
`;

const ItemInfo = styled.div`
  padding: 0.5rem 0.75rem;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}`};
  gap: 0.75rem;
  border-top: 1px solid ${props => `${props.theme?.colors?.accent}15` || 'rgba(255, 255, 255, 0.05)'};

  .item-name {
    font-size: 0.95rem;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    font-weight: 600;
    flex: 1;
    line-height: 1.2;
  }

  .price {
    font-size: 0.95rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    font-weight: bold;
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 0.45rem 0.65rem;
    height: 42px;
    
    .item-name {
      font-size: 0.9rem;
    }
    
    .price {
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.6rem;
    height: 40px;
    gap: 0.5rem;
    
    .item-name {
      font-size: 0.85rem;
    }
    
    .price {
      font-size: 0.85rem;
    }
  }
`;

const ShopNameOverlay = styled.div`
  position: absolute;
  bottom: 0.3rem;
  left: 0.3rem;
  color: ${props => props.theme?.colors?.accent || '#800000'};
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  max-width: 60%;
  
  &:hover {
    transform: scale(1.05);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9),
                 0 0 12px rgba(0, 0, 0, 0.7);
  }
  
  .shop-icon {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
  }
  
  .shop-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  @media (max-width: 480px) {
    top: 0.5rem;
    left: 0.5rem;
    font-size: 0.7rem;
    gap: 0.25rem;
    
    svg {
      width: 11px;
      height: 11px;
    }
  }
`;

const DistanceOverlay = styled.div`
  position: absolute;
  bottom: 0.30rem;
  right: 0.30rem;
  color: ${props => props.theme?.colors?.accent || '#800000'};
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
  }
  
  @media (max-width: 480px) {
    top: 0.5rem;
    right: 0.5rem;
    font-size: 0.7rem;
    gap: 0.25rem;
    
    svg {
      width: 11px;
      height: 11px;
    }
  }
`;


const ImageSection = styled.div`
  position: relative;
  width: 100%;
  /* ✅ FIXED: Aspect ratio ensures uniform image container */
  aspect-ratio: 1 / 1; /* Square images */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => `${props.theme?.colors?.background || '#000000'}50`};
  flex-shrink: 0; /* Prevent shrinking */

  img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* ✅ Fills the space while maintaining aspect ratio */
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
  
  @media (max-width: 768px) {
    aspect-ratio: 4 / 3; /* Slightly taller on mobile for better visibility */
    
    .carousel-arrow {
      width: 28px;
      height: 28px;
      
      &.left {
        left: 0.75rem;
      }
      
      &.right {
        right: 0.75rem;
      }
      
      svg {
        width: 14px;
        height: 14px;
      }
    }
  }
  
  @media (max-width: 480px) {
    aspect-ratio: 1 / 1; /* Back to square on small mobile */
    
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
        width: 12px;
        height: 12px;
      }
    }
    
    &:not(:hover) .carousel-arrow {
      opacity: 0.5;
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
      {/* ✅ NEW: Skinny Top Bar */}
      <TopBar theme={itemTheme}>
        <div 
          className="shop-name"
          onClick={(e) => {
            e.stopPropagation();
            if (item.shopUsername) {
              window.location.href = getSubdomainUrl(item.shopUsername);
            } else {
              navigate(`/shop/${item.shopId}/view`);
            }
          }}
        >
          <Store size={12} />
          <span>{item.shopName}</span>
        </div>
        
        {item.formattedDistance && (
          <div className="distance">
            <Navigation size={11} />
            <span>{item.formattedDistance}</span>
          </div>
        )}
      </TopBar> 

      {/* ✅ Image takes remaining space */}
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
      </ImageSection> 

      {/* ✅ Skinny Bottom Bar */}
      <ItemInfo theme={itemTheme}>
        <h3 className="item-name">{item.name}</h3>
        <div className="price">${formatPrice(item.price)}</div>
      </ItemInfo>
    </ItemCard>
  );
         
};

export default FeaturedItem;