import React, { useState } from 'react';
import styled from 'styled-components';
import { X, MapPin, PackageCheck } from 'lucide-react';
import { TransactionService } from '../../services/TransactionService';

// src/components/Transaction/BuyDialog.js (continued)

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* Increase this value */
  backdrop-filter: blur(4px);
`;

const DialogContent = styled.div`
  background: ${props => props.theme?.colors?.background || '#111'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  border: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}30`};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: ${props => props.theme?.colors?.text || 'white'};
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const Title = styled.h2`
  font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
  color: ${props => props.theme?.colors?.text || 'white'};
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const ItemDetails = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  .details {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    h3 {
      margin: 0 0 0.5rem 0;
      font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    }
    
    .price {
      font-size: 1.2rem;
      font-weight: bold;
      color: ${props => props.theme?.colors?.accent || '#800000'};
    }
    
    .seller {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  }
`;

const MeetupOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .title {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
`;

const MeetupOption = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.selected ? 
    `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)' : 
    `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}`
  };
  border: 1px solid ${props => props.selected ? 
    props.theme?.colors?.accent || '#800000' : 
    'transparent'
  };
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  }
  
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${props => props.selected ? 
      props.theme?.colors?.accent || '#800000' : 
      'rgba(255, 255, 255, 0.1)'
    };
    color: ${props => props.selected ? 'white' : props.theme?.colors?.text || 'white'};
  }
  
  .info {
    flex: 1;
    
    .title {
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    
    .description {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme?.colors?.primary || '#600000'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;const PriceNegotiation = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 193, 7, 0.3);
  
  .price-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    .original-price {
      text-decoration: line-through;
      opacity: 0.6;
      font-size: 0.9rem;
    }
    
    .your-offer {
      font-weight: bold;
      color: #FFC107;
      font-size: 1.1rem;
    }
  }
  
  .price-input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .dollar-sign {
      font-size: 1.2rem;
      font-weight: bold;
      color: #FFC107;
    }
    
    input {
      flex: 1;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 193, 7, 0.5);
      border-radius: 4px;
      color: white;
      font-size: 1.1rem;
      font-weight: bold;
      
      &:focus {
        outline: none;
        border-color: #FFC107;
      }
    }
    
    .savings {
      font-size: 0.9rem;
      color: #4CAF50;
      font-weight: bold;
    }
  }
  
  .negotiation-note {
    font-size: 0.85rem;
    opacity: 0.8;
    margin-top: 0.5rem;
    font-style: italic;
  }
`;

const BuyDialog = ({ item, sellerId, onClose, onTransactionCreated }) => {
  const [meetupType, setMeetupType] = useState('inperson');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offerPrice, setOfferPrice] = useState(parseFloat(item.price) || 0);
  
  const originalPrice = parseFloat(item.price) || 0;
  const savings = originalPrice - offerPrice;
  const isNegotiating = offerPrice !== originalPrice;
  
  const handleBuy = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new transaction flow that creates a purchase request
      const result = await TransactionService.initiateTransaction(
        item.id,
        sellerId,
        offerPrice, // Use the negotiated price
        meetupType
      );
      
      if (result.transactionId) {
        // Redirect to messages to continue the flow
        onTransactionCreated(result.transactionId);
        onClose();
      }
    } catch (error) {
      console.error('Error initiating transaction:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePriceChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setOfferPrice(Math.max(0, value));
  };
  
  return (
    <DialogOverlay onClick={onClose}>
      <DialogContent 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }} 
        theme={item.theme}
      >
        <CloseButton onClick={onClose} theme={item.theme}>
          <X size={20} />
        </CloseButton>
        
        <Title theme={item.theme}>Make Purchase Request</Title>
        
        <ItemDetails theme={item.theme}>
          {item.images && item.images[0] && (
            <img src={item.images[0]} alt={item.name} />
          )}
          <div className="details">
            <h3>{item.name}</h3>
            <div className="price">Listed: ${originalPrice.toFixed(2)}</div>
            <div className="seller">Seller: {item.shopName}</div>
          </div>
        </ItemDetails>
        
        {/* Price Negotiation Section */}
        <PriceNegotiation>
          <div className="price-header">
            <span>Your Offer:</span>
            {isNegotiating && (
              <div>
                <span className="original-price">${originalPrice.toFixed(2)}</span>
                <span className="your-offer"> → ${offerPrice.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <div className="price-input-group">
            <span className="dollar-sign">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={offerPrice}
              onChange={handlePriceChange}
              placeholder="Enter your offer"
            />
            {savings > 0 && (
              <span className="savings">Save ${savings.toFixed(2)}</span>
            )}
          </div>
          
          <div className="negotiation-note">
            {isNegotiating 
              ? "Your offer will be sent to the seller for approval"
              : "You're offering the listed price"
            }
          </div>
        </PriceNegotiation>
        
        <MeetupOptions>
          <div className="title">Choose pickup method:</div>
          
          <MeetupOption 
            selected={meetupType === 'inperson'} 
            onClick={() => setMeetupType('inperson')}
            theme={item.theme}
          >
            <div className="icon">
              <MapPin size={20} />
            </div>
            <div className="info">
              <div className="title">In-Person Meetup</div>
              <div className="description">
                Meet the seller at an agreed location
              </div>
            </div>
          </MeetupOption>
          
          <MeetupOption 
            selected={meetupType === 'locker'} 
            onClick={() => setMeetupType('locker')}
            theme={item.theme}
          >
            <div className="icon">
              <PackageCheck size={20} />
            </div>
            <div className="info">
              <div className="title">Locker Pickup</div>
              <div className="description">
                Seller will place item in a secure locker
              </div>
            </div>
          </MeetupOption>
        </MeetupOptions>
        
        {error && (
          <div style={{ 
            color: '#ff4444', 
            padding: '0.5rem', 
            marginBottom: '1rem',
            background: 'rgba(255, 68, 68, 0.1)',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        
        <Button 
          onClick={handleBuy} 
          disabled={loading || offerPrice <= 0}
          theme={item.theme}
        >
          {loading ? 'Sending Request...' : 
           isNegotiating ? `Send Offer (${offerPrice.toFixed(2)})` : 
           'Send Purchase Request'}
        </Button>
        
        <div style={{
          fontSize: '0.85rem',
          opacity: 0.8,
          textAlign: 'center',
          marginTop: '1rem',
          lineHeight: '1.4'
        }}>
          {isNegotiating 
            ? "The seller will be notified of your offer and can accept, reject, or counter-offer"
            : "The seller will be notified of your purchase request"
          }
        </div>
      </DialogContent>
    </DialogOverlay>
  );
};

export default BuyDialog;