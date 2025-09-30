// src/components/common/ValidatedEditableText.js

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import EditableText from '../../pages/shop/components/EditableComponents/EditableText';
import ValidationDisplay from './ValidationDisplay';
import { validateField, truncateToMaxLength } from '../../utils/inputValidation';

const Container = styled.div`
  width: 100%;
`;

const ValidatedEditableText = ({
  value,
  onChange,
  placeholder,
  multiline = false,
  validationRules,
  showValidation = true,
  autoTruncate = true,
  theme,
  fontSize,
  fontWeight,
  minHeight,
  style,
  ...otherProps
}) => {
  const [validation, setValidation] = useState({
    isValid: true,
    error: null,
    charCount: 0,
    charLimit: validationRules?.maxLength
  });

  useEffect(() => {
    if (validationRules) {
      const result = validateField(value || '', validationRules);
      setValidation(result);
    }
  }, [value, validationRules]);

  const handleChange = (newValue) => {
    let processedValue = newValue;

    // Auto-truncate if enabled
    if (autoTruncate && validationRules?.maxLength) {
      processedValue = truncateToMaxLength(newValue, validationRules.maxLength);
    }

    // Validate pattern if exists (only for non-empty values)
    if (validationRules?.pattern && processedValue && processedValue.trim()) {
      if (!validationRules.pattern.test(processedValue)) {
        // For pattern validation, allow backspace/deletion
        // Only block if they're adding invalid characters
        if (processedValue.length > (value?.length || 0)) {
          return;
        }
      }
    }

    onChange(processedValue);
  };

  return (
    <Container>
      <EditableText
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        multiline={multiline}
        theme={theme}
        fontSize={fontSize}
        fontWeight={fontWeight}
        minHeight={minHeight}
        maxLength={validationRules?.maxLength}
        style={style}
        {...otherProps}
      />
      {showValidation && validationRules && (
        <ValidationDisplay
          error={validation.error}
          charCount={validation.charCount}
          charLimit={validation.charLimit}
          theme={theme}
        />
      )}
    </Container>
  );
};

export default ValidatedEditableText;