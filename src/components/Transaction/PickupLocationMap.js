// Add this component: src/components/Transaction/PickupLocationMap.js
import React from 'react';
import styled from 'styled-components';
import { MapPin, Navigation } from 'lucide-react';

const MapContainer = styled.div`
  margin: 1rem 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const MapPreview = styled.div`
  height: 200px;
  background: rgba(0, 0, 0, 0.2);
  position: relative;
  
  .map-placeholder {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    
    .pin {
      margin-bottom: 0.5rem;
    }
  }
  
  .location-pin {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
    color: #800000;
  }
`;

const LocationDetails = styled.div`
  padding: 1rem;
  background: rgba(0, 0, 0, 0.4);
  
  .location-address {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .location-details {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 0.5rem;
  }
  
  .location-time {
    font-size: 0.9rem;
    opacity: 0.7;
    font-style: italic;
  }
  
  .directions-button {
    margin-top: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(33, 150, 243, 0.2);
    color: #2196F3;
    border: none;
    border-radius: 20px;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: rgba(33, 150, 243, 0.3);
      transform: translateY(-2px);
    }
  }
`;

const PickupLocationMap = ({ location }) => {
  if (!location) return null;
  
  const handleOpenDirections = () => {
    if (location.latitude && location.longitude) {
      // Open Google Maps directions in a new tab
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`, '_blank');
    } else {
      // If we don't have coordinates, just search for the address
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`, '_blank');
    }
  };
  
  return (
    <MapContainer>
      <MapPreview>
        <div className="map-placeholder">
          <div className="pin">
            <MapPin size={32} />
          </div>
          <div>Map Preview</div>
        </div>
        <div className="location-pin">
          <MapPin size={24} fill="#800000" />
        </div>
      </MapPreview>
      
      <LocationDetails>
        <div className="location-address">{location.address}</div>
        {location.details && (
          <div className="location-details">{location.details}</div>
        )}
        {location.time && (
          <div className="location-time">
            Pickup time: {new Date(location.time).toLocaleString()}
          </div>
        )}
        
        <button 
          className="directions-button"
          onClick={handleOpenDirections}
        >
          <Navigation size={14} />
          Get Directions
        </button>
      </LocationDetails>
    </MapContainer>
  );
};

export default PickupLocationMap;