// src/pages/shop/MessagesPage.js - Refactored with enhanced features
import React, { useState, useEffect, useReducer, useMemo } from 'react';
import styled from 'styled-components';
import { 
  MessageCircle, Search, X, Clock, Check, ArrowLeft, ChevronLeft
} from 'lucide-react';
import { 
  collection, query, where, orderBy, onSnapshot, doc, updateDoc
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useSearchParams } from 'react-router-dom';

// Import components (we'll create these next)
import MessagesList from './components/MessagesList';
import ChatView from './components/ChatView';
import EmptyState from './components/EmptyState';

// Filter options for chat list
const FILTER_OPTIONS = [
  { key: 'all', label: 'All', icon: MessageCircle },
  { key: 'active', label: 'Active', icon: Clock },
  { key: 'completed', label: 'Completed', icon: Check },
  { key: 'cancelled', label: 'Cancelled', icon: X }
];

// Chat state reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CHATS':
      return { ...state, chats: action.payload, loading: false };
    case 'SET_SELECTED_CHAT':
      return { ...state, selectedChat: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_FILTER':
      return { ...state, activeFilter: action.payload };
    case 'SET_MOBILE_VIEW':
      return { ...state, showChatList: action.payload };
    default:
      return state;
  }
};

// Initial state
const initialChatState = {
  chats: [],
  selectedChat: null,
  searchTerm: '',
  activeFilter: 'all',
  loading: true,
  showChatList: true
};

// Styled components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #0B0B3B, #1A1A4C);
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  /* Add bottom padding on mobile for bottom navigation */
  @media (max-width: 768px) {
    padding-bottom: 80px;
    min-height: calc(100vh - 80px);
  }
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

  @media (max-width: 768px) {
    padding: 1rem;
    height: 70px;
    
    /* Hide or simplify header on very small screens */
    h1 {
      font-size: 1.4rem;
      
      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    height: 60px;
    
    h1 {
      font-size: 1.2rem;
      gap: 0.5rem;
      
      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
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
    margin: 0;

    svg {
      color: #800000;
    }

    @media (max-width: 768px) {
      font-size: 1.4rem;
      gap: 0.5rem;
    }
  }
`;

const MainContent = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0;
    top: 70px;
    /* Account for bottom navigation */
    bottom: 80px;
  }
  
  @media (max-width: 480px) {
    top: 60px;
  }
`;


const ContentWrapper = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  height: 100%;
  position: relative;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const MobileBackButton = styled.button`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    color: #FFFFFF;
    cursor: pointer;
    padding: 1rem;
    margin-bottom: 1rem;
    font-size: 1rem;
    border-bottom: 1px solid rgba(128, 0, 0, 0.2);
    width: 100%;
    justify-content: flex-start;
    
    &:hover {
      background: rgba(128, 0, 0, 0.1);
    }
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
  overflow-x: auto;
  
  /* Show scrollbar on mobile for better UX */
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(128, 0, 0, 0.5);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    gap: 0.25rem;
    /* Ensure horizontal scroll works smoothly */
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
  }
`;

const FilterTab = styled.button`
  background: ${props => props.active ? 'rgba(128, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
  border: 1px solid ${props => props.active ? '#800000' : 'rgba(128, 0, 0, 0.3)'};
  color: ${props => props.active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: rgba(128, 0, 0, 0.3);
    border-color: #800000;
    color: #FFFFFF;
  }

  svg {
    width: 14px;
    height: 14px;
  }
  
  .count {
    background: ${props => props.active ? '#800000' : 'rgba(255, 255, 255, 0.2)'};
    color: white;
    padding: 0.1rem 0.4rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: bold;
    min-width: 16px;
    text-align: center;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    
    .count {
      padding: 0.1rem 0.3rem;
      font-size: 0.7rem;
    }
  }
`;

const SearchInput = styled.div`
  position: relative;
  margin-bottom: 1rem;
  
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

    @media (max-width: 768px) {
      width: 100%;
      padding: 0.75rem 3rem 0.75rem 1rem;
    }
  }
  
  .search-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.6);
    pointer-events: none;

    @media (max-width: 768px) {
      right: 1rem;
    }
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

const MessagesPage = () => {
  const [chatState, chatDispatch] = useReducer(chatReducer, initialChatState);
  const [searchParams] = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  
  const targetChatId = searchParams.get('chat');

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load chats with real-time updates
  useEffect(() => {
    if (!auth.currentUser) return;
    
    chatDispatch({ type: 'SET_LOADING', payload: true });
    
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
        
        // Get transaction status for filtering
        let transactionStatus = null;
        if (chat.pendingPurchase?.status) {
          transactionStatus = chat.pendingPurchase.status;
        }
        
        chatData.push({
          id: doc.id,
          ...chat,
          isBuyer,
          isSeller: !isBuyer,
          role: isBuyer ? 'buyer' : 'seller',
          otherPartyId: isBuyer ? chat.sellerId : chat.buyerId,
          // FIX: Use correct names - buyer should show their profile name, not store name
          otherPartyName: isBuyer ? 
            (chat.sellerName || 'Unknown Shop') : 
            (chat.buyerName || 'Unknown User'),
          unreadCount: chat.unreadCount?.[auth.currentUser.uid] || 0,
          transactionStatus
        });
      }
      
      chatDispatch({ type: 'SET_CHATS', payload: chatData });
    });
    
    return unsubscribe;
  }, []);

  // Handle target chat from URL
  useEffect(() => {
    if (targetChatId && chatState.chats.length > 0) {
      const targetChat = chatState.chats.find(chat => chat.id === targetChatId);
      if (targetChat && !chatState.selectedChat) {
        chatDispatch({ type: 'SET_SELECTED_CHAT', payload: targetChat });
        if (isMobile) {
          chatDispatch({ type: 'SET_MOBILE_VIEW', payload: false });
        }
      }
    }
  }, [targetChatId, chatState.chats, chatState.selectedChat, isMobile]);

  // Filter chats based on status
  const getFilteredChats = useMemo(() => {
    let filtered = chatState.chats;

    // Apply status filter
    if (chatState.activeFilter !== 'all') {
      filtered = filtered.filter(chat => {
        const status = chat.transactionStatus;
        
        switch (chatState.activeFilter) {
          case 'active':
            return ['pending_seller_acceptance', 'seller_accepted', 'paid'].includes(status);
          case 'completed':
            return status === 'completed';
          case 'cancelled':
            return ['seller_rejected', 'withdrawn'].includes(status);
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (chatState.searchTerm) {
      filtered = filtered.filter(chat => 
        (chat.itemName?.toLowerCase().includes(chatState.searchTerm.toLowerCase())) ||
        (chat.otherPartyName?.toLowerCase().includes(chatState.searchTerm.toLowerCase())) ||
        (chat.lastMessage?.toLowerCase().includes(chatState.searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [chatState.chats, chatState.activeFilter, chatState.searchTerm]);

  // Get filter counts
  const getFilterCounts = useMemo(() => {
    const counts = {
      all: chatState.chats.length,
      active: 0,
      completed: 0,
      cancelled: 0
    };

    chatState.chats.forEach(chat => {
      const status = chat.transactionStatus;
      if (['pending_seller_acceptance', 'seller_accepted', 'paid'].includes(status)) {
        counts.active++;
      } else if (status === 'completed') {
        counts.completed++;
      } else if (['seller_rejected', 'withdrawn'].includes(status)) {
        counts.cancelled++;
      }
    });

    return counts;
  }, [chatState.chats]);

  // Handle chat selection
  const handleChatSelect = (chat) => {
    chatDispatch({ type: 'SET_SELECTED_CHAT', payload: chat });
    if (isMobile) {
      chatDispatch({ type: 'SET_MOBILE_VIEW', payload: false });
    }
  };

  // Handle back to chat list on mobile
  const handleBackToChatList = () => {
    if (isMobile) {
      chatDispatch({ type: 'SET_MOBILE_VIEW', payload: true });
      chatDispatch({ type: 'SET_SELECTED_CHAT', payload: null });
    }
  };

  // Handle chat deletion
  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        [`hidden.${auth.currentUser.uid}`]: true
      });
      
      // Update local state
      const updatedChats = chatState.chats.filter(chat => chat.id !== chatId);
      chatDispatch({ type: 'SET_CHATS', payload: updatedChats });
      
      if (chatState.selectedChat?.id === chatId) {
        chatDispatch({ type: 'SET_SELECTED_CHAT', payload: null });
        if (isMobile) {
          chatDispatch({ type: 'SET_MOBILE_VIEW', payload: true });
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
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
          {/* Chat List */}
          <div style={{
            position: 'relative',
            width: isMobile ? '100%' : '350px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease-in-out',
            ...(isMobile && {
              position: 'absolute',
              left: 0,
              top: 0,
              background: 'linear-gradient(to bottom, #0B0B3B, #1A1A4C)',
              zIndex: 30,
              transform: chatState.showChatList ? 'translateX(0)' : 'translateX(-100%)',
              padding: '1rem'
            })
          }}>
            {isMobile && chatState.selectedChat && (
              <button
                onClick={handleBackToChatList}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '1rem 0',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                <ArrowLeft size={20} />
                Back to Chats
              </button>
            )}
            
            {/* Filter Tabs - Always show on all devices */}
            <FilterTabs>
              {FILTER_OPTIONS.map(option => {
                const Icon = option.icon;
                const count = getFilterCounts[option.key];
                return (
                  <FilterTab
                    key={option.key}
                    active={chatState.activeFilter === option.key}
                    onClick={() => chatDispatch({ type: 'SET_FILTER', payload: option.key })}
                  >
                    <Icon />
                    {option.label}
                    {count > 0 && <span className="count">{count}</span>}
                  </FilterTab>
                );
              })}
            </FilterTabs>
            
            {/* Search Input */}
            <SearchInput>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={chatState.searchTerm}
                onChange={(e) => chatDispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
              />
              {chatState.searchTerm && (
                <button 
                  className="clear-button"
                  onClick={() => chatDispatch({ type: 'SET_SEARCH_TERM', payload: '' })}
                >
                  <X size={16} />
                </button>
              )}
            </SearchInput>
            
            {/* Messages List Component */}
            <MessagesList
              chats={getFilteredChats}
              selectedChat={chatState.selectedChat}
              loading={chatState.loading}
              searchTerm={chatState.searchTerm}
              onChatSelect={handleChatSelect}
              onDeleteChat={handleDeleteChat}
            />
          </div>
          
          {/* Chat Display */}
          <div style={{
            flex: 1,
            marginLeft: isMobile ? 0 : '2rem',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: isMobile ? 0 : '10px',
            border: isMobile ? 'none' : '1px solid rgba(128, 0, 0, 0.3)',
            overflow: 'hidden',
            boxShadow: isMobile ? 'none' : '0 5px 30px rgba(0, 0, 0, 0.2)',
            ...(isMobile && {
              position: chatState.selectedChat ? 'relative' : 'absolute',
              left: chatState.selectedChat ? '0' : '100%',
              width: '100%',
              transition: 'left 0.3s ease-in-out'
            })
          }}>
            {chatState.selectedChat ? (
              <ChatView
                chat={chatState.selectedChat}
                isMobile={isMobile}
                onBackToList={handleBackToChatList}
              />
            ) : (
              <EmptyState 
                isMobile={isMobile} 
                hasSelectedChat={!!chatState.selectedChat}
              />
            )}
          </div>
        </ContentWrapper>
      </MainContent>
    </PageContainer>
  );
};

export default MessagesPage;