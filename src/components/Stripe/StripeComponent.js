// src/components/Stripe/StripeComponents.js
import React from 'react';

// Mock CardElement component
export const CardElement = ({ options }) => {
  return (
    <div 
      className="stripe-card-element" 
      style={{ 
        padding: '10px', 
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '4px', 
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        color: 'white'
      }}
    >
      Credit Card Details Input (Stripe Mock)
    </div>
  );
};

// Mock useStripe hook
export const useStripe = () => {
  return {
    createPaymentMethod: async () => ({
      paymentMethod: { id: 'mock_payment_method_id' }
    })
  };
};

// Mock useElements hook
export const useElements = () => {
  return {
    getElement: () => ({})
  };
};

// Mock Elements provider
export const Elements = ({ stripe, children }) => {
  return (
    <div className="stripe-elements-provider">
      {children}
    </div>
  );
};