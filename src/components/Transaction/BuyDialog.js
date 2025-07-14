// src/components/Transaction/BuyDialog.js - Updated for quantity-based transactions

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, MapPin, PackageCheck, Plus, Minus } from 'lucide-react';
import { TransactionService } from '../../services/TransactionService';

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
  z-index: 9999;
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
    flex: 1;
    
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
    
    .availability {
      font-size: 0.9rem;
      color: ${props => props.availableQuantity > 0 ? '#4CAF50' : '#F44336'};
      font-weight: 500;
    }
  }
`;

const QuantitySection = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  .quantity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    .label {
      font-weight: bold;
      color: ${props => props.theme?.colors?.text || 'white'};
    }
    
    .available {
      font-size: 0.9rem;
      opacity: 0.8;
      color: ${props => props.theme?.colors?.accent || '#800000'};
    }
  }
  
  .quantity-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    
    .quantity-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid ${props => props.theme?.colors?.accent || '#800000'};
      background: transparent;
      color: ${props => props.theme?.colors?.accent || '#800000'};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover:not(:disabled) {
        background: ${props => props.theme?.colors?.accent || '#800000'};
        color: white;
      }
      
      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }
    
    .quantity-display {
      font-size: 1.5rem;
      font-weight: bold;
      color: ${props => props.theme?.colors?.text || 'white'};
      min-width: 60px;
      text-align: center;
    }
  }
  
  .quantity-input {
    margin-top: 1rem;
    
    input {
      width: 100%;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: white;
      text-align: center;
      font-size: 1.1rem;
      
      &:focus {
        outline: none;
        border-color: ${props => props.theme?.colors?.accent || '#800000'};
      }
    }
    
    .input-note {
      font-size: 0.8rem;
      opacity: 0.7;
      text-align: center;
      margin-top: 0.5rem;
    }
  }
`;

const PriceBreakdown = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(0, 188, 212, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(0, 188, 212, 0.3);
  
  .breakdown-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    
    &.total {
      font-weight: bold;
      font-size: 1.1rem;
      color: #00BCD4;
      border-top: 1px solid rgba(0, 188, 212, 0.3);
      padding-top: 0.5rem;
      margin-top: 0.5rem;
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
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  
  const availableQuantity = parseInt(item.quantity) || 0;
  const unitPrice = parseFloat(item.price) || 0;
  const totalPrice = unitPrice * requestedQuantity;
  
  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, Math.min(availableQuantity, requestedQuantity + delta));
    setRequestedQuantity(newQuantity);
  };
  
  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value) || 1;
    setRequestedQuantity(Math.max(1, Math.min(availableQuantity, value)));
  };
  
  const handleSubmitRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (requestedQuantity > availableQuantity) {
        throw new Error('Requested quantity exceeds available stock');
      }
      
      if (requestedQuantity < 1) {
        throw new Error('Quantity must be at least 1');
      }
      
      // Create quantity-based transaction request
      const result = await TransactionService.initiateQuantityTransaction(
        item.id,
        sellerId,
        unitPrice,
        requestedQuantity,
        meetupType
      );
      
      if (result.transactionId) {
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
        
        <Title theme={item.theme}>Purchase Request</Title>
        
        <ItemDetails theme={item.theme} availableQuantity={availableQuantity}>
          {item.images && item.images[0] && (
            <img src={item.images[0]} alt={item.name} />
          )}
          <div className="details">
            <h3>{item.name}</h3>
            <div className="price">${unitPrice.toFixed(2)} each</div>
            <div className="seller">Seller: {item.shopName}</div>
            <div className="availability">
              {availableQuantity > 0 ? 
                `${availableQuantity} available` : 
                'Out of stock'
              }
            </div>
          </div>
        </ItemDetails>
        
        {availableQuantity > 0 && (
          <>
            <QuantitySection theme={item.theme}>
              <div className="quantity-header">
                <span className="label">Select Quantity</span>
                <span className="available">{availableQuantity} available</span>
              </div>
              
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={requestedQuantity <= 1}
                >
                  <Minus size={16} />
                </button>
                
                <div className="quantity-display">
                  {requestedQuantity}
                </div>
                
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={requestedQuantity >= availableQuantity}
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="quantity-input">
                <input
                  type="number"
                  min="1"
                  max={availableQuantity}
                  value={requestedQuantity}
                  onChange={handleQuantityInput}
                  placeholder="Enter quantity"
                />
                <div className="input-note">
                  Enter quantity directly or use +/- buttons
                </div>
              </div>
            </QuantitySection>
            
            <PriceBreakdown>
              <div className="breakdown-row">
                <span>Unit Price:</span>
                <span>${unitPrice.toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span>Quantity:</span>
                <span>{requestedQuantity}</span>
              </div>
              <div className="breakdown-row total">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </PriceBreakdown>
            
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
              onClick={handleSubmitRequest} 
              disabled={loading || requestedQuantity <= 0 || requestedQuantity > availableQuantity}
              theme={item.theme}
            >
              {loading ? 'Sending Request...' : 
               `Request ${requestedQuantity} item${requestedQuantity > 1 ? 's' : ''} ($${totalPrice.toFixed(2)})`}
            </Button>
            
            <div style={{
              fontSize: '0.85rem',
              opacity: 0.8,
              textAlign: 'center',
              marginTop: '1rem',
              lineHeight: '1.4'
            }}>
              The seller will review your quantity request and can accept or adjust the quantity before you make payment.
            </div>
          </>
        )}
        
        {availableQuantity <= 0 && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'rgba(244, 67, 54, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(244, 67, 54, 0.3)'
          }}>
            <h3 style={{ color: '#F44336', marginBottom: '0.5rem' }}>Out of Stock</h3>
            <p style={{ opacity: 0.8 }}>This item is currently unavailable.</p>
          </div>
        )}
      </DialogContent>
    </DialogOverlay>
  );
};

export default BuyDialog;