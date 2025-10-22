// UPDATE EditableImage.js - Complete replacement
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Plus, X } from 'lucide-react';
import { compressImage } from '../../../../utils/imageCompression';



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

  // UPDATE handleImageChange function
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
  
    // Validate original file size (before compression)
    if (file.size > 10 * 1024 * 1024) { // 10MB max for original
      alert('Original file size must be less than 10MB');
      return;
    }
  
    try {
      // Show loading state (optional - add to component state)
      // setCompressing(true);
    
      // Compress the image
      const compressedFile = await compressImage(file);
    
      // Create preview from compressed file
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          file: compressedFile, // Use compressed file
          preview: reader.result,
          type: compressedFile.type,
          name: compressedFile.name
        });
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Failed to process image. Please try another file.');
    } finally {
      // setCompressing(false);
    }
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