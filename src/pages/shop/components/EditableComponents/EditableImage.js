// UPDATE EditableImage.js - Complete replacement
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Plus, X } from 'lucide-react';

const ImageContainer = styled.div`
  position: relative;
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '200px'};
  border-radius: ${props => props.round ? '50%' : '8px'};
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;

  &:hover .overlay {
    opacity: 1;
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  gap: 0.5rem;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 2;

  &:hover {
    background: rgba(255, 0, 0, 0.5);
  }
`;

const EditableImage = ({
  value,
  onChange,
  width,
  height,
  round = false,
  theme
}) => {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange({
        file: file,
        preview: reader.result,
        type: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  // Determine what image to show
  const getImageSource = () => {
    // If value is a string URL, use it directly
    if (typeof value === 'string') {
      return value;
    }
    // If value is an object with preview, use preview
    if (value?.preview) {
      return value.preview;
    }
    // No image
    return null;
  };

  const imageSource = getImageSource();

  return (
    <ImageContainer 
      width={width} 
      height={height} 
      round={round}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      {imageSource ? (
        <>
          <ImagePreview src={imageSource} alt="Preview" />
          <RemoveButton onClick={handleRemove}>
            <X size={14} />
          </RemoveButton>
        </>
      ) : (
        <PlaceholderContent>
          <Plus size={24} />
          <span>Upload Image</span>
        </PlaceholderContent>
      )}
    </ImageContainer>
  );
};

export default EditableImage;