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
`;

const BuyDialog = ({ item, sellerId, onClose, onTransactionCreated }) => {
  const [meetupType, setMeetupType] = useState('inperson');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleBuy = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const transactionId = await TransactionService.initiateTransaction(
        item.id,
        sellerId,
        item.price,
        meetupType
      );
      
      onTransactionCreated(transactionId);
    } catch (error) {
      console.error('Error initiating transaction:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
        
        <Title theme={item.theme}>Buy Item</Title>
        
        <ItemDetails theme={item.theme}>
          {item.images && item.images[0] && (
            <img src={item.images[0]} alt={item.name} />
          )}
          <div className="details">
            <h3>{item.name}</h3>
            <div className="price">${parseFloat(item.price).toFixed(2)}</div>
            <div className="seller">Seller: {item.shopName}</div>
          </div>
        </ItemDetails>
        
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
          disabled={loading}
          theme={item.theme}
        >
          {loading ? 'Processing...' : 'Confirm Purchase'}
        </Button>
      </DialogContent>
    </DialogOverlay>
  );
};

export default BuyDialog;