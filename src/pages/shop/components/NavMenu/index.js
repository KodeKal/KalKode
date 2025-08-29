// Updated src/pages/shop/components/NavMenu/index.js - Desktop Only Version

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Settings, 
  User, 
  LayoutDashboard, 
  LogOut,
  Bell,
  Home,
  MessageCircle,
  Store
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../../../../firebase/config';
import { DEFAULT_THEME } from '../../../../theme/theme';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const NavContainer = styled.div`
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  height: auto;
  width: auto;
  background: ${props => `${props.theme?.colors?.background || '#000000'}CC`};
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}30`};
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: none;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);

  &:hover {
    .label {
      opacity: 1;
      width: auto;
      padding-left: 0.5rem;
    }
  }

  /* Hide completely on mobile and tablet since we use bottom nav */
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.8rem;
  background: ${props => props.active ? 
    `${props.theme?.colors?.accent || '#800000'}15` : 
    'transparent'
  };
  border: none;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  cursor: pointer;
  width: 100%;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 8px;

  &:hover {
    background: ${props => `${props.theme?.colors?.accent || '#800000'}10`};
    transform: translateX(-2px);
  }

  .icon-container {
    margin-right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
  }

  .label {
    opacity: 0;
    width: 0;
    overflow: hidden;
    transition: all 0.3s ease;
    margin-left: 0;
    white-space: nowrap;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .notification-badge {
    position: absolute;
    top: 0.4rem;
    left: 1.2rem;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: ${props => props.theme?.colors?.accent || '#800000'};
    display: ${props => props.hasNotification ? 'block' : 'none'};
    border: 2px solid ${props => props.theme?.colors?.background || '#000000'};
  }
`;

const LogoutSection = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}20`};
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

  const menuItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Home', 
      path: '/'
    },
    { 
      icon: <Store size={20} />, 
      label: 'My Shop', 
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

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <NavContainer theme={menuTheme}>
      <NavButtonsContainer>
        {menuItems.map((item) => (
          <NavButton 
            key={item.path}
            theme={menuTheme}
            active={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
            onClick={() => handleNavigation(item.path)}
            hasNotification={item.hasNotification}
            title={item.label}
          >
            <div className="icon-container">
              {item.icon}
            </div>
            <span className="label">{item.label}</span>
            {item.hasNotification && <div className="notification-badge"></div>}
          </NavButton>
        ))}
      </NavButtonsContainer>
      
      <LogoutSection theme={menuTheme}>
        <NavButton theme={menuTheme} onClick={handleLogout} title="Logout">
          <div className="icon-container">
            <LogOut size={20} />
          </div>
          <span className="label">Logout</span>
        </NavButton>
      </LogoutSection>
    </NavContainer>
  );
};

export default NavMenu;