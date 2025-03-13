// In src/pages/shop/components/NavMenu/index.js

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Settings, 
  User, 
  LayoutDashboard, 
  LogOut,
  Bell,
  Home,
  Layout,
  MessageCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../../../../firebase/config';
import { DEFAULT_THEME } from '../../../../theme/theme';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

const NavContainer = styled.div`
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  background: ${props => `${props.theme?.colors?.background || '#000000'}CC`};
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}30`};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 100;
  width: auto;

  &:hover {
    .label {
      opacity: 1;
      width: auto;
      padding-left: 0.5rem;
    }
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.8rem;
  background: ${props => props.active ? 
    `${props.theme?.colors?.accent || '#800000'}15` : 
    'transparent'
  };
  border: none;
  border-radius: 8px;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  cursor: pointer;
  width: auto;
  white-space: nowrap;
  position: relative;

  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
  }

  .label {
    opacity: 0;
    width: 0;
    overflow: hidden;
    transition: none;
  }
  
  .notification-badge {
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: ${props => props.theme?.colors?.accent || '#800000'};
    display: ${props => props.hasNotification ? 'block' : 'none'};
  }
`;

const NavMenu = ({ theme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadMessages, setUnreadMessages] = useState(false);
  const defaultTheme = {
    colors: {
      background: '#0B0B3B',
      text: '#FFFFFF',
      accent: '#800000'
    }
  };

  const menuTheme = theme || defaultTheme;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Check for unread messages
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const userId = auth.currentUser.uid;
    
    // Create a query to check for chats with unread messages
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

  // Updated menu items with unread indicator
  const menuItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Home', 
      path: '/'  // Changed from shop path to home path
    },
    { 
      icon: <LayoutDashboard size={20} />, 
      label: 'Dashboard', 
      path: '/shop/dashboard'
    },
    {
      icon: <MessageCircle size={20} />,
      label: 'Messages',
      path: '/messages',
      hasNotification: unreadMessages
    },
    { 
      icon: <Bell size={20} />, 
      label: 'Notifications', 
      path: '/notifications'
    },
    { 
      icon: <User size={20} />, 
      label: 'Profile', 
      path: '/profile'
    }
  ];

  return (
    <NavContainer theme={menuTheme}>
      {menuItems.map((item) => (
        <NavButton 
          key={item.path}
          theme={theme}
          active={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
          onClick={() => navigate(item.path)}
          hasNotification={item.hasNotification}
        >
          <div className="icon-container">
            {item.icon}
          </div>
          <span className="label">{item.label}</span>
          {item.hasNotification && <div className="notification-badge"></div>}
        </NavButton>
      ))}
      
      <NavButton theme={theme} onClick={handleLogout}>
        <div className="icon-container">
          <LogOut size={20} />
        </div>
        <span className="label">Logout</span>
      </NavButton>
    </NavContainer>
  );
};

export default NavMenu;