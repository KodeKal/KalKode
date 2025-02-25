// src/components/shop/FeaturedItem.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Navigation, X, MessageCircle, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

const ItemCard = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(128, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: ${props => props.isExpanded ? '100' : '1'};

  ${props => props.isExpanded && `
    position: fixed;
    top: 55%; // Changed from 50% to move it down
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 1200px;
    height: 80vh; // Reduced from 90vh to prevent banner overlap
    margin-top: 40px; // Added margin to push down further
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  `}
  
  &:hover {
    transform: ${props => props.isExpanded ? 'translate(-50%, -50%)' : 'translateY(-5px)'};
    border-color: #800000;
    box-shadow: 0 5px 15px rgba(128, 0, 0, 0.2);
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
  background: ${props => props.active ? '#800000' : 'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#800000' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

// Update the ImageSection component:
const ImageSection = styled.div`
  position: relative;
  height: ${props => props.isExpanded ? '100%' : '200px'};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: ${props => props.isExpanded ? 'contain' : 'cover'};
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
    opacity: 0.7;
    transition: all 0.2s;

    &:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.8);
    }

    &.left {
      left: 1rem;
    }

    &.right {
      right: 1rem;
    }
  }
`;


const ItemInfo = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h3 {
    font-size: 1.2rem;
    color: #FFFFFF;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .price {
    font-size: 1.1rem;
    color: #800000;
    font-weight: bold;
  }

  .shop-name {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: auto;
  }
`;

const Distance = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: white;
`;

const LocationText = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 99;
  backdrop-filter: blur(5px);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
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
  z-index: 101;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;

const DetailsSection = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;

  h2 {
    font-size: 1.8rem;
    color: #FFFFFF;
    margin: 0;
  }

  .price {
    font-size: 1.4rem;
    color: #800000;
    font-weight: bold;
  }

  .shop-name {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .description {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.7);
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
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.inquiry {
    background: transparent;
    border: 1px solid #800000;
    color: #800000;

    &:hover {
      background: rgba(128, 0, 0, 0.1);
    }
  }

  &.order {
    background: #800000;
    color: white;

    &:hover {
      background: #600000;
    }
  }
`;

const FeaturedItem = ({ item, showDistance }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (item.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (item.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  const formatPrice = (price) => {
    try {
      return parseFloat(price).toFixed(2);
    } catch {
      return '0.00';
    }
  };

  const getDisplayImage = () => {
    if (item.images && Array.isArray(item.images)) {
      const validImage = item.images.find(img => img);
      return validImage || '/placeholder-image.jpg';
    }
    return '/placeholder-image.jpg';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setIsExpanded(true);
  };

  return (
    <>
      {isExpanded && <Overlay onClick={() => setIsExpanded(false)} />}
      <ItemCard 
        isExpanded={isExpanded} 
        onClick={isExpanded ? undefined : handleClick}
      >
        {isExpanded && (
          <CloseButton onClick={() => setIsExpanded(false)}>
            <X size={16} />
          </CloseButton>
        )}
        
        <ImageSection isExpanded={isExpanded}>
          <img 
            src={item.images?.[currentImageIndex] || '/placeholder-image.jpg'} 
            alt={item.name} 
          />
          {isExpanded && item.images && item.images.length > 1 && (
            <>
              <button className="carousel-arrow left" onClick={handlePrevImage}>
                <ChevronLeft size={16} />
              </button>
              <button className="carousel-arrow right" onClick={handleNextImage}>
                <ChevronRight size={16} />
              </button>
              <CarouselControls>
                {item.images.map((_, index) => (
                  <CarouselDot
                    key={index}
                    active={currentImageIndex === index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </CarouselControls>
            </>
          )}
          {showDistance && item.distance && (
            <Distance>{item.distance}</Distance>
          )}
        </ImageSection>

        {isExpanded ? (
          <DetailsSection>
            <h2>{item.name}</h2>
            <div className="price">${formatPrice(item.price)}</div>
            <div className="shop-name">{item.shopName}</div>
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
              <ActionButton className="inquiry">
                <MessageCircle size={18} />
                Inquire
              </ActionButton>
              <ActionButton className="order">
                <ShoppingCart size={18} />
                Order Now
              </ActionButton>
            </ActionButtons>
          </DetailsSection>
        ) : (
          <ItemInfo>
            <h3>{item.name}</h3>
            <div className="price">${formatPrice(item.price)}</div>
            <div className="shop-name">{item.shopName || 'Unknown Shop'}</div>
            {item.location && (
              <LocationText>
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