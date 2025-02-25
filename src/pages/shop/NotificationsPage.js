// src/pages/shop/NotificationsPage.js
import React from 'react';
import styled from 'styled-components';
import { Bell } from 'lucide-react';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #0B0B3B, #1A1A4C);
  color: #FFFFFF;
`;

const NotificationsHeader = styled.header`
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

const NotificationsContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.7);
  
  .icon {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

const NotificationsPage = () => {
  return (
    <PageContainer>
      <NotificationsHeader>
        <HeaderContent>
          <Bell size={24} />
          <h1>Notifications</h1>
        </HeaderContent>
      </NotificationsHeader>

      <NotificationsContent>
        <EmptyState>
          <div className="icon">
            <Bell size={48} />
          </div>
          <h2>No notifications yet</h2>
          <p>You'll see your notifications here when you get them</p>
        </EmptyState>
      </NotificationsContent>

    </PageContainer>
  );
};

export default NotificationsPage;