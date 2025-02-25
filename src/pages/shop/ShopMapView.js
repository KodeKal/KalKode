// Save this file at: src/pages/ShopMapView.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import 'leaflet/dist/leaflet.css';
import { getCoordinatesFromZip } from '../services/locationService';

const MapPageContainer = styled.div`
  min-height: 100vh;
  background: #000000;
  color: #FFFFFF;
`;

const MapWrapper = styled.div`
  width: 100%;
  height: calc(100vh - 80px);
  margin-top: 80px;

  .leaflet-container {
    width: 100%;
    height: 100%;
  }

  .leaflet-popup-content-wrapper {
    background: rgba(0, 0, 0, 0.8);
    color: white;
  }

  .leaflet-popup-tip {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 1000;
  border-bottom: 1px solid rgba(128, 0, 0, 0.3);
`;

const ShopMapView = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopsRef = collection(db, 'shops');
        const snapshot = await getDocs(shopsRef);
        
        const shopsData = await Promise.all(snapshot.docs.map(async doc => {
          const data = doc.data();
          if (data.location?.zipCode) {
            const coordinates = await getCoordinatesFromZip(data.location.zipCode);
            return {
              id: doc.id,
              ...data,
              coordinates
            };
          }
          return null;
        }));

        setShops(shopsData.filter(Boolean));
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <MapPageContainer>
      <Header>
        <div onClick={() => navigate('/')}>KALKODE</div>
      </Header>
      
      <MapWrapper>
        <MapContainer 
          center={[39.8283, -98.5795]} // Center of US
          zoom={4}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {shops.map(shop => (
            shop.coordinates && (
              <Marker
                key={shop.id}
                position={[shop.coordinates.lat, shop.coordinates.lng]}
              >
                <Popup>
                  <div style={{ color: 'white', padding: '0.5rem' }}>
                    <h3>{shop.name}</h3>
                    <p>{shop.description}</p>
                    <button onClick={() => navigate(`/shop/${shop.id}`)}>
                      View Shop
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </MapWrapper>
    </MapPageContainer>
  );
};

export default ShopMapView;