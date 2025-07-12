// src/components/Chat/OrderChat.js - Updated for new flow

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

  return (
    <BuyDialog
      item={{
        ...item,
        shopName
      }}
      sellerId={shopId}
      onClose={onClose}
      onTransactionCreated={handleTransactionCreated}
    />
  );
};

export default OrderChat;