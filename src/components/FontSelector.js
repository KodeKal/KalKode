// Create new file: src/components/FontSelector.js
import React from 'react';
import styled from 'styled-components';
import { FONT_OPTIONS } from '../theme/config/fonts';

const FontOptionButton = styled.button`
  background: ${props => props.isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.isSelected ? props.theme.colors.accent : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1rem;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: ${props => props.theme.colors.accent};
  }

  .font-name {
    font-family: ${props => props.fontFamily};
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .sample-text {
    font-family: ${props => props.fontFamily};
    opacity: 0.7;
  }
`;

const FontSelector = ({ selectedFont, onSelectFont }) => {
  return (
    <div>
      {Object.entries(FONT_OPTIONS).map(([key, font]) => (
        <FontOptionButton
          key={key}
          isSelected={selectedFont === key}
          fontFamily={font.heading}
          onClick={() => onSelectFont(key)}
        >
          <div className="font-name">Aa</div>
          <div className="sample-text">{font.name}</div>
        </FontOptionButton>
      ))}
    </div>
  );
};

export default FontSelector;