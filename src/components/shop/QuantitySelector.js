// src/components/shop/QuantitySelector.js

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Minus } from 'lucide-react';

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  gap: 0.5rem;
`;

const Label = styled.label`
  display: block;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  opacity: 0.8;
  font-size: 0.9rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const QuantityInput = styled.input`
  width: 100%;
  background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.2)'}80`};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  border: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}30`};
  padding: 0.6rem;
  text-align: center;
  font-size: 1rem;
  -moz-appearance: textfield; /* Hide number input arrows in Firefox */
  
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
  }
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${props => `${props.theme?.colors?.accent || '#800000'}40`};
  border: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}60`};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.minus {
    border-radius: 4px 0 0 4px;
  }
  
  &.plus {
    border-radius: 0 4px 4px 0;
  }
`;

const StockStatus = styled.div`
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.inStock ? '#4CAF50' : '#FF5252'};
  }
  
  .status-text {
    color: ${props => props.inStock ? '#4CAF50' : '#FF5252'};
    font-weight: 500;
  }
  
  .quantity-info {
    color: ${props => props.theme?.colors?.text || '#FFFFFF'}CC;
  }
`;

const QuantitySelector = ({ 
  value, 
  onChange, 
  theme,
  showStatus = true,
  min = 0,
  max = 9999
}) => {
  const [localValue, setLocalValue] = useState(value || 0);
  
  useEffect(() => {
    // Keep local state in sync with props
    setLocalValue(value !== undefined ? value : 0);
  }, [value]);
  
  const handleChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    setLocalValue(val);
    
    // Only trigger onChange for valid values
    if (val >= min && val <= max) {
      onChange(val);
    }
  };
  
  const handleBlur = () => {
    // Enforce min/max constraints on blur
    if (localValue < min) {
      setLocalValue(min);
      onChange(min);
    } else if (localValue > max) {
      setLocalValue(max);
      onChange(max);
    }
  };
  
  const incrementValue = () => {
    if (localValue < max) {
      const newValue = localValue + 1;
      setLocalValue(newValue);
      onChange(newValue);
    }
  };
  
  const decrementValue = () => {
    if (localValue > min) {
      const newValue = localValue - 1;
      setLocalValue(newValue);
      onChange(newValue);
    }
  };
  
  const isInStock = localValue > 0;
  
  return (
    <SelectorContainer>
      <Label theme={theme}>Quantity Available</Label>
      
      <ControlsContainer>
        <ControlButton 
          className="minus" 
          onClick={decrementValue} 
          disabled={localValue <= min}
          theme={theme}
        >
          <Minus size={16} />
        </ControlButton>
        
        <QuantityInput
          type="number"
          min={min}
          max={max}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          theme={theme}
        />
        
        <ControlButton 
          className="plus" 
          onClick={incrementValue} 
          disabled={localValue >= max}
          theme={theme}
        >
          <Plus size={16} />
        </ControlButton>
      </ControlsContainer>
      
      {showStatus && (
        <StockStatus inStock={isInStock} theme={theme}>
          <span className="status-indicator"></span>
          <span className="status-text">
            {isInStock ? 'In Stock' : 'Out of Stock'}
          </span>
          {isInStock && localValue > 1 && (
            <span className="quantity-info">({localValue} available)</span>
          )}
        </StockStatus>
      )}
    </SelectorContainer>
  );
};

export default QuantitySelector;