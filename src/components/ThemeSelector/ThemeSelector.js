// src/components/ThemeSelector/ThemeSelector.js
import React from 'react';
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
  background: ${props => props.theme?.colors?.background || '#000000'};
  border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  padding: 1rem;
  z-index: 1000;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  max-width: 90vw;
`;

const ThemeOption = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: ${props => props.color};
  border: 2px solid ${props => props.active ? 'white' : 'transparent'};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: scale(1.1);
  }

  .theme-number {
    position: absolute;
    bottom: 3px;
    right: 3px;
    font-size: 10px;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 2px black;
  }
`;

const ThemeSelector = ({ 
  currentTheme, 
  onThemeSelect, 
  isAuthenticated = false,
  onApplyTheme = null 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <ThemeDropdown>
      <DropdownButton onClick={() => setIsOpen(!isOpen)}>
        <span>Theme: {currentTheme.name || 'Default'}</span>
      </DropdownButton>

      {isOpen && (
        <DropdownContent>
          {Object.values(WELCOME_STYLES).map((theme) => (
            <ThemeOption 
              key={theme.id}
              color={theme.colors.accent}
              active={currentTheme.id === theme.id}
              onClick={() => {
                onThemeSelect(theme);
                setIsOpen(false);
              }}
              title={`${theme.name} (Style ${theme.id})`}
            >
              <div className="theme-number">{theme.id}</div>
            </ThemeOption>
          ))}
          {isAuthenticated && onApplyTheme && (
            <button 
              onClick={() => {
                onApplyTheme(currentTheme);
                setIsOpen(false);
              }}
              style={{ 
                width: '100%', 
                marginTop: '1rem',
                padding: '0.5rem',
                background: currentTheme.colors.accent,
                border: 'none',
                borderRadius: '4px',
                color: currentTheme.colors.text,
                cursor: 'pointer'
              }}
            >
              Apply Theme
            </button>
          )}
        </DropdownContent>
      )}
    </ThemeDropdown>
  );
};

export default ThemeSelector;