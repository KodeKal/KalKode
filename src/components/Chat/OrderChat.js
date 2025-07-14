// src/components/Chat/OrderChat.js - Updated for quantity-based transactions

import React from 'react';
import { useNavigate } from 'react-router-dom';
import BuyDialog from '../Transaction/BuyDialog';

const OrderChat = ({ isOpen, onClose, item, shopId, shopName, theme }) => {
  const navigate = useNavigate();

  const handleTransactionCreated = (transactionId) => {
    // Close the dialog and navigate to messages with the chat open
    onClose();
    navigate(`/messages?chat=${transactionId}`);
  };

  if (!isOpen) return null;

  // Ensure item has the necessary quantity information
  const enhancedItem = {
    ...item,
    shopName,
    quantity: item.quantity || 0, // Ensure quantity is available
    theme: theme || item.theme
  };

  return (
    <BuyDialog
      item={enhancedItem}
      sellerId={shopId}
      onClose={onClose}
      onTransactionCreated={handleTransactionCreated}
    />
  );
};

export default OrderChat;