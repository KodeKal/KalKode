// src/components/Chat/SellerOrderChat.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  X, 
  Send, 
  MapPin, 
  Check, 
  MessageCircle, 
  Camera, 
  Calendar, 
  Clock, 
  DollarSign,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Upload
} from 'lucide-react';
import { TransactionService } from '../../services/TransactionService';
import { auth, db, storage } from '../../firebase/config';
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp,
    doc,
    getDoc,
    updateDoc,
    increment 
  } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  
  .transaction-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    font-size: 0.9rem;
    
    .detail {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      .label {
        opacity: 0.7;
      }
      
      .value {
        font-weight: 500;
      }
    }
  }
  
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    
    &.pending {
      background: rgba(255, 152, 0, 0.2);
      color: #FF9800;
    }
    
    &.awaiting_seller {
      background: rgba(33, 150, 243, 0.2);
      color: #2196F3;
    }
    
    &.confirmed {
      background: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }
    
    &.completed {
      background: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }
    
    &.cancelled {
      background: rgba(244, 67, 54, 0.2);
      color: #F44336;
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
  
  .image-message {
    max-width: 100%;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .verification-code {
    font-family: monospace;
    font-size: 1.2rem;
    font-weight: bold;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.5rem;
    border-radius: 4px;
    text-align: center;
    border: 1px dashed rgba(255, 255, 255, 0.2);
    margin: 0.5rem 0;
  }
`;

const SystemMessage = styled(Message)`
  background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.2)'};
  align-self: center;
  text-align: center;
  font-style: italic;
  max-width: 90%;
  
  &.status-message {
    background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
    border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
    font-weight: 500;
  }
  
  &.alert-message {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
    color: #FFC107;
  }
  
  &.success-message {
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.3);
    color: #4CAF50;
  }
  
  &.error-message {
    background: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
    color: #F44336;
  }
`;

const LocationMessage = styled(Message)`
  background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  
  .location-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .location-details {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }
  
  .location-time {
    font-style: italic;
    font-size: 0.9rem;
    opacity: 0.8;
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
`;

const ChatControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
`;

const IconButton = styled.button`
  background: ${props => props.active ? `${props.theme?.colors?.accent}20` : 'transparent'};
  border: none;
  color: ${props => props.theme?.colors?.accent || '#800000'};
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: all 0.2s;
  
  &:hover {
    opacity: 1;
    background: ${props => `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionSection = styled.div`
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: ${props => props.variant === 'accept' ? 
    '#4CAF50' : 
    props.variant === 'deny' ? 
    '#F44336' : 
    props.theme?.colors?.accent || '#800000'
  };
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

const MeetupForm = styled.div`
  padding: 1rem;
  background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  border-radius: 12px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  margin: 0 1rem 1rem;
  
  h4 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    margin: 0 0 1rem 0;
    font-size: 1rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    
    input, textarea {
      width: 100%;
      padding: 0.75rem;
      background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.2)'}90`};
      border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
      border-radius: 8px;
      color: ${props => props.theme?.colors?.text || 'white'};
      
      &:focus {
        outline: none;
        border-color: ${props => props.theme?.colors?.accent || '#800000'};
      }
    }
    
    textarea {
      min-height: 80px;
      resize: vertical;
    }
  }
  
  .buttons {
    display: flex;
    gap: 0.5rem;
  }
`;

const VerificationCheck = styled.div`
  padding: 1rem;
  background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  border-radius: 12px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  margin: 0 1rem 1rem;
  
  h4 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    margin: 0 0 1rem 0;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  
  .code-input {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    
    input {
      flex: 1;
      padding: 0.75rem;
      background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.2)'}90`};
      border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
      border-radius: 8px;
      color: ${props => props.theme?.colors?.text || 'white'};
      font-family: monospace;
      font-size: 1.2rem;
      text-align: center;
      letter-spacing: 2px;
      
      &:focus {
        outline: none;
        border-color: ${props => props.theme?.colors?.accent || '#800000'};
      }
    }
  }
  
  .error-message {
    color: #F44336;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
`;

// The actual SellerOrderChat component
const SellerOrderChat = ({ isOpen, onClose, transaction, theme }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showMeetupForm, setShowMeetupForm] = useState(false);
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [meetupAddress, setMeetupAddress] = useState('');
  const [meetupDetails, setMeetupDetails] = useState('');
  const [meetupTime, setMeetupTime] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
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
  
  const handleAcceptOrder = async () => {
    try {
      setLoading(true);
      console.log('Accepting transaction:', transaction.id);
      await TransactionService.acceptTransaction(transaction.id);
      
      // Add a system message
      await addDoc(collection(db, 'chats', transaction.id, 'messages'), {
        text: 'Order accepted by seller. Please arrange for pickup.',
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'system',
        messageClass: 'success-message'
      });
      
      // Update unread count for buyer
      await updateDoc(doc(db, 'chats', transaction.id), {
        [`unreadCount.${transaction.buyerId}`]: increment(1),
        lastMessage: 'Order accepted by seller',
        lastMessageTime: serverTimestamp()
      });
      
      setShowMeetupForm(true);
    } catch (error) {
      console.error('Error accepting order:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRejectOrder = async () => {
    try {
      setLoading(true);
      console.log('Rejecting transaction:', transaction.id);
      await TransactionService.rejectTransaction(transaction.id, 'Rejected by seller');
      
      // Add a system message
      await addDoc(collection(db, 'chats', transaction.id, 'messages'), {
        text: 'Order rejected by seller.',
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'system',
        messageClass: 'error-message'
      });
      
      // Update unread count for buyer
      await updateDoc(doc(db, 'chats', transaction.id), {
        [`unreadCount.${transaction.buyerId}`]: increment(1),
        lastMessage: 'Order rejected by seller',
        lastMessageTime: serverTimestamp()
      });
      
      onClose();
    } catch (error) {
      console.error('Error rejecting order:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSetMeetup = async () => {
    try {
      setLoading(true);
      
      // Create meetup location object
      const meetupLocation = {
        address: meetupAddress,
        details: meetupDetails,
        time: meetupTime ? new Date(meetupTime).toISOString() : new Date().toISOString(),
        timestamp: new Date()
      };
      
      await TransactionService.setMeetupDetails(transaction.id, meetupLocation);
      
      setShowMeetupForm(false);
    } catch (error) {
      console.error('Error setting meetup:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !transaction?.id) return;
    
    try {
      setUploadingPhoto(true);
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `transactions/${transaction.id}/evidence_${Date.now()}`);
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const photoURL = await getDownloadURL(storageRef);
      
      // Send as a message
      await addDoc(collection(db, 'chats', transaction.id, 'messages'), {
        image: photoURL,
        sender: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email,
        timestamp: serverTimestamp(),
        type: 'image'
      });
      
      // Save to transaction
      await TransactionService.uploadPhotoEvidence(transaction.id, photoURL);
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
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
      
      setShowCodeVerification(false);
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
  
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  // Show appropriate UI based on transaction status
  const renderActionSection = () => {
    if (!transaction) return null;
    
    if (transaction.status === 'awaiting_seller') {
      return (
        <ActionSection>
          <ActionButton variant="deny" onClick={handleRejectOrder} disabled={loading}>
            <ThumbsDown size={18} />
            Reject Order
          </ActionButton>
          <ActionButton variant="accept" onClick={handleAcceptOrder} disabled={loading}>
            <ThumbsUp size={18} />
            Accept Order
          </ActionButton>
        </ActionSection>
      );
    }
    
    if (transaction.status === 'confirmed') {
      return (
        <ActionSection>
          <ActionButton onClick={() => setShowCodeVerification(true)} disabled={loading}>
            <DollarSign size={18} />
            Complete Sale
          </ActionButton>
        </ActionSection>
      );
    }
    
    return null;
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
        <h3>Transaction #{transaction.id.slice(-6)}</h3>
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
          <div className="status">
            <span className={`status-badge ${transaction.status}`}>
              {transaction.status}
            </span>
          </div>
        </div>
        
        <div className="transaction-details">
          <div className="detail">
            <Calendar size={14} />
            <span className="label">Date:</span>
            <span className="value">{formatDate(transaction.createdAt)}</span>
          </div>
          <div className="detail">
            <Clock size={14} />
            <span className="label">Time:</span>
            <span className="value">{formatTime(transaction.createdAt)}</span>
          </div>
          <div className="detail">
            <DollarSign size={14} />
            <span className="label">Payment:</span>
            <span className="value">{transaction.paymentStatus}</span>
          </div>
          <div className="detail">
            <MapPin size={14} />
            <span className="label">Meetup:</span>
            <span className="value">{transaction.meetupType}</span>
          </div>
        </div>
      </TransactionDetails>
      
      <ChatMessages>
        {messages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <SystemMessage 
                key={msg.id} 
                theme={theme}
                className={msg.messageClass}
              >
                {msg.text}
                <div className="time">{formatTime(msg.timestamp)}</div>
              </SystemMessage>
            );
          }
          
          if (msg.type === 'image') {
            return (
              <Message 
                key={msg.id} 
                sent={msg.sender === auth.currentUser?.uid}
                theme={theme}
              >
                <img 
                  src={msg.image} 
                  alt="Shared"
                  className="image-message"
                />
                <div className="time">{formatTime(msg.timestamp)}</div>
              </Message>
            );
          }
          
          if (msg.type === 'location') {
            return (
              <LocationMessage
                key={msg.id}
                theme={theme}
              >
                <div className="location-header">
                  <MapPin size={16} />
                  Meetup Location
                </div>
                <div className="location-details">
                  {msg.location.address}
                  {msg.location.details && (
                    <div style={{ marginTop: '0.5rem' }}>
                      {msg.location.details}
                    </div>
                  )}
                </div>
                <div className="location-time">
                  Time: {new Date(msg.location.time).toLocaleString()}
                </div>
                <div className="time">{formatTime(msg.timestamp)}</div>
              </LocationMessage>
            );
          }
          
          if (msg.type === 'verification-code' && msg.sender === auth.currentUser?.uid) {
            return (
              <Message 
                key={msg.id} 
                sent
                theme={theme}
              >
                <div>Verification code for buyer:</div>
                <div className="verification-code">{msg.code}</div>
                <div className="time">{formatTime(msg.timestamp)}</div>
              </Message>
            );
          }
          
          return (
            <Message 
              key={msg.id} 
              sent={msg.sender === auth.currentUser?.uid}
              theme={theme}
            >
              {msg.text}
              <div className="time">{formatTime(msg.timestamp)}</div>
            </Message>
          );
        })}
        <div ref={messagesEndRef} />
      </ChatMessages>
      
      {showMeetupForm && (
        <MeetupForm theme={theme}>
          <h4>Set Meetup Details</h4>
          <div className="form-group">
            <label>Meetup Location</label>
            <input 
              type="text"
              placeholder="Enter address"
              value={meetupAddress}
              onChange={(e) => setMeetupAddress(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Additional Details</label>
            <textarea
              placeholder="Any specific instructions for the meetup"
              value={meetupDetails}
              onChange={(e) => setMeetupDetails(e.target.value)}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Meetup Time</label>
            <input 
              type="datetime-local"
              value={meetupTime}
              onChange={(e) => setMeetupTime(e.target.value)}
            />
          </div>
          <div className="buttons">
            <ActionButton onClick={() => setShowMeetupForm(false)} variant="deny">
              Cancel
            </ActionButton>
            <ActionButton 
              onClick={handleSetMeetup} 
              disabled={!meetupAddress || loading}
            >
              <MapPin size={18} />
              Set Meetup
            </ActionButton>
          </div>
        </MeetupForm>
      )}
      
      {showCodeVerification && (
        <VerificationCheck theme={theme}>
          <h4>
            <DollarSign size={18} />
            Complete Transaction
          </h4>
          <p>Enter the verification code provided by the buyer to complete the transaction and receive payment.</p>
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
          <div className="buttons">
            <ActionButton onClick={() => setShowCodeVerification(false)} variant="deny">
              Cancel
            </ActionButton>
            <ActionButton 
              onClick={handleVerifyCode} 
              disabled={!verificationCode || loading}
              variant="accept"
            >
              <Check size={18} />
              Verify Code
            </ActionButton>
          </div>
        </VerificationCheck>
      )}
      
      {renderActionSection()}
      
      {transaction.status === 'confirmed' && (
        <ChatInput>
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <ChatControls>
            <IconButton 
              onClick={() => fileInputRef.current.click()}
              disabled={uploadingPhoto}
              theme={theme}
            >
              <Camera size={20} />
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
            <IconButton 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              theme={theme}
            >
              <Send size={20} />
            </IconButton>
          </ChatControls>
        </ChatInput>
      )}
    </ChatDrawer>
  );
};

export default SellerOrderChat;