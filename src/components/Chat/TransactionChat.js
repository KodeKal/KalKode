// src/components/Chat/TransactionChat.js

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc,
  increment 
} from 'firebase/firestore';
import { db, auth, storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Send, Camera, MapPin, Check, X } from 'lucide-react';
import { TransactionService } from '../../services/TransactionService';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px;
  background: ${props => props.theme?.colors?.surface || 'rgba(0, 0, 0, 0.2)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  overflow: hidden;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
`;

const ChatHeader = styled.div`
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: ${props => props.theme?.colors?.text || 'white'};
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h3 {
    margin: 0;
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
  }
`;

const ChatMessages = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  position: relative;
  
  ${props => props.sent ? `
    align-self: flex-end;
    background: ${props.theme?.colors?.accent || '#800000'};
    color: ${props.theme?.colors?.text || 'white'};
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background: ${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.1)'};
    color: ${props.theme?.colors?.text || 'white'};
    border-bottom-left-radius: 4px;
  `}
  
  .time {
    font-size: 0.7rem;
    opacity: 0.7;
    text-align: right;
    margin-top: 0.3rem;
  }
  
  .image-message {
    max-width: 100%;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .location-message {
    background: ${props => `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};
    padding: 0.5rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    .location-title {
      font-weight: bold;
    }
    
    .location-time {
      font-style: italic;
    }
    
    .location-address {
      font-size: 0.9rem;
    }
  }
`;

const ChatInput = styled.div`
  display: flex;
  padding: 1rem;
  border-top: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
  
  input {
    flex-grow: 1;
    background: transparent;
    border: none;
    color: ${props => props.theme?.colors?.text || 'white'};
    padding: 0.5rem;
    
    &:focus {
      outline: none;
    }
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme?.colors?.text || 'white'};
  opacity: 0.7;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    opacity: 1;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }
`;

const TransactionDetails = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '8px'};
  border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
  
  .transaction-title {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .transaction-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    
    img {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      object-fit: cover;
    }
  }
  
  .transaction-details {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: ${props => props.theme?.styles?.borderRadius || '8px'};
  background: ${props => props.primary ? 
    props.theme?.colors?.accent || '#800000' : 
    'transparent'
  };
  color: ${props => props.primary ? 
    'white' : 
    props.theme?.colors?.accent || '#800000'
  };
  border: ${props => props.primary ? 
    'none' : 
    `1px solid ${props.theme?.colors?.accent || '#800000'}`
  };
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    background: ${props => props.primary ? 
      props.theme?.colors?.primary || '#600000' : 
      `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'
    };
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TransactionChat = ({ transactionId, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [transaction, setTransaction] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const currentUser = auth.currentUser;
  const isBuyer = currentUser?.uid === transaction?.buyerId;
  const isSeller = currentUser?.uid === transaction?.sellerId;
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Load transaction data
  useEffect(() => {
    if (!transactionId) return;
    
    const unsubscribe = onSnapshot(
      doc(db, 'transactions', transactionId),
      (doc) => {
        if (doc.exists()) {
          setTransaction({
            id: doc.id,
            ...doc.data()
          });
        }
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [transactionId]);
  
  // Load messages
  useEffect(() => {
    if (!transactionId) return;
    
    const q = query(
      collection(db, 'chats', transactionId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const loadedMessages = [];
      querySnapshot.forEach((doc) => {
        loadedMessages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setMessages(loadedMessages);
      
      // Mark messages as read
      if (currentUser) {
        updateDoc(doc(db, 'chats', transactionId), {
          [`unreadCount.${currentUser.uid}`]: 0
        });
      }
    });
    
    return () => unsubscribe();
  }, [transactionId, currentUser]);
  
  // Send a normal text message
  const sendMessage = async () => {
    if (!message.trim() || !currentUser) return;
    
    try {
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: message,
        sender: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp(),
        type: 'text'
      });
      
      // Update last message
      await updateDoc(doc(db, 'chats', transactionId), {
        lastMessage: message,
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${transaction.buyerId === currentUser.uid ? transaction.sellerId : transaction.buyerId}`]: increment(1)
      });
      
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Send a location for meetup
  const sendLocation = async () => {
    if (!currentUser || !isSeller) return;
    
    try {
      // Get current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Please set a meetup address',
            time: new Date()
          };
          
          // Send location as a message
          await addDoc(collection(db, 'chats', transactionId, 'messages'), {
            location: locationData,
            sender: currentUser.uid,
            senderName: currentUser.displayName || currentUser.email,
            timestamp: serverTimestamp(),
            type: 'location'
          });
          
          // Update transaction with meetup details
          await TransactionService.setMeetupDetails(transactionId, locationData);
          
          // Update last message
          await updateDoc(doc(db, 'chats', transactionId), {
            lastMessage: 'Location shared for meetup',
            lastMessageTime: serverTimestamp(),
            [`unreadCount.${transaction.buyerId}`]: increment(1)
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please check your browser permissions.');
        }
      );
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };
  
  // Upload photo evidence
  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    
    try {
      setUploadingPhoto(true);
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `transactions/${transactionId}/evidence_${Date.now()}`);
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const photoURL = await getDownloadURL(storageRef);
      
      // Send as a message
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        image: photoURL,
        sender: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp(),
        type: 'image'
      });
      
      // Save to transaction
      if (isSeller) {
        await TransactionService.uploadPhotoEvidence(transactionId, photoURL);
      }
      
      // Update last message
      await updateDoc(doc(db, 'chats', transactionId), {
        lastMessage: 'Photo shared',
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${transaction.buyerId === currentUser.uid ? transaction.sellerId : transaction.buyerId}`]: increment(1)
      });
      
      setUploadingPhoto(false);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploadingPhoto(false);
    }
  };
  
  // Verify location proximity
  const verifyLocation = async () => {
    if (!currentUser) return;
    
    try {
      // Get current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          setLocation(currentLocation);
          
          // Compare with meetup location
          if (transaction.meetupDetails) {
            const isProximityVerified = await TransactionService.verifyLocation(
              transactionId,
              currentLocation,
              {
                latitude: transaction.meetupDetails.latitude,
                longitude: transaction.meetupDetails.longitude
              }
            );
            
            // Send as a system message
            await addDoc(collection(db, 'chats', transactionId, 'messages'), {
              text: isProximityVerified 
                ? 'Location proximity verified! You are at the meetup location.' 
                : 'Location verification failed. You are not at the meetup location.',
              sender: 'system',
              senderName: 'System',
              timestamp: serverTimestamp(),
              type: 'system'
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please check your browser permissions.');
        }
      );
    } catch (error) {
      console.error('Error verifying location:', error);
    }
  };
  
  // Complete transaction (buyer)
  const completeTransaction = async () => {
    if (!isBuyer || transaction.status !== 'confirmed') return;
    
    try {
      await TransactionService.completeTransaction(transactionId, transaction.transactionCode);
      
      // Send as a system message
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: 'Transaction completed! Funds have been released to the seller.',
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'system'
      });
    } catch (error) {
      console.error('Error completing transaction:', error);
      alert('Error completing transaction: ' + error.message);
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div>Loading transaction...</div>;
  }
  
  if (!transaction) {
    return <div>Transaction not found</div>;
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <h3>{transaction.itemName} - Transaction</h3>
        <IconButton onClick={onClose}>
          <X size={20} />
        </IconButton>
      </ChatHeader>
      
      <TransactionDetails>
        <div className="transaction-title">Transaction Details</div>
        <div className="transaction-item">
          {transaction.itemImage && (
            <img src={transaction.itemImage} alt={transaction.itemName} />
          )}
          <div>{transaction.itemName}</div>
        </div>
        <div className="transaction-details">
          <div>Price: ${transaction.price.toFixed(2)}</div>
          <div>Status: {transaction.status}</div>
        </div>
        {isBuyer && transaction.transactionCode && (
          <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
            Your transaction code: {transaction.transactionCode}
          </div>
        )}
        {transaction.meetupType === 'locker' && isBuyer && transaction.lockerCode && (
          <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
            Locker code: {transaction.lockerCode}
          </div>
        )}
      </TransactionDetails>
      
      <ChatMessages>
        {messages.map(msg => (
          <Message 
            key={msg.id} 
            sent={msg.sender === currentUser?.uid}
            theme={transaction.theme}
          >
            {msg.type === 'text' && (
              <>
                <div>{msg.text}</div>
                <div className="time">{formatTime(msg.timestamp)}</div>
              </>
            )}
            
            {msg.type === 'image' && (
              <>
                <img 
                  src={msg.image} 
                  alt="Shared" 
                  className="image-message" 
                />
                <div className="time">{formatTime(msg.timestamp)}</div>
              </>
            )}
            
            {msg.type === 'location' && (
              <div className="location-message">
                <div className="location-title">Meetup Location</div>
                <div className="location-address">{msg.location.address}</div>
                <div className="location-time">
                  Time: {new Date(msg.location.time).toLocaleString()}
                </div>
                <div className="time">{formatTime(msg.timestamp)}</div>
              </div>
            )}
            
            {msg.type === 'system' && (
              <div style={{ fontStyle: 'italic', opacity: 0.8 }}>
                {msg.text}
                <div className="time">{formatTime(msg.timestamp)}</div>
              </div>
            )}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </ChatMessages>
      
      {transaction.status !== 'completed' && (
        <>
          <ActionButtons>
            {isSeller && transaction.status === 'pending' && (
              <ActionButton primary onClick={sendLocation}>
                <MapPin size={16} />
                Set Meetup
              </ActionButton>
            )}
            
            {transaction.status === 'confirmed' && (
              <ActionButton onClick={verifyLocation}>
                <MapPin size={16} />
                Verify Location
              </ActionButton>
            )}
            
            {isBuyer && transaction.status === 'confirmed' && (
              <ActionButton primary onClick={completeTransaction}>
                <Check size={16} />
                Complete Transaction
              </ActionButton>
            )}
          </ActionButtons>
          
          <ChatInput>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            
            <div className="actions">
              <IconButton 
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingPhoto}
              >
                <Camera size={20} />
              </IconButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={uploadPhoto}
              />
              
              <IconButton onClick={sendMessage} disabled={!message.trim()}>
                <Send size={20} />
              </IconButton>
            </div>
          </ChatInput>
        </>
      )}
    </ChatContainer>
  );
};

export default TransactionChat;