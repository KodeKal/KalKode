// src/pages/shop/ShopDashboard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Store, 
  Package, 
  Users, 
  Settings, 
  ChevronRight,
  BarChart2,
  Edit3,
  Eye
} from 'lucide-react';
import { getShopData } from '../../firebase/firebaseService';
import { useAuth } from '../../contexts/AuthContext';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #0B0B3B, #1A1A4C);
  color: #FFFFFF;
`;

const DashboardHeader = styled.header`
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(128, 0, 0, 0.3);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ShopName = styled.h1`
  font-size: 1.8rem;
  background: linear-gradient(45deg, #800000, #4A0404);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const DashboardContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(128, 0, 0, 0.3);

  h3 {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .value {
    font-size: 1.8rem;
    font-weight: bold;
  }

  .change {
    color: ${props => props.increase ? '#4CAF50' : '#FF4444'};
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ActionCard = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(128, 0, 0, 0.3);
  cursor: pointer;

  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
`;

const ViewShopButton = styled.button`
  background: linear-gradient(45deg, #800000, #4A0404);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

// Add after existing styled components (around line 140)
const SettingsSection = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
  border: 1px solid rgba(128, 0, 0, 0.3);
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const SettingsCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    color: #FFFFFF;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
`;

const SettingsInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #800000;
  }
`;

const SettingsSelect = styled.select`
  width: 100%;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #800000;
  }

  option {
    background: #1A1A4C;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(45deg, #800000, #4A0404);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ShopDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shopData, setShopData] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [settingsData, setSettingsData] = useState({
    shopName: '',
    description: '',
    email: '',
    phone: '',
    location: '',
    visibility: 'public',
    theme: 'default',
    businessHours: '',
    shippingPreferences: '',
    paymentMethods: []
  });

  useEffect(() => {
    const fetchShopData = async () => {
      if (user) {
        try {
          const data = await getShopData(user.uid);
          setShopData(data);
        } catch (error) {
          console.error('Error fetching shop data:', error);
        }
      }
    };

    fetchShopData();
  }, [user]);

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderContent>
          <ShopName>{shopData?.shopName || 'My Shop'}</ShopName>
          <ViewShopButton onClick={() => navigate(`/shop/${user.uid}`)}>
            <Eye size={18} />
            View Shop
          </ViewShopButton>
        </HeaderContent>
      </DashboardHeader>

      <DashboardContent>
        <StatsGrid>
          <StatCard>
            <h3><Package size={16} /> Total Items</h3>
            <div className="value">{shopData?.items?.length || 0}</div>
          </StatCard>
          <StatCard>
            <h3><Users size={16} /> Visitors</h3>
            <div className="value">0</div>
          </StatCard>
          <StatCard increase>
            <h3><BarChart2 size={16} /> Shop Views</h3>
            <div className="value">0</div>
            <div className="change">+0% this week</div>
          </StatCard>
        </StatsGrid>

        <ActionsGrid>
          <ActionCard onClick={() => setShowSettings(!showSettings)}>
            <h3><Settings size={20} /> Shop Settings</h3>
            <p>Manage your shop's settings and preferences</p>
          </ActionCard>
            
          {showSettings && (
            <SettingsSection>
              <h2 style={{ marginBottom: '2rem' }}>Shop Settings</h2>
              <SettingsGrid>
                <SettingsCard>
                  <h3>Basic Information</h3>
                  <SettingsInput
                    placeholder="Shop Name"
                    value={settingsData.shopName}
                    onChange={(e) => setSettingsData(prev => ({
                      ...prev,
                      shopName: e.target.value
                    }))}
                  />
                  <SettingsInput
                    placeholder="Email"
                    type="email"
                    value={settingsData.email}
                    onChange={(e) => setSettingsData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                  />
                  <SettingsInput
                    placeholder="Phone"
                    type="tel"
                    value={settingsData.phone}
                    onChange={(e) => setSettingsData(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                  />
                </SettingsCard>
                  
                <SettingsCard>
                  <h3>Privacy & Visibility</h3>
                  <SettingsSelect
                    value={settingsData.visibility}
                    onChange={(e) => setSettingsData(prev => ({
                      ...prev,
                      visibility: e.target.value
                    }))}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                  </SettingsSelect>
                </SettingsCard>
                  
                <SettingsCard>
                  <h3>Operational Settings</h3>
                  <SettingsInput
                    placeholder="Business Hours"
                    value={settingsData.businessHours}
                    onChange={(e) => setSettingsData(prev => ({
                      ...prev,
                      businessHours: e.target.value
                    }))}
                  />
                  <SettingsInput
                    placeholder="Shipping Preferences"
                    value={settingsData.shippingPreferences}
                    onChange={(e) => setSettingsData(prev => ({
                      ...prev,
                      shippingPreferences: e.target.value
                    }))}
                  />
                </SettingsCard>
              </SettingsGrid>
              <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <SaveButton>
                  Save Changes
                </SaveButton>
              </div>
            </SettingsSection>
          )}
          
          <ActionCard onClick={() => navigate('/shop/edit/design')}>
            <h3><Edit3 size={20} /> Customize Design</h3>
            <p>Update your shop's look and feel</p>
          </ActionCard>
        </ActionsGrid>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default ShopDashboard;
