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
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../../../../firebase/config';
import { DEFAULT_THEME } from '../../../../theme/theme';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

const NavContainer = styled.div`
  position: fixed;
  right: ${props => props.isOpen ? '0' : '-80px'};
  top: 50%; /* Center vertically */
  transform: translateY(-50%); /* Perfect center alignment */
  height: 50vh; /* Keep same height */
  width: 80px;
  background: ${props => `${props.theme?.colors?.background || '#000000'}F5`};
  backdrop-filter: blur(20px);
  border-left: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}30`};
  border-top: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}30`};
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}30`};
  border-radius: 12px 0 0 12px; /* Round left corners */
  display: flex;
  flex-direction: column;
  z-index: 1050;
  transition: right 0.3s ease-in-out;
  box-shadow: ${props => props.isOpen ? '-5px 0 20px rgba(0, 0, 0, 0.3)' : 'none'};

  /* Desktop styles */
  @media (min-width: 769px) {
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
    box-shadow: none;
    transition: none;
    z-index: 100;

    &:hover {
      .label {
        opacity: 1;
        width: auto;
        padding-left: 0.5rem;
      }
    }
  }
`;

const NavHeader = styled.div`
  padding: 1rem 0.5rem 0.5rem; /* Reduced padding for compact header */
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}20`};
  text-align: center;
  
  h2 {
    color: ${props => props.theme?.colors?.accent || '#800000'};
    font-family: ${props => props.theme?.fonts?.heading || 'Impact, sans-serif'};
    font-size: 0.7rem; /* Even smaller for compact design */
    margin: 0;
    letter-spacing: 1px;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    height: 40px; /* Reduced height */
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const NavButtonsContainer = styled.div`
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (min-width: 769px) {
    padding: 0;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 0.5rem; /* Slightly reduced padding for compact design */
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
  border-right: 3px solid ${props => props.active ? 
    props.theme?.colors?.accent || '#800000' : 
    'transparent'
  };

  &:hover {
    background: ${props => `${props.theme?.colors?.accent || '#800000'}10`};
  }

  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
  }

  .label {
    display: none; /* Never show labels on mobile */
  }
  
  .notification-badge {
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.theme?.colors?.accent || '#800000'};
    display: ${props => props.hasNotification ? 'block' : 'none'};
  }

  /* Desktop styles */
  @media (min-width: 769px) {
    padding: 0.8rem;
    border-radius: 8px;
    border-right: none;
    margin-right: 0;
    justify-content: flex-start;

    .icon-container {
      margin-right: 0;
    }

    .label {
      opacity: 0;
      width: 0;
      overflow: hidden;
      transition: none;
      margin-left: 0;
      display: block;
    }

    .notification-badge {
      top: 0.4rem;
      left: auto;
      right: 0.4rem;
      width: 0.5rem;
      height: 0.5rem;
    }
  }
`;

const ToggleButton = styled.button`
  position: fixed;
  right: ${props => props.isOpen ? '80px' : '0px'};
  top: 50%; /* Center vertically to align with drawer */
  transform: translateY(-50%); /* Perfect center alignment */
  width: 50px;
  height: 50px;
  background: ${props => `${props.theme?.colors?.background || '#000000'}F5`};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}30`};
  border-right: none;
  border-radius: 12px 0 0 12px; /* Round left corners */
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  cursor: pointer;
  z-index: 1051;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-in-out;
  box-shadow: ${props => props.isOpen ? 'none' : '-2px 0 10px rgba(0, 0, 0, 0.2)'};

  &:hover {
    background: ${props => `${props.theme?.colors?.accent || '#800000'}20`};
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  /* Hide on desktop */
  @media (min-width: 769px) {
    display: none;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1049; /* Just below nav container */
  opacity: ${props => props.isOpen ? 1 : 0};
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
  transition: opacity 0.3s ease;

  /* Hide on desktop */
  @media (min-width: 769px) {
    display: none;
  }
`;

const LogoutSection = styled.div`
  padding: 1rem 0;
  border-top: 1px solid ${props => `${props.theme?.colors?.accent || '#800000'}20`};

  @media (min-width: 769px) {
    padding: 0;
    border-top: none;
    margin-top: 0.5rem;
  }
`;

const NavMenu = ({ theme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadMessages, setUnreadMessages] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const defaultTheme = {
    colors: {
      background: '#0B0B3B',
      text: '#FFFFFF',
      accent: '#800000'
    }
  };

  const menuTheme = theme || defaultTheme;

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu on route change (mobile only)
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

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
      path: '/'
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

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <ToggleButton 
        theme={menuTheme}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </ToggleButton>

      {/* Mobile Overlay */}
      <Overlay 
        isOpen={isOpen && isMobile} 
        onClick={() => setIsOpen(false)} 
      />

      {/* Navigation Container */}
      <NavContainer theme={menuTheme} isOpen={isOpen || !isMobile}>
        {/* Mobile Header */}
        <NavHeader theme={menuTheme}>
          <h2>NAV</h2>
        </NavHeader>

        {/* Navigation Buttons */}
        <NavButtonsContainer>
          {menuItems.map((item) => (
            <NavButton 
              key={item.path}
              theme={menuTheme}
              active={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
              onClick={() => handleNavigation(item.path)}
              hasNotification={item.hasNotification}
            >
              <div className="icon-container">
                {item.icon}
              </div>
              <span className="label">{item.label}</span>
              {item.hasNotification && <div className="notification-badge"></div>}
            </NavButton>
          ))}
        </NavButtonsContainer>
        
        {/* Logout Section */}
        <LogoutSection theme={menuTheme}>
          <NavButton theme={menuTheme} onClick={handleLogout}>
            <div className="icon-container">
              <LogOut size={20} />
            </div>
            <span className="label">Logout</span>
          </NavButton>
        </LogoutSection>
      </NavContainer>
    </>
  );
};

export default NavMenu;