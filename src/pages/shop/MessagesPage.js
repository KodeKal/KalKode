// src/pages/shop/MessagesPage.js - Optimized Version
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { 
  MessageCircle, Search, X, Trash2, Send, Package, User, Check, QrCode, Camera, Plus, Minus, ChevronDown
} from 'lucide-react';
import { 
  collection, query, where, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { TransactionService } from '../../services/TransactionService';
import QrScanner from 'qr-scanner';
import { useLocation, useSearchParams } from 'react-router-dom';

// Move QR scanner instance outside component to prevent recreation
let qrScannerInstance = null;
let scanHeartbeat = null;

// Styled components (keeping existing styles but optimized)
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #0B0B3B, #1A1A4C);
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PageHeader = styled.div`
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(128, 0, 0, 0.3);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  height: 80px;
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
`;

const MainContent = styled.div`
  position: fixed;
  top: calc(80px + 5rem);
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  padding: 0 1rem;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  height: 100%;
`;

const ChatsList = styled.div`
  position: relative;
  width: 350px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const SearchInput = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  
  input {
    width: 85%;
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
    pointer-events: none;
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

const ChatItemsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
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

const ChatItem = styled.div`
  display: flex;
  gap: 1rem;
  background: ${props => props.active ? 'rgba(128, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.4)'};
  border: 2px solid ${props => props.active ? '#800000' : 'rgba(128, 0, 0, 0.3)'};
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
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
    display: flex;
    align-items: center;
    justify-content: center;
    
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
      color: ${props => props.active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)'};
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
        flex-shrink: 0;
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

const ChatDisplay = styled.div`
  flex: 1;
  margin-left: 2rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(128, 0, 0, 0.3);
  overflow: hidden;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
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
    background: rgba(128, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
  }
  
  .chat-user-details {
    flex: 1;
    
    .chat-title {
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    
    .chat-subtitle {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  }
  
  .transaction-details {
    background: rgba(128, 0, 0, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    border: 1px solid rgba(128, 0, 0, 0.3);
  }
`;

const PurchaseRequestCard = styled.div`
  margin: 1rem 1.5rem;
  padding: 1.5rem;
  background: ${props => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.1)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.1)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.1)';
      case 'paid': return 'rgba(33, 150, 243, 0.1)';
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  }};
  border-radius: 12px;
  border: 1px solid ${props => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.3)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.3)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.3)';
      case 'paid': return 'rgba(33, 150, 243, 0.3)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  
  h4 {
    margin: 0 0 1rem 0;
    color: ${props => {
      switch(props.status) {
        case 'pending_seller_acceptance': return '#FFC107';
        case 'seller_accepted': return '#4CAF50';
        case 'seller_rejected': return '#F44336';
        case 'paid': return '#2196F3';
        default: return '#FFFFFF';
      }
    }};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .purchase-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
    
    .detail {
      .label {
        font-size: 0.8rem;
        opacity: 0.7;
        margin-bottom: 0.25rem;
      }
      
      .value {
        font-weight: bold;
        color: white;
      }
    }
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    
    button {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      
      &.accept {
        background: #4CAF50;
        color: white;
        
        &:hover {
          background: #45a049;
        }
      }
      
      &.reject {
        background: transparent;
        border: 1px solid #F44336;
        color: #F44336;
        
        &:hover {
          background: rgba(244, 67, 54, 0.1);
        }
      }
      
      &.pay {
        background: #2196F3;
        color: white;
        
        &:hover {
          background: #1976D2;
        }
      }
    }
  }
`;

const PaymentForm = styled.div`
  margin: 1rem 1.5rem;
  padding: 1rem;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(33, 150, 243, 0.3);
  
  h4 {
    color: #2196F3;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .payment-amount {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    margin: 1rem 0;
    color: #2196F3;
  }
  
  .mock-payment-form {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    margin-bottom: 1rem;
    
    input {
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: white;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
  
  .payment-button {
    width: 100%;
    padding: 1rem;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    
    &:hover {
      background: #1976D2;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const ChatBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.2);

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

const Message = styled.div`
  max-width: 70%;
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.4;
  
  align-self: ${props => props.sent ? 'flex-end' : 'flex-start'};
  background: ${props => props.sent ? 
    'linear-gradient(45deg, #800000, #4A0404)' : 
    'rgba(0, 0, 0, 0.4)'
  };
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  ${props => props.sent ? 
    'border-bottom-right-radius: 4px;' : 
    'border-bottom-left-radius: 4px;'
  }
  
  .message-time {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    opacity: 0.6;
    text-align: right;
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
  
  .input-actions {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }
  
  .action-button {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid ${props => props.active ? '#4CAF50' : 'rgba(255, 255, 255, 0.3)'};
    color: ${props => props.active ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)'};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: ${props => props.active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
      transform: scale(1.05);
    }
  }
  
  .send-button {
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
      transform: scale(1.05);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: scale(1);
    }
  }
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid ${props => props.active ? '#4CAF50' : 'rgba(255, 255, 255, 0.3)'};
  color: ${props => props.active ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
    transform: scale(1.05);
  }
`;

// Unified verification component
const VerificationSection = styled.div`
  margin: 1rem 1.5rem;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  
  h4 {
    color: #4CAF50;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .content {
    transition: all 0.3s ease;
    overflow: hidden;
    ${props => props.minimized ? `
      max-height: 0;
      opacity: 0;
      margin: 0;
      padding: 0;
    ` : `
      max-height: 500px;
      opacity: 1;
    `}
  }
  
  .code-input {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    position: relative;
    
    input {
      flex: 1;
      padding: 0.75rem 3rem 0.75rem 0.75rem;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      font-family: monospace;
      font-size: 1.2rem;
      text-align: center;
      letter-spacing: 2px;
      
      &:focus {
        outline: none;
        border-color: #4CAF50;
      }
    }
    
    .camera-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: #2196F3;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        background: rgba(33, 150, 243, 0.1);
        transform: translateY(-50%) scale(1.1);
      }
    }
  }
  
  .code-display {
    font-family: monospace;
    font-size: 1.8rem;
    font-weight: bold;
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    letter-spacing: 3px;
    color: #4CAF50;
    border: 2px dashed #4CAF50;
    text-align: center;
  }
  
  .qr-code {
    margin: 1rem 0;
    text-align: center;
    
    img {
      width: 150px;
      height: 150px;
      border-radius: 8px;
    }
  }
  
  .message {
    margin-bottom: 1rem;
    font-size: 0.9rem;
    padding: 0.75rem;
    border-radius: 8px;
    
    &.error {
      color: #F44336;
      background: rgba(244, 67, 54, 0.1);
      border: 1px solid rgba(244, 67, 54, 0.3);
    }
    
    &.success {
      color: #4CAF50;
      background: rgba(76, 175, 80, 0.1);
      border: 1px solid rgba(76, 175, 80, 0.3);
      font-weight: bold;
      line-height: 1.4;
    }
  }
  
  .action-button {
    width: 100%;
    padding: 0.75rem;
    background: #4CAF50;
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
      filter: brightness(1.1);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }
`;

const CameraModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  /* Prevent modal from closing on click */
  .modal-content {
    pointer-events: all;
  }
  
  .camera-header {
    color: white;
    text-align: center;
    margin-bottom: 2rem;
    
    h3 {
      margin-bottom: 0.5rem;
      color: #4CAF50;
    }
    
    p {
      opacity: 0.8;
      font-size: 0.9rem;
    }
  }
  
  .camera-view {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.5);
    
    video {
      width: 300px;
      height: 300px;
      object-fit: cover;
      background: #000;
      border: 2px solid #4CAF50;
      transform: scaleX(-1);
    }
    
    .scan-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      border: 2px solid #4CAF50;
      border-radius: 12px;
      background: transparent;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
      
      &::before, &::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        border: 3px solid #4CAF50;
        border-radius: 3px;
      }
      
      &::before {
        top: -3px;
        left: -3px;
        border-right: transparent;
        border-bottom: transparent;
      }
      
      &::after {
        bottom: -3px;
        right: -3px;
        border-left: transparent;
        border-top: transparent;
      }
    }
  }
  
  .camera-controls {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    
    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
      
      &.primary {
        background: #4CAF50;
        color: white;
        
        &:hover {
          background: #45a049;
        }
      }
      
      &.secondary {
        background: #f44336;
        color: white;
        
        &:hover {
          background: #da190b;
        }
      }
    }
  }
  
  .error-message {
    color: #f44336;
    background: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: center;
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
  }
`;

const QuantityRequestCard = styled.div`
  margin: ${props => props.minimized ? '0' : '0 1.5rem'};
  padding: ${props => props.minimized ? '0' : '1.5rem'};
  background: ${props => props.minimized ? 'transparent' : (() => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.1)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.1)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.1)';
      case 'paid': return 'rgba(33, 150, 243, 0.1)';
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  })()};
  border-radius: ${props => props.minimized ? '0' : '12px'};
  border: ${props => props.minimized ? 'none' : (() => {
    switch(props.status) {
      case 'pending_seller_acceptance': return '1px solid rgba(255, 193, 7, 0.3)';
      case 'seller_accepted': return '1px solid rgba(76, 175, 80, 0.3)';
      case 'seller_rejected': return '1px solid rgba(244, 67, 54, 0.3)';
      case 'paid': return '1px solid rgba(33, 150, 243, 0.3)';
      default: return '1px solid rgba(255, 255, 255, 0.1)';
    }
  })()};
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: ${props => props.minimized ? '0' : '800px'};
  opacity: ${props => props.minimized ? '0' : '1'};
  
  h4 {
    margin: 0 0 1rem 0;
    color: ${props => {
      switch(props.status) {
        case 'pending_seller_acceptance': return '#FFC107';
        case 'seller_accepted': return '#4CAF50';
        case 'seller_rejected': return '#F44336';
        case 'paid': return '#2196F3';
        default: return '#FFFFFF';
      }
    }};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .quantity-details {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
    
    .detail {
      .label {
        font-size: 0.8rem;
        opacity: 0.7;
        margin-bottom: 0.25rem;
      }
      
      .value {
        font-weight: bold;
        color: white;
        
        &.highlight {
          color: #FFC107;
          font-size: 1.1rem;
        }
      }
    }
  }
  
  .quantity-adjustment {
    margin: 1rem 0;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    
    .adjustment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      .label {
        font-weight: bold;
        color: #FFC107;
      }
      
      .max-available {
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }
    
    .quantity-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      
      .quantity-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid #FFC107;
        background: transparent;
        color: #FFC107;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover:not(:disabled) {
          background: #FFC107;
          color: black;
        }
        
        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }
      
      .quantity-display {
        font-size: 1.5rem;
        font-weight: bold;
        color: white;
        min-width: 60px;
        text-align: center;
      }
    }
    
    .total-preview {
      text-align: center;
      margin-top: 1rem;
      font-size: 1.1rem;
      color: #4CAF50;
      font-weight: bold;
    }
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    
    button {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      
      &.accept {
        background: #4CAF50;
        color: white;
        
        &:hover {
          background: #45a049;
          transform: translateY(-2px);
        }
      }
      
      &.reject {
        background: transparent;
        border: 1px solid #F44336;
        color: #F44336;
        
        &:hover {
          background: rgba(244, 67, 54, 0.1);
        }
      }
      
      &.pay {
        background: #2196F3;
        color: white;
        
        &:hover {
          background: #1976D2;
          transform: translateY(-2px);
        }
      }
    }
  }
`;

const StatusButton = styled.button`
  margin: 1rem 1.5rem 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.2)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.2)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.2)';
      case 'paid': return 'rgba(33, 150, 243, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border: 1px solid ${props => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.5)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.5)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.5)';
      case 'paid': return 'rgba(33, 150, 243, 0.5)';
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  }};
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .status-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .status-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: ${props => {
        switch(props.status) {
          case 'pending_seller_acceptance': return '#FFC107';
          case 'seller_accepted': return '#4CAF50';
          case 'seller_rejected': return '#F44336';
          case 'paid': return '#2196F3';
          default: return '#FFFFFF';
        }
      }};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
    }
    
    .status-text {
      .main-text {
        font-size: 0.95rem;
        margin-bottom: 0.1rem;
      }
      
      .sub-text {
        font-size: 0.8rem;
        opacity: 0.8;
      }
    }
  }
  
  .toggle-icon {
    transform: ${props => props.minimized ? 'rotate(0deg)' : 'rotate(180deg)'};
    transition: transform 0.3s ease;
  }
`;

const MessagesPage = () => {
  // Optimized state management - combine related states
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [purchaseRequest, setPurchaseRequest] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const targetChatId = searchParams.get('chat');
   const [adjustedQuantity, setAdjustedQuantity] = useState(1);
  const [maxAvailableQuantity, setMaxAvailableQuantity] = useState(0);
  const [statusWindowMinimized, setStatusWindowMinimized] = useState(false);


  useEffect(() => {
    if (targetChatId && chats.length > 0) {
      const targetChat = chats.find(chat => chat.id === targetChatId);
      if (targetChat && !selectedChat) {
        setSelectedChat(targetChat);
      }
    }
  }, [targetChatId, chats, selectedChat]);

  useEffect(() => {
  if (selectedChat?.pendingPurchase) {
    setPurchaseRequest(selectedChat.pendingPurchase);
    // FIX: Properly initialize quantity states
    setAdjustedQuantity(selectedChat.pendingPurchase.requestedQuantity || 1);
    setMaxAvailableQuantity(selectedChat.pendingPurchase.availableQuantity || 0);
  }
}, [selectedChat]);

  const handleQuantityResponse = async (decision, finalQuantity = null) => {
    try {
      setPaymentLoading(true);
      
      await TransactionService.respondToQuantityRequest(  // Correct method name
        selectedChat.transactionId, 
        decision, 
        finalQuantity
      );
      
      // Refresh will happen via real-time listener
    } catch (error) {
      console.error('Error responding to quantity request:', error);
      alert('Error: ' + error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle buyer payment
  const handleQuantityPayment = async () => {
    try {
      setPaymentLoading(true);
      
      // Mock payment data
      const mockPaymentData = {
        cardNumber: '4242424242424242',
        expiryMonth: '12',
        expiryYear: '25',
        cvc: '123'
      };
      
      const result = await TransactionService.processQuantityPayment(  // Correct method name
        selectedChat.transactionId,
        mockPaymentData
      );
      
      if (result.success) {
        setShowPaymentForm(false);
        // The transaction code will appear in chat messages via real-time updates
      }
      
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Quantity adjustment functions
  const adjustQuantity = (delta) => {
    const newQuantity = Math.max(1, Math.min(maxAvailableQuantity, adjustedQuantity + delta));
    setAdjustedQuantity(newQuantity);
  };

  // Render quantity-based purchase request card
  // Render quantity-based purchase request card
const renderQuantityRequest = () => {
  if (!purchaseRequest) return null;
  
  const isSeller = selectedChat?.isSeller;
  const isBuyer = selectedChat?.isBuyer;
  const unitPrice = purchaseRequest.unitPrice || 0;
  const requestedQty = purchaseRequest.requestedQuantity || 1;
  const adjustedTotal = unitPrice * adjustedQuantity;
  
  // Get status display info
  const getStatusInfo = () => {
    switch(purchaseRequest.status) {
      case 'pending_seller_acceptance':
        return {
          icon: '⏳',
          main: 'Quantity Purchase Request',
          sub: `${requestedQty}x ${purchaseRequest.itemName} - $${(unitPrice * requestedQty).toFixed(2)}`
        };
      case 'seller_accepted':
        return {
          icon: '✅',
          main: 'Request Accepted',
          sub: `${purchaseRequest.approvedQuantity}x approved - $${(purchaseRequest.finalTotalPrice || 0).toFixed(2)}`
        };
      case 'seller_rejected':
        return {
          icon: '❌',
          main: 'Request Declined',
          sub: 'Seller declined your request'
        };
      case 'paid':
        return {
          icon: '💰',
          main: 'Payment Complete',
          sub: 'Waiting for pickup coordination'
        };
      default:
        return {
          icon: '📦',
          main: 'Transaction',
          sub: 'Processing...'
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <>
      <StatusButton 
        status={purchaseRequest.status}
        minimized={statusWindowMinimized}
        onClick={() => setStatusWindowMinimized(!statusWindowMinimized)}
      >
        <div className="status-info">
          <div className="status-icon">{statusInfo.icon}</div>
          <div className="status-text">
            <div className="main-text">{statusInfo.main}</div>
            <div className="sub-text">{statusInfo.sub}</div>
          </div>
        </div>
        <div className="toggle-icon">
          <ChevronDown size={20} />
        </div>
      </StatusButton>
      
      <QuantityRequestCard 
        status={purchaseRequest.status}
        minimized={statusWindowMinimized}
      >
        <h4>
          {purchaseRequest.status === 'pending_seller_acceptance' && '⏳ Quantity Purchase Request'}
          {purchaseRequest.status === 'seller_accepted' && '✅ Request Accepted'}
          {purchaseRequest.status === 'seller_rejected' && '❌ Request Declined'}
          {purchaseRequest.status === 'paid' && '💰 Payment Complete'}
        </h4>
        
        <div className="quantity-details">
          <div className="detail">
            <div className="label">Item</div>
            <div className="value">{purchaseRequest.itemName}</div>
          </div>
          <div className="detail">
            <div className="label">Unit Price</div>
            <div className="value">${unitPrice.toFixed(2)}</div>
          </div>
          <div className="detail">
            <div className="label">Requested Qty</div>
            <div className="value highlight">{requestedQty}</div>
          </div>
        </div>
        
        {purchaseRequest.approvedQuantity && (
          <div className="quantity-details">
            <div className="detail">
              <div className="label">Approved Qty</div>
              <div className="value highlight">{purchaseRequest.approvedQuantity}</div>
            </div>
            <div className="detail">
              <div className="label">Final Total</div>
              <div className="value highlight">${(purchaseRequest.finalTotalPrice || 0).toFixed(2)}</div>
            </div>
            <div className="detail"></div>
          </div>
        )}
        
        {/* Seller Quantity Adjustment */}
        {isSeller && purchaseRequest.status === 'pending_seller_acceptance' && (
          <div className="quantity-adjustment">
            <div className="adjustment-header">
              <span className="label">Adjust Quantity (Optional)</span>
              <span className="max-available">Max available: {maxAvailableQuantity}</span>
            </div>
            
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => adjustQuantity(-1)}
                disabled={adjustedQuantity <= 1}
              >
                <Minus size={16} />
              </button>
              
              <div className="quantity-display">
                {adjustedQuantity}
              </div>
              
              <button 
                className="quantity-btn"
                onClick={() => adjustQuantity(1)}
                disabled={adjustedQuantity >= maxAvailableQuantity}
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="total-preview">
              Total: ${adjustedTotal.toFixed(2)}
            </div>
          </div>
        )}
        
        {/* Seller Actions */}
        {isSeller && purchaseRequest.status === 'pending_seller_acceptance' && (
          <div className="actions">
            <button 
              className="reject" 
              onClick={() => handleQuantityResponse('reject')}
              disabled={paymentLoading}
            >
              Decline Request
            </button>
            <button 
              className="accept" 
              onClick={() => handleQuantityResponse('accept', adjustedQuantity)}
              disabled={paymentLoading}
            >
              {adjustedQuantity === requestedQty ? 
                `Accept ${adjustedQuantity} items` : 
                `Approve ${adjustedQuantity} items (adjusted)`
              }
            </button>
          </div>
        )}
        
        {/* Buyer Payment Action */}
        {isBuyer && purchaseRequest.status === 'seller_accepted' && (
          <div className="actions">
            <button 
              className="pay" 
              onClick={() => setShowPaymentForm(true)}
              disabled={paymentLoading}
            >
              Pay ${(purchaseRequest.finalTotalPrice || purchaseRequest.totalPrice || 0).toFixed(2)}
            </button>
          </div>
        )}
      </QuantityRequestCard>
    </>
  );
};

  // Render payment form (keep from original but update for quantity)
  const renderPaymentForm = () => {
    if (!showPaymentForm || !purchaseRequest) return null;
    
    const finalAmount = purchaseRequest.finalTotalPrice || purchaseRequest.totalPrice || 0;
    const approvedQty = purchaseRequest.approvedQuantity || purchaseRequest.requestedQuantity || 1;
    
    return (
      <PaymentForm>
        <h4>💳 Complete Payment</h4>
        <div className="payment-amount">
          ${finalAmount.toFixed(2)}
        </div>
        <div style={{ textAlign: 'center', marginBottom: '1rem', opacity: 0.8 }}>
          {approvedQty}x {purchaseRequest.itemName}
        </div>
        
        <div className="mock-payment-form">
          <input type="text" placeholder="Card Number: 4242 4242 4242 4242" readOnly />
          <input type="text" placeholder="MM/YY: 12/25" readOnly />
          <input type="text" placeholder="CVC: 123" readOnly />
        </div>
        
        <button 
          className="payment-button"
          onClick={handleQuantityPayment}
          disabled={paymentLoading}
        >
          {paymentLoading ? 'Processing...' : 'Complete Payment'}
        </button>
        
        <button 
          style={{ 
            width: '100%', 
            marginTop: '0.5rem', 
            background: 'transparent', 
            border: '1px solid rgba(255,255,255,0.3)', 
            color: 'white', 
            padding: '0.5rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => setShowPaymentForm(false)}
        >
          Cancel
        </button>
      </PaymentForm>
    );
  };

  
    // Update the message rendering to handle special message types
  const renderMessage = (message) => {
    const currentUserId = auth.currentUser?.uid;
    
    // Check if message is visible to current user
    if (message.visibleTo && !message.visibleTo.includes(currentUserId)) {
      return null;
    }
    
    return (
      <Message 
        key={message.id} 
        sent={message.sender === currentUserId}
      >
        {message.type === 'payment_success' && message.purchaseData?.transactionCode && (
          <div style={{ 
            background: 'rgba(76, 175, 80, 0.2)', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid rgba(76, 175, 80, 0.3)'
          }}>
            <div style={{ fontWeight: 'bold', color: '#4CAF50', marginBottom: '0.5rem' }}>
              🎉 Payment Successful!
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem' }}>
              Show this code to the seller for pickup
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${message.purchaseData.transactionCode}&size=100x100`}
                alt="QR Code"
                style={{ borderRadius: '4px' }}
              />
            </div>
            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', letterSpacing: '2px' }}>
              {message.purchaseData.transactionCode}
            </div>
          </div>
        )}
        
        {message.text}
        {message.timestamp && (
          <div className="message-time">
            {formatTimestamp(message.timestamp)}
          </div>
        )}
      </Message>
    );
  };
  
  // Unified verification state
  const [verification, setVerification] = useState({
    code: '',
    error: null,
    success: null,
    loading: false,
    minimized: true
  });
  
  // UI state
  const [ui, setUi] = useState({
    qrMinimized: true,
    showCamera: false,
    cameraError: null
  });
  
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);

  // Optimized callbacks using useCallback
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const updateVerification = useCallback((updates) => {
    setVerification(prev => ({ ...prev, ...updates }));
  }, []);

  const updateUI = useCallback((updates) => {
    setUi(prev => ({ ...prev, ...updates }));
  }, []);

  // Cleanup camera resources
  const cleanupCamera = useCallback(() => {
    console.log('🧹 Cleaning up camera...');
    
    if (qrScannerInstance) {
      qrScannerInstance.destroy();
      qrScannerInstance = null;
    }
    if (scanHeartbeat) {
      clearInterval(scanHeartbeat);
      scanHeartbeat = null;
    }
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // Optimized QR scanning with automatic verification
  const startQRScanning = useCallback(async () => {
  if (!videoRef.current?.srcObject) return;

  try {
    if (qrScannerInstance) qrScannerInstance.destroy();

    qrScannerInstance = new QrScanner(
      videoRef.current,
      async (result) => {
        const code = result.data.toUpperCase().trim();
        console.log('🎯 QR Code detected:', code);
        
        // Stop scanning immediately but keep camera open
        if (qrScannerInstance) {
          qrScannerInstance.stop();
        }
        
        // Fill the input field
        updateVerification({ code, error: null });
        
        // Show "Code detected" message and keep camera open for 2 seconds
        updateUI({ cameraError: `✅ Code detected: ${code}. Verifying...` });
        
        // Wait 2 seconds before closing camera and verifying
        setTimeout(async () => {
          // Close camera
          updateUI({ showCamera: false, cameraError: null });
          cleanupCamera();
          
          // Now verify
          try {
            updateVerification({ loading: true, error: null, success: null });
            
            await TransactionService.completeTransaction(selectedChat.transactionId, code);
            
            await addDoc(collection(db, 'chats', selectedChat.transactionId, 'messages'), {
              text: '✅ Transaction completed:\nFunds have been released.\nStatus: Order fulfilled.',
              sender: 'system',
              senderName: 'System',
              timestamp: serverTimestamp(),
              type: 'system'
            });
            
            updateVerification({ 
              code: '', 
              loading: false,
              success: `🎉 CODE VERIFIED! Transaction completed! 💰 Funds released. 📦 Please deliver the item to the buyer. Code: ${code}`
            });
            
          } catch (error) {
            updateVerification({ 
              loading: false,
              error: `❌ Invalid code "${code}". Please ask buyer for correct pickup code.`
            });
          }
        }, 2000); // 2 second delay
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 505, // Reduced to prevent multiple detections
        preferredCamera: 'environment'
      }
    );

    await qrScannerInstance.start();

    // Backup scanning with same delay pattern
    scanHeartbeat = setInterval(async () => {
      if (!videoRef.current || qrScannerInstance?.hasFlash === false) return;
      
      try {
        const result = await QrScanner.scanImage(videoRef.current);
        const code = result.toUpperCase().trim();
        console.log('💓 Backup scan found QR:', code);
        
        // Clear the interval immediately
        clearInterval(scanHeartbeat);
        scanHeartbeat = null;
        
        updateVerification({ code });
        updateUI({ cameraError: `✅ Code detected: ${code}. Verifying...` });
        
        // Same 2-second delay pattern
        setTimeout(async () => {
          updateUI({ showCamera: false, cameraError: null });
          cleanupCamera();
          
          try {
            updateVerification({ loading: true, error: null });
            await TransactionService.completeTransaction(selectedChat.transactionId, code);
            
            await addDoc(collection(db, 'chats', selectedChat.transactionId, 'messages'), {
              text: '✅ Transaction completed! Funds have been released.',
              sender: 'system',
              senderName: 'System',
              timestamp: serverTimestamp(),
              type: 'system'
            });
            
            updateVerification({ 
              code: '', 
              loading: false,
              success: `🎉 CODE VERIFIED! Transaction completed! 💰 Funds released. 📦 Please deliver item. Code: ${code}`
            });
          } catch (error) {
            updateVerification({ 
              loading: false,
              error: `❌ Invalid code "${code}". Please ask buyer for correct pickup code.`
            });
          }
        }, 2000);
        
      } catch {
        // Silent fail - continue scanning
      }
    }, 1000); // Check every 1 second instead of 500ms

  } catch (error) {
    updateUI({ cameraError: 'QR scanning failed: ' + error.message });
  }
}, [selectedChat?.transactionId, cleanupCamera, updateVerification, updateUI]);

  // Camera management
  const toggleCamera = useCallback(async () => {
  if (ui.showCamera) {
    cleanupCamera();
    updateUI({ showCamera: false, cameraError: null });
    return;
  }

  try {
    updateUI({ showCamera: true, cameraError: null });
    
    // Increased delay to ensure DOM update and prevent race conditions
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await new Promise(resolve => {
        videoRef.current.onloadedmetadata = resolve;
      });
      await videoRef.current.play();
      
      // Additional delay before starting QR scanning
      setTimeout(startQRScanning, 1500);
    }
  } catch (error) {
    console.error('Camera error:', error);
    updateUI({ cameraError: 'Camera error: ' + error.message, showCamera: false });
  }
}, [ui.showCamera, cleanupCamera, startQRScanning, updateUI]);

  // Manual verification
  const handleVerifyCode = useCallback(async () => {
    if (!verification.code.trim()) {
      updateVerification({ error: 'Please enter verification code' });
      return;
    }

    try {
      updateVerification({ loading: true, error: null, success: null });
      
      await TransactionService.completeTransaction(selectedChat.transactionId, verification.code);
      
      await addDoc(collection(db, 'chats', selectedChat.transactionId, 'messages'), {
        text: '✅ Transaction completed! Funds have been released.',
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'system'
      });
      
      updateVerification({ 
        code: '', 
        loading: false,
        success: '🎉 Transaction completed! 💰 Funds released. 📦 Please deliver item.'
      });
      
    } catch (error) {
      updateVerification({ 
        loading: false,
        error: `Invalid code "${verification.code}". Please try again.`
      });
    }
  }, [verification.code, selectedChat?.transactionId, updateVerification]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !selectedChat) return;
    
    try {
      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
        text: inputMessage.trim(),
        sender: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email,
        timestamp: serverTimestamp(),
        type: 'text'
      });
      
      setInputMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }, [inputMessage, selectedChat]);

  // Delete chat
  const handleDeleteChat = useCallback(async (chatId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        [`hidden.${auth.currentUser.uid}`]: true
      });
      
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  }, [selectedChat?.id]);

  // Optimized timestamp formatting with memoization
  const formatTimestamp = useCallback((timestamp) => {
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
  }, []);

  // Memoized filtered chats
  const filteredChats = useMemo(() => 
    chats.filter(chat => 
      searchTerm === '' || 
      (chat.itemName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chat.otherPartyName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [chats, searchTerm]
  );

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return cleanupCamera;
  }, [cleanupCamera]);

  // Load chats (optimized)
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
      
      for (const doc of snapshot.docs) {
        const chat = doc.data();
        
        if (chat.hidden?.[auth.currentUser.uid]) continue;
        
        const isBuyer = chat.buyerId === auth.currentUser.uid;
        
        chatData.push({
          id: doc.id,
          ...chat,
          isBuyer,
          isSeller: !isBuyer,
          role: isBuyer ? 'buyer' : 'seller',
          otherPartyId: isBuyer ? chat.sellerId : chat.buyerId,
          otherPartyName: isBuyer ? chat.sellerName : chat.buyerName,
          unreadCount: chat.unreadCount?.[auth.currentUser.uid] || 0
        });
      }
      
      setChats(chatData);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  // Load messages (optimized)
  useEffect(() => {
    if (!selectedChat) return;
    
    const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
      }));
      
      setMessages(messageData);
      
      // Mark as read
      if (selectedChat.unreadCount > 0) {
        updateDoc(doc(db, 'chats', selectedChat.id), {
          [`unreadCount.${auth.currentUser.uid}`]: 0
        });
      }
    });
    
    return unsubscribe;
  }, [selectedChat?.id]);

  // Load transaction details (optimized)
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (selectedChat?.transactionId) {
        try {
          const transaction = await TransactionService.getTransactionById(selectedChat.transactionId);
          setTransactionDetails(transaction);
        } catch (error) {
          console.error('Error fetching transaction:', error);
        }
      } else {
        setTransactionDetails(null);
      }
    };
    
    fetchTransactionDetails();
  }, [selectedChat?.transactionId]);

  return (
    <PageContainer>
      <PageHeader>
        <HeaderContent>
          <h1>
            <MessageCircle size={24} />
            Messages
          </h1>
        </HeaderContent>
      </PageHeader>
      
      <MainContent>
        <ContentWrapper>
          <ChatsList>
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
              ) : filteredChats.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '4rem 2rem',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  <h3>No conversations found</h3>
                  <p>
                    {searchTerm ? 
                      `No results matching "${searchTerm}"` : 
                      "You don't have any conversations yet"
                    }
                  </p>
                </div>
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
                        <Package size={20} opacity={0.5} />
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
                      {selectedChat.isBuyer ? <User size={20} /> : <Package size={20} />}
                    </div>
                    
                    <div className="chat-user-details">
                      <div className="chat-title">
                        {selectedChat.otherPartyName || "Unknown user"}
                      </div>
                      <div className="chat-subtitle">
                        {selectedChat.isBuyer ? "Seller" : "Buyer"} • {selectedChat.itemName}
                      </div>
                    </div>
                  </div>
                  
                  {transactionDetails && (
                    <div className="transaction-details">
                      {transactionDetails.approvedQuantity ? 
                        `${transactionDetails.approvedQuantity}x = $${transactionDetails.finalTotalPrice.toFixed(2)}` :
                        transactionDetails.requestedQuantity ? 
                          `${transactionDetails.requestedQuantity}x = $${transactionDetails.totalPrice.toFixed(2)}` :
                          `$${parseFloat(transactionDetails.price || 0).toFixed(2)}`
                      }
                    </div>
                  )}
                </ChatHeader>

                {renderQuantityRequest()}
                
                {renderPaymentForm()}
                
                <ChatBody>
                  {/* Keep existing message rendering */}
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map(renderMessage).filter(Boolean)
                  )}
                  <div ref={messagesEndRef} />
                </ChatBody>

                {selectedChat.isSeller && transactionDetails?.status === 'paid' && (
                  <VerificationSection minimized={verification.minimized}>
                    <h4>
                      <ActionButton 
                          active={!verification.minimized}
                          onClick={() => updateVerification({ minimized: !verification.minimized })}
                          title={verification.minimized ? "Show Code Entry" : "Hide Code Entry"}
                        >
                          <QrCode size={14} />
                        </ActionButton>
                      Redeem Buyer Kode
                    </h4>
                    <div className="content">
                      <p>Enter the buyer's pickup code to complete the transaction:</p>
                      <div className="code-input">
                        <input
                          type="text"
                          placeholder="KODE-XXXXXX"
                          value={verification.code}
                          onChange={(e) => updateVerification({ code: e.target.value.toUpperCase() })}
                          maxLength={11}
                        />
                        <ActionButton 
                          active={!verification.minimized}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleCamera();
                          }}
                          title="Scan QR Code"
                        >
                          <Camera size={20} />
                        </ActionButton>
                      </div>
                      
                      {verification.error && (
                        <div className="message error">{verification.error}</div>
                      )}
                      {verification.success && (
                        <div className="message success">{verification.success}</div>
                      )}
                      
                      <button 
                        className="action-button"
                        onClick={handleVerifyCode} 
                        disabled={!verification.code || verification.loading}
                      >
                        <Check size={18} />
                        {verification.loading ? 'Verifying...' : 'Complete Transaction'}
                      </button>
                    </div>
                  </VerificationSection>
                )}
                
                <ChatInput>
                  <div className="input-container">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <div className="input-actions">
                      <button 
                        className="send-button" 
                        onClick={handleSendMessage} 
                        disabled={!inputMessage.trim()}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </ChatInput>
              </>
            ) : (
              <EmptyState>
                <div className="icon-container">
                  <MessageCircle size={32} />
                </div>
                <h3>No conversation selected</h3>
                <p>Select a conversation from the list to view messages</p>
              </EmptyState>
            )}
          </ChatDisplay>

          {/* Optimized Camera Modal */}
          {ui.showCamera && (
          <CameraModal onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="camera-header">
                <h3>Scan QR Code</h3>
                <p>Point camera at buyer's QR code</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                  ✨ Code will be automatically verified when detected
                </p>
              </div>

              <div className="camera-view">
                <video ref={videoRef} autoPlay playsInline muted />
                <div className="scan-overlay"></div>
              </div>

              <div className="camera-controls">
                <button 
                  className="secondary" 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCamera();
                  }}
                >
                  <X size={16} />
                  Stop Camera
                </button>
              </div>
                
              {ui.cameraError && (
                <div className="error-message">
                  {ui.cameraError}
                </div>
              )}
            </div>
          </CameraModal>
        )}
        </ContentWrapper>
      </MainContent>
    </PageContainer>
  );
};

export default MessagesPage;