// src/pages/messages/MessagesPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
  Send
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, updateDoc, deleteDoc, getDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import OrderChat from '../../components/Chat/OrderChat';
import SellerOrderChat from '../../components/Chat/SellerOrderChat';
import { DEFAULT_THEME } from '../../theme/config/themes';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || DEFAULT_THEME.colors.background};
  color: ${props => props.theme?.colors?.text || DEFAULT_THEME.colors.text};
  padding-top: 80px; // Space for header
`;

const PageHeader = styled.div`
  background: ${props => `${props.theme?.colors?.background || DEFAULT_THEME.colors.background}90`};
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h1 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    font-size: 2rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .header-stats {
    display: flex;
    gap: 1.5rem;
    
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`};
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      
      .value {
        font-size: 1.2rem;
        font-weight: bold;
        color: ${props => props.theme?.colors?.accent || '#800000'};
      }
      
      .label {
        font-size: 0.8rem;
        opacity: 0.8;
      }
    }
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  gap: 2rem;
`;

const ChatsList = styled.div`
  flex: 1;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SearchInput = styled.div`
  position: relative;
  margin-bottom: 1rem;
  
  input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 8px;
    color: ${props => props.theme?.colors?.text || 'white'};
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme?.colors?.accent || '#800000'};
    }
    
    &::placeholder {
      color: ${props => `${props.theme?.colors?.text}60` || 'rgba(255, 255, 255, 0.6)'};
    }
  }
  
  .search-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => `${props.theme?.colors?.text}60` || 'rgba(255, 255, 255, 0.6)'};
  }
`;

const ChatTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ChatTab = styled.button`
  flex: 1;
  background: ${props => props.active ? 
    `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)' : 
    `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`
  };
  border: 1px solid ${props => props.active ? 
    props.theme?.colors?.accent || '#800000' : 
    'transparent'
  };
  border-radius: 8px;
  padding: 0.75rem;
  color: ${props => props.theme?.colors?.text || 'white'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  }
`;

const ChatItem = styled.div`
  display: flex;
  gap: 1rem;
  background: ${props => props.active ? 
    `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)' : 
    `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`
  };
  border: 1px solid ${props => props.active ? 
    props.theme?.colors?.accent || '#800000' : 
    'transparent'
  };
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
    
    .delete-btn {
      opacity: 1;
    }
  }
  
  .chat-image {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    
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
      }
    }
  }
  
  .unread-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: ${props => props.theme?.colors?.accent || '#800000'};
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
  }
  
  .delete-btn {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    background: transparent;
    border: none;
    color: #e74c3c;
    opacity: 0;
    transition: opacity 0.2s;
    cursor: pointer;
    padding: 0.25rem;
    
    &:hover {
      transform: scale(1.2);
    }
  }
`;

const ChatDisplay = styled.div`
  flex: 2;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`};
  border-radius: 12px;
  border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
  display: flex;
  flex-direction: column;
  min-height: 600px;
  max-height: 80vh;
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
    background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    
    svg {
      color: ${props => props.theme?.colors?.accent || '#800000'};
      opacity: 0.8;
    }
  }
  
  h3 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    margin-bottom: 0.5rem;
  }
  
  p {
    max-width: 300px;
    opacity: 0.8;
    line-height: 1.5;
  }
`;

const ChatHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    
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
    background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    
    &:hover {
      background: ${props => `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};
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
    props.theme?.colors?.accent || '#800000' : 
    `${props.theme?.colors?.background || '#000'}80`
  };
  color: ${props => props.sent ? 'white' : props.theme?.colors?.text || 'white'};
  
  ${props => props.sent ? 
    'border-bottom-right-radius: 4px;' : 
    'border-bottom-left-radius: 4px;'
  }
  
  &.system-message {
    align-self: center;
    background: transparent;
    border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
    color: ${props => `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
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
    color: ${props => props.theme?.colors?.text || 'white'};
  }
  
  // Continue from where we left off...

  .image-container {
    max-width: 200px;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 0.5rem;
    
    img {
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  }
`;

const ChatInput = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
  display: flex;
  align-items: center;
  gap: 1rem;
  
  input {
    flex: 1;
    background: ${props => `${props.theme?.colors?.background || '#000'}80`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
    border-radius: 20px;
    padding: 0.75rem 1.25rem;
    color: ${props => props.theme?.colors?.text || 'white'};
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme?.colors?.accent || '#800000'};
    }
  }
  
  button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${props => props.theme?.colors?.accent || '#800000'};
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      transform: scale(1.05);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const NoChatsMessage = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-radius: 12px;
  
  h3 {
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 1.5rem;
  }
`;

const MessagesPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    total: 0
  });
  
  // Load user's chats from Firestore
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
        
        // Get transaction details
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
        ...doc.data()
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
  }, [selectedChat]);
  
  // Filter chats based on search term and tab
  const applyFilters = (allChats, search, tab) => {
    let filtered = [...allChats];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(chat => 
        (chat.itemName?.toLowerCase().includes(searchLower)) ||
        (chat.otherPartyName?.toLowerCase().includes(searchLower))
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
        [`unreadCount.${otherPartyId}`]: (selectedChat.unreadCount?.[otherPartyId] || 0) + 1
      });
      
      // Clear input
      setInputMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
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
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
          <div className="chat-status pending">
            <AlertTriangle size={12} /> Awaiting
          </div>
        );
      case 'confirmed':
        return (
          <div className="chat-status active">
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
          <SearchInput>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="search-icon" size={16} />
          </SearchInput>
          
          <ChatTabs>
            <ChatTab 
              active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')}
            >
              All
            </ChatTab>
            <ChatTab 
              active={activeTab === 'active'} 
              onClick={() => setActiveTab('active')}
            >
              Active
            </ChatTab>
            <ChatTab 
              active={activeTab === 'completed'} 
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </ChatTab>
          </ChatTabs>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading conversations...</div>
          ) : filteredChats.length === 0 ? (
            <NoChatsMessage>
              <h3>No conversations found</h3>
              <p>
                {searchTerm ? 
                  `No results matching "${searchTerm}"` : 
                  "You don't have any conversations yet"
                }
              </p>
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
                      background: 'rgba(0, 0, 0, 0.2)',
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
        </ChatsList>
        
        <ChatDisplay>
          {selectedChat ? (
            <>
              <ChatHeader>
                <div className="avatar">
                  {selectedChat.isBuyer ? (
                    <User size={24} />
                  ) : (
                    <Package size={24} />
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
                
                <div className="transaction-details">
                  <DollarSign size={16} />
                  ${parseFloat(selectedChat.transaction?.price || 0).toFixed(2)}
                </div>
              </ChatHeader>
              
              <ChatBody>
                {messages.map(message => {
                  const isSentByMe = message.sender === auth.currentUser.uid;
                  const isSystem = message.sender === 'system';
                  
                  return (
                    <Message
                      key={message.id}
                      sent={isSentByMe}
                      className={isSystem ? 'system-message' : ''}
                    >
                      {message.text}
                      
                      {message.image && (
                        <div className="image-container">
                          <img src={message.image} alt="Shared" />
                        </div>
                      )}
                      
                      {message.timestamp && (
                        <div className="time">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      )}
                    </Message>
                  );
                })}
              </ChatBody>
              
              <ChatInput>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                  <Send size={18} />
                </button>
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
      </MainContent>
    </PageContainer>
  );
};

export default MessagesPage;