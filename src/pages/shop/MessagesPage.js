// src/pages/shop/MessagesPage.js - With Ultra-Simple Chat Implementation
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  MessageCircle, 
  Search, 
  X, 
  Trash2, 
  Send,
  Package,
  User,
  Check,
  QrCode
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  addDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { TransactionService } from '../../services/TransactionService';

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
  width: calc(100% - 0.1rem);
  
  input {
    width: 83%;
    height: 80%;
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

const ChatItemsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 4rem;
  margin-left: -0.35rem;
  
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
  width: calc(100% + 4rem);
  min-width: 0;
  flex-shrink: 0;
  box-sizing: border-box;
  
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
`;

const ChatDisplay = styled.div`
  flex: 0 0 auto;
  width: calc(69% - 3rem);
  margin-left: 3rem;
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
    border: 1px solid rgba(128, 0, 0, 0.3);
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
`;

const CodeVerification = styled.div`
  margin: 1rem 1.5rem;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  
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

const CodeDisplay = styled.div`
  margin: 1rem 1.5rem;
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

const MessagesPage = () => {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chats
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
        
        if (chat.hidden && chat.hidden[auth.currentUser.uid]) {
          continue;
        }
        
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
    
    return () => unsubscribe();
  }, [auth.currentUser]);

  // Load messages for selected chat
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
      
      // Mark messages as read
      if (selectedChat.unreadCount > 0) {
        updateDoc(doc(db, 'chats', selectedChat.id), {
          [`unreadCount.${auth.currentUser.uid}`]: 0
        });
      }
    });
    
    return () => unsubscribe();
  }, [selectedChat?.id, auth.currentUser?.uid]);

  // Load transaction details
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

  // Filter chats based on search
  const filteredChats = chats.filter(chat => 
    searchTerm === '' || 
    (chat.itemName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (chat.otherPartyName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Send message
  const handleSendMessage = async () => {
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
  };

  // Verify code (seller only)
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setVerificationError('Please enter the verification code');
      return;
    }
    
    try {
      setVerifying(true);
      setVerificationError(null);
      
      await TransactionService.completeTransaction(selectedChat.transactionId, verificationCode);
      
      await addDoc(collection(db, 'chats', selectedChat.transactionId, 'messages'), {
        text: '✅ Transaction completed! Funds have been released.',
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'system'
      });
      
      setVerificationCode('');
      
    } catch (error) {
      console.error('Error verifying code:', error);
      setVerificationError(error.message);
    } finally {
      setVerifying(false);
    }
  };

  // Delete chat
  const handleDeleteChat = async (chatId, e) => {
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
                     </div>
                     <div className="chat-subtitle">
                       {selectedChat.isBuyer ? "Seller" : "Buyer"} • {selectedChat.itemName}
                     </div>
                   </div>
                 </div>
                 
                 {transactionDetails && (
                   <div className="transaction-details">
                     ${parseFloat(transactionDetails.price || 0).toFixed(2)}
                   </div>
                 )}
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
                   messages.map((message) => (
                     <Message
                       key={message.id}
                       sent={message.sender === auth.currentUser?.uid}
                     >
                       {message.text}
                       {message.timestamp && (
                         <div className="message-time">
                           {formatTimestamp(message.timestamp)}
                         </div>
                       )}
                     </Message>
                   ))
                 )}
                 <div ref={messagesEndRef} />
               </ChatBody>

               {/* Show pickup code for buyer */}
               {selectedChat.isBuyer && transactionDetails?.transactionCode && (
                 <CodeDisplay>
                   <h4>
                     <QrCode size={18} />
                     Your Pickup Code
                   </h4>
                   <div className="code-display">{transactionDetails.transactionCode}</div>
                   <div className="qr-code">
                     <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?data=${transactionDetails.transactionCode}&size=150x150`} 
                       alt="QR Code"
                     />
                   </div>
                   <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                     Show this code to the seller when you arrive for pickup.
                   </p>
                 </CodeDisplay>
               )}

               {/* Code verification for seller */}
               {selectedChat.isSeller && transactionDetails?.status === 'paid' && (
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
                     disabled={!verificationCode || verifying}
                   >
                     <Check size={18} />
                     {verifying ? 'Verifying...' : 'Complete Transaction'}
                   </ActionButton>
                 </CodeVerification>
               )}
               
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
                     disabled={!inputMessage.trim()}
                   >
                     <Send size={16} />
                   </button>
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
       </ContentWrapper>
     </MainContent>
   </PageContainer>
 );
};

export default MessagesPage;
