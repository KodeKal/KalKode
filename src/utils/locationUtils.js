// src/utils/locationUtils.js

import { getDistance } from 'geolib';

export const LocationFormat = {
  standardize: (coordinates) => {
    if (!coordinates) return null;
    
    const lat = coordinates.lat || coordinates.latitude;
    const lng = coordinates.lng || coordinates.longitude;
    
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return null;
    }

    return {
      lat,
      lng
    };
  },

  calculateDistance: (coords1, coords2) => {
    const point1 = LocationFormat.standardize(coords1);
    const point2 = LocationFormat.standardize(coords2);
    
    if (!point1 || !point2) return null;

    return getDistance(
      { latitude: point1.lat, longitude: point1.lng },
      { latitude: point2.lat, longitude: point2.lng }
    );
  },

  formatDistance: (meters) => {
    if (!meters) return '';
    const miles = (meters / 1609.34).toFixed(1);
    return miles === "0.0" ? 
      'Less than a mile away' : 
      `${miles} ${miles === "1.0" ? 'mile' : 'miles'} away`;
  },

  obfuscate: (coordinates) => {
    if (!coordinates) return null;
    
    const point = LocationFormat.standardize(coordinates);
    if (!point) return null;
    
    // Random angle and distance
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * OBFUSCATION_RADIUS_METERS;
    
    // Calculate offset in degrees (rough approximation)
    const latOffset = (distance * Math.cos(angle)) / 111320;
    const lngOffset = (distance * Math.sin(angle)) / (111320 * Math.cos(point.lat * Math.PI / 180));
    
    return {
      lat: point.lat + latOffset,
      lng: point.lng + lngOffset,
      isObfuscated: true
    };
  },
  
  // ADD: Validate address format
  validateAddress: (address) => {
    if (!address || address.trim().length < 5) return false;
    
    // Check if it's coordinates
    const coordsMatch = address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }
    
    // Basic address validation (has some alphanumeric)
    return /[a-zA-Z0-9]{3,}/.test(address);
  },
  
  // ADD: Distance cache
  _distanceCache: new Map(),
  
  getCachedDistance: (coords1, coords2) => {
    const key = `${coords1.lat},${coords1.lng}-${coords2.lat},${coords2.lng}`;
    
    if (LocationFormat._distanceCache.has(key)) {
      return LocationFormat._distanceCache.get(key);
    }
    
    const distance = LocationFormat.calculateDistance(coords1, coords2);
    LocationFormat._distanceCache.set(key, distance);
    
    // Clear cache if too large
    if (LocationFormat._distanceCache.size > 1000) {
      LocationFormat._distanceCache.clear();
    }
    
    return distance;
  },
  
  // ADD: Privacy level helpers
  getLocationByPrivacy: (item, privacyLevel = 'neighborhood') => {
    if (!item.coordinates) return null;
    
    switch(privacyLevel) {
      case 'exact':
        return null; // Never show exact publicly
      case 'neighborhood':
        return LocationFormat.obfuscate(item.coordinates);
      case 'city':
        return null; // Would need geocoding service
      default:
        return LocationFormat.obfuscate(item.coordinates);
    }
  }
};

