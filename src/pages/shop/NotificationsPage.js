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
  User,
  Mail,
  Settings,
  Send,
  AlertCircle
} from 'lucide-react';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import NotificationService from '../../services/NotificationService';
import EmailNotificationService from '../../services/EmailNotificationService';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #0B0B3B, #1A1A4C);
  color: #FFFFFF;
  padding-bottom: 100px;
  
  @media (max-width: 768px) {
    padding-bottom: 120px; /* Extra padding for mobile bottom nav */
  }
`;

const NotificationsHeader = styled.div`
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(128, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .left-section {
    display: flex;
    align-items: center;
    gap: 1rem;

    h1 {
      font-size: 1.8rem;
      color: #FFFFFF;
      margin: 0;

      @media (max-width: 768px) {
        font-size: 1.4rem;
      }
    }
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }
`;

const NotificationsContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(128, 0, 0, 0.2);
`;

const Tab = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.active ? '#800000' : 'rgba(255, 255, 255, 0.6)'};
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid ${props => props.active ? '#800000' : 'transparent'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};

  &:hover {
    color: #800000;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
`;

const EmailSettingsCard = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(128, 0, 0, 0.3);
  padding: 2rem;
  margin-bottom: 2rem;

  h2 {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    color: #FFFFFF;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const ToggleSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 1rem;

  .toggle-info {
    flex: 1;

    .toggle-label {
      font-weight: bold;
      margin-bottom: 0.25rem;
    }

    .toggle-description {
      font-size: 0.9rem;
      opacity: 0.7;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.2);
    transition: 0.4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 22px;
      width: 22px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }

  input:checked + .slider {
    background-color: #800000;
  }

  input:checked + .slider:before {
    transform: translateX(30px);
  }
`;

const NotificationPreferences = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const PreferenceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .preference-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
`;

const TestEmailSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 8px;

  h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #2196F3;
  }

  .test-description {
    margin-bottom: 1rem;
    opacity: 0.9;
  }

  button {
    background: #2196F3;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;

    &:hover:not(:disabled) {
      background: #1976D2;
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
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

const StatusMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &.success {
    background: rgba(76, 175, 80, 0.2);
    color: #4CAF50;
    border: 1px solid rgba(76, 175, 80, 0.3);
  }
  
  &.error {
    background: rgba(244, 67, 54, 0.2);
    color: #F44336;
    border: 1px solid rgba(244, 67, 54, 0.3);
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const navigate = useNavigate();
  
  // Email preferences state
  const [emailPreferences, setEmailPreferences] = useState({
    emailNotificationsEnabled: true,
    notificationPreferences: {
      newMessages: true,
      orderRequests: true,
      orderUpdates: true,
      paymentConfirmations: true,
      transactionComplete: true,
      promotions: false,
      weeklyDigest: false
    }
  });

  // Load notifications and preferences
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Load email preferences
        const prefs = await EmailNotificationService.getUserEmailPreferences(auth.currentUser.uid);
        if (prefs) {
          setEmailPreferences(prefs);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
      
      // Set up notifications listener
      const unsubscribe = NotificationService.setupNotificationsListener(
        auth.currentUser.uid,
        (newNotifications) => {
          setNotifications(newNotifications);
          setLoading(false);
        }
      );
      
      return unsubscribe;
    };
    
    loadData();
  }, []);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      await NotificationService.markNotificationAsRead(notification.id);
      
      // Navigate based on type
      if (notification.data?.transactionId) {
        navigate(`/messages?chat=${notification.data.transactionId}`);
      } else if (notification.data?.chatId) {
        navigate(`/messages?chat=${notification.data.chatId}`);
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  // Toggle email notifications
  const toggleEmailNotifications = async () => {
    const newValue = !emailPreferences.emailNotificationsEnabled;
    setEmailPreferences(prev => ({
      ...prev,
      emailNotificationsEnabled: newValue
    }));
    
    // Auto-save this setting
    try {
      setSaving(true);
      await EmailNotificationService.updateEmailPreferences(auth.currentUser.uid, {
        ...emailPreferences,
        emailNotificationsEnabled: newValue
      });
      setStatusMessage({ type: 'success', text: `Email notifications ${newValue ? 'enabled' : 'disabled'}` });
    } catch (error) {
      console.error('Error updating preferences:', error);
      setStatusMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Toggle specific preference
  const togglePreference = async (key) => {
    const newPrefs = {
      ...emailPreferences.notificationPreferences,
      [key]: !emailPreferences.notificationPreferences[key]
    };
    
    setEmailPreferences(prev => ({
      ...prev,
      notificationPreferences: newPrefs
    }));
    
    // Auto-save
    try {
      setSaving(true);
      await EmailNotificationService.updateEmailPreferences(auth.currentUser.uid, {
        ...emailPreferences,
        notificationPreferences: newPrefs
      });
      setStatusMessage({ type: 'success', text: 'Preferences updated' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      setStatusMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Send test email
  const sendTestEmail = async () => {
    try {
      setTestEmailSending(true);
      const result = await EmailNotificationService.sendTestEmail(auth.currentUser.uid);
      
      if (result.success) {
        setStatusMessage({ type: 'success', text: 'Test email sent! Check your inbox.' });
      } else {
        setStatusMessage({ type: 'error', text: result.error || 'Failed to send test email' });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      setStatusMessage({ type: 'error', text: 'Failed to send test email' });
    } finally {
      setTestEmailSending(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  // Format timestamp
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
          <div className="left-section">
            <Bell size={24} />
            <h1>Notifications</h1>
          </div>
        </HeaderContent>
      </NotificationsHeader>

      <NotificationsContent>
        {statusMessage && (
          <StatusMessage className={statusMessage.type}>
            {statusMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {statusMessage.text}
          </StatusMessage>
        )}

        <TabContainer>
          <Tab 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </Tab>
          <Tab 
            active={activeTab === 'email-settings'} 
            onClick={() => setActiveTab('email-settings')}
          >
            Email Settings
          </Tab>
        </TabContainer>

        {activeTab === 'notifications' ? (
          loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <LoadingSpinner />
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
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-dot" />
                  
                  <div className="icon-container">
                    {notification.type === 'transaction' || notification.type.includes('order') ? (
                      <ShoppingCart size={24} />
                    ) : notification.type === 'message' || notification.type === 'new_message' ? (
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
                  
                  <div className={`badge ${notification.type.includes('order') ? 'transaction' : notification.type}`}>
                    {notification.type.replace('_', ' ')}
                  </div>
                </NotificationCard>
              ))}
            </NotificationsList>
          )
        ) : (
          <div>
            <EmailSettingsCard>
              <h2>
                <Mail size={24} />
                Email Notification Settings
              </h2>

              <ToggleSection>
                <div className="toggle-info">
                  <div className="toggle-label">Enable Email Notifications</div>
                  <div className="toggle-description">
                    Receive important updates and notifications via email
                  </div>
                </div>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={emailPreferences.emailNotificationsEnabled}
                    onChange={toggleEmailNotifications}
                    disabled={saving}
                  />
                  <span className="slider"></span>
                </ToggleSwitch>
              </ToggleSection>

              {emailPreferences.emailNotificationsEnabled && (
                <>
                  <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                    Notification Types
                  </h3>
                  
                  <NotificationPreferences>
                    <PreferenceItem>
                      <div className="preference-label">
                        <MessageCircle size={16} />
                        New Messages
                      </div>
                      <ToggleSwitch>
                        <input
                          type="checkbox"
                          checked={emailPreferences.notificationPreferences.newMessages}
                          onChange={() => togglePreference('newMessages')}
                          disabled={saving}
                        />
                        <span className="slider"></span>
                      </ToggleSwitch>
                    </PreferenceItem>

                    <PreferenceItem>
                      <div className="preference-label">
                        <ShoppingCart size={16} />
                        Order Requests
                      </div>
                      <ToggleSwitch>
                        <input
                          type="checkbox"
                          checked={emailPreferences.notificationPreferences.orderRequests}
                          onChange={() => togglePreference('orderRequests')}
                          disabled={saving}
                        />
                        <span className="slider"></span>
                      </ToggleSwitch>
                    </PreferenceItem>

                    <PreferenceItem>
                      <div className="preference-label">
                        <Package size={16} />
                        Order Updates
                      </div>
                      <ToggleSwitch>
                        <input
                          type="checkbox"
                          checked={emailPreferences.notificationPreferences.orderUpdates}
                          onChange={() => togglePreference('orderUpdates')}
                          disabled={saving}
                        />
                        <span className="slider"></span>
                      </ToggleSwitch>
                    </PreferenceItem>

                    <PreferenceItem>
                      <div className="preference-label">
                        <Check size={16} />
                        Payment Confirmations
                      </div>
                      <ToggleSwitch>
                        <input
                          type="checkbox"
                          checked={emailPreferences.notificationPreferences.paymentConfirmations}
                          onChange={() => togglePreference('paymentConfirmations')}
                          disabled={saving}
                        />
                        <span className="slider"></span>
                      </ToggleSwitch>
                    </PreferenceItem>

                    <PreferenceItem>
                      <div className="preference-label">
                        <Check size={16} />
                        Transaction Complete
                      </div>
                      <ToggleSwitch>
                        <input
                          type="checkbox"
                          checked={emailPreferences.notificationPreferences.transactionComplete}
                          onChange={() => togglePreference('transactionComplete')}
                          disabled={saving}
                        />
                        <span className="slider"></span>
                      </ToggleSwitch>
                    </PreferenceItem>

                    <PreferenceItem>
                      <div className="preference-label">
                        <Bell size={16} />
                        Weekly Digest
                      </div>
                      <ToggleSwitch>
                        <input
                          type="checkbox"
                          checked={emailPreferences.notificationPreferences.weeklyDigest}
                          onChange={() => togglePreference('weeklyDigest')}
                          disabled={saving}
                        />
                        <span className="slider"></span>
                      </ToggleSwitch>
                    </PreferenceItem>
                  </NotificationPreferences>

                  <TestEmailSection>
                    <h3>
                      <Send size={20} />
                      Test Email Notifications
                    </h3>
                    <div className="test-description">
                      Send a test email to verify your email notifications are working correctly.
                    </div>
                    <button onClick={sendTestEmail} disabled={testEmailSending}>
                      {testEmailSending ? (
                        <>
                          <LoadingSpinner />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Test Email
                        </>
                      )}
                    </button>
                  </TestEmailSection>
                </>
              )}
            </EmailSettingsCard>
          </div>
        )}
      </NotificationsContent>
    </PageContainer>
  );
};

export default NotificationsPage;