// In src/components/ThemeSelector/ThemeSelector.js

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
  min-width: 380px;
  max-width: 90vw;
  background: ${props => props.theme?.colors?.background || '#000000'};
  border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  padding: 1rem;
  z-index: 1000;
`;

// New horizontal grid layout for theme options
const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.7rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
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
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 3px 8px rgba(0,0,0,0.2);
  }
  
  .style-number {
    position: absolute;
    bottom: 3px;
    right: 3px;
    font-size: 10px;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 2px black;
  }
  
  .style-name {
    font-size: 10px;
    color: white;
    text-shadow: 0 0 3px black;
    text-align: center;
    position: absolute;
    bottom: 5px;
    left: 3px;
    right: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

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
                active={currentTheme.id === theme.id}
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