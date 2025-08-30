// src/pages/shop/components/MessagesList.js
import React from 'react';
import styled from 'styled-components';
import { Package, Trash2, Clock, Check, AlertCircle } from 'lucide-react';

const ChatItemsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
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
  background: ${props => props.active ? 'rgba(128, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.4)'};
  border: 2px solid ${props => props.active ? '#800000' : 'rgba(128, 0, 0, 0.3)'};
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
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
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .status-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid ${props => props.theme?.colors?.background || '#0B0B3B'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    
    &.active {
      background: #FFC107;
      color: #000;
    }
    
    &.completed {
      background: #4CAF50;
      color: #fff;
    }
    
    &.cancelled {
      background: #F44336;
      color: #fff;
    }
  }
  
  .chat-info {
    flex: 1;
    min-width: 0;
    
    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.25rem;
      
      .chat-name {
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: ${props => props.active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)'};
        flex: 1;
        margin-right: 0.5rem;
      }
      
      .transaction-amount {
        font-size: 0.8rem;
        color: #4CAF50;
        font-weight: bold;
        white-space: nowrap;
      }
    }
    
    .chat-preview {
      font-size: 0.9rem;
      opacity: 0.8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 0.5rem;
    }
    
    .chat-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      
      .chat-time {
        opacity: 0.6;
        flex-shrink: 0;
      }
      
      .chat-status {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.2rem 0.5rem;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: bold;
        text-transform: uppercase;
        
        &.pending {
          background: rgba(255, 193, 7, 0.2);
          color: #FFC107;
        }
        
        &.accepted {
          background: rgba(33, 150, 243, 0.2);
          color: #2196F3;
        }
        
        &.paid {
          background: rgba(156, 39, 176, 0.2);
          color: #9C27B0;
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
    border-radius: 4px;
    
    &:hover {
      transform: scale(1.2) translateX(0);
      background: rgba(231, 76, 60, 0.1);
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  margin: 2rem auto;
  border: 3px solid rgba(128, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #800000;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.6);
  
  h3 {
    margin-bottom: 0.5rem;
    color: rgba(255, 255, 255, 0.8);
  }
  
  p {
    line-height: 1.5;
  }
`;

const MessagesList = ({ 
  chats, 
  selectedChat, 
  loading, 
  searchTerm, 
  onChatSelect, 
  onDeleteChat 
}) => {
  
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

  // Get status display info
  const getStatusInfo = (status, role) => {
    if (!status) return null;
    
    const statusMap = {
      pending_seller_acceptance: {
        label: role === 'buyer' ? 'Pending' : 'New Order',
        className: 'pending',
        icon: Clock
      },
      seller_accepted: {
        label: role === 'buyer' ? 'Approved' : 'Approved',
        className: 'accepted',
        icon: Check
      },
      paid: {
        label: 'Paid',
        className: 'paid',
        icon: Package
      },
      completed: {
        label: 'Completed',
        className: 'completed',
        icon: Check
      },
      seller_rejected: {
        label: 'Declined',
        className: 'cancelled',
        icon: AlertCircle
      },
      withdrawn: {
        label: 'Withdrawn',
        className: 'cancelled',
        icon: AlertCircle
      }
    };
    
    return statusMap[status] || null;
  };

  // Get transaction amount display
  const getTransactionAmount = (chat) => {
    const pendingPurchase = chat.pendingPurchase;
    if (!pendingPurchase) return null;
    
    if (pendingPurchase.finalTotalPrice) {
      return `${pendingPurchase.finalTotalPrice.toFixed(2)}`;
    } else if (pendingPurchase.totalPrice) {
      return `${pendingPurchase.totalPrice.toFixed(2)}`;
    }
    
    return null;
  };

  // Get status indicator for chat image
  const getStatusIndicator = (status) => {
    if (!status) return null;
    
    if (['pending_seller_acceptance', 'seller_accepted', 'paid'].includes(status)) {
      return { className: 'active', icon: Clock };
    } else if (status === 'completed') {
      return { className: 'completed', icon: Check };
    } else if (['seller_rejected', 'withdrawn'].includes(status)) {
      return { className: 'cancelled', icon: AlertCircle };
    }
    
    return null;
  };

  if (loading) {
    return (
      <ChatItemsContainer>
        <LoadingSpinner />
        <p style={{ textAlign: 'center', opacity: 0.7 }}>Loading conversations...</p>
      </ChatItemsContainer>
    );
  }

  if (chats.length === 0) {
    return (
      <ChatItemsContainer>
        <EmptyMessage>
          <h3>No conversations found</h3>
          <p>
            {searchTerm ? 
              `No results matching "${searchTerm}"` : 
              "You don't have any conversations yet"
            }
          </p>
        </EmptyMessage>
      </ChatItemsContainer>
    );
  }

  return (
    <ChatItemsContainer>
      {chats.map(chat => {
        const statusInfo = getStatusInfo(chat.transactionStatus, chat.role);
        const statusIndicator = getStatusIndicator(chat.transactionStatus);
        const transactionAmount = getTransactionAmount(chat);
        const StatusIcon = statusInfo?.icon;
        const IndicatorIcon = statusIndicator?.icon;
        
        return (
          <ChatItem 
            key={chat.id}
            active={selectedChat?.id === chat.id}
            onClick={() => onChatSelect(chat)}
          >
            <div className="chat-image">
              {chat.itemImage ? (
                <img src={chat.itemImage} alt={chat.itemName} />
              ) : (
                <Package size={20} opacity={0.5} />
              )}
              {statusIndicator && IndicatorIcon && (
                <div className={`status-indicator ${statusIndicator.className}`}>
                  <IndicatorIcon size={10} />
                </div>
              )}
            </div>
            
            <div className="chat-info">
              <div className="chat-header">
                <div className="chat-name">
                  {chat.itemName || "Untitled conversation"}
                </div>
                {transactionAmount && (
                  <div className="transaction-amount">
                    {transactionAmount}
                  </div>
                )}
              </div>
              
              <div className="chat-preview">
                {chat.role === 'buyer' ? 
                  `Seller: ${chat.otherPartyName}` : 
                  `Buyer: ${chat.otherPartyName}`
                }
              </div>
              
              <div className="chat-meta">
                <div className="chat-time">
                  {formatTimestamp(chat.lastMessageTime)}
                </div>
                
                {statusInfo && StatusIcon && (
                  <div className={`chat-status ${statusInfo.className}`}>
                    <StatusIcon size={10} />
                    {statusInfo.label}
                  </div>
                )}
              </div>
            </div>
            
            {chat.unreadCount > 0 && (
              <div className="unread-badge">
                {chat.unreadCount}
              </div>
            )}
            
            <button 
              className="delete-btn"
              onClick={(e) => onDeleteChat(chat.id, e)}
              title="Delete conversation"
            >
              <Trash2 size={16} />
            </button>
          </ChatItem>
        );
      })}
    </ChatItemsContainer>
  );
};

export default MessagesList;