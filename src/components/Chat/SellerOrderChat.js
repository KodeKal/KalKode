// src/components/Chat/SellerOrderChat.js - Ultra Simplified
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X, Send, Check } from 'lucide-react';
import { TransactionService } from '../../services/TransactionService';
import { auth, db } from '../../firebase/config';
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp
  } from 'firebase/firestore';

const ChatDrawer = styled.div`
  position: fixed;
  top: 0;
  left: ${props => props.isOpen ? '0' : '-500px'};
  width: 500px;
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

const TransactionDetails = styled.div`
  padding: 1rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};
  
  .transaction-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    
    .item-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .transaction-info {
      flex: 1;
      
      h4 {
        margin: 0 0 0.25rem 0;
        font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
      }
      
      .price {
        font-weight: bold;
        color: ${props => props.theme?.colors?.accent || '#800000'};
      }
      
      .buyer {
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }
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
  
  .time {
    font-size: 0.7rem;
    margin-top: 0.5rem;
    opacity: 0.7;
    text-align: right;
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
    padding: 0.5rem;
    border-radius: 50%;
    
    &:hover {
      background: ${props => `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};
    }
  }
`;

const CodeVerification = styled.div`
  padding: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  margin: 1rem;
  
  h4 {
    color: #4CAF50;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .code-input {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    
    input {
      flex: 1;
      padding: 0.75rem;
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
  }
  
  .error-message {
    color: #F44336;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
`;

const ActionButton = styled.button`
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
`;

const SellerOrderChat = ({ isOpen, onClose, transaction, theme }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState(null);
  const [showCodeInput, setShowCodeInput] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Load chat messages
  useEffect(() => {
    if (!transaction?.id) return;
    
    const q = query(
      collection(db, 'chats', transaction.id, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const loadedMessages = [];
      querySnapshot.forEach((doc) => {
        loadedMessages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        });
      });
      setMessages(loadedMessages);
    });
    
    return () => unsubscribe();
  }, [transaction?.id]);
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !transaction?.id) return;
    
    try {
      await addDoc(collection(db, 'chats', transaction.id, 'messages'), {
        text: inputMessage,
        sender: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email,
        timestamp: serverTimestamp(),
        type: 'text'
      });
      
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setVerificationError('Please enter the verification code');
      return;
    }
    
    try {
      setLoading(true);
      setVerificationError(null);
      
      await TransactionService.completeTransaction(transaction.id, verificationCode);
      
      await addDoc(collection(db, 'chats', transaction.id, 'messages'), {
        text: '✅ Transaction completed:\nFunds have been released.\nStatus: Order fulfilled.',
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'system'
      });
      
      setTimeout(() => onClose(), 2000);
      
    } catch (error) {
      console.error('Error verifying code:', error);
      setVerificationError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (!transaction) {
    return (
      <ChatDrawer isOpen={isOpen} theme={theme}>
        <ChatHeader theme={theme}>
          <h3>Transaction</h3>
          <CloseButton onClick={onClose} theme={theme}>
            <X size={20} />
          </CloseButton>
        </ChatHeader>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          No transaction data available
        </div>
      </ChatDrawer>
    );
  }
  
  return (
    <ChatDrawer isOpen={isOpen} theme={theme}>
      <ChatHeader theme={theme}>
        <h3>Order #{transaction.id.slice(-6)}</h3>
        <CloseButton onClick={onClose} theme={theme}>
          <X size={20} />
        </CloseButton>
      </ChatHeader>
      
      <TransactionDetails theme={theme}>
        <div className="transaction-header">
          <div className="item-image">
            {transaction.itemImage ? (
              <img src={transaction.itemImage} alt={transaction.itemName} />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.8rem'
              }}>
                No image
              </div>
            )}
          </div>
          <div className="transaction-info">
            <h4>{transaction.itemName}</h4>
            <div className="price">${parseFloat(transaction.price).toFixed(2)}</div>
            <div className="buyer">Buyer: {transaction.buyerName}</div>
          </div>
        </div>
      </TransactionDetails>
      
      <ChatMessages>
        {messages.map((msg) => (
          <Message 
            key={msg.id} 
            sent={msg.sender === auth.currentUser?.uid}
            theme={theme}
          >
            {msg.text}
            <div className="time">{formatTime(msg.timestamp)}</div>
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </ChatMessages>
      
      {/* Code Verification */}
      {showCodeInput && (
        <CodeVerification>
          <h4>
            <Check size={18} />
            Complete Transaction
          </h4>
          <p>Enter the buyer's pickup code to complete the transaction:</p>
          <div className="code-input">
            <input
              type="text"
              placeholder="KODE-XXXXXX"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              maxLength={11}
              />
         </div>
         {verificationError && (
           <div className="error-message">{verificationError}</div>
         )}
         <ActionButton 
           onClick={handleVerifyCode} 
           disabled={!verificationCode || loading}
         >
           <Check size={18} />
           {loading ? 'Verifying...' : 'Complete Transaction'}
         </ActionButton>
       </CodeVerification>
     )}
     
     {/* Chat Input */}
     <ChatInput>
       <input
         type="text"
         placeholder="Type a message..."
         value={inputMessage}
         onChange={(e) => setInputMessage(e.target.value)}
         onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
       />
       <button onClick={handleSendMessage}>
         <Send size={20} />
       </button>
     </ChatInput>
   </ChatDrawer>
 );
};

export default SellerOrderChat;
