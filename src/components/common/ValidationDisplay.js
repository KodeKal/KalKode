// src/components/common/ValidationDisplay.js

import React from 'react';
import styled from 'styled-components';
import { formatCharCount, getValidationColor } from '../../utils/inputValidation';

const ValidationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-family: ${props => props.theme?.fonts?.body || 'sans-serif'};
`;

const ErrorMessage = styled.span`
  color: #ff4444;
  font-weight: 500;
`;

const CharCounter = styled.span`
  color: ${props => props.color || props.theme?.colors?.text || '#ffffff'};
  opacity: ${props => props.isWarning ? 1 : 0.6};
  font-weight: ${props => props.isWarning ? 600 : 400};
  margin-left: auto;
`;

const ValidationDisplay = ({ 
  error, 
  charCount, 
  charLimit, 
  showCharCount = true,
  theme 
}) => {
  if (!error && !showCharCount) return null;

  const color = getValidationColor(charCount, charLimit);
  const isWarning = charCount >= charLimit * 0.75;

  return (
    <ValidationContainer theme={theme}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {showCharCount && charLimit && (
        <CharCounter 
          color={color} 
          isWarning={isWarning}
          theme={theme}
        >
          {formatCharCount(charCount, charLimit)}
        </CharCounter>
      )}
    </ValidationContainer>
  );
};

export default ValidationDisplay;