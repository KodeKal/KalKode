// src/pages/shop/components/EmptyState.js
import React from 'react';
import styled from 'styled-components';
import { MessageCircle } from 'lucide-react';

const EmptyContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  
  .icon-container {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(128, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    
    svg {
      color: #800000;
      opacity: 0.8;
    }
  }
  
  h3 {
    margin-bottom: 0.5rem;
    color: #800000;
    font-size: 1.2rem;
  }
  
  p {
    max-width: 300px;
    opacity: 0.8;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    display: ${props => props.isMobile && !props.hasSelectedChat ? 'flex' : 'none'};
    padding: 1.5rem;
    
    .icon-container {
      width: 60px;
      height: 60px;
      margin-bottom: 1rem;
      
      svg {
        width: 24px;
        height: 24px;
      }
    }
    
    h3 {
      font-size: 1.1rem;
    }
    
    p {
      font-size: 0.9rem;
      max-width: 250px;
    }
  }
`;

const EmptyState = ({ isMobile, hasSelectedChat }) => {
  return (
    <EmptyContainer isMobile={isMobile} hasSelectedChat={hasSelectedChat}>
      <div className="icon-container">
        <MessageCircle size={32} />
      </div>
      <h3>No conversation selected</h3>
      <p>Select a conversation from the list to view messages and manage transactions</p>
    </EmptyContainer>
  );
};

export default EmptyState;