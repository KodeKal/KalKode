// src/components/Chat/OrderChat.js
import React, { Navigation, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X, Send, ShoppingCart, MessageCircle, ChevronRight, Check, CreditCard, Clock, MapPin, Star } from 'lucide-react';
import { TransactionService } from '../../services/TransactionService';
import { PaymentService } from '../../services/PaymentService';
import { auth } from '../../firebase/config';
import { CardElement, useStripe, useElements, Elements } from '../Stripe/StripeComponent';
import PickupLocationMap from '../Transaction/PickupLocationMap';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';

// ... (keep all existing styled components)

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

const ItemCard = styled.div`
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
  margin-bottom: 1rem;
  overflow: hidden;
`;

const ItemImage = styled.div`
  height: 180px;
  width: 100%;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemDetails = styled.div`
  padding: 1rem;
  
  h4 {
    margin: 0 0 0.5rem 0;
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    color: ${props => props.theme?.colors?.text || 'white'};
  }
  
  .price {
    font-weight: bold;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    margin-bottom: 0.5rem;
  }
  
  .description {
    font-size: 0.9rem;
    color: ${props => props.theme?.colors?.text || 'white'};
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
  gap: 0.5rem;
`;

const MessageButtons = styled.div`
  padding: 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MessageButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #1A1F36;
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  font-size: 1rem;
  
  &:hover {
    background: #272B3F;
  }
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem;
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
    background: ${props => props.primary ? 
      props.theme?.colors?.primary || '#600000' : 
      `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'
    };
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CloseConfirmation = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  
  .emojis {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 2rem;
  }
`;

const TransactionFlow = styled.div`
  padding: 1rem;
  background: ${props => props.status === 'confirmed' ? 
    'rgba(76, 175, 80, 0.1)' : 
    props.status === 'awaiting_seller' ?
    'rgba(33, 150, 243, 0.1)' :
    'rgba(255, 152, 0, 0.1)'
  };
  border: 1px solid ${props => props.status === 'confirmed' ?
    'rgba(76, 175, 80, 0.3)' :
    props.status === 'awaiting_seller' ?
    'rgba(33, 150, 243, 0.3)' :
    'rgba(255, 152, 0, 0.3)'
  };
  border-radius: 12px;
  margin-bottom: 1rem;
  
  h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: ${props => props.status === 'confirmed' ?
      '#4CAF50' :
      props.status === 'awaiting_seller' ?
      '#2196F3' :
      '#FF9800'
    };
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
  }
  
  .status-message {
    margin-bottom: 1rem;
  }
  
  .action-buttons {
    display: flex;
    gap: 0.5rem;
  }
`;

const StatusButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.primary ? 
    props.theme?.colors?.accent || '#800000' : 
    'rgba(255, 255, 255, 0.05)'
  };
  color: ${props => props.primary ? 
    'white' : 
    props.theme?.colors?.text || 'white'
  };
  border: 1px solid ${props => props.primary ? 
    'transparent' : 
    props.theme?.colors?.accent || '#800000'
  };
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => props.primary ? 
      props.theme?.colors?.primary || '#600000' : 
      'rgba(255, 255, 255, 0.1)'
    };
  }
`;

const PaymentForm = styled.div`
  margin: 1rem;
  padding: 1rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`};
  border-radius: 12px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
  
  h4 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    margin: 0 0 1rem 0;
    color: ${props => props.theme?.colors?.text || 'white'};
  }
  
  .card-element {
    padding: 1rem;
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.2)'}90`};
    border-radius: 8px;
    border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
    margin-bottom: 1rem;
  }
  
  .payment-info {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 1rem;
  }
  
  .error-message {
    color: #F44336;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }
`;

const VerificationCodeForm = styled.div`
  margin: 1rem;
  padding: 1rem;
  background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  border-radius: 12px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  
  h4 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    margin: 0 0 0.5rem 0;
    color: ${props => props.theme?.colors?.text || 'white'};
    font-size: 1rem;
  }
  
  p {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  
  .code {
    text-align: center;
    font-family: monospace;
    font-size: 1.4rem;
    font-weight: bold;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    margin: 1rem 0;
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.2)'}90`};
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px dashed ${props => `${props.theme?.colors?.accent}40` || 'rgba(128, 0, 0, 0.4)'};
  }
`;


const ETAForm = styled.div`
  margin: 1rem;
  padding: 1rem;
  background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  border-radius: 12px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  
  h4 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    margin: 0 0 1rem 0;
    color: ${props => props.theme?.colors?.text || 'white'};
    font-size: 1rem;
  }
  
  .eta-input {
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
      
      &:focus {
        outline: none;
        border-color: ${props => props.theme?.colors?.accent || '#800000'};
      }
    }
  }
  
  .buttons {
    display: flex;
    gap: 0.5rem;
  }
`;

const LocationPrompt = styled.div`
  margin: 1rem;
  padding: 1rem;
  background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  border-radius: 12px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  
  h4 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    margin: 0 0 1rem 0;
    color: ${props => props.theme?.colors?.text || 'white'};
    font-size: 1rem;
  }
  
  .location-status {
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-weight: 500;
    
    &.checking {
      background: rgba(255, 152, 0, 0.2);
      color: #FF9800;
    }
    
    &.verified {
      background: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }
    
    &.failed {
      background: rgba(244, 67, 54, 0.2);
      color: #F44336;
    }
  }
`;

const ShareCodePrompt = styled.div`
  margin: 1rem;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  text-align: center;
  
  h4 {
    color: #4CAF50;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
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
  }
  
  .qr-code {
    margin: 1rem 0;
    img {
      width: 150px;
      height: 150px;
      border-radius: 8px;
    }
  }
`;

const RatingForm = styled.div`
  margin: 1rem;
  padding: 1rem;
  background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  border-radius: 12px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  
  h4 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    margin: 0 0 1rem 0;
    color: ${props => props.theme?.colors?.text || 'white'};
    font-size: 1rem;
  }
  
  .rating-section {
    margin-bottom: 1.5rem;
    
    .rating-label {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      opacity: 0.9;
    }
    
    .stars {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 0.5rem;
      
      .star {
        cursor: pointer;
        color: rgba(255, 255, 255, 0.3);
        transition: color 0.2s;
        
        &.filled {
          color: #FFD700;
        }
        
        &:hover {
          color: #FFD700;
        }
      }
    }
  }
  
  textarea {
    width: 100%;
    padding: 0.75rem;
    background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.2)'}90`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 8px;
    color: ${props => props.theme?.colors?.text || 'white'};
    resize: vertical;
    min-height: 80px;
    margin-bottom: 1rem;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme?.colors?.accent || '#800000'};
    }
  }
`;

// The actual OrderChat component
const OrderChat = ({ isOpen, onClose, item, shopId, shopName, theme }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [transactionId, setTransactionId] = useState(null);
  const [transactionCode, setTransactionCode] = useState(null);
  const [status, setStatus] = useState('initial');
  const [closingChat, setClosingChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [showETAForm, setShowETAForm] = useState(false);
  const [eta, setEta] = useState('');
  const [locationStatus, setLocationStatus] = useState(null); // 'checking', 'verified', 'failed'
  const [showShareCode, setShowShareCode] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratings, setRatings] = useState({
    seller: 0,
    product: 0,
    experience: 0
  });
  const [ratingComment, setRatingComment] = useState('');
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          text: `Order item?`,
          sender: 'system',
          item: item,
          timestamp: new Date(),
          type: 'item-inquiry'
        }
      ]);
    }
  }, [isOpen, item, messages.length]);

  // Listen for transaction updates (you'll need to implement this)
  useEffect(() => {
    if (transactionId) {
      // Set up listener for transaction updates
      // This would listen to Firestore changes and update status accordingly
    }
  }, [transactionId]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setMessages([
      ...messages,
      {
        text: inputMessage,
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
      }
    ]);
    
    setInputMessage('');
  };
  
  const handleOrder = async () => {
    try {
      setLoading(true);
      setStatus('ordering');
      
      setMessages(prev => [
        ...prev,
        {
          text: `I'd like to order this item.`,
          sender: 'user',
          timestamp: new Date(),
          type: 'order-request'
        }
      ]);
      
      const result = await TransactionService.initiateTransaction(
        item.id,
        shopId,
        item.price,
        'inperson'
      );
      
      setTransactionId(result.transactionId);
      setTransactionCode(result.transactionCode);
      
      setMessages(prev => [
        ...prev,
        {
          text: `Order initiated! Please proceed with payment to confirm your order.`,
          sender: 'system',
          timestamp: new Date(),
          type: 'system',
          messageClass: 'status-message'
        }
      ]);
      
      setStatus('payment');
    } catch (error) {
      console.error('Error creating order:', error);
      
      setMessages(prev => [
        ...prev,
        {
          text: `Error: ${error.message || 'Failed to create order. Please try again.'}`,
          sender: 'system',
          timestamp: new Date(),
          type: 'system',
          messageClass: 'error-message'
        }
      ]);
      
      setStatus('initial');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePayment = async () => {
    if (!stripe || !elements) {
      setPaymentError('Stripe has not been properly initialized');
      return;
    }
    
    try {
      setLoading(true);
      setPaymentError(null);
      
      const cardElement = elements.getElement(CardElement);
      
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      await PaymentService.processPayment(transactionId, paymentMethod.id);
      
      setMessages(prev => [
        ...prev,
        {
          text: `Payment successful! Your payment is securely held until you pick up the item. The seller has been notified of your order.`,
          sender: 'system',
          senderName: 'System',
          timestamp: new Date(),
          type: 'system',
          messageClass: 'success-message'
        },
        {
          text: `Your order code: ${transactionCode}. Keep this code safe - you'll need it when picking up your item.`,
          sender: 'system',
          timestamp: new Date(),
          type: 'verification-code',
          code: transactionCode,
          showInMessages: true // Flag to show this in messages page
        }
      ]);
      
      setStatus('awaiting_seller');
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message);
      
      setMessages(prev => [
        ...prev,
        {
          text: `Payment error: ${error.message}`,
          sender: 'system',
          senderName: 'System',
          timestamp: new Date(),
          type: 'system',
          messageClass: 'error-message'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePickupConfirmed = (pickupInfo) => {
    setMessages(prev => [
      ...prev,
      {
        text: `Pickup location confirmed: ${pickupInfo.address}`,
        sender: 'seller',
        timestamp: new Date(),
        type: 'pickup-info',
        pickupInfo: pickupInfo
      }
    ]);
    
    setShowETAForm(true);
    setStatus('eta_requested');
  };

  const handleETASubmit = async () => {
    if (!eta.trim()) return;
    
    try {
      // Send ETA to seller via chat message
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: `My estimated arrival time: ${eta}`,
        sender: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email,
        timestamp: serverTimestamp(),
        type: 'eta',
        eta: eta
      });

      setMessages(prev => [
        ...prev,
        {
          text: `ETA shared: ${eta}`,
          sender: 'user',
          timestamp: new Date(),
          type: 'eta-sent'
        }
      ]);

      setShowETAForm(false);
      setStatus('en_route');
    } catch (error) {
      console.error('Error sending ETA:', error);
    }
  };

  const handleArrived = async () => {
    try {
      setLocationStatus('checking');
      
      // Get current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          // Send arrival message
          await addDoc(collection(db, 'chats', transactionId, 'messages'), {
            text: "I've arrived at the pickup location",
            sender: auth.currentUser.uid,
            senderName: auth.currentUser.displayName || auth.currentUser.email,
            timestamp: serverTimestamp(),
            type: 'arrival',
            location: currentLocation
          });

          // Verify location proximity (you'll need to implement this logic)
          const isLocationVerified = await verifyLocationProximity(currentLocation);
          
          if (isLocationVerified) {
            setLocationStatus('verified');
            setShowShareCode(true);
            setStatus('location_verified');
            
            setMessages(prev => [
              ...prev,
              {
                text: "Location verified! You can now share your order code with the seller.",
                sender: 'system',
                timestamp: new Date(),
                type: 'system',
                messageClass: 'success-message'
              }
            ]);
          } else {
            setLocationStatus('failed');
            setMessages(prev => [
              ...prev,
              {
                text: "Location verification failed. Please make sure you're at the correct pickup location.",
                sender: 'system',
                timestamp: new Date(),
                type: 'system',
                messageClass: 'error-message'
              }
            ]);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationStatus('failed');
        }
      );
    } catch (error) {
      console.error('Error handling arrival:', error);
      setLocationStatus('failed');
    }
  };

  const verifyLocationProximity = async (currentLocation) => {
    // Implement location verification logic here
    // Compare with seller's location or pickup location
    // Return true if within acceptable range (e.g., 100 meters)
    return true; // Placeholder
  };

  const handleShareCode = async () => {
    try {
      // Send code sharing message
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: `Here's my order code: ${transactionCode}`,
        sender: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email,
        timestamp: serverTimestamp(),
        type: 'code-share',
        code: transactionCode
      });

      setMessages(prev => [
        ...prev,
        {
          text: "Order code shared with seller",
          sender: 'system',
          timestamp: new Date(),
          type: 'system',
          messageClass: 'success-message'
        }
      ]);

      setShowShareCode(false);
      setStatus('code_shared');
    } catch (error) {
      console.error('Error sharing code:', error);
    }
  };

  const handleTransactionComplete = () => {
    setShowRating(true);
    setStatus('completed');
  };

  const handleRatingSubmit = async () => {
    try {
      const ratingData = {
        transactionId,
        sellerId: shopId,
        ratings: ratings,
        comment: ratingComment,
        timestamp: new Date(),
        buyerId: auth.currentUser.uid
      };

      // Save anonymous rating
      await addDoc(collection(db, 'ratings'), ratingData);

      // Update seller's rating statistics
      await updateDoc(doc(db, 'shops', shopId), {
        'stats.totalRatings': increment(1),
        'stats.totalStars': increment(ratings.seller + ratings.product + ratings.experience),
        'stats.averageRating': (ratings.seller + ratings.product + ratings.experience) / 3
      });

      setMessages(prev => [
        ...prev,
        {
          text: "Thank you for your feedback! Transaction completed successfully.",
          sender: 'system',
          timestamp: new Date(),
          type: 'system',
          messageClass: 'success-message'
        }
      ]);

      setShowRating(false);
      
      // Auto-close chat after rating
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (closingChat) {
    return (
      <ChatDrawer isOpen={isOpen} theme={theme}>
        <ChatHeader theme={theme}>
          <h3>Chat</h3>
          <CloseButton onClick={onClose} theme={theme}>
            <X size={20} />
          </CloseButton>
        </ChatHeader>
        
        <CloseConfirmation>
          <div className="emojis">👍 ✌️</div>
          <p>Thanks for chatting! Have a great day.</p>
        </CloseConfirmation>
      </ChatDrawer>
    );
  }
  
  return (
    <ChatDrawer isOpen={isOpen} theme={theme}>
      <ChatHeader theme={theme}>
        <h3>{shopName || 'Shop Chat'}</h3>
        <CloseButton onClick={onClose} theme={theme}>
          <X size={20} />
        </CloseButton>
      </ChatHeader>
      
      <ItemCard theme={theme}>
        <ItemImage>
          {item.images && item.images[0] && (
            <img src={item.images[0]} alt={item.name} />
          )}
        </ItemImage>
        <ItemDetails theme={theme}>
          <h4>{item.name}</h4>
          <div className="price">${parseFloat(item.price).toFixed(2)}</div>
          {item.description && (
            <div className="description">{item.description}</div>
          )}
        </ItemDetails>
      </ItemCard>
      
      <ChatMessages>
        {messages.map((msg, index) => {
          if (msg.type === 'item-inquiry') {
            return (
              <SystemMessage key={index} theme={theme}>
                {msg.text}
                <div className="time">{formatTime(msg.timestamp)}</div>
              </SystemMessage>
            );
          }
          
          if (msg.type === 'system') {
            return (
              <SystemMessage 
                key={index} 
                theme={theme}
                className={msg.messageClass}
              >
                {msg.text}
                <div className="time">{formatTime(msg.timestamp)}</div>
              </SystemMessage>
            );
          }
          
          if (msg.type === 'verification-code') {
            return (
              <VerificationCodeForm key={index} theme={theme}>
                <h4>Order Code</h4>
                <p>Keep this code safe - you'll need it for pickup:</p>
                <div className="code">{msg.code}</div>
                <p>Show this code to the seller when you arrive.</p>
              </VerificationCodeForm>
            );
          }

          if (msg.type === 'pickup-info') {
            return (
              <Message 
                key={index} 
                sent={msg.sender === 'user'}
                theme={theme}
              >
                <div><strong>Pickup Location:</strong></div>
                <div>{msg.pickupInfo.address}</div>
                {msg.pickupInfo.details && <div>{msg.pickupInfo.details}</div>}
                <div className="time">{formatTime(msg.timestamp)}</div>
              </Message>
            );
          }
          
          return (
            <Message 
              key={index} 
              sent={msg.sender === 'user'}
              theme={theme}
            >
              {msg.text}
              <div className="time">{formatTime(msg.timestamp)}</div>
            </Message>
          );
        })}
        <div ref={messagesEndRef} />
      </ChatMessages>
      
      {/* ETA Form */}
      {showETAForm && (
        <ETAForm theme={theme}>
          <h4>Estimated Time of Arrival?</h4>
          <div className="eta-input">
            <input
              type="text"
              placeholder="e.g., 15 minutes, 2:30 PM"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
            />
          </div>
          <div className="buttons">
            <ActionButton 
              className="secondary"
              onClick={() => setShowETAForm(false)}
              theme={theme}
            >
              Cancel
            </ActionButton>
            <ActionButton 
              className="primary"
              onClick={handleETASubmit}
              disabled={!eta.trim()}
              theme={theme}
            >
              <Send size={16} />
              Send ETA
            </ActionButton>
          </div>
        </ETAForm>
      )}

      {/* Location Status */}
      {locationStatus && (
        <LocationPrompt theme={theme}>
          <h4>Location Verification</h4>
          <div className={`location-status ${locationStatus}`}>
            {locationStatus === 'checking' && 'Checking your location...'}
            {locationStatus === 'verified' && 'Location verified! You\'re at the pickup spot.'}
            {locationStatus === 'failed' && 'Location verification failed. Please check your location.'}
          </div>
        </LocationPrompt>
      )}

      {/* Share Code Prompt */}
      {showShareCode && (
        <ShareCodePrompt>
          <h4>
            <Check size={18} />
            Ready to Complete Transaction
          </h4>
          <p>Share your order code with the seller to receive your item:</p>
          <div className="code-display">{transactionCode}</div>
          <div className="qr-code">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${transactionCode}&size=150x150`} 
              alt="QR Code"
            />
          </div>
          <ActionButton 
            className="primary"
            onClick={handleShareCode}
            theme={theme}
          >
            <Send size={16} />
            Share Code with Seller
          </ActionButton>
        </ShareCodePrompt>
      )}

      {/* Rating Form */}
      {showRating && (
        <RatingForm theme={theme}>
          <h4>Rate Your Experience</h4>
          
          <div className="rating-section">
            <div className="rating-label">Seller Rating:</div>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={24}
                  className={`star ${star <= ratings.seller ? 'filled' : ''}`}
                  onClick={() => setRatings(prev => ({ ...prev, seller: star }))}
                />
              ))}
            </div>
          </div>

          <div className="rating-section">
            <div className="rating-label">Product Quality:</div>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={24}
                  className={`star ${star <= ratings.product ? 'filled' : ''}`}
                  onClick={() => setRatings(prev => ({ ...prev, product: star }))}
                />
              ))}
            </div>
          </div>

          <div className="rating-section">
            <div className="rating-label">Overall Experience:</div>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={24}
                  className={`star ${star <= ratings.experience ? 'filled' : ''}`}
                  onClick={() => setRatings(prev => ({ ...prev, experience: star }))}
                />
              ))}
            </div>
          </div>

          <textarea
            placeholder="Optional: Share your experience (anonymous)"
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
          />

          <div className="buttons">
            <ActionButton 
              className="secondary"
              onClick={() => setShowRating(false)}
              theme={theme}
            >
              Skip Rating
            </ActionButton>
            <ActionButton 
              className="primary"
              onClick={handleRatingSubmit}
              disabled={!ratings.seller || !ratings.product || !ratings.experience}
              theme={theme}
            >
              <Star size={16} />
              Submit Rating
            </ActionButton>
          </div>
        </RatingForm>
      )}
      
      {/* Action Buttons for different states */}
      {status === 'initial' && (
        <MessageButtons>
          <MessageButton onClick={handleOrder}>
            I'd like to order this item.
          </MessageButton>
          <MessageButton onClick={() => setClosingChat(true)}>
            Cancel
          </MessageButton>
        </MessageButtons>
      )}
      
      {status === 'payment' && (
        <PaymentForm theme={theme}>
          <h4>Complete Your Payment</h4>
          <div className="payment-info">
            Your payment will be securely held until you receive the item and provide the verification code to the seller.
          </div>
          <div className="card-element">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: theme?.colors?.text || '#FFFFFF',
                    '::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  },
                  invalid: {
                    color: '#F44336',
                  },
                },
              }}
            />
          </div>
          {paymentError && (
            <div className="error-message">{paymentError}</div>
          )}
          <ActionButton 
            primary 
            onClick={handlePayment}
            disabled={loading}
            theme={theme}
          >
            <CreditCard size={18} />
            {loading ? 'Processing...' : `Pay $${parseFloat(item.price).toFixed(2)}`}
          </ActionButton>
        </PaymentForm>
      )}

      {status === 'en_route' && (
        <TransactionFlow status="confirmed" theme={theme}>
          <h3>
            <MapPin size={18} />
            On Your Way
          </h3>
          <div className="status-message">
            Head to the pickup location. Let the seller know when you arrive.
          </div>
          <div className="action-buttons">
            <StatusButton primary onClick={handleArrived} theme={theme}>
              <MapPin size={16} />
              I've Arrived
            </StatusButton>
          </div>
        </TransactionFlow>
      )}
      
      {(status === 'awaiting_seller' || status === 'confirmed' || status === 'eta_requested') && (
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
      )}
    </ChatDrawer>
  );
};

const OrderChatWithStripe = (props) => {
  const stripePromise = PaymentService.getStripePromise();
  
  return (
    <Elements stripe={stripePromise}>
      <OrderChat {...props} />
    </Elements>
  );
};

export default OrderChatWithStripe;