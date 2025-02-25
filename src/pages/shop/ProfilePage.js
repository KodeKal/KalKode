// src/pages/shop/ProfilePage.js
import React from 'react';
import styled from 'styled-components';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #0B0B3B, #1A1A4C);
  color: #FFFFFF;
`;

const ProfileHeader = styled.header`
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(128, 0, 0, 0.3);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;

  h1 {
    font-size: 1.8rem;
    color: #FFFFFF;
  }
`;

const ProfileContent = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const ProfileCard = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(128, 0, 0, 0.3);

  h2 {
    margin-bottom: 1rem;
    color: rgba(255, 255, 255, 0.9);
  }
`;

const ProfileInfo = styled.div`
  display: grid;
  gap: 1rem;
  
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
    }
    
    .value {
      color: #FFFFFF;
    }
  }
`;

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <PageContainer>
      <ProfileHeader>
        <HeaderContent>
          <User size={24} />
          <h1>Profile</h1>
        </HeaderContent>
      </ProfileHeader>

      <ProfileContent>
        <ProfileCard>
          <h2>Account Information</h2>
          <ProfileInfo>
            <div className="info-item">
              <label>Email</label>
              <div className="value">{user?.email}</div>
            </div>
            <div className="info-item">
              <label>Account Created</label>
              <div className="value">
                {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </ProfileInfo>
        </ProfileCard>
      </ProfileContent>

    </PageContainer>
  );
};

export default ProfilePage;