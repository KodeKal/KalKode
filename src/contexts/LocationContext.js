// src/contexts/LocationContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [locationPermission, setLocationPermission] = useState('pending'); // 'granted', 'denied', 'pending'

  const requestLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(coordinates);
          setLocationPermission('granted');
          setLocationLoading(false);
          
          // Store in localStorage for persistence across sessions
          localStorage.setItem('userLocation', JSON.stringify(coordinates));
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(error.message);
          setLocationPermission('denied');
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
      setLocationPermission('denied');
      setLocationLoading(false);
    }
  };

  // Check for stored location on initial load
  useEffect(() => {
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      try {
        const parsedLocation = JSON.parse(storedLocation);
        setUserLocation(parsedLocation);
        setLocationPermission('granted');
      } catch (e) {
        console.error('Error parsing stored location', e);
      }
    }
    setLocationLoading(false);
  }, []);

  return (
    <LocationContext.Provider 
      value={{ 
        userLocation, 
        locationLoading, 
        locationError, 
        locationPermission,
        requestLocation,
        setUserLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);