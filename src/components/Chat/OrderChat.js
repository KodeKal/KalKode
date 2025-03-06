// src/components/Chat/OrderChat.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X, Send, ShoppingCart, MessageCircle, ChevronRight } from 'lucide-react';
import { TransactionService } from '../../services/TransactionService';

const ChatDrawer = styled.div`
  position: fixed;
  top: 0;
  left: ${props => props.isOpen ? '0' : '-400px'};
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background: ${props => props.theme?.colors?.background || '#111'};
  border-right: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: left 0.3s ease-in-out;
  box-shadow: 5px 0 20px rgba(0, 0, 0, 0.5);
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};
  
  h3 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    margin: 0;
    color: ${props => props.theme?.colors?.text || 'white'};
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme?.colors?.text || 'white'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div`
  max-width: 85%;
  padding: 1rem;
  border-radius: 12px;
  background: ${props => props.sent ? 
    props.theme?.colors?.accent || '#800000' : 
    `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.1)'}90`
  };
  align-self: ${props => props.sent ? 'flex-end' : 'flex-start'};
  color: ${props => props.sent ? 'white' : props.theme?.colors?.text || 'white'};
  
  ${props => props.sent ? `
    border-bottom-right-radius: 4px;
  ` : `
    border-bottom-left-radius: 4px;
  `}
  
  .time {
    font-size: 0.7rem;
    margin-top: 0.5rem;
    opacity: 0.7;
    text-align: right;
  }
  
  .item-preview {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    
    img {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
    }
    
    .item-details {
      h4 {
        margin: 0 0 0.25rem 0;
        font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
      }
      
      .price {
        font-weight: bold;
        color: ${props => props.theme?.colors?.accent || '#800000'};
      }
    }
  }
`;

const ChatInput = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};
  
  input {
    flex: 1;
    padding: 0.75rem 1rem;
    background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 20px;
    color: ${props => props.theme?.colors?.text || 'white'};
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme?.colors?.accent || '#800000'};
    }
  }
  
  button {
    background: transparent;
    border: none;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    margin-left: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const ActionSection = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => props.theme?.colors?.primary || '#600000'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const OrderChat = ({ isOpen, onClose, item, shopId, shopName, theme }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [showOrderButton, setShowOrderButton] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          text: "Welcome! I'm interested in this item:",
          sender: 'system',
          item: item,
          timestamp: new Date(),
          type: 'item-inquiry'
        }
      ]);
    }
  }, [isOpen, item, messages.length]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    setMessages([
      ...messages,
      {
        text: messageText,
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
      }
    ]);
    
    setMessageText('');
    
    // Simulate shop response after a short delay
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          text: `Thanks for your interest in ${item.name}. How can I help you with this item?`,
          sender: 'shop',
          timestamp: new Date(),
          type: 'text'
        }
      ]);
    }, 1500);
  };
  
  const handleOrder = () => {
    setShowOrderButton(false);
    
    setMessages([
      ...messages,
      {
        text: `I'd like to order this item.`,
        sender: 'user',
        timestamp: new Date(),
        type: 'order-request'
      }
    ]);
    
    // Simulate shop response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          text: `Great! Please proceed to checkout to complete your order.`,
          sender: 'shop',
          timestamp: new Date(),
          type: 'text'
        }
      ]);
    }, 1000);
  };
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <ChatDrawer isOpen={isOpen} theme={theme}>
      <ChatHeader theme={theme}>
        <h3>{shopName || 'Shop Chat'}</h3>
        <CloseButton onClick={onClose} theme={theme}>
          <X size={20} />
        </CloseButton>
      </ChatHeader>
      
      <ChatMessages>
        {messages.map((msg, index) => (
          <Message 
            key={index} 
            sent={msg.sender === 'user'}
            theme={theme}
          >
            {msg.type === 'item-inquiry' && (
              <div className="item-preview">
                {item.images && item.images[0] && (
                  <img src={item.images[0]} alt={item.name} />
                )}
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <div className="price">${parseFloat(item.price).toFixed(2)}</div>
                </div>
              </div>
            )}
            
            <div>{msg.text}</div>
            <div className="time">{formatTime(msg.timestamp)}</div>
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </ChatMessages>
      
      <ChatInput theme={theme}>
        <input
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>
          <Send size={20} />
        </button>
      </ChatInput>
      
      {showOrderButton && (
        <ActionSection>
          <ActionButton onClick={handleOrder} theme={theme}>
            <ShoppingCart size={20} />
            Order This Item
          </ActionButton>
        </ActionSection>
      )}
      
      {!showOrderButton && (
        <ActionSection>
          <ActionButton 
            onClick={() => {
              // Redirect to BuyDialog or payment wall
              onClose();
              // Here you would trigger your payment process
            }} 
            theme={theme}
          >
            <ChevronRight size={20} />
            Proceed to Checkout
          </ActionButton>
        </ActionSection>
      )}
    </ChatDrawer>
  );
};

export default OrderChat;