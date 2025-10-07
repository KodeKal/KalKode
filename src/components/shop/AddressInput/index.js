// src/components/shop/AddressInput/index.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { Navigation, Search, X } from 'lucide-react';
import geocodeAddress from 'src/utils/geocoding'

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
          onLocationSelect({
            address: formattedAddress,
            coordinates: coords
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const handleAddressSubmit = () => {
    if (!address.trim()) return;

    // Check if input is coordinates format (lat, lng)
    const coordsMatch = address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    
    if (coordsMatch) {
      const coords = {
        lat: parseFloat(coordsMatch[1]),
        lng: parseFloat(coordsMatch[2])
      } else {
    // NEW: Geocode the address
    const result = await geocodeAddress(address);
    if (result) {
      onLocationSelect({
        address: result.displayName,
        coordinates: { lat: result.lat, lng: result.lng }
      });
    } else {
      setError('Could not find that address');
    }
  };
      
      onLocationSelect({
        address: formatCoordinates(coords),
        coordinates: coords
      });
    } else {
      // For now, use a default location
      // TODO: Implement actual geocoding
      const defaultCoords = { lat: 29.6350, lng: -95.4738 };
      onLocationSelect({
        address: formatCoordinates(defaultCoords),
        coordinates: defaultCoords
      });
    }
  };

  return (
    <AddressContainer>
      <InputWrapper>
        <Input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Enter coordinates (lat, lng)..."
          onKeyPress={(e) => e.key === 'Enter' && handleAddressSubmit()}
        />
        {address && (
          <LocationButton 
            onClick={() => onAddressChange('')}
            title="Clear"
          >
            <X size={16} />
          </LocationButton>
        )}
        <LocationButton 
          onClick={handleAddressSubmit}
          disabled={!address.trim() || isLoading}
          title="Search coordinates"
        >
          <Search size={16} />
        </LocationButton>
        <LocationButton 
          onClick={handleLiveLocation}
          disabled={isLoading}
          title="Use current location"
        >
          <Navigation size={16} />
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