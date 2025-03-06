// src/pages/transactions/Transactions.js

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { TransactionService } from '../../services/TransactionService';
import { auth } from '../../firebase/config';
import TransactionChat from '../../components/Chat/TransactionChat';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#000000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
`;

const PageHeader = styled.div`
  background: ${props => `${props.theme?.colors?.background || '#000000'}CC`};
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(255, 255, 255, 0.1)'};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  h1 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    font-size: 2rem;
    margin: 0;
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const TransactionTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
  padding-bottom: 1rem;
`;

const TabButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.active ? 
    props.theme?.colors?.accent || '#800000' : 
    props.theme?.colors?.text || 'white'
  };
  opacity: ${props => props.active ? 1 : 0.7};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  padding: 0.5rem 1rem;
  cursor: pointer;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.active ? 
      props.theme?.colors?.accent || '#800000' : 
      'transparent'
    };
    transition: all 0.3s;
  }
  
  &:hover {
    opacity: 1;
    
    &::after {
      background: ${props => props.theme?.colors?.accent || '#800000'};
      opacity: 0.5;
    }
  }
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TransactionCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'};
  border-radius: ${props => props.theme?.styles?.borderRadius || '12px'};
  border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(255, 255, 255, 0.1)'};
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  .item-image {
    width: 80px;
    height: 80px;
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
    
    .title {
      font-weight: bold;
      margin-bottom: 0.5rem;
      font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    }
    
    .details {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 2rem;
      font-size: 0.9rem;
      opacity: 0.8;
      
      .detail {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }
  
  .status {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    text-transform: uppercase;
    font-size: 0.8rem;
    font-weight: bold;
    
    &.pending {
      background: rgba(255, 152, 0, 0.2);
      color: #FF9800;
    }
    
    &.confirmed {
      background: rgba(33, 150, 243, 0.2);
      color: #2196F3;
    }
    
    &.completed {
      background: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }
    
    &.cancelled {
      background: rgba(244, 67, 54, 0.2);
      color: #F44336;
    }
    
    &.disputed {
      background: rgba(156, 39, 176, 0.2);
      color: #9C27B0;
    }
  }
  
  .arrow {
    opacity: 0.5;
    transition: all 0.3s;
  }
  
  &:hover .arrow {
    opacity: 1;
    transform: translateX(3px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  
  h3 {
    font-family: ${props => props.theme?.fonts?.heading || 'inherit'};
    margin-bottom: 1rem;
  }
`;

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const loadTransactions = async () => {
    if (!auth.currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const userTransactions = await TransactionService.getUserTransactions(
        auth.currentUser.uid
      );
      
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadTransactions();
    
    // Set up a refresh interval
    const interval = setInterval(loadTransactions, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    if (activeTab === 'buying' && transaction.role === 'buyer') return true;
    if (activeTab === 'selling' && transaction.role === 'seller') return true;
    if (activeTab === transaction.status) return true;
    return false;
  });
  
  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  return (
    <PageContainer>
      <PageHeader>
        <HeaderContent>
          <ShoppingBag size={24} />
          <h1>My Transactions</h1>
        </HeaderContent>
      </PageHeader>
      
      <MainContent>
        <TransactionTabs>
          <TabButton 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
          >
            All
          </TabButton>
          <TabButton 
            active={activeTab === 'buying'} 
            onClick={() => setActiveTab('buying')}
          >
            Buying
          </TabButton>
          <TabButton 
            active={activeTab === 'selling'} 
            onClick={() => setActiveTab('selling')}
          >
            Selling
          </TabButton>
          <TabButton 
            active={activeTab === 'pending'} 
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </TabButton>
          <TabButton 
            active={activeTab === 'confirmed'} 
            onClick={() => setActiveTab('confirmed')}
          >
            Confirmed
          </TabButton>
          <TabButton 
            active={activeTab === 'completed'} 
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </TabButton>
        </TransactionTabs>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading transactions...
          </div>
        ) : error ? (
          <div style={{ 
            color: '#ff4444', 
            padding: '1rem', 
            background: 'rgba(255, 68, 68, 0.1)',
            borderRadius: '8px',
            textAlign: 'center' 
          }}>
            {error}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyState>
            <h3>No transactions found</h3>
            <p>
              {activeTab === 'all' 
                ? "You haven't made any transactions yet." 
                : `You don't have any ${activeTab} transactions.`}
            </p>
          </EmptyState>
        ) : (
          <TransactionList>
            {filteredTransactions.map(transaction => (
              <TransactionCard 
                key={transaction.id}
                onClick={() => setSelectedTransaction(transaction.id)}
              >
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
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}>
                      No image
                    </div>
                  )}
                </div>
                
                <div className="transaction-info">
                  <div className="title">{transaction.itemName}</div>
                  <div className="details">
                    <div className="detail">
                      Price: ${transaction.price.toFixed(2)}
                    </div>
                    <div className="detail">
                      {transaction.role === 'buyer' ? 
                        `Seller: ${transaction.sellerName}` : 
                        `Buyer: ${transaction.buyerName}`}
                    </div>
                    <div className="detail">
                      Date: {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className={`status ${transaction.status}`}>
                  {transaction.status}
                </div>
                
                <div className="arrow">
                  <ChevronRight size={20} />
                </div>
              </TransactionCard>
            ))}
          </TransactionList>
        )}
        
        {selectedTransaction && (
          <div style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{ width: '90%', maxWidth: '800px' }}>
              <TransactionChat 
                transactionId={selectedTransaction} 
                onClose={() => setSelectedTransaction(null)}
              />
            </div>
          </div>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default TransactionsPage;