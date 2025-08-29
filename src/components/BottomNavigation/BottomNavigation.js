// src/components/BottomNavigation/BottomNavigation.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Home,
  MessageCircle,
  Bell,
  User,
  Store
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const BottomNavContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: ${props => `${props.theme?.colors?.background || '#000000'}F5`};
  backdrop-filter: blur(20px);
  border-top: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}30`};
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 1rem;
  z-index: 1000;
  
  /* Only show on mobile */
  @media (min-width: 769px) {
    display: none;
  }
`;

const NavButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: ${props => props.active ? 
    props.theme?.colors?.accent || '#800000' : 
    `${props.theme?.colors?.text || '#FFFFFF'}80`
  };
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  min-width: 50px;
  
  &:active {
    transform: scale(0.95);
  }
  
  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2px;
    position: relative;
  }
  
  .label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    opacity: ${props => props.active ? 1 : 0.8};
  }
  
  .notification-dot {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.theme?.colors?.accent || '#800000'};
    display: ${props => props.hasNotification ? 'block' : 'none'};
    border: 2px solid ${props => props.theme?.colors?.background || '#000000'};
  }
  
  /* Active state indicator */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: ${props => props.active ? '4px' : '0'};
    height: 3px;
    background: ${props => props.theme?.colors?.accent || '#800000'};
    border-radius: 2px 2px 0 0;
    transition: width 0.3s ease;
  }
`;

const BottomNavigation = ({ theme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth(); // Add user to destructuring
  const [unreadMessages, setUnreadMessages] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(false);

  const defaultTheme = {
    colors: {
      background: '#000000',
      text: '#FFFFFF',
      accent: '#800000'
    }
  };

  const navTheme = theme || defaultTheme;

  // Check for unread messages
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const userId = auth.currentUser.uid;
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let hasUnread = false;
      
      snapshot.docs.forEach(doc => {
        const chat = doc.data();
        if (chat.unreadCount && chat.unreadCount[userId] && chat.unreadCount[userId] > 0) {
          hasUnread = true;
        }
      });
      
      setUnreadMessages(hasUnread);
    });
    
    return () => unsubscribe();
  }, []);

  // Check for unread notifications (placeholder - implement based on your notification system)
  useEffect(() => {
    if (!auth.currentUser) return;
    
    // TODO: Implement notification checking logic
    setUnreadNotifications(false);
  }, []);

  const navigationItems = [
    {
      icon: <Home size={22} />,
      label: 'Home',
      path: '/',
      key: 'home',
      showAlways: true
    },
    {
      icon: <Store size={22} />,
      label: 'My Shop',
      path: user?.uid ? `/shop/${user.uid}` : '/shop/create/template', // Fallback if no user
      key: 'shop',
      showAlways: false, // Only show when authenticated
      requiresAuth: true
    },
    {
      icon: <MessageCircle size={22} />,
      label: 'Messages',
      path: '/messages',
      key: 'messages',
      hasNotification: unreadMessages,
      showAlways: true
    },
    {
      icon: <Bell size={22} />,
      label: 'Notifications',
      path: '/notifications',
      key: 'notifications',
      hasNotification: unreadNotifications,
      showAlways: true
    },
    {
      icon: <User size={22} />,
      label: 'Profile',
      path: '/profile',
      key: 'profile',
      showAlways: true
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isPathActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Filter items based on authentication status
  const visibleItems = navigationItems.filter(item => {
    if (item.showAlways) return true;
    if (item.requiresAuth) return isAuthenticated;
    return true;
  });

  return (
    <BottomNavContainer theme={navTheme}>
      {visibleItems.map((item) => (
        <NavButton
          key={item.key}
          theme={navTheme}
          active={isPathActive(item.path)}
          onClick={() => handleNavigation(item.path)}
          hasNotification={item.hasNotification}
        >
          <div className="icon-container">
            {item.icon}
            {item.hasNotification && <div className="notification-dot"></div>}
          </div>
          <span className="label">{item.label}</span>
        </NavButton>
      ))}
    </BottomNavContainer>
  );
};

export default BottomNavigation;