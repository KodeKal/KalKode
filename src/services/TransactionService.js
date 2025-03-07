// src/services/TransactionService.js

import { db, auth } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  serverTimestamp,
  increment,
  query,
  where,
  getDocs
} from 'firebase/firestore';

export const TransactionService = {
  // Initiate a transaction when buyer clicks "Buy"
  initiateTransaction: async (itemId, sellerId, price, meetupType) => {
    try {
      const buyer = auth.currentUser;
      
      if (!buyer) {
        throw new Error('You must be logged in to make a purchase');
      }
      
      // Get the shop document to find the item
      const shopRef = doc(db, 'shops', sellerId);
      const shopSnap = await getDoc(shopRef);
      
      if (!shopSnap.exists()) {
        throw new Error('Shop not found');
      }
      
      const shopData = shopSnap.data();
      
      // Find the item in the shop's items array
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
      
      // Create a new transaction
      const transaction = {
        itemId,
        itemName: itemData.name,
        itemImage: itemData.images?.[0] || null,
        sellerId,
        buyerId: buyer.uid,
        buyerName: buyer.displayName || buyer.email,
        sellerName: shopData.name || '',
        price: parseFloat(price),
        status: 'pending', // pending, confirmed, completed, cancelled, disputed
        meetupType, // 'inperson' or 'locker'
        meetupDetails: null,
        locationVerified: false,
        photoEvidence: null,
        transactionCode: generateTransactionCode(),
        lockerCode: meetupType === 'locker' ? generateLockerCode() : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      };
      
      // Create the transaction
      const transactionRef = await addDoc(collection(db, 'transactions'), transaction);
      
      // Decrease item quantity
      const updatedItems = [...shopData.items];
      updatedItems[itemIndex] = {
        ...itemData,
        quantity: currentQuantity - 1
      };
      
      // Update the shop document with the new items array
      await updateDoc(shopRef, {
        items: updatedItems
      });
      
      // Create a chat for this transaction
      await addDoc(collection(db, 'chats'), {
        transactionId: transactionRef.id,
        buyerId: buyer.uid,
        sellerId,
        lastMessage: 'Transaction started',
        lastMessageTime: serverTimestamp(),
        participants: [buyer.uid, sellerId],
        unreadCount: {
          [buyer.uid]: 0,
          [sellerId]: 1 // Notify seller
        }
      });
      
      return transactionRef.id;
    } catch (error) {
      console.error('Error initiating transaction:', error);
      throw error;
    }
  },
  
  // Update transaction with meetup details
  setMeetupDetails: async (transactionId, details) => {
    try {
      await updateDoc(doc(db, 'transactions', transactionId), {
        meetupDetails: details,
        status: 'confirmed',
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error setting meetup details:', error);
      throw error;
    }
  },
  
  // Verify location proximity
  verifyLocation: async (transactionId, buyerLocation, sellerLocation) => {
    try {
      // Calculate distance between buyer and seller (using a simple calculation)
      const distance = calculateDistance(
        buyerLocation.latitude, 
        buyerLocation.longitude, 
        sellerLocation.latitude, 
        sellerLocation.longitude
      );
      
      // If they are within 50 meters of each other
      const isProximityVerified = distance <= 0.05; // 50 meters
      
      await updateDoc(doc(db, 'transactions', transactionId), {
        locationVerified: isProximityVerified,
        updatedAt: serverTimestamp()
      });
      
      return isProximityVerified;
    } catch (error) {
      console.error('Error verifying location:', error);
      throw error;
    }
  },
  
  // Upload photo evidence
  uploadPhotoEvidence: async (transactionId, photoUrl) => {
    try {
      await updateDoc(doc(db, 'transactions', transactionId), {
        photoEvidence: photoUrl,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error uploading photo evidence:', error);
      throw error;
    }
  },
  
  // Complete transaction (release funds)
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
        throw new Error('Invalid transaction code');
      }
      
      // Update transaction status
      await updateDoc(transactionRef, {
        status: 'completed',
        updatedAt: serverTimestamp()
      });
      
      // Here you would integrate with payment system to release funds
      // For now, we'll just mark it as completed
      
      return true;
    } catch (error) {
      console.error('Error completing transaction:', error);
      throw error;
    }
  },
  
  // Get transaction for a user (either buyer or seller)
  getUserTransactions: async (userId) => {
    try {
      const transactions = [];
      
      // Get transactions where user is buyer
      const buyerQuery = query(
        collection(db, 'transactions'),
        where('buyerId', '==', userId)
      );
      
      // Get transactions where user is seller
      const sellerQuery = query(
        collection(db, 'transactions'),
        where('sellerId', '==', userId)
      );
      
      const [buyerSnap, sellerSnap] = await Promise.all([
        getDocs(buyerQuery),
        getDocs(sellerQuery)
      ]);
      
      buyerSnap.forEach(doc => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
          role: 'buyer'
        });
      });
      
      sellerSnap.forEach(doc => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
          role: 'seller'
        });
      });
      
      // Sort by creation date (most recent first)
      return transactions.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }
};

// Helper functions
function generateTransactionCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'KODE-';
  
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return code;
}

function generateLockerCode() {
  // Generate a 6-digit locker code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Simple distance calculation using the Haversine formula
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}