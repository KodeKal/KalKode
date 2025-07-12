// src/services/TransactionService.js - Enhanced with proper flow

import { db, auth } from '../firebase/config';
import { 
 collection, 
 addDoc, 
 updateDoc, 
 doc, 
 getDoc, 
 serverTimestamp,
 setDoc
} from 'firebase/firestore';

export const TransactionService = {
 // Step 1: Buyer initiates transaction (creates pending transaction)
 initiateTransaction: async (itemId, sellerId, price, meetupType) => {
   try {
     const buyer = auth.currentUser;

     if (!buyer) {
       throw new Error('You must be logged in to make a purchase');
     }

     if (buyer.uid === sellerId) {
       throw new Error('You cannot purchase items from your own store');
     }

     // Get the shop document to find the item
     const shopRef = doc(db, 'shops', sellerId);
     const shopSnap = await getDoc(shopRef);

     if (!shopSnap.exists()) {
       throw new Error('Shop not found');
     }

     const shopData = shopSnap.data();
     const item = shopData.items.find(item => item.id === itemId);

     if (!item) {
       throw new Error('Item not found');
     }

     // Check quantity
     const currentQuantity = item.quantity || 0;
     if (currentQuantity < 1) {
       throw new Error('This item is out of stock');
     }

     // Create PENDING transaction (waiting for seller acceptance)
     const transaction = {
       itemId,
       itemName: item.name,
       itemImage: item.images?.[0] || null,
       itemAddress: item.address || null,
       itemCoordinates: item.coordinates || null,
       originalPrice: parseFloat(item.price),
       negotiatedPrice: parseFloat(price), // Could be different if negotiated
       finalPrice: null, // Set when seller accepts
       sellerId,
       sellerName: shopData.name || '',
       buyerId: buyer.uid,
       buyerName: buyer.displayName || buyer.email,
       status: 'pending_seller_acceptance', // NEW STATUS
       paymentStatus: 'not_paid',
       meetupType,
       transactionCode: null, // Generated after payment
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     };

     const transactionRef = await addDoc(collection(db, 'transactions'), transaction);
     const transactionId = transactionRef.id;

     // Create chat with purchase request
     const chatDoc = {
       transactionId,
       itemId: item.id,
       itemName: item.name,
       itemImage: item.images?.[0] || null,
       itemAddress: item.address || null,
       buyerId: buyer.uid,
       buyerName: buyer.displayName || buyer.email,
       sellerId,
       sellerName: shopData.name || '',
       participants: [buyer.uid, sellerId],
       lastMessage: `Purchase request for ${item.name} - $${price}`,
       lastMessageTime: serverTimestamp(),
       unreadCount: {
         [buyer.uid]: 0,
         [sellerId]: 1
       },
       // Add purchase request data to chat
       pendingPurchase: {
         itemId,
         itemName: item.name,
         negotiatedPrice: parseFloat(price),
         originalPrice: parseFloat(item.price),
         status: 'pending_seller_acceptance',
         buyerName: buyer.displayName || buyer.email
       }
     };

     await setDoc(doc(db, 'chats', transactionId), chatDoc);

     // Add system message about purchase request
     await addDoc(collection(db, 'chats', transactionId, 'messages'), {
       text: `Purchase request initiated for ${item.name} at $${price}. Waiting for seller acceptance.`,
       sender: 'system',
       senderName: 'System',
       timestamp: serverTimestamp(),
       type: 'purchase_request',
       purchaseData: {
         itemName: item.name,
         requestedPrice: parseFloat(price),
         originalPrice: parseFloat(item.price),
         meetupType
       }
     });

     return {
       transactionId,
       status: 'pending_seller_acceptance'
     };
   } catch (error) {
     console.error('Error initiating transaction:', error);
     throw error;
   }
 },

 // Step 2: Seller accepts/rejects the purchase request
 respondToPurchaseRequest: async (transactionId, decision, finalPrice = null) => {
   try {
     const currentUser = auth.currentUser;
     if (!currentUser) throw new Error('Authentication required');

     const transactionRef = doc(db, 'transactions', transactionId);
     const transactionSnap = await getDoc(transactionRef);
     
     if (!transactionSnap.exists()) {
       throw new Error('Transaction not found');
     }
     
     const transaction = transactionSnap.data();
     
     // Verify this is the seller
     if (transaction.sellerId !== currentUser.uid) {
       throw new Error('Only the seller can respond to this request');
     }

     if (decision === 'accept') {
       const agreedPrice = finalPrice || transaction.negotiatedPrice;
       
       // Update transaction status to accepted
       await updateDoc(transactionRef, {
         status: 'seller_accepted',
         finalPrice: agreedPrice,
         sellerAcceptedAt: serverTimestamp(),
         updatedAt: serverTimestamp()
       });

       // Update chat with acceptance
       await updateDoc(doc(db, 'chats', transactionId), {
         lastMessage: `Seller accepted purchase for $${agreedPrice}`,
         lastMessageTime: serverTimestamp(),
         pendingPurchase: {
           ...transaction,
           status: 'seller_accepted',
           finalPrice: agreedPrice
         },
         [`unreadCount.${transaction.buyerId}`]: 1
       });

       // Add system message
       await addDoc(collection(db, 'chats', transactionId, 'messages'), {
         text: `Seller accepted the purchase request for $${agreedPrice}. Buyer can now proceed with payment.`,
         sender: 'system',
         senderName: 'System',
         timestamp: serverTimestamp(),
         type: 'seller_accepted',
         purchaseData: {
           finalPrice: agreedPrice,
           sellerName: transaction.sellerName
         }
       });

       return { success: true, finalPrice: agreedPrice };
     } else {
       // Seller rejected
       await updateDoc(transactionRef, {
         status: 'seller_rejected',
         sellerRejectedAt: serverTimestamp(),
         updatedAt: serverTimestamp()
       });

       await updateDoc(doc(db, 'chats', transactionId), {
         lastMessage: 'Seller declined the purchase request',
         lastMessageTime: serverTimestamp(),
         pendingPurchase: {
           ...transaction,
           status: 'seller_rejected'
         },
         [`unreadCount.${transaction.buyerId}`]: 1
       });

       await addDoc(collection(db, 'chats', transactionId, 'messages'), {
         text: 'Seller declined the purchase request.',
         sender: 'system',
         senderName: 'System',
         timestamp: serverTimestamp(),
         type: 'seller_rejected'
       });

       return { success: true, rejected: true };
     }
   } catch (error) {
     console.error('Error responding to purchase request:', error);
     throw error;
   }
 },

 // Step 3: Buyer processes payment after seller acceptance
 processPayment: async (transactionId, paymentMethodData) => {
   try {
     const transactionRef = doc(db, 'transactions', transactionId);
     const transactionSnap = await getDoc(transactionRef);
     
     if (!transactionSnap.exists()) {
       throw new Error('Transaction not found');
     }
     
     const transaction = transactionSnap.data();
     
     if (transaction.status !== 'seller_accepted') {
       throw new Error('Transaction must be accepted by seller before payment');
     }

     // Generate transaction code for pickup
     const transactionCode = generateTransactionCode();

     // Mock payment processing (replace with real Stripe integration)
     console.log('Processing payment for $', transaction.finalPrice);
     
     // Update transaction with payment success
     await updateDoc(transactionRef, {
       status: 'paid',
       paymentStatus: 'escrowed',
       transactionCode,
       paidAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     });

     // Update chat
     await updateDoc(doc(db, 'chats', transactionId), {
       lastMessage: 'Payment processed successfully',
       lastMessageTime: serverTimestamp(),
       pendingPurchase: {
         ...transaction,
         status: 'paid',
         transactionCode
       },
       [`unreadCount.${transaction.sellerId}`]: 1
     });

     // Add system message with code (only buyer can see)
     await addDoc(collection(db, 'chats', transactionId, 'messages'), {
       text: `Payment processed successfully! Your pickup code is: ${transactionCode}`,
       sender: 'system',
       senderName: 'System',
       timestamp: serverTimestamp(),
       type: 'payment_success',
       visibleTo: [transaction.buyerId], // Only buyer sees the code
       purchaseData: {
         transactionCode,
         finalPrice: transaction.finalPrice
       }
     });

     // Add separate message for seller (without code)
     await addDoc(collection(db, 'chats', transactionId, 'messages'), {
       text: 'Buyer has completed payment. Funds are held in escrow until pickup is confirmed.',
       sender: 'system',
       senderName: 'System',
       timestamp: serverTimestamp(),
       type: 'payment_notification',
       visibleTo: [transaction.sellerId],
       purchaseData: {
         finalPrice: transaction.finalPrice
       }
     });

     // Reserve item (decrease quantity)
     const shopRef = doc(db, 'shops', transaction.sellerId);
     const shopSnap = await getDoc(shopRef);
     if (shopSnap.exists()) {
       const shopData = shopSnap.data();
       const itemIndex = shopData.items.findIndex(item => item.id === transaction.itemId);
       
       if (itemIndex !== -1) {
         const updatedItems = [...shopData.items];
         updatedItems[itemIndex] = {
           ...updatedItems[itemIndex],
           quantity: Math.max(0, (updatedItems[itemIndex].quantity || 1) - 1)
         };

         await updateDoc(shopRef, { items: updatedItems });
       }
     }

     return {
       success: true,
       transactionCode,
       finalPrice: transaction.finalPrice
     };
   } catch (error) {
     console.error('Error processing payment:', error);
     throw error;
   }
 },

 // Step 4: Complete transaction when seller enters buyer's code
 completeTransaction: async (transactionId, code) => {
   try {
     const transactionRef = doc(db, 'transactions', transactionId);
     const transactionSnap = await getDoc(transactionRef);
     
     if (!transactionSnap.exists()) {
       throw new Error('Transaction not found');
     }
     
     const transaction = transactionSnap.data();
     
     // Verify code
     if (transaction.transactionCode !== code) {
       throw new Error('Invalid verification code');
     }
     
     // Complete transaction and release funds
     await updateDoc(transactionRef, {
       status: 'completed',
       paymentStatus: 'released',
       completedAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     });

     // Update chat
     await updateDoc(doc(db, 'chats', transactionId), {
       lastMessage: 'Transaction completed successfully',
       lastMessageTime: serverTimestamp(),
       pendingPurchase: {
         ...transaction,
         status: 'completed'
       }
     });
     
     // Add completion message
     await addDoc(collection(db, 'chats', transactionId, 'messages'), {
       text: '✅ Transaction completed! Funds have been released to the seller.',
       sender: 'system',
       senderName: 'System',
       timestamp: serverTimestamp(),
       type: 'transaction_completed'
     });
     
     console.log(`Released $${transaction.finalPrice} from escrow to seller ${transaction.sellerId}`);
     
     return {
       success: true,
       message: 'Transaction completed successfully'
     };
   } catch (error) {
     console.error('Error completing transaction:', error);
     throw error;
   }
 },

 // Get transaction by ID
 getTransactionById: async (transactionId) => {
   try {
     const transactionDoc = await getDoc(doc(db, 'transactions', transactionId));
     if (!transactionDoc.exists()) {
       throw new Error('Transaction not found');
     }
     
     return {
       id: transactionDoc.id,
       ...transactionDoc.data()
     };
   } catch (error) {
     console.error('Error getting transaction:', error);
     throw error;
   }
 }
};

// Helper function to generate transaction codes
function generateTransactionCode() {
 const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
 let code = 'KODE-';
 
 for (let i = 0; i < 6; i++) {
   code += characters.charAt(Math.floor(Math.random() * characters.length));
 }
 
 return code;
}