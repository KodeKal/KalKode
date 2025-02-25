// Save at: src/pages/shop/components/EditableComponents/EditableText.js

import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const EditableContainer = styled.div`
  width: 100%;
  position: relative;
`;

const EditableInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  font-size: ${props => props.fontSize || '1rem'};
  font-weight: ${props => props.fontWeight || 'normal'};
  color: inherit;
  text-align: inherit;
  font-family: inherit;
  outline: none;
  padding: 0.5rem;
  
  &:focus {
    background: rgba(255, 255, 255, 0.05);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const EditableTextArea = styled.textarea`
  width: 100%;
  background: transparent;
  border: none;
  font-size: ${props => props.fontSize || '1rem'};
  font-weight: ${props => props.fontWeight || 'normal'};
  color: inherit;
  text-align: inherit;
  font-family: inherit;
  outline: none;
  padding: 0.5rem;
  resize: none;
  min-height: ${props => props.minHeight || '60px'};
  
  &:focus {
    background: rgba(255, 255, 255, 0.05);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const EditableText = ({
  value,
  onChange,
  onBlur,
  placeholder,
  multiline = false,
  fontSize,
  fontWeight,
  minHeight,
  maxLength,
  theme,
  style = {}
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange(newValue);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Ensure cursor goes to end of text
    if (inputRef.current) {
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  };

  return (
    <EditableContainer>
      {multiline ? (
        <EditableTextArea
          ref={inputRef}
          value={value || ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          fontSize={fontSize}
          fontWeight={fontWeight}
          minHeight={minHeight}
          style={style}
        />
      ) : (
        <EditableInput
          ref={inputRef}
          value={value || ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          fontSize={fontSize}
          fontWeight={fontWeight}
          style={style}
        />
      )}
    </EditableContainer>
  );
};

export default EditableText;