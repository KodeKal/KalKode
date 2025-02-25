// src/components/TabPositioner/index.js

import React from 'react';
import styled from 'styled-components';
import { DEFAULT_THEME } from '../../../../theme/theme';

const TabContainer = styled.div`
  position: fixed;
  ${props => props.position === 'bottom' ? 'bottom: 2rem;' : 'top: 2rem;'}
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2rem;
  padding: 1rem 2rem;
  z-index: 100;
  background: transparent;
`;

const Tab = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.active ? 
    props.theme?.colors?.accent : 
    `${props.theme?.colors?.text}80`};
  font-family: ${props => props.theme?.fonts?.heading};
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${props => props.active ? '100%' : '0%'};
    height: 2px;
    background: ${props => props.theme?.colors?.accent};
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const TabPositioner = ({ 
  position, 
  onPositionChange, 
  activeTab, 
  onTabChange, 
  tabs, 
  theme,
  actionButton,
  isEditing = false // New prop to determine if position selector should be shown
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <TabContainer position={position} theme={theme}>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            theme={theme}
          >
            {tab.label}
          </Tab>
        ))}
      </TabContainer>
      {actionButton && actionButton} {/* Render the action button if provided */}
    </div>
  );
};

export default TabPositioner;