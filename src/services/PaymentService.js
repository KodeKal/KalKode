// src/services/PaymentService.js
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../firebase/config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  increment
} from 'firebase/firestore';
// Import our mock instead of the real loadStripe
import { loadStripe } from '../utils/stripe-js';

// Initialize Stripe with your publishable key
// Replace with your actual key when deploying
const stripePromise = loadStripe('pk_test_51OrL8jKQTQHbUWOUYmr5kc3tBzSTYxsIvd9P31qP4sjEVcyQvg2vxQpqvKZFGnwKpC8p6MtF7FPULJzLO3mPnFfy00Vd0R2yOS');

export const PaymentService = {
  // Get Stripe promise to use with Elements
  getStripePromise: () => stripePromise,
  
  // Create a payment intent for a transaction
  createPaymentIntent: async (transactionData) => {
    try {
      const createPaymentIntentFn = httpsCallable(functions, 'createPaymentIntent');
      const response = await createPaymentIntentFn(transactionData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },
  
  // Capture a payment (release from escrow to seller)
  capturePayment: async (transactionId, verificationCode) => {
    try {
      const capturePaymentFn = httpsCallable(functions, 'capturePayment');
      const response = await capturePaymentFn({ transactionId, verificationCode });
      return response.data;
    } catch (error) {
      console.error('Error capturing payment:', error);
      throw error;
    }
  },
  
  // Cancel a payment and refund the buyer
  cancelPayment: async (transactionId, reason) => {
    try {
      const cancelPaymentFn = httpsCallable(functions, 'cancelPayment');
      const response = await cancelPaymentFn({ transactionId, reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw error;
    }
  },
  
  // On-board a seller to Stripe Connect
  createSellerAccount: async (userData) => {
    try {
      const createSellerAccountFn = httpsCallable(functions, 'createSellerAccount');
      const response = await createSellerAccountFn(userData);
      return response.data;
    } catch (error) {
      console.error('Error creating seller account:', error);
      throw error;
    }
  },
  
  // Get a seller's account status
  getSellerAccountStatus: async (userId) => {
    try {
      const getSellerStatusFn = httpsCallable(functions, 'getSellerAccountStatus');
      const response = await getSellerStatusFn({ userId });
      return response.data;
    } catch (error) {
      console.error('Error getting seller status:', error);
      throw error;
    }
  },
  
  // Get a link to complete seller onboarding
  getSellerOnboardingLink: async () => {
    try {
      const getOnboardingLinkFn = httpsCallable(functions, 'getSellerOnboardingLink');
      const response = await getOnboardingLinkFn();
      return response.data.url;
    } catch (error) {
      console.error('Error getting onboarding link:', error);
      throw error;
    }
  },

  processPayment: async (transactionId, paymentMethodId) => {
    try {
      console.log('Processing payment with mock Stripe:', { transactionId, paymentMethodId });
      
      // Get transaction reference
      const transactionRef = doc(db, 'transactions', transactionId);
      
      // Create a mock payment intent success response
      const mockPaymentResponse = {
        id: `mock_payment_${Date.now()}`,
        status: 'succeeded',
        client_secret: `mock_secret_${Date.now()}`
      };
      
      // Update transaction with the payment intent ID
      await updateDoc(transactionRef, {
        stripePaymentIntentId: mockPaymentResponse.id,
        paymentStatus: 'succeeded',
        status: 'awaiting_seller', // Update status to notify seller
        updatedAt: serverTimestamp()
      });
      
      // Add notification for the seller in Firestore
      const transaction = (await getDoc(transactionRef)).data();
      
      // Create notification in chat
      const chatRef = doc(db, 'chats', transactionId);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        // Create chat if it doesn't exist
        await setDoc(chatRef, {
          transactionId,
          buyerId: transaction.buyerId,
          sellerId: transaction.sellerId,
          lastMessage: 'New payment received!',
          lastMessageTime: serverTimestamp(),
          participants: [transaction.buyerId, transaction.sellerId],
          unreadCount: {
            [transaction.buyerId]: 0,
            [transaction.sellerId]: 1 // Notify seller with unread count
          }
        });
      } else {
        // Update existing chat
        await updateDoc(chatRef, {
          lastMessage: 'New payment received!',
          lastMessageTime: serverTimestamp(),
          [`unreadCount.${transaction.sellerId}`]: increment(1)
        });
      }
      
      // Add payment message to chat
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: 'Placeholder payment processed successfully!',
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'system',
        messageClass: 'success-message'
      });
      
      return mockPaymentResponse;
    } catch (error) {
      console.error('Error processing mock payment:', error);
      throw error;
    }
  }
};