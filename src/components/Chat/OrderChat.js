// src/components/Chat/OrderChat.js - Ultra Simplified
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X, ShoppingCart, QrCode, Minimize2, Maximize2 } from 'lucide-react';
import { TransactionService } from '../../services/TransactionService';
import { PaymentService } from '../../services/PaymentService';
import { auth } from '../../firebase/config';
import { CardElement, useStripe, useElements, Elements } from '../Stripe/StripeComponent';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
  
  .time {
    font-size: 0.7rem;
    margin-top: 0.5rem;
    opacity: 0.7;
    text-align: right;
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
  
  .error-message {
    color: #F44336;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 0.75rem;
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

const CodeDisplay = styled.div`
  margin: 1rem;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  text-align: center;
  transition: all 0.3s ease;
  
  h4 {
    color: #4CAF50;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .code-content {
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

const ChatInput = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid ${props => `${props.theme?.colors?.accent}20` || "rgba(128, 0, 0, 0.2)"};
  
  input {
    flex: 1;
    padding: 0.75rem 1rem;
    background: ${props => `${props.theme?.colors?.surface || "rgba(255, 255, 255, 0.05)"}90`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}20` || "rgba(255, 255, 255, 0.1)"};
    border-radius: 20px;
    color: ${props => props.theme?.colors?.text || "white"};
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme?.colors?.accent || "#800000"};
    }
  }
  
  .input-actions {
    display: flex;
    gap: 0.5rem;
    margin-left: 0.5rem;
  }
  
  button {
    background: transparent;
    border: none;
    color: ${props => props.theme?.colors?.accent || "#800000"};
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${props => `${props.theme?.colors?.accent}20` || "rgba(128, 0, 0, 0.2)"};
    }
    
    &.qr-toggle {
      color: ${props => props.qrMinimized ? 
        props.theme?.colors?.text || "white" : 
        props.theme?.colors?.accent || "#800000"
      };
      opacity: ${props => props.qrMinimized ? "0.7" : "1"};
    }
  }
`;

const OrderChat = ({ isOpen, onClose, item, shopId, shopName, theme }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [transactionId, setTransactionId] = useState(null);
  const [transactionCode, setTransactionCode] = useState(null);
  const [status, setStatus] = useState('initial');
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [qrMinimized, setQrMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Listen for messages when transaction is created
  useEffect(() => {
    if (transactionId) {
      const q = query(
        collection(db, 'chats', transactionId, 'messages'),
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
    }
  }, [transactionId]);

  const handleOrder = async () => {
    setStatus('payment');
  };
  
  const handlePayment = async () => {
    if (!stripe || !elements) {
      setPaymentError('Stripe has not been properly initialized');
      return;
    }
    
    try {
      setLoading(true);
      setPaymentError(null);
      
      // Create transaction
      const result = await TransactionService.initiateTransaction(
        item.id,
        shopId,
        item.price,
        'inperson'
      );
      
      setTransactionId(result.transactionId);
      setTransactionCode(result.transactionCode);
      
      // Mock payment processing
      await PaymentService.processPayment(result.transactionId, 'mock_payment_method');
      
      // Auto-send interest message
      await addDoc(collection(db, 'chats', result.transactionId, 'messages'), {
        text: "I'm interested in this item! When and where can I pick it up?",
        sender: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email,
        timestamp: serverTimestamp(),
        type: 'text'
      });
      
      setStatus('chat');
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !transactionId) return;
    
    try {
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
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
        {/* Item Display */}
        <div style={{
          background: `${theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`,
          borderRadius: '12px',
          padding: '1rem',
          border: `1px solid ${theme?.colors?.accent}20`
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {item.images && item.images[0] && (
              <img 
                src={item.images[0]} 
                alt={item.name}
                style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
              />
            )}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h4>
              <div style={{ fontWeight: 'bold', color: theme?.colors?.accent }}>
                ${parseFloat(item.price).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {messages.map((msg, index) => (
          <Message 
            key={index} 
            sent={msg.sender === auth.currentUser?.uid}
            theme={theme}
          >
            {msg.text}
            <div className="time">{formatTime(msg.timestamp)}</div>
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </ChatMessages>
      
      {/* Payment Form */}
      {status === 'payment' && (
        <PaymentForm theme={theme}>
          <h4>Complete Your Payment</h4>
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
            onClick={handlePayment}
            disabled={loading}
            theme={theme}
          >
            <ShoppingCart size={18} />
            {loading ? 'Processing...' : `Pay $${parseFloat(item.price).toFixed(2)}`}
          </ActionButton>
        </PaymentForm>
      )}

      {/* Show Code when ready for pickup */}
      {transactionCode && status === 'chat' && (
        <CodeDisplay minimized={qrMinimized}>
          <h4>
            <QrCode size={18} />
            Your Pickup Code
          </h4>
          <div className="code-content">
            <div className="code-display">{transactionCode}</div>
            <div className="qr-code">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${transactionCode}&size=150x150`} 
                alt="QR Code"
              />
            </div>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Show this code to the seller when you arrive for pickup.
            </p>
          </div>
        </CodeDisplay>
      )}

      {/* Chat Input */}
      {status === 'chat' && (
        <ChatInput qrMinimized={qrMinimized} theme={theme}>
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <div className="input-actions">
            {transactionCode && (
              <button 
                onClick={() => setQrMinimized(!qrMinimized)}
                className="qr-toggle"
                title={qrMinimized ? "Show QR Code" : "Hide QR Code"}
              >
                {qrMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
            )}
            <button onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </ChatInput>
      )}

      {/* Initial Order Button */}
      {status === 'initial' && (
        <div style={{ padding: '1rem' }}>
          <ActionButton onClick={handleOrder} theme={theme}>
            <ShoppingCart size={18} />
            Order This Item
          </ActionButton>
        </div>
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
