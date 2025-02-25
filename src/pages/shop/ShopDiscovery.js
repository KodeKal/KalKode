// Save this file at: src/pages/ShopDiscovery.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import MapView from '../components/Map/MapView';

const DiscoveryContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#000000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: ${props => props.theme?.colors?.accent};
  }
`;

const ShopDiscovery = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopsRef = collection(db, 'shops');
        const q = query(shopsRef, where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);
        
        const shopsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setShops(shopsData);
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const handleShopClick = (shopId) => {
    navigate(`/shop/${shopId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DiscoveryContainer>
      <Header>
        <h1>Discover Shops</h1>
        <p>Find unique creators in your area</p>
      </Header>
      
      <MapView 
        shops={shops} 
        onShopClick={handleShopClick}
      />
    </DiscoveryContainer>
  );
};

export default ShopDiscovery;