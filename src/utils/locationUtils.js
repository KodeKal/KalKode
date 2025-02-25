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
  }
};