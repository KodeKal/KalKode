// src/pages/shop/components/ChatView.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  User, Package, ChevronLeft, Send, ChevronDown
} from 'lucide-react';
import { 
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc
} from 'firebase/firestore';
import { db, auth } from '../../../firebase/config';

// Import sub-components
import TransactionStatusCard from './TransactionStatusCard';
import VerificationSection from './VerificationSection';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
`;

const HeaderStatusButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.2)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.2)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.2)';
      case 'paid': return 'rgba(33, 150, 243, 0.2)';
      case 'withdrawn': return 'rgba(156, 39, 176, 0.2)';
      case 'completed': return 'rgba(76, 175, 80, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border: 1px solid ${props => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.5)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.5)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.5)';
      case 'paid': return 'rgba(33, 150, 243, 0.5)';
      case 'withdrawn': return 'rgba(156, 39, 176, 0.5)';
      case 'completed': return 'rgba(76, 175, 80, 0.5)';
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  }};
  border-radius: 8px;
  color: white;
  cursor: pointer;
  padding: 0.6rem 1rem;
  transition: all 0.3s ease;
  height: 40px;
  font-family: ${props => props.theme?.fonts?.body || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    background: ${props => {
      switch(props.status) {
        case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.3)';
        case 'seller_accepted': return 'rgba(76, 175, 80, 0.3)';
        case 'seller_rejected': return 'rgba(244, 67, 54, 0.3)';
        case 'paid': return 'rgba(33, 150, 243, 0.3)';
        case 'withdrawn': return 'rgba(156, 39, 176, 0.3)';
        case 'completed': return 'rgba(76, 175, 80, 0.3)';
        default: return 'rgba(255, 255, 255, 0.2)';
      }
    }};
  }
  
  .status-icon {
    font-size: 1rem;
    line-height: 1;
  }
  
  .status-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-family: ${props => props.theme?.fonts?.body || 'inherit'};
    
    .main-text {
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.2;
      color: white;
      font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
      letter-spacing: -0.01em;
    }
    
    .sub-text {
      font-size: 0.75rem;
      opacity: 0.85;
      line-height: 1.2;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 400;
      margin-top: 0.1rem;
      font-family: ${props => props.theme?.fonts?.body || 'inherit'};
    }
  }
  
  .dropdown-icon {
    margin-left: 0.25rem;
    transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.3s ease;
    color: rgba(255, 255, 255, 0.8);
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    height: 36px;
    gap: 0.4rem;
    
    .status-text {
      display: none; // Hide text on mobile
    }
    
    .status-icon {
      font-size: 1.1rem;
    }
    
    .dropdown-icon {
      margin-left: 0.1rem;
      
      svg {
        width: 14px;
        height: 14px;
      }
    }
  }
`;

// Also update the ChatHeader to pass theme
const ChatHeader = styled.div`
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid rgba(128, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
  
  .left-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    min-width: 0;
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
    flex-shrink: 0;
  }
  
  .chat-details {
    flex: 1;
    min-width: 0;
    font-family: ${props => props.theme?.fonts?.body || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
    
    .item-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
      font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
      font-size: 1rem;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
      letter-spacing: -0.01em;
    }
    
    .seller-info {
      font-size: 0.85rem;
      opacity: 0.8;
      color: rgba(255, 255, 255, 0.8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
      font-weight: 400;
      font-family: ${props => props.theme?.fonts?.body || 'inherit'};
      
      .seller-label {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.8rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        font-family: ${props => props.theme?.fonts?.mono || 'SFMono-Regular, Consolas, monospace'};
      }
    }
  }
  
  .status-section {
    flex-shrink: 0;
    margin-left: 1rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    
    .left-section {
      gap: 0.75rem;
    }
    
    .avatar {
      width: 36px;
      height: 36px;
    }
    
    .chat-details {
      .item-name {
        font-size: 0.9rem;
      }
      
      .seller-info {
        font-size: 0.8rem;
        
        .seller-label {
          font-size: 0.75rem;
        }
      }
    }
    
    .status-section {
      margin-left: 0.5rem;
    }
  }
`;

// UPDATE: Change StatusDropdown to push content instead of overlay
const StatusDropdown = styled.div`
  background: ${props => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.1)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.1)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.1)';
      case 'paid': return 'rgba(33, 150, 243, 0.1)';
      case 'withdrawn': return 'rgba(156, 39, 176, 0.1)';
      case 'completed': return 'rgba(76, 175, 80, 0.1)';
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  }};
  border-bottom: 1px solid ${props => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.3)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.3)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.3)';
      case 'paid': return 'rgba(33, 150, 243, 0.3)';
      case 'withdrawn': return 'rgba(156, 39, 176, 0.3)';
      case 'completed': return 'rgba(76, 175, 80, 0.3)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  flex-shrink: 0; // Prevent dropdown from shrinking
  transition: all 0.3s ease;
  max-height: ${props => props.expanded ? '500px' : '0'};
  opacity: ${props => props.expanded ? '1' : '0'};
  overflow: hidden;
  box-shadow: ${props => props.expanded ? '0 4px 20px rgba(0, 0, 0, 0.3)' : 'none'};
`;

const ChatBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0; // Allow flex child to shrink

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

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Message = styled.div`
  max-width: 70%;
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5; // Improved line height for readability
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: ${props => props.theme?.fonts?.body || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'};
  font-weight: 400;
  
  align-self: ${props => props.sent ? 'flex-end' : 'flex-start'};
  background: ${props => props.sent ? 
    props.theme?.colors?.accent || 'linear-gradient(45deg, #800000, #4A0404)' : 
    'rgba(0, 0, 0, 0.4)'
  };
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  ${props => props.sent ? 
    'border-bottom-right-radius: 4px;' : 
    'border-bottom-left-radius: 4px;'
  }
  
  .message-time {
    margin-top: 0.6rem;
    font-size: 0.75rem;
    opacity: 0.7;
    text-align: right;
    font-family: ${props => props.theme?.fonts?.mono || 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace'};
    letter-spacing: 0.3px;
  }

  &.system-message {
    align-self: center;
    background: rgba(0, 188, 212, 0.15);
    border: 1px solid rgba(0, 188, 212, 0.4);
    color: #00E5FF;
    font-style: normal; // Remove italic
    font-weight: 500;
    max-width: 85%;
    font-family: ${props => props.theme?.fonts?.body || 'inherit'};
    
    .message-time {
      text-align: center;
      color: rgba(0, 229, 255, 0.8);
    }
  }

  .qr-code-section {
    background: rgba(76, 175, 80, 0.2);
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    border: 1px solid rgba(76, 175, 80, 0.3);
    text-align: center;
    font-family: ${props => props.theme?.fonts?.body || 'inherit'};
    
    .qr-title {
      font-weight: 600;
      color: #4CAF50;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 1rem;
    }
    
    img {
      border-radius: 4px;
      margin: 0.5rem 0;
    }
    
    .transaction-code {
      font-family: ${props => props.theme?.fonts?.mono || 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace'};
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 2px;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      color: #4CAF50;
    }
    
    .pickup-instructions {
      font-size: 0.85rem;
      opacity: 0.9;
      margin-top: 0.5rem;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.4;
    }
  }

  @media (max-width: 768px) {
    max-width: 85%;
    padding: 0.75rem;
    font-size: 0.9rem;
    
    &.system-message {
      max-width: 95%;
      font-size: 0.9rem;
    }
    
    .message-time {
      font-size: 0.7rem;
    }
    
    .qr-code-section {
      .qr-title {
        font-size: 0.95rem;
      }
      
      .transaction-code {
        font-size: 1.1rem;
      }
      
      .pickup-instructions {
        font-size: 0.8rem;
      }
    }
  }
`;

// Also update the ChatInput styled component for better text input styling
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
    font-size: 0.95rem;
    font-family: ${props => props.theme?.fonts?.body || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
    font-weight: 400;
    line-height: 1.4;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #800000;
      box-shadow: 0 0 0 2px rgba(128, 0, 0, 0.3);
      background: rgba(0, 0, 0, 0.8);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
      font-style: normal;
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
    
    &:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: scale(1);
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;
    
    input {
      padding: 0.75rem 2.5rem 0.75rem 1rem;
    }
    
    .send-button {
      width: 32px;
      height: 32px;
    }
  }
`;

const EmptyMessages = styled.div`
  text-align: center;
  padding: 2rem;
  opacity: 0.7;
  font-family: ${props => props.theme?.fonts?.body || 'inherit'};
  
  p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 400;
  }
`;

const ChatView = ({ chat, isMobile, onBackToList, theme }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [statusExpanded, setStatusExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUser = auth.currentUser;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages
  useEffect(() => {
    if (!chat?.id) return;
    
    const messagesRef = collection(db, 'chats', chat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
      }));
      
      setMessages(messageData);
      
      // Mark as read
      if (chat.unreadCount > 0) {
        updateDoc(doc(db, 'chats', chat.id), {
          [`unreadCount.${currentUser.uid}`]: 0
        });
      }
    });
    
    return unsubscribe;
  }, [chat?.id, chat?.unreadCount, currentUser?.uid]);

  // Load transaction details from chat data
  useEffect(() => {
    if (chat?.pendingPurchase) {
      setTransactionDetails(chat.pendingPurchase);
    } else if (chat?.transactionId) {
      // Could fetch full transaction details here if needed
      setTransactionDetails(null);
    }
  }, [chat]);

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !chat) return;
    
    try {
      await addDoc(collection(db, 'chats', chat.id, 'messages'), {
        text: inputMessage.trim(),
        sender: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp(),
        type: 'text'
      });
      
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getStatusInfo = () => {
    if (!transactionDetails) return null;
    
    switch(transactionDetails.status) {
      case 'pending_seller_acceptance':
        return {
          icon: '⏳',
          main: 'Pending Request',
          sub: `${transactionDetails.requestedQuantity || 1}x requested`
        };
      case 'seller_accepted':
        return {
          icon: '✅',
          main: 'Accepted',
          sub: `${transactionDetails.approvedQuantity || 1}x approved`
        };
      case 'seller_rejected':
        return {
          icon: '❌',
          main: 'Declined',
          sub: 'Request declined'
        };
      case 'paid':
        return {
          icon: '💰',
          main: 'Paid',
          sub: 'Awaiting pickup'
        };
      case 'withdrawn':
        return {
          icon: '🔄',
          main: 'Withdrawn',
          sub: 'Payment cancelled'
        };
      case 'completed':
        return {
          icon: '🎉',
          main: 'Completed',
          sub: 'Transaction done'
        };
      default:
        return {
          icon: '📦',
          main: 'Processing',
          sub: 'In progress'
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Format timestamp
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
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render message based on type
  const renderMessage = (message) => {
    const currentUserId = currentUser?.uid;
    
    // Check if message is visible to current user
    if (message.visibleTo && !message.visibleTo.includes(currentUserId)) {
      return null;
    }
    
    const isSystemMessage = message.sender === 'system';
    const isSentByUser = message.sender === currentUserId;
    
    return (
      <Message 
        key={message.id} 
        sent={isSentByUser}
        className={isSystemMessage ? 'system-message' : ''}
      >
        {/* Handle payment success messages with QR codes */}
        {message.type === 'payment_success' && message.purchaseData?.transactionCode && (
          <div className="qr-code-section">
            <div className="qr-title">
              🎉 Escrow Payment Successful!
            </div>
            <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Show this code to the seller for pickup:
            </div>
            
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${message.purchaseData.transactionCode}&size=120x120`}
              alt="QR Code"
            />
            
            <div className="transaction-code">
              {message.purchaseData.transactionCode}
            </div>
            
            <div className="pickup-instructions">
              Keep this code safe until pickup is complete
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

  // Get transaction amount for header display
  const getTransactionAmount = () => {
    if (transactionDetails?.finalTotalPrice) {
      return transactionDetails.finalTotalPrice.toFixed(2);
    } else if (transactionDetails?.totalPrice) {
      return transactionDetails.totalPrice.toFixed(2);
    }
    return null;
  };

  const transactionAmount = getTransactionAmount();

  return (
    <ChatContainer>
      {/* Chat Header */}
      <ChatHeader theme={theme}>
        <div className="left-section">
          <div className="avatar">
            {chat.isBuyer ? <User size={20} /> : <Package size={20} />}
          </div>
          
          <div className="chat-details">
            <div className="item-name">
              {chat.itemName || "Unknown Item"}
            </div>
            <div className="seller-info">
              <span className="seller-label">Seller:</span> {chat.otherPartyName || "Unknown Store"}
            </div>
          </div>
        </div>
        
        {/* Status Button */}
        {transactionDetails && statusInfo && (
          <div className="status-section">
            <HeaderStatusButton
              status={transactionDetails.status}
              expanded={statusExpanded}
              onClick={() => setStatusExpanded(!statusExpanded)}
              theme={theme}
            >
              <span className="status-icon">{statusInfo.icon}</span>
              <div className="status-text">
                <span className="main-text">{statusInfo.main}</span>
                <span className="sub-text">{statusInfo.sub}</span>
              </div>
              <ChevronDown className="dropdown-icon" size={16} />
            </HeaderStatusButton>
          </div>
        )}
      </ChatHeader>

      {/* Status Dropdown - Now pushes content down instead of overlaying */}
      {transactionDetails && (
        <StatusDropdown 
          status={transactionDetails.status}
          expanded={statusExpanded}
        >
          <TransactionStatusCard
            transaction={transactionDetails}
            chat={chat}
            transactionId={chat.transactionId}
            isDropdown={true}
          />
        </StatusDropdown>
      )}

      {/* Chat Body - Now gets pushed down when dropdown expands */}
      <ChatBody>
        {messages.length === 0 ? (
          <EmptyMessages>
            <p>No messages yet. Start the conversation!</p>
          </EmptyMessages>
        ) : (
          messages.map(renderMessage).filter(Boolean)
        )}
        <div ref={messagesEndRef} />
      </ChatBody>

      {/* Verification Section for sellers when transaction is paid */}
      {chat.isSeller && transactionDetails?.status === 'paid' && !statusExpanded && (
        <VerificationSection
          transactionId={chat.transactionId}
          transactionCode={transactionDetails.transactionCode}
        />
      )}
      
      {/* Chat Input */}
      {!['completed', 'seller_rejected', 'withdrawn'].includes(transactionDetails?.status) && (
        <ChatInput>
          <div className="input-container">
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
          </div>
          
          <button 
            className="send-button" 
            onClick={handleSendMessage} 
            disabled={!inputMessage.trim()}
          >
            <Send size={16} />
          </button>
        </ChatInput>
      )}
    </ChatContainer>
  );
};

export default ChatView;