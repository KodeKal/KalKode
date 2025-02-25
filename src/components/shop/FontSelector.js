// Save at: src/components/shop/FontSelector.js

import React from 'react';
import styled from 'styled-components';

const FontOption = styled.div`
  padding: 1rem;
  border: 1px solid ${props => props.selected ? '#800000' : 'rgba(128, 0, 0, 0.3)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: ${props => props.selected ? 'rgba(128, 0, 0, 0.1)' : 'transparent'};
  margin-bottom: 1rem;

  &:hover {
    border-color: #800000;
    background: rgba(128, 0, 0, 0.1);
  }

  h3 {
    font-family: ${props => props.fontFamily};
    font-size: 2rem;
    color: ${props => props.selected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'};
    text-align: center;
  }
`;

const fontOptions = [
  { 
    id: 'graffiti',
    name: 'Street Style',
    fontFamily: 'Impact, sans-serif',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    fontFamily: 'Playfair Display, serif',
  },
  {
    id: 'modern',
    name: 'Modern',
    fontFamily: 'Space Grotesk, sans-serif',
  }
];

const FontSelector = ({ selectedFont, onSelect }) => {
  return (
    <div>
      {fontOptions.map(font => (
        <FontOption
          key={font.id}
          selected={selectedFont === font.id}
          fontFamily={font.fontFamily}
          onClick={() => onSelect(font.id)}
        >
          <h3>Your Shop Name</h3>
        </FontOption>
      ))}
    </div>
  );
};

export default FontSelector;
