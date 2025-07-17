// src/components/ThemeSelector/ThemeSelector.js - Updated for 30 themes
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
  min-width: 600px; // Increased for 6 columns
  max-width: 90vw;
  max-height: 70vh;
  overflow-y: auto;
  background: ${props => props.theme?.colors?.background || '#000000'};
  border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  padding: 1rem;
  z-index: 1000;
  
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

// 6 columns for 30 themes (5 rows)
const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.7rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
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
  background: ${props => props.gradient || props.color};
  border: 2px solid ${props => props.active ? 'white' : 'transparent'};
  position: relative;
  overflow: hidden;
  
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
    font-size: 7px;
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
  
  // Category indicator
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

// Simple category colors
const getCategoryColor = (themeId) => {
  if (themeId <= 10) return '#4CAF50'; // Original themes - green
  if (themeId <= 15) return '#FF9800'; // Cultural themes - orange
  if (themeId <= 20) return '#E91E63'; // Creative themes - pink
  if (themeId <= 25) return '#2196F3'; // Environment themes - blue
  return '#9C27B0'; // Tech/Space themes - purple
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
                categoryColor={getCategoryColor(theme.id)}
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