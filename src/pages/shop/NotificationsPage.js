// src/pages/shop/NotificationsPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Bell, 
  ShoppingCart, 
  MessageCircle, 
  Check, 
  X, 
  Clock,
  Package,
  User
} from 'lucide-react';
import { auth, db } from '../../firebase/config';
import { collection, query, orderBy, where, onSnapshot } from 'firebase/firestore';
import NotificationService from '../../services/NotificationService';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #0B0B3B, #1A1A4C);
  color: #FFFFFF;
`;

const NotificationsHeader = styled.div`
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

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationCard = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border: 1px solid ${props => props.unread ? 'rgba(128, 0, 0, 0.6)' : 'rgba(128, 0, 0, 0.3)'};
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(128, 0, 0, 0.8);
    background: rgba(0, 0, 0, 0.5);
  }
  
  .notification-dot {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #800000;
    display: ${props => props.unread ? 'block' : 'none'};
  }

  .icon-container {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(128, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #800000;
    flex-shrink: 0;
  }
  
  .content {
    flex: 1;
    
    .title {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .message {
      opacity: 0.8;
      font-size: 0.9rem;
    }
    
    .time {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      opacity: 0.6;
    }
  }
  
  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
    
    &.transaction {
      background: rgba(33, 150, 243, 0.2);
      color: #2196F3;
    }
    
    &.message {
      background: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }
    
    &.system {
      background: rgba(255, 152, 0, 0.2);
      color: #FF9800;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.7);
  
  .icon {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    margin-bottom: 1rem;
  }
`;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    
    // Set up real-time listener for notifications
    const unsubscribe = NotificationService.setupNotificationsListener(
      auth.currentUser.uid,
      (newNotifications) => {
        setNotifications(newNotifications);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read
      await NotificationService.markNotificationAsRead(notification);
      
      // Navigate based on notification type
      if (notification.type === 'transaction') {
        navigate(`/transactions?id=${notification.id}`);
      } else if (notification.type === 'message') {
        navigate(`/messages?chat=${notification.id}`);
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <PageContainer>
      <NotificationsHeader>
        <HeaderContent>
          <Bell size={24} />
          <h1>Notifications</h1>
        </HeaderContent>
      </NotificationsHeader>

      <NotificationsContent>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              margin: '0 auto', 
              border: '3px solid rgba(128, 0, 0, 0.1)', 
              borderRadius: '50%', 
              borderTopColor: '#800000', 
              animation: 'spin 1s linear infinite' 
            }}></div>
            <p style={{ marginTop: '1rem', opacity: 0.7 }}>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState>
            <div className="icon">
              <Bell size={48} />
            </div>
            <h3>No notifications yet</h3>
            <p>You'll see your notifications here when you get them</p>
          </EmptyState>
        ) : (
          <NotificationsList>
            {notifications.map(notification => (
              <NotificationCard 
                key={notification.id}
                unread={notification.unread}
                onClick={() => navigate(`/messages?chat=${notification.id}`)}
              >
                <div className="notification-dot" />
                
                <div className="icon-container">
                  {notification.type === 'transaction' ? (
                    <ShoppingCart size={24} />
                  ) : notification.type === 'message' ? (
                    <MessageCircle size={24} />
                  ) : (
                    <Bell size={24} />
                  )}
                </div>
                
                <div className="content">
                  <div className="title">{notification.title}</div>
                  <div className="message">{notification.message}</div>
                  <div className="time">{formatTime(notification.timestamp)}</div>
                </div>
                
                <div className={`badge ${notification.type}`}>
                  {notification.type}
                </div>
              </NotificationCard>
            ))}
          </NotificationsList>
        )}
      </NotificationsContent>
    </PageContainer>
  );
};

export default NotificationsPage;