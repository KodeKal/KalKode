// src/pages/shop/components/ThemeSelector/ThemeCard.js

import React from 'react';
import styled from 'styled-components';
import { Lock } from 'lucide-react';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.styles.borderRadius};
  overflow: hidden;
  border: 1px solid ${props => props.selected ? props.theme.colors.accent : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme.colors.accent};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

const Preview = styled.div`
  height: 200px;
  background: ${props => props.previewBg};
  padding: 2rem;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  h3 {
    font-family: ${props => props.previewFont};
    color: ${props => props.previewColor};
    font-size: 1.8rem;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.overlay};
    opacity: 0.1;
  }
`;

const ThemeInfo = styled.div`
  padding: 1.5rem;

  h4 {
    font-family: ${props => props.theme.fonts.heading};
    color: ${props => props.theme.colors.text};
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
  }

  p {
    color: ${props => props.theme.colors.text}CC;
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.6;
  }
`;

const PriceTag = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${props => props.isPremium ? props.theme.colors.accent : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.theme.colors.text};
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 2;
`;

const ThemeCard = ({ 
  theme, 
  selected, 
  onSelect, 
  previewText,
  isPremium,
  isLoading 
}) => {
  return (
    <Card 
      selected={selected} 
      onClick={() => onSelect(theme)}
    >
      <Preview
        previewBg={theme.colors.background}
        previewFont={theme.fonts.heading}
        previewColor={theme.colors.text}
        overlay={theme.colors.primary}
      >
        <h3>{previewText}</h3>
      </Preview>
      
      <ThemeInfo>
        <h4>{theme.name}</h4>
        <p>{theme.description}</p>
      </ThemeInfo>

      <PriceTag isPremium={isPremium}>
        {theme.price === 0 ? 'FREE' : `$${theme.price.toFixed(2)}`}
      </PriceTag>
    </Card>
  );
};

export default ThemeCard;