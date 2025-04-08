// src/pages/shop/MessagesPage.js
import React, { useState, useEffect, useRef } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { 
  MessageCircle, 
  Search, 
  X, 
  Trash2, 
  Calendar,
  User,
  Package,
  DollarSign,
  AlertTriangle,
  Check,
  Clock,
  Send,
  Phone,
  Mail,
  Share2,
  Bell,
  Image,
  Link,
  RefreshCw,
  MoreVertical,
  FileText
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, getDocs, 
  doc, updateDoc, deleteDoc, getDoc, serverTimestamp, addDoc, 
  increment, Timestamp, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../firebase/config';
import OrderChat from '../../components/Chat/OrderChat';
import SellerOrderChat from '../../components/Chat/SellerOrderChat';
import { DEFAULT_THEME } from '../../theme/config/themes';
import { formatDistance } from 'date-fns';

// Update PageContainer to fix the overall container
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #0B0B3B, #1A1A4C);
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow: hidden; // Prevent page scrolling
`;

// Update PageHeader to be fixed and ensure proper z-index
const PageHeader = styled.div`
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(128, 0, 0, 0.3);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20; // Higher z-index to stay on top
  height: 80px; // Fixed height for calculations
`;

// Update MainContent to position columns 3 inches down from header
const MainContent = styled.div`
  position: fixed;
  top: calc(80px + 5rem); // Header height + 5rem (about 2 inches more than before)
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Center the columns within the available space
const ContentWrapper = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  height: 100%;
`;

// Update ChatsList with appropriate sizing and positioning
const ChatsList = styled.div`
  position: relative;
  width: 350px;
  height: 100%; // Reduce to 70% height
  display: flex;
  flex-direction: column;
`;

const ChatDisplay = styled.div`
  flex: 0 0 auto; // Don't allow it to grow or shrink
  width: calc(69% - 3rem); // Reduce width by about 4 inches
  margin-left: 3rem; // Keep current spacing from chat list
  margin-top: -1rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(128, 0, 0, 0.3);
  overflow: hidden;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
`;

// Fix ChatsListHeader to keep it at the top of the chat list
const ChatsListHeader = styled.div`
  position: sticky;
  top: 2;
  z-index: 10;
  padding-bottom: 1rem;
`;

// Make ChatItemsContainer take remaining height with scrolling
const ChatItemsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 4rem;
  margin-left: -.35rem; /* Move items to the left by 1 inch */
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(128, 0, 0, 0.5);
    border-radius: 10px;
  }
`;

// Ensure ChatBody takes up remaining space and scrolls
const ChatBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.2);

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(128, 0, 0, 0.5);
    border-radius: 10px;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h1 {
    font-size: 1.8rem;
    background: linear-gradient(45deg, #800000, #4A0404);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    svg {
      color: #800000;
    }
  }
  
  .header-stats {
    display: flex;
    gap: 1.5rem;
    
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(0, 0, 0, 0.4);
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      border: 1px solid rgba(128, 0, 0, 0.3);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
      
      .value {
        font-size: 1.2rem;
        font-weight: bold;
        color: #FFFFFF;
      }
      
      .label {
        font-size: 0.8rem;
        opacity: 0.8;
      }
    }
  }
`;

const SearchInput = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  width: calc(100% + -.1rem); /* Adjusted width */
  
  input {
    width: 83%;
    height: 80%; /* Adjusted width */

    padding: 0.75rem 3rem 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(128, 0, 0, 0.3);
    border-radius: 12px;
    color: #FFFFFF;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #800000;
      box-shadow: 0 0 0 2px rgba(128, 0, 0, 0.3);
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
  }
  
  .search-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.6);
  }

  .clear-button {
    position: absolute;
    right: 2.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const ChatTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(128, 0, 0, 0.3);
  overflow-x: auto;
  width: calc(100% + 2.5rem); /* Adjusted width */
  position: sticky;
  top: 70px; // Just below the search input
  z-index: 5;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ChatTab = styled.button`
  background: ${props => props.active ? 
    'rgba(128, 0, 0, 0.4)' : 
    'rgba(0, 0, 0, 0.4)'
  };
  border: 1px solid ${props => props.active ? 
    '#800000' : 
    'rgba(128, 0, 0, 0.3)'
  };
  border-radius: 12px;
  padding: 0.88rem .3rem;
  color: ${props => props.active ? 
    '#FFFFFF' : 
    'rgba(255, 255, 255, 0.7)'
  };
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(128, 0, 0, 0.2);
    transform: translateY(-2px);
  }
`;

const ChatItem = styled.div`
  display: flex;
  gap: 1rem;
  background: ${props => props.active ? 
    'rgba(128, 0, 0, 0.3)' : 
    'rgba(0, 0, 0, 0.4)'
  };
  border: 2px solid ${props => props.active ? 
    '#800000' : 
    'rgba(128, 0, 0, 0.3)'
  };
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  max-height: none;
  width: calc(100% + 1.7rem); /* Adjusted width */
  
  &:hover {
    transform: translateY(-0px);
    border-color: #800000;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    
    .delete-btn {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .chat-image {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.6);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .chat-info {
    flex: 1;
    min-width: 0;
    
    .chat-name {
      font-weight: bold;
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: ${props => props.active ? 
        '#FFFFFF' : 
        'rgba(255, 255, 255, 0.9)'
      };
    }
    
    .chat-preview {
      font-size: 0.9rem;
      opacity: 0.8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .chat-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      
      .chat-time {
        opacity: 0.6;
      }
      
      .chat-status {
        padding: 0.2rem 0.5rem;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: bold;
        text-transform: uppercase;
        
        &.active {
          background: rgba(76, 175, 80, 0.2);
          color: #4CAF50;
        }
        
        &.pending {
          background: rgba(255, 152, 0, 0.2);
          color: #FF9800;
        }
        
        &.completed {
          background: rgba(33, 150, 243, 0.2);
          color: #2196F3;
        }

        &.confirmed {
          background: rgba(156, 39, 176, 0.2);
          color: #9C27B0;
        }

        &.awaiting_seller {
          background: rgba(255, 87, 34, 0.2);
          color: #FF5722;
        }
      }
    }
  }
  
  .unread-badge {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: #800000;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  
  .delete-btn {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    background: transparent;
    border: none;
    color: #e74c3c;
    opacity: 0;
    transition: all 0.3s ease;
    cursor: pointer;
    padding: 0.25rem;
    transform: translateX(10px);
    
    &:hover {
      transform: scale(1.2) translateX(0);
    }
  }
`;

const EmptyState = styled.div`
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
  }
  
  p {
    max-width: 300px;
    opacity: 0.8;
    line-height: 1.5;
    margin-bottom: 2rem;
  }

  .action-btn {
    background: linear-gradient(45deg, #800000, #4A0404);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
  }
`;

const ChatHeader = styled.div`
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid rgba(128, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.4);
  
  .left-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    background: rgba(128, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .chat-user-details {
    flex: 1;
    
    .chat-title {
      font-weight: bold;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .chat-subtitle {
      font-size: 0.9rem;
      opacity: 0.8;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
  
  .transaction-details {
    background: rgba(128, 0, 0, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(128, 0, 0, 0.3);
    
    &:hover {
      background: rgba(128, 0, 0, 0.3);
      transform: translateY(-2px);
    }
  }

  .actions-menu {
    display: flex;
    gap: 0.75rem;

    button {
      background: transparent;
      border: none;
      color: #FFFFFF;
      opacity: 0.7;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
      padding: 0.5rem;
      border-radius: 50%;
      
      &:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.05);
        transform: translateY(-2px);
      }
    }
  }
`;

const DateSeparator = styled.div`
  width: 100%;
  text-align: center;
  margin: 1rem 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    right: 0;
    height: 1px;
    background: rgba(128, 0, 0, 0.3);
    z-index: 1;
  }
  
  span {
    background: rgba(0, 0, 0, 0.4);
    padding: 0 1rem;
    position: relative;
    z-index: 2;
    font-size: 0.8rem;
    opacity: 0.7;
  }
`;

const Message = styled.div`
  max-width: 70%;
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.4;
  position: relative;
  
  align-self: ${props => props.sent ? 'flex-end' : 'flex-start'};
  background: ${props => props.sent ? 
    'linear-gradient(45deg, #800000, #4A0404)' : 
    'rgba(0, 0, 0, 0.4)'
  };
  color: ${props => props.sent ? 'white' : '#FFFFFF'};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  ${props => props.sent ? 
    'border-bottom-right-radius: 4px;' : 
    'border-bottom-left-radius: 4px;'
  }
  
  &.system-message {
    align-self: center;
    background: transparent;
    border: 1px solid rgba(128, 0, 0, 0.3);
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    text-align: center;
    max-width: 90%;
  }
  
  .time {
    position: absolute;
    bottom: 0.3rem;
    ${props => props.sent ? 'left: -3.5rem;' : 'right: -3.5rem;'}
    font-size: 0.75rem;
    opacity: 0.5;
    white-space: nowrap;
    color: #FFFFFF;
  }
  
  .message-time {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    opacity: 0.6;
    text-align: right;
  }

  .image-container {
    max-width: 200px;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 0.5rem;
    
    img {
      width: 100%;
      height: auto;
      object-fit: cover;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
`;

const ChatInput = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(128, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.4);
  
  .input-container {
    flex: 1;
    position: relative;
  }
  
  input {
    width: 100%;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(128, 0, 0, 0.3);
    border-radius: 20px;
    padding: 0.75rem 3rem 0.75rem 1.25rem;
    color: #FFFFFF;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #800000;
      box-shadow: 0 0 0 2px rgba(128, 0, 0, 0.3);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
  }
  
  .send-button {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(45deg, #800000, #4A0404);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-50%) scale(1.05);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: translateY(-50%) scale(1);
      box-shadow: none;
    }
  }
  
  .attachment-button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: transparent;
    color: #800000;
    border: 1px solid #800000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(128, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  }
`;

const NoChatsMessage = styled.div`
  text-align: center;
  padding: 5rem 5rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(128, 0, 0, 0.3);
  
  h3 {
    margin-bottom: 0.5rem;
    color: #800000;
  }
  
  p {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 1.5rem;
    max-width: 500px;
    margin: 0 auto 1.5rem;
  }

  .browse-button {
    background: linear-gradient(45deg, #800000, #4A0404);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
  }
`;

// Notification Modal
const NotificationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  background: rgba(0, 0, 0, 0.9);
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(128, 0, 0, 0.3);
  
  h2 {
    margin-bottom: 1.5rem;
    color: #800000;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    color: #FFFFFF;
    opacity: 0.7;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      opacity: 1;
      transform: scale(1.1);
    }
  }
`;

const NotificationForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    label {
      font-size: 0.9rem;
      opacity: 0.8;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    input, textarea {
      padding: 0.75rem 1rem;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(128, 0, 0, 0.3);
      border-radius: 8px;
      color: #FFFFFF;
      font-family: inherit;
      
      &:focus {
        outline: none;
        border-color: #800000;
      }
    }
    
    textarea {
      min-height: 100px;
      resize: vertical;
    }

    .preview {
      margin-top: 0.5rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.6);
      border: 1px dashed rgba(128, 0, 0, 0.4);
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.9rem;
      overflow-x: auto;
      white-space: pre-wrap;
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
    
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      &:hover {
        transform: translateY(-2px);
      }
      
      &.cancel {
        background: transparent;
        border: 1px solid #800000;
        color: #800000;
        
        &:hover {
          background: rgba(128, 0, 0, 0.1);
        }
      }
      
      &.send {
        background: linear-gradient(45deg, #800000, #4A0404);
        border: none;
        color: white;
        
        &:hover {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      }
    }
  }
`;

// Main component
const MessagesPage = () => {
  // Component logic remains the same
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  // Continue from where we left off
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    total: 0
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    phoneNumber: '',
    message: '',
    linkText: '',
    chatId: ''
  });
  const [sending, setSending] = useState(false);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Fetch user's chats from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', auth.currentUser.uid),
      orderBy('lastMessageTime', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatData = [];
      
      let activeCount = 0;
      let completedCount = 0;
      
      // Process each chat
      for (const doc of snapshot.docs) {
        const chat = doc.data();
        
        // Skip hidden chats
        if (chat.hidden && chat.hidden[auth.currentUser.uid]) {
          continue;
        }
        
        // Get transaction details if available
        let transaction = null;
        if (chat.transactionId) {
          try {
            const transactionSnap = await getDoc(doc(db, 'transactions', chat.transactionId));
            if (transactionSnap.exists()) {
              transaction = {
                id: transactionSnap.id,
                ...transactionSnap.data()
              };
              
              // Count based on status
              if (transaction.status === 'completed') {
                completedCount++;
              } else {
                activeCount++;
              }
            }
          } catch (err) {
            console.error(`Error fetching transaction for chat ${doc.id}:`, err);
          }
        }
        
        // Determine if user is buyer or seller
        const isBuyer = chat.buyerId === auth.currentUser.uid;
        const isSeller = chat.sellerId === auth.currentUser.uid;
        
        // Get other party's details
        const otherPartyId = isBuyer ? chat.sellerId : chat.buyerId;
        const otherPartyName = isBuyer ? chat.sellerName : chat.buyerName;
        
        // Add to chat data
        chatData.push({
          id: doc.id,
          ...chat,
          transaction,
          isBuyer,
          isSeller,
          role: isBuyer ? 'buyer' : 'seller',
          otherPartyId,
          otherPartyName,
          unreadCount: chat.unreadCount?.[auth.currentUser.uid] || 0
        });
      }
      
      // Update stats
      setStats({
        active: activeCount,
        completed: completedCount,
        total: chatData.length
      });
      
      setChats(chatData);
      applyFilters(chatData, searchTerm, activeTab);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    applyFilters(chats, searchTerm, activeTab);
  }, [chats, searchTerm, activeTab]);
  
  // Load messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }
    
    const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
      }));
      
      // Group messages by date
      const groupedMessages = [];
      let currentDate = null;
      
      messageData.forEach(msg => {
        const msgDate = msg.timestamp ? new Date(msg.timestamp.toDate().setHours(0, 0, 0, 0)) : null;
        
        if (msgDate && (!currentDate || msgDate.getTime() !== currentDate.getTime())) {
          currentDate = msgDate;
          groupedMessages.push({
            type: 'date',
            date: currentDate
          });
        }
        
        groupedMessages.push(msg);
      });
      
      setMessages(groupedMessages);
      
      // Mark messages as read
      if (selectedChat.unreadCount > 0) {
        updateDoc(doc(db, 'chats', selectedChat.id), {
          [`unreadCount.${auth.currentUser.uid}`]: 0
        });
      }
    });
    
    return () => unsubscribe();
  }, [selectedChat]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Function to apply filters to chats
  const applyFilters = (allChats, search, tab) => {
    let filtered = [...allChats];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(chat => 
        (chat.itemName?.toLowerCase().includes(searchLower)) ||
        (chat.otherPartyName?.toLowerCase().includes(searchLower)) ||
        (chat.lastMessage?.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply tab filter
    if (tab === 'active') {
      filtered = filtered.filter(chat => 
        chat.transaction?.status !== 'completed' && 
        chat.transaction?.status !== 'cancelled'
      );
    } else if (tab === 'completed') {
      filtered = filtered.filter(chat => 
        chat.transaction?.status === 'completed' || 
        chat.transaction?.status === 'cancelled'
      );
    } else if (tab === 'unread') {
      filtered = filtered.filter(chat => chat.unreadCount > 0);
    } else if (tab === 'buying') {
      filtered = filtered.filter(chat => chat.role === 'buyer');
    } else if (tab === 'selling') {
      filtered = filtered.filter(chat => chat.role === 'seller');
    }
    
    setFilteredChats(filtered);
  };
  
  // Send a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedChat) return;
    
    try {
      // Add message to Firestore
      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
        text: inputMessage.trim(),
        sender: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email,
        timestamp: serverTimestamp(),
        type: 'text'
      });
      
      // Update chat with last message
      const otherPartyId = selectedChat.isBuyer ? selectedChat.sellerId : selectedChat.buyerId;
      
      await updateDoc(doc(db, 'chats', selectedChat.id), {
        lastMessage: inputMessage.trim(),
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${otherPartyId}`]: increment(1)
      });
      
      // Clear input
      setInputMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };
  
  // Upload and send image
  const handleUploadImage = async (file) => {
    if (!file || !selectedChat) return;
    
    try {
      setUploadingFile(true);
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `chats/${selectedChat.id}/images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const imageUrl = await getDownloadURL(storageRef);
      
      // Add message to chat
      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
        image: imageUrl,
        sender: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email,
        timestamp: serverTimestamp(),
        type: 'image'
      });
      
      // Update chat metadata
      const otherPartyId = selectedChat.isBuyer ? selectedChat.sellerId : selectedChat.buyerId;
      
      await updateDoc(doc(db, 'chats', selectedChat.id), {
        lastMessage: '📷 Image',
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${otherPartyId}`]: increment(1)
      });
      
      setUploadingFile(false);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      setUploadingFile(false);
    }
  };
  
  // Delete a chat (hide it for the current user)
  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      // Update Firestore
      await updateDoc(doc(db, 'chats', chatId), {
        [`hidden.${auth.currentUser.uid}`]: true
      });
      
      // Immediately update the local state to remove this chat
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was selected, deselect it
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('Failed to delete chat. Please try again.');
    }
  };
  
  // Send a notification SMS
  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!notificationForm.phoneNumber || !notificationForm.message) {
      setError('Please fill out all required fields');
      return;
    }
    
    try {
      setSending(true);
      
      // In a real implementation, you would call a Cloud Function to send SMS
      // For demo purposes, we'll just log and simulate success
      console.log('Sending notification:', notificationForm);
      
      // Add a notification record to Firestore
      await addDoc(collection(db, 'notifications'), {
        to: notificationForm.phoneNumber,
        message: notificationForm.message,
        chatId: notificationForm.chatId || selectedChat?.id,
        sentBy: auth.currentUser.uid,
        sentAt: serverTimestamp(),
        status: 'sent'
      });
      
      // Add system message to chat
      if (notificationForm.chatId || selectedChat?.id) {
        const chatId = notificationForm.chatId || selectedChat.id;
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          text: `Notification sent to ${notificationForm.phoneNumber}`,
          sender: 'system',
          senderName: 'System',
          timestamp: serverTimestamp(),
          type: 'system'
        });
      }
      
      // Reset form and close modal
      setNotificationForm({
        phoneNumber: '',
        message: '',
        linkText: '',
        chatId: ''
      });
      
      setNotificationModalOpen(false);
      setSending(false);
      
      // Show success message
      alert('Notification sent successfully!');
    } catch (err) {
      console.error('Error sending notification:', err);
      setError('Failed to send notification. Please try again.');
      setSending(false);
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Format date for date separators
  const formatDate = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };
  
  // Show transaction status with icon
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return (
          <div className="chat-status pending">
            <Clock size={12} /> Pending
          </div>
        );
      case 'awaiting_seller':
        return (
          <div className="chat-status awaiting_seller">
            <AlertTriangle size={12} /> Awaiting
          </div>
        );
      case 'confirmed':
        return (
          <div className="chat-status confirmed">
            <Check size={12} /> Active
          </div>
        );
      case 'completed':
        return (
          <div className="chat-status completed">
            <Check size={12} /> Completed
          </div>
        );
      default:
        return null;
    }
  };
  
  // Generate notification message preview
  const generateMessagePreview = () => {
    const chatName = selectedChat?.itemName || 'your order';
    const otherParty = selectedChat?.otherPartyName || 'a customer';
    const linkText = notificationForm.linkText || chatName;
    
    let baseMessage = notificationForm.message;
    if (!baseMessage) {
      // Generate default message based on role
      if (selectedChat?.isSeller) {
        baseMessage = `You have a new order for ${chatName} from ${otherParty}. Click the link to respond:`;
      } else {
        baseMessage = `Your order for ${chatName} has been updated. Click the link to view:`;
      }
    }
    
    // Here we would construct the actual URL in a real implementation
    const chatUrl = `https://yourdomain.com/messages?chat=${selectedChat?.id || 'CHAT_ID'}`;
    
    return `${baseMessage} ${linkText} (${chatUrl})`;
  };
  
  return (
    <PageContainer>
      <PageHeader>
        <HeaderContent>
          <h1>
            <MessageCircle size={24} />
            Messages
          </h1>
          
          <div className="header-stats">
            <div className="stat">
              <div className="value">{stats.active}</div>
              <div className="label">Active</div>
            </div>
            <div className="stat">
              <div className="value">{stats.completed}</div>
              <div className="label">Completed</div>
            </div>
            <div className="stat">
              <div className="value">{stats.total}</div>
              <div className="label">Total</div>
            </div>
          </div>
        </HeaderContent>
      </PageHeader>
      
      <MainContent>
        <ChatsList>
          <ChatsListHeader>
            <ChatTabs>
              <ChatTab 
                active={activeTab === 'all'} 
                onClick={() => setActiveTab('all')}
              >
                All
              </ChatTab>
              <ChatTab 
                active={activeTab === 'unread'} 
                onClick={() => setActiveTab('unread')}
              >
                Unread
              </ChatTab>
              <ChatTab 
                active={activeTab === 'active'} 
                onClick={() => setActiveTab('active')}
              >
                Active
              </ChatTab>
              <ChatTab 
                active={activeTab === 'buying'} 
                onClick={() => setActiveTab('buying')}
              >
                Buying
              </ChatTab>
              <ChatTab 
                active={activeTab === 'selling'} 
                onClick={() => setActiveTab('selling')}
              >
                Selling
              </ChatTab>
              <ChatTab 
                active={activeTab === 'completed'} 
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </ChatTab>
            </ChatTabs>

            <SearchInput>
            <Search className="search-icon" size={16} />
            <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-button"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={16} />
                </button>
              )}
            </SearchInput>
          </ChatsListHeader>
            
          <ChatItemsContainer>
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
                <p style={{ marginTop: '1rem', opacity: 0.7 }}>Loading conversations...</p>
              </div>
            ) : error ? (
              <div style={{ 
                color: '#ff4444', 
                padding: '1rem', 
                background: 'rgba(255, 68, 68, 0.1)',
                borderRadius: '8px',
                textAlign: 'center',
                margin: '1rem 0'
              }}>
                {error}
                <button 
                  onClick={() => setError(null)} 
                  style={{ 
                    display: 'block', 
                    margin: '0.5rem auto',
                    background: 'transparent',
                    border: 'none',
                    color: '#ff4444',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Dismiss
                </button>
              </div>
            ) : filteredChats.length === 0 ? (
              <NoChatsMessage>
                <h3>No conversations found</h3>
                <p>
                  {searchTerm ? 
                    `No results matching "${searchTerm}"` : 
                    activeTab !== 'all' ?
                    `You don't have any ${activeTab} conversations` :
                    "You don't have any conversations yet"
                  }
                </p>
                {activeTab === 'all' && !searchTerm && (
                  <button 
                    className="browse-button"
                    onClick={() => window.location.href = '/'}
                  >
                    <Package size={16} />
                    Browse Items
                  </button>
                )}
              </NoChatsMessage>
            ) : (
              filteredChats.map(chat => (
                <ChatItem 
                  key={chat.id}
                  active={selectedChat?.id === chat.id}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="chat-image">
                    {chat.itemImage ? (
                      <img src={chat.itemImage} alt={chat.itemName} />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center' 
                      }}>
                        <Package size={20} opacity={0.5} />
                      </div>
                    )}
                  </div>
                  
                  <div className="chat-info">
                    <div className="chat-name">
                      {chat.itemName || "Untitled conversation"}
                    </div>
                    <div className="chat-preview">
                      {chat.otherPartyName || "Unknown user"}
                    </div>
                    
                    <div className="chat-meta">
                      <div className="chat-time">
                        {formatTimestamp(chat.lastMessageTime)}
                      </div>
                      
                      {chat.transaction && getStatusDisplay(chat.transaction.status)}
                    </div>
                  </div>
                  
                  {chat.unreadCount > 0 && (
                    <div className="unread-badge">
                      {chat.unreadCount}
                    </div>
                  )}
                  
                  <button 
                    className="delete-btn"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                  >
                    <Trash2 size={16} />
                  </button>
                </ChatItem>
              ))
            )}
          </ChatItemsContainer>
        </ChatsList>
        
        <ChatDisplay>
          {selectedChat ? (
            <>
              <ChatHeader>
                <div className="left-section">
                  <div className="avatar">
                    {selectedChat.isBuyer ? (
                      <User size={20} />
                    ) : (
                      <Package size={20} />
                    )}
                  </div>
                  
                  <div className="chat-user-details">
                    <div className="chat-title">
                      {selectedChat.otherPartyName || "Unknown user"}
                      {selectedChat.transaction && getStatusDisplay(selectedChat.transaction.status)}
                    </div>
                    <div className="chat-subtitle">
                      {selectedChat.isBuyer ? "Seller" : "Buyer"} • {selectedChat.itemName}
                    </div>
                  </div>
                </div>
                
                <div className="actions-menu">
                  <button 
                    onClick={() => setNotificationModalOpen(true)}
                    title="Send SMS Notification"
                  >
                    <Bell size={20} />
                  </button>
                  
                  <div className="transaction-details">
                    <DollarSign size={16} />
                    ${parseFloat(selectedChat.transaction?.price || 0).toFixed(2)}
                  </div>
                </div>
              </ChatHeader>
              
              <ChatBody>
                {messages.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    opacity: 0.7,
                    fontStyle: 'italic'
                  }}>
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message, index) => {
                    if (message.type === 'date') {
                      return (
                        <DateSeparator key={`date-${index}`}>
                          <span>{formatDate(message.date)}</span>
                        </DateSeparator>
                      );
                    }
                    
                    const isSentByMe = message.sender === auth.currentUser.uid;
                    const isSystem = message.sender === 'system';
                    
                    return (
                      <Message
                        key={message.id}
                        sent={isSentByMe}
                        className={isSystem ? 'system-message' : ''}
                      >
                        {message.text && <div>{message.text}</div>}
                        
                        {message.image && (
                          <div className="image-container">
                            <img 
                              src={message.image} 
                              alt="Shared" 
                              onClick={() => window.open(message.image, '_blank')}
                            />
                          </div>
                        )}
                        
                        {message.timestamp && (
                          <div className="message-time">
                            {formatTimestamp(message.timestamp)}
                          </div>
                        )}
                      </Message>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </ChatBody>
              
              <ChatInput>
                <div className="input-container">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    className="send-button" 
                    onClick={handleSendMessage} 
                    disabled={!inputMessage.trim() || uploadingFile}
                  >
                    <Send size={16} />
                  </button>
                </div>
                
                <button 
                  className="attachment-button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploadingFile}
                >
                  <Image size={20} />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleUploadImage(e.target.files[0]);
                      e.target.value = '';
                    }
                  }}
                />
              </ChatInput>
            </>
          ) : (
            <EmptyState>
              <div className="icon-container">
                <MessageCircle size={32} />
              </div>
              <h3>No conversation selected</h3>
              <p>Select a conversation from the list to view messages</p>
              <button className="action-btn" onClick={() => window.location.href = '/'}>
                <Package size={16} />
                Browse Items
              </button>
            </EmptyState>
          )}
        </ChatDisplay>
      </MainContent>
      
      {/* Notification Modal */}
      <NotificationModal isOpen={notificationModalOpen}>
        <ModalContent>
          <h2>
            <Bell size={24} />
            Send SMS Notification
          </h2>
          
          <button 
            className="close-button"
            onClick={() => setNotificationModalOpen(false)}
          >
            <X size={24} />
          </button>
          
          <NotificationForm onSubmit={handleSendNotification}>
            <div className="form-group">
              <label>
                <Phone size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={notificationForm.phoneNumber}
                onChange={(e) => setNotificationForm({
                  ...notificationForm,
                  phoneNumber: e.target.value
                })}
                required
              />
            </div>
            
            <div className="form-group">
              <label>
                <MessageCircle size={16} />
                Notification Message
              </label>
              <textarea
                placeholder="Enter your message here..."
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({
                  ...notificationForm,
                  message: e.target.value
                })}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>
                <Link size={16} />
                Link Text (Optional)
              </label>
              <input
                type="text"
                placeholder="Click here to view"
                value={notificationForm.linkText}
                onChange={(e) => setNotificationForm({
                  ...notificationForm,
                  linkText: e.target.value
                })}
              />
            </div>
            
            <div className="form-group">
              <label>
                <FileText size={16} />
                Message Preview
              </label>
              <div className="preview">
                {generateMessagePreview()}
              </div>
            </div>
            
            <div className="action-buttons">
              <button 
                type="button" 
                className="cancel"
                onClick={() => setNotificationModalOpen(false)}
              >
                <X size={16} />
                Cancel
              </button>
              
              <button 
                type="submit" 
                className="send"
                disabled={!notificationForm.phoneNumber || !notificationForm.message || sending}
              >
                <Send size={16} />
                {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </NotificationForm>
        </ModalContent>
      </NotificationModal>
    </PageContainer>
  );
};

export default MessagesPage;