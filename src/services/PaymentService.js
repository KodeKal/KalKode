// src/services/PaymentService.js - Simplified with Escrow Mock

import { db } from '../firebase/config';
import { 
 doc, 
 updateDoc, 
 serverTimestamp
} from 'firebase/firestore';
import { loadStripe } from '../utils/stripe-js';

const stripePromise = loadStripe('pk_test_51OrL8jKQTQHbUWOUYmr5kc3tBzSTYxsIvd9P31qP4sjEVcyQvg2vxQpqvKZFGnwKpC8p6MtF7FPULJzLO3mPnFfy00Vd0R2yOS');

export const PaymentService = {
 getStripePromise: () => stripePromise,

 // Process payment and hold in escrow
 processPayment: async (transactionId, paymentMethodId) => {
   try {
     console.log('Processing escrow payment:', { transactionId, paymentMethodId });
     
     // Mock successful payment processing
     const mockPaymentResponse = {
       id: `mock_escrow_${Date.now()}`,
       status: 'succeeded',
       client_secret: `mock_secret_${Date.now()}`
     };
     
     // Update transaction with escrow status
     const transactionRef = doc(db, 'transactions', transactionId);
     await updateDoc(transactionRef, {
       stripePaymentIntentId: mockPaymentResponse.id,
       paymentStatus: 'escrowed',
       updatedAt: serverTimestamp()
     });
     
     console.log('Payment held in escrow successfully');
     return mockPaymentResponse;
   } catch (error) {
     console.error('Error processing escrow payment:', error);
     throw error;
   }
 },

 // Release escrow funds to seller
 releaseEscrow: async (transactionId) => {
   try {
     console.log('Releasing escrow funds for transaction:', transactionId);
     
     const transactionRef = doc(db, 'transactions', transactionId);
     await updateDoc(transactionRef, {
       paymentStatus: 'released',
       releasedAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     });
     
     console.log('Escrow funds released to seller');
     return { success: true };
   } catch (error) {
     console.error('Error releasing escrow:', error);
     throw error;
   }
 },

 // Refund buyer (cancel escrow)
 refundEscrow: async (transactionId) => {
   try {
     console.log('Refunding escrow for transaction:', transactionId);
     
     const transactionRef = doc(db, 'transactions', transactionId);
     await updateDoc(transactionRef, {
       paymentStatus: 'refunded',
       refundedAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     });
     
     console.log('Escrow refunded to buyer');
     return { success: true };
   } catch (error) {
     console.error('Error refunding escrow:', error);
     throw error;
   }
 }
};
