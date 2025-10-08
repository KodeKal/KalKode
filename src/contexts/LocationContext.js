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

  useEffect(() => {
  // Only check if permission was previously granted
  const checkPreviousPermission = async () => {
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (result.state === 'granted') {
          // Only auto-fetch if previously granted
          requestLocation();
        } else {
          setLocationPermission('prompt');
        }
      } catch (error) {
        setLocationPermission('prompt');
      }
    }
  };
  
  checkPreviousPermission();
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