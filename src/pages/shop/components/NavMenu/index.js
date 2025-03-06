// src/pages/shop/components/NavMenu/index.js

import React from 'react';
import styled from 'styled-components';
import { 
  Settings, 
  User, 
  LayoutDashboard, 
  LogOut,
  Bell,
  Home,
  Layout,
  MessageCircle // Added MessageCircle icon
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../../../firebase/config';
import { DEFAULT_THEME } from '../../../../theme/theme';

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
`;

const NavMenu = ({ theme }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Updated menu items to include Messages
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
      path: '/messages'
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
        >
          <div className="icon-container">
            {item.icon}
          </div>
          <span className="label">{item.label}</span>
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