// src/pages/shop/components/TransactionStatusCard.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ChevronDown, Plus, Minus, Package, CreditCard, X
} from 'lucide-react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../../firebase/config';
import { TransactionService } from '../../../services/TransactionService';

const StatusCardContainer = styled.div`
  margin: ${props => props.minimized ? '0' : '0 1.5rem'};
  transition: all 0.3s ease;
`;

const StatusButton = styled.button`
  width: 95%;
  margin: 1rem 1.5rem 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.2)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.2)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.2)';
      case 'paid': return 'rgba(33, 150, 243, 0.2)';
      case 'withdrawn': return 'rgba(156, 39, 176, 0.2)';
      case 'completed': return 'rgba(76, 175, 80, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border: 1px solid ${props => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.5)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.5)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.5)';
      case 'paid': return 'rgba(33, 150, 243, 0.5)';
      case 'withdrawn': return 'rgba(156, 39, 176, 0.5)';
      case 'completed': return 'rgba(76, 175, 80, 0.5)';
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  }};
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .status-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .status-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: ${props => {
        switch(props.status) {
          case 'pending_seller_acceptance': return '#FFC107';
          case 'seller_accepted': return '#4CAF50';
          case 'seller_rejected': return '#F44336';
          case 'paid': return '#2196F3';
          case 'withdrawn': return '#9C27B0';
          case 'completed': return '#4CAF50';
          default: return '#FFFFFF';
        }
      }};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
    }
    
    .status-text {
      text-align: left;
      
      .main-text {
        font-size: 0.95rem;
        margin-bottom: 0.1rem;
      }
      
      .sub-text {
        font-size: 0.8rem;
        opacity: 0.8;
      }
    }
  }
  
  .toggle-icon {
    transform: ${props => props.minimized ? 'rotate(0deg)' : 'rotate(180deg)'};
    transition: transform 0.3s ease;
  }

  @media (max-width: 768px) {
    margin: 1rem 1rem 0.5rem;
    padding: 0.65rem 0.85rem;
    
    .status-info {
      gap: 0.6rem;
      
      .status-icon {
        width: 20px;
        height: 20px;
        font-size: 0.7rem;
      }
      
      .status-text {
        .main-text {
          font-size: 0.9rem;
        }
        
        .sub-text {
          font-size: 0.75rem;
        }
      }
    }
  }
`;

const StatusCard = styled.div`
  background: ${props => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.1)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.1)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.1)';
      case 'paid': return 'rgba(33, 150, 243, 0.1)';
      case 'withdrawn': return 'rgba(156, 39, 176, 0.1)';
      case 'completed': return 'rgba(76, 175, 80, 0.1)';
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  }};
  border-radius: 12px;
  border: 1px solid ${props => {
    switch(props.status) {
      case 'pending_seller_acceptance': return 'rgba(255, 193, 7, 0.3)';
      case 'seller_accepted': return 'rgba(76, 175, 80, 0.3)';
      case 'seller_rejected': return 'rgba(244, 67, 54, 0.3)';
      case 'paid': return 'rgba(33, 150, 243, 0.3)';
      case 'withdrawn': return 'rgba(156, 39, 176, 0.3)';
      case 'completed': return 'rgba(76, 175, 80, 0.3)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: ${props => props.minimized ? '0' : '800px'};
  opacity: ${props => props.minimized ? '0' : '1'};
  margin: ${props => props.minimized ? '0' : '0 1.5rem 1rem'};
  padding: ${props => props.minimized ? '0' : '1.5rem'};
  
  h4 {
    margin: 0 0 1rem 0;
    color: ${props => {
      switch(props.status) {
        case 'pending_seller_acceptance': return '#FFC107';
        case 'seller_accepted': return '#4CAF50';
        case 'seller_rejected': return '#F44336';
        case 'paid': return '#2196F3';
        case 'withdrawn': return '#9C27B0';
        case 'completed': return '#4CAF50';
        default: return '#FFFFFF';
      }
    }};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    margin: ${props => props.minimized ? '0' : '0 1rem 1rem'};
    padding: ${props => props.minimized ? '0' : '1rem'};
  }
`;

const TransactionDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  
  .detail {
    .label {
      font-size: 0.8rem;
      opacity: 0.7;
      margin-bottom: 0.25rem;
    }
    
    .value {
      font-weight: bold;
      color: white;
      
      &.highlight {
        color: #FFC107;
        font-size: 1.1rem;
      }
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    
    .detail {
      .label {
        font-size: 0.75rem;
      }
      
      .value {
        font-size: 0.9rem;
        
        &.highlight {
          font-size: 1rem;
        }
      }
    }
  }
`;

const QuantityAdjustment = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  
  .adjustment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    .label {
      font-weight: bold;
      color: #FFC107;
    }
    
    .max-available {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  }
  
  .quantity-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    
    .quantity-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid #FFC107;
      background: transparent;
      color: #FFC107;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover:not(:disabled) {
        background: #FFC107;
        color: black;
      }
      
      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }
    
    .quantity-display {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      min-width: 60px;
      text-align: center;
    }
  }
  
  .total-preview {
    text-align: center;
    margin-top: 1rem;
    font-size: 1.1rem;
    color: #4CAF50;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
    
    .quantity-controls {
      gap: 0.75rem;
      
      .quantity-btn {
        width: 32px;
        height: 32px;
      }
      
      .quantity-display {
        font-size: 1.3rem;
        min-width: 50px;
      }
    }
    
    .total-preview {
      font-size: 1rem;
    }
  }
`;

const PaymentForm = styled.div`
  margin: 0;
  padding: 0;
  
  h4 {
    color: #2196F3;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .payment-amount {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    margin: 1rem 0;
    color: #2196F3;
  }
  
  .payment-details {
    text-align: center;
    margin-bottom: 1rem;
    opacity: 0.8;
    
    .quantity-info {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
  }
  
  .mock-payment-form {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    margin-bottom: 1rem;
    
    input {
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: white;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
      
      &:focus {
        outline: none;
        border-color: #2196F3;
      }
    }
  }

  @media (max-width: 768px) {
    .payment-amount {
      font-size: 1.3rem;
    }
    
    .mock-payment-form {
      padding: 0.75rem;
      
      input {
        padding: 0.65rem;
        font-size: 0.9rem;
      }
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  
  button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    &.accept {
      background: #4CAF50;
      color: white;
      
      &:hover:not(:disabled) {
        background: #45a049;
        transform: translateY(-2px);
      }
    }
    
    &.reject {
      background: transparent;
      border: 1px solid #F44336;
      color: #F44336;
      
      &:hover:not(:disabled) {
        background: rgba(244, 67, 54, 0.1);
      }
    }
    
    &.pay {
      background: #2196F3;
      color: white;
      
      &:hover:not(:disabled) {
        background: #1976D2;
        transform: translateY(-2px);
      }
    }
    
    &.withdraw {
      background: #9C27B0;
      color: white;
      
      &:hover:not(:disabled) {
        background: #7B1FA2;
        transform: translateY(-2px);
      }
    }
    
    &.cancel {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      
      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
      }
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }

  @media (max-width: 768px) {
    gap: 0.4rem;
    
    button {
      padding: 0.65rem 0.5rem;
      font-size: 0.85rem;
      
      svg {
        width: 14px;
        height: 14px;
      }
    }
  }
`;

const TransactionStatusCard = ({ transaction: initialTransaction, chat, transactionId }) => {
  const [minimized, setMinimized] = useState(true);
  const [adjustedQuantity, setAdjustedQuantity] = useState(1);
  const [maxAvailableQuantity, setMaxAvailableQuantity] = useState(0);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState(initialTransaction);

  const currentUser = auth.currentUser;
  const isSeller = chat?.isSeller;
  const isBuyer = chat?.isBuyer;

  // Real-time listener for transaction updates
  useEffect(() => {
    if (!transactionId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'transactions', transactionId),
      (doc) => {
        if (doc.exists()) {
          const updatedTransaction = doc.data();
          setTransaction(updatedTransaction);
          
          // Auto-minimize after status changes
          const statusChanged = updatedTransaction.status !== transaction?.status;
          if (statusChanged && 
              ['seller_accepted', 'seller_rejected', 'paid', 'withdrawn', 'completed']
                .includes(updatedTransaction.status)) {
            setMinimized(true);
            setShowPaymentForm(false);
          }
        }
      },
      (error) => {
        console.error('Error listening to transaction updates:', error);
      }
    );

    return () => unsubscribe();
  }, [transactionId]);

  // Also listen to chat for pendingPurchase updates
  useEffect(() => {
    if (chat?.pendingPurchase) {
      setTransaction(chat.pendingPurchase);
    }
  }, [chat?.pendingPurchase]);

  // Initialize quantities
  useEffect(() => {
    if (transaction) {
      setAdjustedQuantity(transaction.requestedQuantity || 1);
      setMaxAvailableQuantity(transaction.availableQuantity || transaction.requestedQuantity || 1);
    }
  }, [transaction]);

  // Get current item availability for sellers
  useEffect(() => {
    const fetchAvailability = async () => {
      if (isSeller && transaction?.itemId && transaction?.sellerId) {
        try {
          const shopRef = doc(db, 'shops', transaction.sellerId);
          const shopSnap = await getDoc(shopRef);
          
          if (shopSnap.exists()) {
            const shopData = shopSnap.data();
            const item = shopData.items?.find(item => item.id === transaction.itemId);
            const available = parseInt(item?.quantity) || 0;
            
            const maxAllowed = Math.min(transaction.requestedQuantity, available);
            setMaxAvailableQuantity(maxAllowed);
            
            if (adjustedQuantity > maxAllowed) {
              setAdjustedQuantity(Math.max(1, maxAllowed));
            }
          }
        } catch (error) {
          console.error('Error fetching item availability:', error);
        }
      }
    };

    fetchAvailability();
  }, [transaction, isSeller, adjustedQuantity]);

  if (!transaction) return null;

  const unitPrice = transaction.unitPrice || 0;
  const requestedQty = transaction.requestedQuantity || 1;
  const approvedQty = transaction.approvedQuantity;
  const finalAmount = transaction.finalTotalPrice || transaction.totalPrice || (unitPrice * requestedQty);
  
  // Get status display info
  const getStatusInfo = () => {
    switch(transaction.status) {
      case 'pending_seller_acceptance':
        return {
          icon: '⏳',
          main: 'Quantity Purchase Request',
          sub: `${requestedQty}x ${transaction.itemName} - $${(unitPrice * requestedQty).toFixed(2)}`
        };
      case 'seller_accepted':
        return {
          icon: '✅',
          main: 'Request Accepted',
          sub: `${approvedQty}x approved - $${finalAmount.toFixed(2)}`
        };
      case 'seller_rejected':
        return {
          icon: '❌',
          main: 'Request Declined',
          sub: 'Seller declined your request'
        };
      case 'paid':
        return {
          icon: '💰',
          main: 'Payment Complete',
          sub: 'Waiting for pickup coordination'
        };
      case 'withdrawn':
        return {
          icon: '🔄',
          main: 'Payment Withdrawn',
          sub: 'Transaction cancelled by buyer'
        };
      case 'completed':
        return {
          icon: '🎉',
          main: 'Transaction Completed',
          sub: 'Successfully completed'
        };
      default:
        return {
          icon: '📦',
          main: 'Transaction',
          sub: 'Processing...'
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Quantity adjustment for sellers
  const adjustQuantity = (delta) => {
    const newQuantity = Math.max(1, Math.min(maxAvailableQuantity, adjustedQuantity + delta));
    setAdjustedQuantity(newQuantity);
  };

  // Handle seller response
  const handleSellerResponse = async (decision) => {
    try {
      setLoading(true);
      
      if (decision === 'accept') {
        await TransactionService.respondToQuantityRequest(
          transactionId, 
          'accept', 
          adjustedQuantity
        );
      } else {
        await TransactionService.respondToQuantityRequest(
          transactionId, 
          'reject'
        );
      }
      
      // Status will update via listener
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle buyer payment
  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const mockPaymentData = {
        cardNumber: '4242424242424242',
        expiryMonth: '12',
        expiryYear: '25',
        cvc: '123'
      };
      
      await TransactionService.processQuantityPayment(transactionId, mockPaymentData);
      
      // Status will update via listener
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle buyer withdrawal
  const handleWithdrawal = async () => {
    if (!window.confirm('Are you sure you want to withdraw your payment? This will cancel the transaction.')) {
      return;
    }

    try {
      setLoading(true);
      
      await TransactionService.withdrawPayment(transactionId);
      
      // Status will update via listener
    } catch (error) {
      console.error('Error withdrawing payment:', error);
      alert('Withdrawal failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Don't show actions for completed/cancelled transactions
  const isTransactionFinalized = ['completed', 'seller_rejected', 'withdrawn'].includes(transaction.status);

  return (
    <StatusCardContainer minimized={minimized}>
      <StatusButton 
        status={transaction.status}
        minimized={minimized}
        onClick={() => setMinimized(!minimized)}
      >
        <div className="status-info">
          <div className="status-icon">{statusInfo.icon}</div>
          <div className="status-text">
            <div className="main-text">{statusInfo.main}</div>
            <div className="sub-text">{statusInfo.sub}</div>
          </div>
        </div>
        <div className="toggle-icon">
          <ChevronDown size={20} />
        </div>
      </StatusButton>
      
      <StatusCard 
        status={transaction.status}
        minimized={minimized}
      >
        {/* Show payment form in-place on mobile */}
        {showPaymentForm ? (
          <PaymentForm>
            <h4>
              <CreditCard size={18} />
              Complete Payment
            </h4>
            
            <div className="payment-amount">
              ${finalAmount.toFixed(2)}
            </div>
            
            <div className="payment-details">
              <div className="quantity-info">
                {approvedQty || requestedQty}x {transaction.itemName}
              </div>
            </div>
            
            <div className="mock-payment-form">
              <input type="text" placeholder="Card Number: 4242 4242 4242 4242" readOnly />
              <input type="text" placeholder="MM/YY: 12/25" readOnly />
              <input type="text" placeholder="CVC: 123" readOnly />
            </div>
            
            <ActionButtons>
              <button 
                className="cancel"
                onClick={() => setShowPaymentForm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="pay"
                onClick={handlePayment}
                disabled={loading}
              >
                <CreditCard size={16} />
                {loading ? 'Processing...' : 'Complete Payment'}
              </button>
            </ActionButtons>
          </PaymentForm>
        ) : (
          <>
            <h4>
              {transaction.status === 'pending_seller_acceptance' && '⏳ Quantity Purchase Request'}
              {transaction.status === 'seller_accepted' && '✅ Request Accepted'}
              {transaction.status === 'seller_rejected' && '❌ Request Declined'}
              {transaction.status === 'paid' && '💰 Payment Complete'}
              {transaction.status === 'withdrawn' && '🔄 Payment Withdrawn'}
              {transaction.status === 'completed' && '🎉 Transaction Completed'}
            </h4>
            
            <TransactionDetails status={transaction.status}>
              <div className="detail">
                <div className="label">Item</div>
                <div className="value">{transaction.itemName}</div>
              </div>
              <div className="detail">
                <div className="label">Unit Price</div>
                <div className="value">${unitPrice.toFixed(2)}</div>
              </div>
              <div className="detail">
                <div className="label">Requested Qty</div>
                <div className="value highlight">{requestedQty}</div>
              </div>
            </TransactionDetails>
            
            {approvedQty && (
              <TransactionDetails>
                <div className="detail">
                  <div className="label">Approved Qty</div>
                  <div className="value highlight">{approvedQty}</div>
                </div>
                <div className="detail">
                  <div className="label">Final Total</div>
                  <div className="value highlight">${finalAmount.toFixed(2)}</div>
                </div>
                <div className="detail"></div>
              </TransactionDetails>
            )}
            
            {/* Seller Quantity Adjustment */}
            {isSeller && transaction.status === 'pending_seller_acceptance' && (
              <QuantityAdjustment>
                <div className="adjustment-header">
                  <span className="label">Adjust Quantity (Optional)</span>
                  <span className="max-available">Max available: {maxAvailableQuantity}</span>
                </div>
                
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => adjustQuantity(-1)}
                    disabled={adjustedQuantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  
                  <div className="quantity-display">
                    {adjustedQuantity}
                  </div>
                  
                  <button 
                    className="quantity-btn"
                    onClick={() => adjustQuantity(1)}
                    disabled={adjustedQuantity >= maxAvailableQuantity}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="total-preview">
                  Total: ${(unitPrice * adjustedQuantity).toFixed(2)}
                </div>
              </QuantityAdjustment>
            )}
            
            {/* Action Buttons */}
            {!isTransactionFinalized && (
              <ActionButtons>
                {/* Seller Actions */}
                {isSeller && transaction.status === 'pending_seller_acceptance' && (
                  <>
                    <button 
                      className="reject" 
                      onClick={() => handleSellerResponse('reject')}
                      disabled={loading}
                    >
                      <X size={16} />
                      Decline
                    </button>
                    <button 
                      className="accept" 
                      onClick={() => handleSellerResponse('accept')}
                      disabled={loading}
                    >
                      <Package size={16} />
                      {loading ? 'Processing...' : 
                       adjustedQuantity === requestedQty ? 
                         `Accept ${adjustedQuantity} items` : 
                         `Approve ${adjustedQuantity} items`
                      }
                    </button>
                  </>
                )}
                
                {/* Buyer Actions */}
                {isBuyer && transaction.status === 'seller_accepted' && (
                  <button 
                    className="pay" 
                    onClick={() => setShowPaymentForm(true)}
                    disabled={loading}
                  >
                    <CreditCard size={16} />
                    Pay ${finalAmount.toFixed(2)}
                  </button>
                )}
                
                {/* Buyer Withdrawal Option */}
                {isBuyer && transaction.status === 'paid' && (
                  <button 
                    className="withdraw" 
                    onClick={handleWithdrawal}
                    disabled={loading}
                  >
                    <X size={16} />
                    {loading ? 'Processing...' : 'Withdraw Payment'}
                  </button>
                )}
              </ActionButtons>
            )}
          </>
        )}
      </StatusCard>
    </StatusCardContainer>
  );
};

export default TransactionStatusCard;