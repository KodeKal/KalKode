// src/components/LocationDialog.js
import React from 'react';
import styled from 'styled-components';
import { Navigation, X } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
`;

const DialogContent = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(128, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  padding: 2rem;
  position: relative;
  text-align: center;
`;

const IconContainer = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(128, 0, 0, 0.2);
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: #800000;
  }
`;

const Title = styled.h3`
  margin-bottom: 1rem;
  color: white;
`;

const Description = styled.p`
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: linear-gradient(45deg, #800000, #4A0404);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }
  }
  
  &.secondary {
    background: transparent;
    border: 1px solid #800000;
    color: #800000;
    
    &:hover {
      background: rgba(128, 0, 0, 0.1);
    }
  }
`;

const LocationDialog = ({ show, onClose }) => {
  const { requestLocation } = useLocation();
  
  const handleAllowLocation = () => {
    requestLocation();
    onClose();
  };
  
  return (
    <DialogOverlay show={show}>
      <DialogContent>
        <IconContainer>
          <Navigation size={32} />
        </IconContainer>
        <Title>Enable Location Services</Title>
        <Description>
          Allow KalKode to access your location to see items near you and get accurate distance information.
        </Description>
        <ButtonGroup>
          <Button className="secondary" onClick={onClose}>
            Maybe Later
          </Button>
          <Button className="primary" onClick={handleAllowLocation}>
            Allow
          </Button>
        </ButtonGroup>
      </DialogContent>
    </DialogOverlay>
  );
};

export default LocationDialog;