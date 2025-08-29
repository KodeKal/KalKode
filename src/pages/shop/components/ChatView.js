// src/pages/shop/components/ChatView.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  User, Package, ChevronLeft, Send
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
  
  .mobile-back-btn {
    display: none;
    
    @media (max-width: 768px) {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: #FFFFFF;
      cursor: pointer;
      padding: 0.5rem;
      margin-right: 0.5rem;
      border-radius: 50%;
      
      &:hover {
        background: rgba(128, 0, 0, 0.2);
      }
    }
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

    @media (max-width: 768px) {
      display: none;
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
  line-height: 1.4;
  white-space: pre-wrap;
  
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

  &.system-message {
    align-self: center;
    background: rgba(0, 188, 212, 0.1);
    border: 1px solid rgba(0, 188, 212, 0.3);
    color: #00BCD4;
    font-style: italic;
    max-width: 85%;
    
    .message-time {
      text-align: center;
    }
  }

  .qr-code-section {
    background: rgba(76, 175, 80, 0.2);
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    border: 1px solid rgba(76, 175, 80, 0.3);
    text-align: center;
    
    .qr-title {
      font-weight: bold;
      color: #4CAF50;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    img {
      border-radius: 4px;
      margin: 0.5rem 0;
    }
    
    .transaction-code {
      font-family: monospace;
      font-size: 1.2rem;
      font-weight: bold;
      letter-spacing: 2px;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
    
    .pickup-instructions {
      font-size: 0.8rem;
      opacity: 0.8;
      margin-top: 0.5rem;
    }
  }

  @media (max-width: 768px) {
    max-width: 85%;
    padding: 0.75rem;
    
    &.system-message {
      max-width: 95%;
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
  
  p {
    margin: 0;
  }
`;

const ChatView = ({ chat, isMobile, onBackToList }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);
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
              🎉 Payment Successful!
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
      <ChatHeader>
        <div className="left-section">
          <button 
            className="mobile-back-btn"
            onClick={onBackToList}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="avatar">
            {chat.isBuyer ? <User size={20} /> : <Package size={20} />}
          </div>
          
          <div className="chat-user-details">
            <div className="chat-title">
              {chat.otherPartyName || "Unknown user"}
            </div>
            <div className="chat-subtitle">
              {chat.isBuyer ? "Seller" : "Buyer"} • {chat.itemName}
            </div>
          </div>
        </div>
        
        {transactionAmount && (
          <div className="transaction-details">
            ${transactionAmount}
          </div>
        )}
      </ChatHeader>

      {/* Transaction Status Card */}
      {transactionDetails && (
        <TransactionStatusCard
          transaction={transactionDetails}
          chat={chat}
          transactionId={chat.transactionId}
        />
      )}

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
      {chat.isSeller && transactionDetails?.status === 'paid' && (
        <VerificationSection
          transactionId={chat.transactionId}
          transactionCode={transactionDetails.transactionCode}
        />
      )}
      
      {/* Chat Input - only show if transaction is not completed/cancelled */}
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