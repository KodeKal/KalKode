// src/services/TransactionService.js - Ultra Simplified

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
import { PaymentService } from './PaymentService';

export const TransactionService = {
 // Initiate transaction with escrow payment
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
     const itemIndex = shopData.items.findIndex(item => item.id === itemId);

     if (itemIndex === -1) {
       throw new Error('Item not found');
     }

     const itemData = shopData.items[itemIndex];

     // Check quantity
     const currentQuantity = itemData.quantity || 0;
     if (currentQuantity < 1) {
       throw new Error('This item is out of stock');
     }

     // Generate transaction code
     const transactionCode = generateTransactionCode();

     // Create transaction with escrowed payment
     const transaction = {
       itemId,
       itemName: itemData.name,
       itemImage: itemData.images?.[0] || null,
       itemAddress: itemData.address || null,
       itemCoordinates: itemData.coordinates || null,
       price: parseFloat(price),
       sellerId,
       sellerName: shopData.name || '',
       buyerId: buyer.uid,
       buyerName: buyer.displayName || buyer.email,
       status: 'paid', // Simplified status
       paymentStatus: 'escrowed',
       meetupType,
       transactionCode,
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     };

     const transactionRef = await addDoc(collection(db, 'transactions'), transaction);
     const transactionId = transactionRef.id;

     // Create chat
     const chatDoc = {
       transactionId,
       itemId: itemData.id,
       itemName: itemData.name,
       itemImage: itemData.images?.[0] || null,
       itemAddress: itemData.address || null,
       buyerId: buyer.uid,
       buyerName: buyer.displayName || buyer.email,
       sellerId,
       sellerName: shopData.name || '',
       participants: [buyer.uid, sellerId],
       lastMessage: 'Payment secured - chat to arrange pickup',
       lastMessageTime: serverTimestamp(),
       unreadCount: {
         [buyer.uid]: 0,
         [sellerId]: 1
       }
     };

     await setDoc(doc(db, 'chats', transactionId), chatDoc);

     // Reserve item (decrease quantity)
     const updatedItems = [...shopData.items];
     updatedItems[itemIndex] = {
       ...itemData,
       quantity: currentQuantity - 1
     };

     await updateDoc(shopRef, {
       items: updatedItems
     });

     return {
       transactionId,
       transactionCode
     };
   } catch (error) {
     console.error('Error initiating transaction:', error);
     throw error;
   }
 },

 // Complete transaction when seller enters buyer's code
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
     
     // Mock releasing escrow funds to seller
     console.log(`Releasing $${transaction.price} from escrow to seller ${transaction.sellerId}`);
     
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
