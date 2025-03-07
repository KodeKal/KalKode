// src/pages/messages/MessagesPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  MessageCircle, 
  Search, 
  X, 
  ChevronRight, 
  Calendar, 
  DollarSign,
  Package,
  Filter
} from 'lucide-react';
import { TransactionService } from '../../services/TransactionService';
import { db, auth } from '../../firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import SellerOrderChat from '../../components/Chat/SellerOrderChat';
import OrderChatWithStripe from '../../components/Chat/OrderChat';
import { DEFAULT_THEME } from '../../theme/config/themes';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || DEFAULT_THEME.colors.background};
  color: ${props => props.theme?.colors?.text || DEFAULT_THEME.colors.text};
`;

const PageHeader = styled.div`
  background: ${props => `${props.theme?.colors?.background || DEFAULT_THEME.colors.background}90`};
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
  position: sticky;
  top: 0;
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
  
  .controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  
  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`};
    border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 20px;
    color: ${props => props.theme?.colors?.text || 'white'};
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme?.colors?.accent || '#800000'};
    }
  }
  
  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => `${props.theme?.colors?.text}60` || 'rgba(255, 255, 255, 0.6)'};
  }
  
  .clear-button {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: ${props => `${props.theme?.colors?.text}60` || 'rgba(255, 255, 255, 0.6)'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    
    &:hover {
      color: ${props => props.theme?.colors?.text || 'white'};
    }
  }
`;

const FilterButton = styled.button`
  background: transparent;
  border: 1px solid ${props => `${props.theme?.colors?.accent}40` || 'rgba(255, 255, 255, 0.4)'};
  color: ${props => props.theme?.colors?.text || 'white'};
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  &:hover {
    background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(255, 255, 255, 0.1)'};
  }
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: ${props => props.theme?.colors?.surface || 'rgba(0, 0, 0, 0.8)'};
  border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 1rem;
  width: 200px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  
  .filter-option {
    margin-bottom: 1rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    
    select {
      width: 100%;
      padding: 0.5rem;
      background: ${props => `${props.theme?.colors?.background || 'rgba(0, 0, 0, 0.8)'}90`};
      border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
      border-radius: 4px;
      color: ${props => props.theme?.colors?.text || 'white'};
      
      &:focus {
        outline: none;
        border-color: ${props => props.theme?.colors?.accent || '#800000'};
      }
      
      option {
        background: ${props => props.theme?.colors?.background || 'rgba(0, 0, 0, 0.8)'};
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

const ChatList = styled.div`
  flex: 1;
  max-width: 400px;
  border-right: 1px solid ${props => `${props.theme?.colors?.accent}10` || 'rgba(255, 255, 255, 0.1)'};
  padding-right: 2rem;
`;

const ChatDetails = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${props => `${props.theme?.colors?.text}80` || 'rgba(255, 255, 255, 0.8)'};
  
  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }
  
  h3 {
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
    max-width: 300px;
    margin: 0 auto;
  }
`;

const ChatItem = styled.div`
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: ${props => props.active ? 
    `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)' : 
    'transparent'
  };
  border: 1px solid ${props => props.active ? 
    `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)' : 
    'transparent'
  };
  margin-bottom: 0.5rem;
  position: relative;
  
  &:hover {
    background: ${props => `${props.theme?.colors?.accent}10` || 'rgba(128, 0, 0, 0.1)'};
  }
  
  .item-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;
    
    .item-image {
      width: 50px;
      height: 50px;
      border-radius: 6px;
      overflow: hidden;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .item-info {
      flex: 1;
      overflow: hidden;
      
      .item-name {
        font-weight: 500;
        margin-bottom: 0.25rem;
        color: ${props => props.theme?.colors?.text || 'white'};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .item-price {
        font-size: 0.9rem;
        color: ${props => props.theme?.colors?.accent || '#800000'};
      }
    }
  }
  
  .item-details {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    font-size: 0.8rem;
    color: ${props => `${props.theme?.colors?.text}80` || 'rgba(255, 255, 255, 0.8)'};
    
    .detail {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }
  
  .transaction-status {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    
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
  
  .unread-indicator {
    position: absolute;
    top: 50%;
    right: 0.5rem;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.theme?.colors?.accent || '#800000'};
  }
`;

const NoChatsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => `${props.theme?.colors?.text}80` || 'rgba(255, 255, 255, 0.8)'};
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-radius: 8px;
  
  h3 {
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
  }
`;

// MessagesPage component
const MessagesPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load transactions with open chats
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!auth.currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Create query for chats where user is a participant
        const chatsQuery = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', auth.currentUser.uid),
          orderBy('lastMessageTime', 'desc'),
          limit(50)
        );
        
        // Listen for chat changes
        const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
          const chatItems = [];
          
          // Process chats and get related transaction data
          for (const doc of snapshot.docs) {
            const chatData = doc.data();
            
            // Get transaction details
            try {
              const transactionData = await TransactionService.getTransactionById(chatData.transactionId);
              
              // Determine if user is buyer or seller
              const role = transactionData.buyerId === auth.currentUser.uid ? 'buyer' : 'seller';
              
              // Add chat with transaction data
              chatItems.push({
                id: doc.id,
                ...chatData,
                ...transactionData,
                role,
                unreadCount: chatData.unreadCount?.[auth.currentUser.uid] || 0
              });
            } catch (err) {
              console.error(`Error fetching transaction ${chatData.transactionId}:`, err);
            }
          }
          
          setTransactions(chatItems);
          applyFilters(chatItems, searchTerm, statusFilter, roleFilter);
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (err) {
        console.error('Error loading transactions:', err);
        setError('Failed to load messages');
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);
  
  // Apply filters when they change
  const applyFilters = (items, search, status, role) => {
    let filtered = [...items];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item => 
        (item.itemName?.toLowerCase().includes(searchLower)) ||
        (item.buyerName?.toLowerCase().includes(searchLower)) ||
        (item.sellerName?.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(item => item.status === status);
    }
    
    // Apply role filter
    if (role !== 'all') {
      filtered = filtered.filter(item => item.role === role);
    }
    
    setFilteredTransactions(filtered);
  };
  
  // Handle search and filter changes
  useEffect(() => {
    applyFilters(transactions, searchTerm, statusFilter, roleFilter);
  }, [transactions, searchTerm, statusFilter, roleFilter]);
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  const renderEmptyState = () => (
    <EmptyState>
      <div className="icon">💬</div>
      <h3>No Message Selected</h3>
      <p>Select a conversation from the list to view details</p>
    </EmptyState>
  );
  
  return (
    <PageContainer>
      <PageHeader>
        <HeaderContent>
          <h1>
            <MessageCircle size={24} />
            Messages
          </h1>
          
          <div className="controls">
            <SearchContainer>
              <div className="search-icon">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-button" onClick={() => setSearchTerm('')}>
                  <X size={16} />
                </button>
              )}
            </SearchContainer>
            
            <div style={{ position: 'relative' }}>
              <FilterButton onClick={() => setShowFilters(!showFilters)}>
                <Filter size={16} />
                Filters
              </FilterButton>
              
              {showFilters && (
                <FilterDropdown>
                  <div className="filter-option">
                    <label>Status</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="awaiting_seller">Awaiting Seller</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className="filter-option">
                    <label>Role</label>
                    <select 
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      <option value="buyer">As Buyer</option>
                      <option value="seller">As Seller</option>
                    </select>
                  </div>
                </FilterDropdown>
              )}
            </div>
          </div>
        </HeaderContent>
      </PageHeader>
      
      <MainContent>
        <ChatList>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading conversations...
            </div>
          ) : error ? (
            <div style={{ color: '#F44336', padding: '1rem' }}>
              {error}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <NoChatsMessage>
              <h3>No conversations found</h3>
              <p>
                {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' ? 
                  'Try adjusting your filters' : 
                  'You have no active conversations yet'}
              </p>
            </NoChatsMessage>
          ) : (
            filteredTransactions.map(transaction => (
              <ChatItem 
                key={transaction.id}
                active={selectedTransaction?.id === transaction.id}
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div className="item-header">
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
                        <Package size={16} />
                      </div>
                    )}
                  </div>
                  <div className="item-info">
                    <div className="item-name">{transaction.itemName}</div>
                    <div className="item-price">${parseFloat(transaction.price).toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="item-details">
                  <div className="detail">
                    <Calendar size={12} />
                    {formatDate(transaction.lastMessageTime || transaction.createdAt)}
                  </div>
                  <div className="detail">
                    <DollarSign size={12} />
                    {transaction.role === 'buyer' ? 'Purchase' : 'Sale'}
                  </div>
                </div>
                
                <div className={`transaction-status ${transaction.status}`}>
                  {transaction.status.replace('_', ' ')}
                </div>
                
                {transaction.unreadCount > 0 && (
                  <div className="unread-indicator" />
                )}
              </ChatItem>
            ))
          )}
        </ChatList>
        
        <ChatDetails>
          {selectedTransaction ? (
            selectedTransaction.role === 'seller' ? (
              <SellerOrderChat 
                isOpen={true}
                onClose={() => setSelectedTransaction(null)}
                transaction={selectedTransaction}
                theme={DEFAULT_THEME}
              />
            ) : (
              <OrderChatWithStripe
                isOpen={true}
                onClose={() => setSelectedTransaction(null)}
                item={{
                  id: selectedTransaction.itemId,
                  name: selectedTransaction.itemName,
                  price: selectedTransaction.price,
                  images: [selectedTransaction.itemImage]
                }}
                shopId={selectedTransaction.sellerId}
                shopName={selectedTransaction.sellerName}
                theme={DEFAULT_THEME}
                transactionId={selectedTransaction.id}
              />
            )
          ) : (
            renderEmptyState()
          )}
        </ChatDetails>
      </MainContent>
    </PageContainer>
  );
};

export default MessagesPage;