// src/services/TransactionService.js - Updated version

import { db, auth } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  serverTimestamp,
  setDoc,
  increment,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { PaymentService } from './PaymentService';

export const TransactionService = {
  // Initiate a transaction when buyer clicks "Order"
  // Update in src/services/TransactionService.js

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

      // Generate transaction code
      const transactionCode = generateTransactionCode();

      // Create a new transaction
      const transaction = {
        itemId,
        itemName: itemData.name,
        itemImage: itemData.images?.[0] || null,
        price: parseFloat(price),
        sellerId,
        sellerName: shopData.name || '',
        buyerId: buyer.uid,
        buyerName: buyer.displayName || buyer.email,
        status: 'pending',
        paymentStatus: 'pending',
        meetupType,
        meetupDetails: null,
        transactionCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Create the transaction first
      const transactionRef = await addDoc(collection(db, 'transactions'), transaction);
      const transactionId = transactionRef.id;

      // Now check if a chat already exists for this transaction
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('transactionId', '==', transactionId));
      const existingChats = await getDocs(q);

      // If no chat exists, create one (and ONLY one)
      if (existingChats.empty) {
        // Create a single chat document with both participants
        const chatDoc = {
          transactionId,
          itemId: itemData.id,
          itemName: itemData.name,
          itemImage: itemData.images?.[0] || null,
          buyerId: buyer.uid,
          buyerName: buyer.displayName || buyer.email,
          sellerId,
          sellerName: shopData.name || '',
          participants: [buyer.uid, sellerId], // Include both participants
          lastMessage: 'Transaction initiated',
          lastMessageTime: serverTimestamp(),
          unreadCount: {
            [buyer.uid]: 0,
            [sellerId]: 1 // Notify seller immediately
          }
        };

        // Create the chat using the transaction ID as the chat ID to ensure uniqueness
        await setDoc(doc(db, 'chats', transactionId), chatDoc);

        // Add welcome message to the chat
        await addDoc(collection(db, 'chats', transactionId, 'messages'), {
          text: `Transaction started for ${itemData.name}. Please complete payment to confirm your order.`,
          sender: 'system',
          senderName: 'System',
          timestamp: serverTimestamp(),
          type: 'system',
          messageClass: 'status-message'
        });
      }

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

      return {
        transactionId,
        transactionCode
      };
    } catch (error) {
      console.error('Error initiating transaction:', error);
      throw error;
    }
  },
  
  verifyPickupLocation: async (transactionId, buyerLocation) => {
    try {
      const transactionDoc = await getDoc(doc(db, 'transactions', transactionId));
      if (!transactionDoc.exists()) {
        throw new Error('Transaction not found');
      }
      
      const transaction = transactionDoc.data();
      
      // Check if buyer is within range of the pickup location
      if (transaction.meetupDetails && 
          transaction.meetupDetails.latitude && 
          transaction.meetupDetails.longitude) {
        
        const distance = calculateDistance(
          buyerLocation.latitude,
          buyerLocation.longitude,
          transaction.meetupDetails.latitude,
          transaction.meetupDetails.longitude
        );
        
        // If within 100 meters, mark as at location
        const isAtLocation = distance <= 0.1; // 100 meters
        
        if (isAtLocation) {
          // Update transaction
          await updateDoc(doc(db, 'transactions', transactionId), {
            buyerAtLocation: true,
            updatedAt: serverTimestamp()
          });
          
          // Add message to chat
          await addDoc(collection(db, 'chats', transactionId, 'messages'), {
            text: 'Buyer has arrived at the pickup location',
            sender: 'system',
            senderName: 'System',
            timestamp: serverTimestamp(),
            type: 'system',
            messageClass: 'status-message'
          });
        }
        
        return {
          isAtLocation,
          distance: distance * 1000 // Convert to meters
        };
      }
      
      return {
        isAtLocation: false,
        distance: null
      };
    } catch (error) {
      console.error('Error verifying pickup location:', error);
      throw error;
    }
  },
  
  // Add function to generate a QR code for verification
  generateVerificationQRCode: async (transactionId) => {
    try {
      const transactionDoc = await getDoc(doc(db, 'transactions', transactionId));
      if (!transactionDoc.exists()) {
        throw new Error('Transaction not found');
      }
      
      const transaction = transactionDoc.data();
      
      // For a real implementation, we would generate a QR code using a library
      // or service. For now, we'll just return the transaction code.
      return {
        transactionCode: transaction.transactionCode,
        // In a real implementation, we'd return a data URL or similar
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?data=${transaction.transactionCode}&size=150x150`
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },

  // Add to src/services/TransactionService.js

completePickupTransaction: async (transactionId, verificationCode) => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionSnap = await getDoc(transactionRef);
    
    if (!transactionSnap.exists()) {
      throw new Error('Transaction not found');
    }
    
    const transaction = transactionSnap.data();
    
    // Verify code
    if (transaction.transactionCode !== verificationCode) {
      throw new Error('Invalid verification code');
    }
    
    // Release payment (in a real implementation, this would call a Cloud Function)
    // For demo purposes, we'll just update the transaction status
    await updateDoc(transactionRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Add system message to chat
    await addDoc(collection(db, 'chats', transactionId, 'messages'), {
      text: 'Transaction completed successfully! Payment has been released to the seller.',
      sender: 'system',
      senderName: 'System',
      timestamp: serverTimestamp(),
      type: 'system',
      messageClass: 'success-message'
    });
    
    return {
      success: true,
      message: 'Transaction completed successfully'
    };
  } catch (error) {
    console.error('Error completing transaction:', error);
    throw error;
  }
},
  // Process payment for a transaction
  processPayment: async (transactionId, paymentMethodId) => {
    try {
      // Get transaction details
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionSnap = await getDoc(transactionRef);
      
      if (!transactionSnap.exists()) {
        throw new Error('Transaction not found');
      }
      
      const transaction = transactionSnap.data();
      
      // Create payment intent with Stripe
      const paymentData = {
        transactionId,
        amount: transaction.price,
        sellerId: transaction.sellerId,
        buyerId: transaction.buyerId,
        itemId: transaction.itemId,
        itemName: transaction.itemName
      };
      
      const paymentResult = await PaymentService.createPaymentIntent(paymentData);
      
      // Add payment message to chat
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: 'Payment processed successfully! Your payment is secure and will be released to the seller when you provide the verification code upon pickup.',
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'system',
        paymentStatus: 'succeeded'
      });
      
      // Update transaction status
      await updateDoc(transactionRef, {
        status: 'awaiting_seller',
        updatedAt: serverTimestamp()
      });
      
      return paymentResult;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },
  
  // Accept a transaction as a seller
  acceptTransaction: async (transactionId) => {
    try {
      const seller = auth.currentUser;
      
      if (!seller) {
        throw new Error('You must be logged in to accept a transaction');
      }
      
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionSnap = await getDoc(transactionRef);
      
      if (!transactionSnap.exists()) {
        throw new Error('Transaction not found');
      }
      
      const transaction = transactionSnap.data();
      
      // Verify that the current user is the seller
      if (transaction.sellerId !== seller.uid) {
        throw new Error('You are not authorized to accept this transaction');
      }
      
      // Get the shop data to find the item location
      const shopRef = doc(db, 'shops', seller.uid);
      const shopSnap = await getDoc(shopRef);
      
      if (!shopSnap.exists()) {
        throw new Error('Shop not found');
      }
      
      const shopData = shopSnap.data();
      const item = shopData.items.find(i => i.id === transaction.itemId);
      
      // Get location from item
      const itemLocation = {
        address: item?.address || 'Location not specified',
        coordinates: item?.coordinates || null,
        timestamp: serverTimestamp()
      };
      
      // Update transaction status and set location
      await updateDoc(transactionRef, {
        status: 'confirmed',
        meetupDetails: itemLocation,
        updatedAt: serverTimestamp()
      });
      
      // Add system message to chat
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: 'Seller has accepted the order. See pickup location details below.',
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'system'
      });
      
      // Add location message to chat
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        location: itemLocation,
        sender: seller.uid,
        senderName: shopData.name || seller.displayName || seller.email,
        timestamp: serverTimestamp(),
        type: 'location'
      });
      
      return true;
    } catch (error) {
      console.error('Error accepting transaction:', error);
      throw error;
    }
  },
  
  // Reject a transaction as a seller
  rejectTransaction: async (transactionId, reason) => {
    try {
      const seller = auth.currentUser;
      
      if (!seller) {
        throw new Error('You must be logged in to reject a transaction');
      }
      
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionSnap = await getDoc(transactionRef);
      
      if (!transactionSnap.exists()) {
        throw new Error('Transaction not found');
      }
      
      const transaction = transactionSnap.data();
      
      // Verify that the current user is the seller
      if (transaction.sellerId !== seller.uid) {
        throw new Error('You are not authorized to reject this transaction');
      }
      
      // Cancel the payment through Stripe if payment was made
      if (transaction.stripePaymentIntentId) {
        await PaymentService.cancelPayment(transactionId, reason || 'Rejected by seller');
      }
      
      // Update transaction status
      await updateDoc(transactionRef, {
        status: 'cancelled',
        cancellationReason: reason || 'Rejected by seller',
        updatedAt: serverTimestamp()
      });
      
      // Add system message to chat
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: `Transaction rejected by seller${reason ? ': ' + reason : '.'}`,
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'system'
      });
      
      return true;
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      throw error;
    }
  },
  
  // Set meetup details
  setMeetupDetails: async (transactionId, details) => {
    try {
      await updateDoc(doc(db, 'transactions', transactionId), {
        meetupDetails: details,
        status: 'confirmed',
        updatedAt: serverTimestamp()
      });
      
      // Add system message to chat
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: 'Meetup location has been set by the seller.',
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'system',
        location: details
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
      // Calculate distance between buyer and seller
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
      
      // Release payment from escrow via Stripe
      const paymentResult = await PaymentService.capturePayment(transactionId, code);
      
      return paymentResult;
    } catch (error) {
      console.error('Error completing transaction:', error);
      throw error;
    }
  },
  
  // Get transactions for a user (either buyer or seller)
  getUserTransactions: async (userId, status = null, role = null, limit = 20) => {
    try {
      const transactions = [];
      
      // Create query conditions
      let conditions = [];
      if (role === 'buyer') {
        conditions.push(where('buyerId', '==', userId));
      } else if (role === 'seller') {
        conditions.push(where('sellerId', '==', userId));
      } else {
        // If no role specified, get both
        const buyerQuery = query(
          collection(db, 'transactions'),
          where('buyerId', '==', userId),
          ...(status ? [where('status', '==', status)] : []),
          orderBy('updatedAt', 'desc'),
          limit(limit)
        );
        
        const sellerQuery = query(
          collection(db, 'transactions'),
          where('sellerId', '==', userId),
          ...(status ? [where('status', '==', status)] : []),
          orderBy('updatedAt', 'desc'),
          limit(limit)
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
        return transactions.sort((a, b) => {
          const dateA = a.updatedAt || a.createdAt;
          const dateB = b.updatedAt || b.createdAt;
          return dateB - dateA;
        });
      }
      
      // If role is specified, build a single query
      if (status) {
        conditions.push(where('status', '==', status));
      }
      
      const txQuery = query(
        collection(db, 'transactions'),
        ...conditions,
        orderBy('updatedAt', 'desc'),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(txQuery);
      
      querySnapshot.forEach(doc => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
          role: role
        });
      });
      
      return transactions;
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  },
  
  // Get transaction details by ID
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
  },
  
  // Get user's pending notifications for transactions
  getTransactionNotifications: async (userId) => {
    try {
      const buyerQuery = query(
        collection(db, 'transactions'),
        where('buyerId', '==', userId),
        where('status', 'in', ['pending', 'awaiting_seller', 'confirmed']),
        orderBy('updatedAt', 'desc')
      );
      
      const sellerQuery = query(
        collection(db, 'transactions'),
        where('sellerId', '==', userId),
        where('status', 'in', ['awaiting_seller', 'confirmed']),
        orderBy('updatedAt', 'desc')
      );
      
      const [buyerSnap, sellerSnap] = await Promise.all([
        getDocs(buyerQuery),
        getDocs(sellerQuery)
      ]);
      
      const notifications = [];
      
      buyerSnap.forEach(doc => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          type: 'transaction',
          title: `Order: ${data.itemName}`,
          message: getStatusMessage(data.status, 'buyer'),
          timestamp: data.updatedAt,
          status: data.status,
          role: 'buyer'
        });
      });
      
      sellerSnap.forEach(doc => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          type: 'transaction',
          title: `New Order: ${data.itemName}`,
          message: getStatusMessage(data.status, 'seller'),
          timestamp: data.updatedAt,
          status: data.status,
          role: 'seller'
        });
      });
      
      return notifications.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting transaction notifications:', error);
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

function getStatusMessage(status, role) {
  const messages = {
    buyer: {
      pending: 'Your order is pending payment',
      awaiting_seller: 'Waiting for seller to accept your order',
      confirmed: 'Order confirmed! Arrange pickup with seller',
      completed: 'Transaction completed',
      cancelled: 'Transaction cancelled'
    },
    seller: {
      awaiting_seller: 'New order waiting for your acceptance',
      confirmed: 'Order confirmed. Coordinate with buyer for pickup',
      completed: 'Transaction completed',
      cancelled: 'Transaction cancelled'
    }
  };
  
  return messages[role][status] || `Status: ${status}`;
}