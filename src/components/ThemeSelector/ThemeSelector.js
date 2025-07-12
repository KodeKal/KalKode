// src/components/ThemeSelector/ThemeSelector.js

import React, { useState } from 'react';
import styled from 'styled-components';
import { WELCOME_STYLES } from '../../theme/welcomeStyles';

const ThemeDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background: transparent;
  border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DropdownContent = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  min-width: 480px; /* Increased width for more themes */
  max-width: 90vw;
  max-height: 70vh; /* Add max height for scrolling */
  overflow-y: auto; /* Add scrolling */
  background: ${props => props.theme?.colors?.background || '#000000'};
  border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  padding: 1rem;
  z-index: 1000;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.colors?.accent || '#800000'};
    border-radius: 3px;
  }
`;

// Updated grid layout for more themes
const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* Changed from 5 to 6 columns */
  gap: 0.7rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr); /* Changed from 3 to 4 columns on mobile */
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ThemeOption = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: ${props => props.color};
  border: 2px solid ${props => props.active ? 'white' : 'transparent'};
  position: relative;
  overflow: hidden;
  
  /* Add gradient overlay to show theme colors better */
  background: ${props => props.gradient || props.color};
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 3px 8px rgba(0,0,0,0.3);
  }
  
  .style-number {
    position: absolute;
    top: 3px;
    right: 3px;
    font-size: 9px;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 2px black;
    background: rgba(0,0,0,0.5);
    padding: 1px 3px;
    border-radius: 2px;
  }
  
  .style-name {
    font-size: 8px;
    color: white;
    text-shadow: 0 0 3px black;
    text-align: center;
    position: absolute;
    bottom: 2px;
    left: 2px;
    right: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: rgba(0,0,0,0.6);
    padding: 1px 2px;
    border-radius: 2px;
  }
  
  /* Theme category indicator */
  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.categoryColor || 'transparent'};
  }
`;

// Add category colors for visual organization
const getCategoryColor = (themeName) => {
  if (themeName.includes('Soccer') || themeName.includes('Sports')) return '#4CAF50';
  if (themeName.includes('Ethiopian') || themeName.includes('Eritrean') || themeName.includes('African')) return '#FF9800';
  if (themeName.includes('Mexican') || themeName.includes('American')) return '#F44336';
  if (themeName.includes('Food') || themeName.includes('Gourmet')) return '#FF5722';
  if (themeName.includes('Code') || themeName.includes('Gaming') || themeName.includes('Cyber')) return '#00E676';
  if (themeName.includes('Music') || themeName.includes('Cinema')) return '#E91E63';
  if (themeName.includes('Elegance') || themeName.includes('Royal')) return '#9C27B0';
  if (themeName.includes('Desert') || themeName.includes('Safari')) return '#FF6F00';
  if (themeName.includes('Space') || themeName.includes('Winter')) return '#2196F3';
  if (themeName.includes('Tropical') || themeName.includes('Japanese')) return '#00BCD4';
  return 'transparent';
};

const ApplyButton = styled.button`
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: ${props => props.theme?.colors?.accent || '#800000'};
  border: none;
  border-radius: 4px;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const ThemeSelector = ({ 
  currentTheme, 
  onThemeSelect, 
  isAuthenticated = false,
  onApplyTheme = null 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ThemeDropdown>
      <DropdownButton onClick={() => setIsOpen(!isOpen)}>
        <span>Theme: {currentTheme.name || 'Default'}</span>
      </DropdownButton>

      {isOpen && (
        <DropdownContent>
          <ThemeGrid>
            {Object.values(WELCOME_STYLES).map((theme) => (
              <ThemeOption 
                key={theme.id}
                color={theme.colors.accent}
                gradient={theme.colors.accentGradient || theme.colors.accent}
                active={currentTheme.id === theme.id}
                categoryColor={getCategoryColor(theme.name)}
                onClick={() => {
                  onThemeSelect(theme);
                  if (!isAuthenticated) {
                    setIsOpen(false);
                  }
                }}
                title={`${theme.name} (Style ${theme.id})`}
              >
                <div className="style-number">{theme.id}</div>
                <div className="style-name">{theme.name}</div>
              </ThemeOption>
            ))}
          </ThemeGrid>
          
          {isAuthenticated && onApplyTheme && (
            <ApplyButton 
              onClick={() => {
                onApplyTheme(currentTheme);
                setIsOpen(false);
              }}
              theme={currentTheme}
            >
              Apply Theme
            </ApplyButton>
          )}
        </DropdownContent>
      )}
    </ThemeDropdown>
  );
};

export default ThemeSelector;