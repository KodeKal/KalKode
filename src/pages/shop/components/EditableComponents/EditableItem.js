// Save at: src/pages/shop/components/EditableComponents/EditableItem.js

import React, { useState } from 'react';
import styled from 'styled-components';
import { DollarSign, Trash2, Plus, X } from 'lucide-react';
import EditableText from './EditableText';
import EditableImage from './EditableImage';

const ItemContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.accent || '#800000'};
  }
`;

const ImageSection = styled.div`
  aspect-ratio: 1;
  overflow: hidden;
`;

const ContentSection = styled.div`
  padding: 1.5rem;
`;

const PriceInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  
  .currency {
    color: ${props => props.theme?.accent || '#800000'};
  }
`;

const ItemActions = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
`;

const ActionButton = styled.button`
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.delete ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
    transform: scale(1.1);
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Tag = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: white;
    }
  }
`;

const AddTagButton = styled.button`
  background: none;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  color: ${props => props.theme?.accent || '#800000'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme?.accent || '#800000'};
    background: rgba(255, 255, 255, 0.05);
  }
`;

const DeleteSection = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
`;

const DeleteItemButton = styled.button`
  background: transparent;
  border: none;
  color: #ff4444;
  opacity: 0.6;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const EditableItem = ({
  item,  // This is already coming from props
  onChange,
  onDelete,
  theme
}) => {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  // Remove this duplicate state declaration
  // const [item, setItem] = useState({...}) - THIS IS THE PROBLEM

  const handleImageChange = (index, imageData) => {
    const newImages = [...item.images];
    newImages[index] = imageData;
    onChange({
      ...item,
      images: newImages
    });
  };

  const handleNameChange = (newName) => {
    onChange({
      ...item,
      name: newName
    });
  };

  const handlePriceChange = (newPrice) => {
    onChange({
      ...item,
      price: newPrice
    });
  };

  const handleDescriptionChange = (newDescription) => {
    onChange({
      ...item,
      description: newDescription
    });
  };

  const handleQuantityChange = (e) => {
    onChange({
      ...item,
      quantity: parseInt(e.target.value) || 0
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && (!item.tags || item.tags.length < 3)) {
      onChange({
        ...item,
        tags: [...(item.tags || []), newTag.trim()]
      });
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange({
      ...item,
      tags: item.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <ItemContainer theme={theme}>
      
      <ImageSection>
        <EditableImage
          value={item.images[item.currentImageIndex]}
          onChange={(imageData) => handleImageChange(item.currentImageIndex, imageData)}
          height="100%"
          theme={theme}
        />
      </ImageSection>

      <ContentSection>
        <EditableText
          value={item.name}
          onChange={handleNameChange}
          placeholder="Item Name"
          fontSize="1.2rem"
          fontWeight="bold"
          theme={theme}
        />

        <PriceInput theme={theme}>
          <DollarSign className="currency" size={16} />
          <EditableText
            value={item.price}
            onChange={handlePriceChange}
            placeholder="0.00"
            theme={theme}
          />
        </PriceInput>

        <EditableText
          value={item.description}
          onChange={handleDescriptionChange}
          placeholder="Item Description"
          multiline
          theme={theme}
        />

        <div className="quantity-field" style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Quantity Available</label>
          <input 
            type="number" 
            min="0" 
            value={item.quantity || 1}
            onChange={handleQuantityChange}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              padding: '0.5rem',
              color: 'white',
              width: '100%'
            }}
          />
        </div>

        <TagsContainer>
          {(item.tags || []).map((tag, index) => (
            <Tag key={index}>
              {tag}
              <button onClick={() => handleRemoveTag(tag)}>
                <X size={14} />
              </button>
            </Tag>
          ))}

          {(!item.tags || item.tags.length < 3) && (
            isAddingTag ? (
              <EditableText
                value={newTag}
                onChange={setNewTag}
                placeholder="Enter tag"
                onSave={handleAddTag}
                theme={theme}
              />
            ) : (
              <AddTagButton onClick={() => setIsAddingTag(true)} theme={theme}>
                <Plus size={14} />
                Add Tag
              </AddTagButton>
            )
          )}
        </TagsContainer>

        <DeleteSection>
          <DeleteItemButton onClick={onDelete}>
            <Trash2 size={16} />
            Remove Item
          </DeleteItemButton>
        </DeleteSection>
      </ContentSection>
    </ItemContainer>
  );
};

export default EditableItem;