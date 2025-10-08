// src/components/shop/AddressInput/index.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { Navigation, Search, X } from 'lucide-react';

const AddressContainer = styled.div`
  margin-top: 0.5rem;
  width: 100%;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:focus-within {
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
  }
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  font-size: 0.9rem;
  padding: 0.25rem;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const LocationButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme?.colors?.accent || '#800000'};
  padding: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LocationInfo = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  opacity: 0.7;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .location-icon {
    color: ${props => props.theme?.colors?.accent || '#800000'};
  }
`;

const standardizeCoordinates = (coordinates) => {
  if (!coordinates) return null;
  
  const lat = coordinates.lat || coordinates.latitude;
  const lng = coordinates.lng || coordinates.longitude;
  
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  return { lat, lng };
};

const formatCoordinates = (coords) => {
  if (!coords) return '';
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
};


const AddressInput = ({ address, onAddressChange, onLocationSelect }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = standardizeCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });

        if (coords) {
          const formattedAddress = formatCoordinates(coords);
          onAddressChange(formattedAddress);
          
          // Call onLocationSelect with proper structure
          onLocationSelect({
            address: formattedAddress,
            coordinates: coords
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to get location. Please enable location services.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <AddressContainer>
      <InputWrapper>
        <Input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Enter coordinates (lat, lng) or click location icon"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              // Handle manual coordinate entry
              const coordsMatch = address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
              if (coordsMatch) {
                const coords = {
                  lat: parseFloat(coordsMatch[1]),
                  lng: parseFloat(coordsMatch[2])
                };
                onLocationSelect({
                  address: formatCoordinates(coords),
                  coordinates: coords
                });
              }
            }
          }}
        />
        {address && (
          <LocationButton 
            onClick={() => {
              onAddressChange('');
              onLocationSelect({ address: '', coordinates: null });
            }}
            title="Clear"
          >
            <X size={16} />
          </LocationButton>
        )}
        <LocationButton 
          onClick={handleLiveLocation}
          disabled={isLoading}
          title="Use current location"
        >
          {isLoading ? (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(128, 0, 0, 0.3)',
              borderRadius: '50%',
              borderTopColor: '#800000',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            <Navigation size={16} />
          )}
        </LocationButton>
      </InputWrapper>
      {address && (
        <LocationInfo>
          <Navigation size={14} className="location-icon" />
          {address}
        </LocationInfo>
      )}
    </AddressContainer>
  );
};

export default AddressInput;