// src/components/ThemeSelector/ThemeSelector.js
import React from 'react';
import styled from 'styled-components';
import { THEME_VARIANTS, DEFAULT_THEME } from '../../theme/config/themes';  // Updated import path

const ThemeDropdown = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 2rem;
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
  top: 100%;
  left: 0;
  width: 300px;
  background: ${props => props.theme?.colors?.background || '#000000'};
  border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
  border-radius: 8px;
  margin-top: 0.5rem;
  padding: 1rem;
  z-index: 1000;
`;

const ThemeOption = styled.div`
  padding: 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  gap: 1rem;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .color-preview {
    display: flex;
    gap: 0.5rem;
  }

  .color-swatch {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }

  .theme-info {
    flex: 1;
    h4 {
      margin: 0;
      font-family: ${props => props.theme?.fonts?.heading};
    }
    p {
      margin: 0;
      font-size: 0.8rem;
      opacity: 0.7;
    }
  }
`;

const ThemeSelector = ({ 
  currentTheme = DEFAULT_THEME, 
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
          {Object.entries(THEME_VARIANTS).map(([id, theme]) => (
            <ThemeOption 
              key={id}
              onClick={() => {
                onThemeSelect({
                  ...DEFAULT_THEME,
                  ...theme,
                  id
                });
                setIsOpen(false);
              }}
            >
              <div className="color-preview">
                <div 
                  className="color-swatch" 
                  style={{ background: theme.colors.primary }} 
                />
                <div 
                  className="color-swatch" 
                  style={{ background: theme.colors.accent }} 
                />
              </div>
              <div className="theme-info">
                <h4>{theme.name}</h4>
                <p>{theme.description}</p>
              </div>
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