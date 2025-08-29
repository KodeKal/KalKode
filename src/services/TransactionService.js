// src/services/TransactionService.js - Enhanced with quantity-based flow

import { db, auth } from '../firebase/config';
import { 
 collection, 
 addDoc, 
 updateDoc, 
 doc, 
 getDoc, 
 serverTimestamp,
 setDoc,
 query,
 where,
 orderBy,
 getDocs
} from 'firebase/firestore';

export const TransactionService = {
 // Step 1: Buyer initiates quantity-based transaction
 initiateQuantityTransaction: async (itemId, sellerId, unitPrice, requestedQuantity, meetupType) => {
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

     // Check available quantity
     const availableQuantity = parseInt(item.quantity) || 0;
     if (availableQuantity < 1) {
       throw new Error('This item is out of stock');
     }

     if (requestedQuantity > availableQuantity) {
       throw new Error(`Only ${availableQuantity} items available`);
     }

     const totalPrice = parseFloat(unitPrice) * parseInt(requestedQuantity);

     // Create PENDING transaction (waiting for seller acceptance)
     const transaction = {
       itemId,
       itemName: item.name,
       itemImage: item.images?.[0] || null,
       itemAddress: item.address || null,
       itemCoordinates: item.coordinates || null,
       unitPrice: parseFloat(unitPrice),
       requestedQuantity: parseInt(requestedQuantity),
       approvedQuantity: null, // Set by seller
       totalPrice,
       sellerId,
       sellerName: shopData.name || '',
       buyerId: buyer.uid,
       buyerName: buyer.displayName || buyer.email,
       status: 'pending_seller_acceptance',
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
       lastMessage: `Purchase request for ${requestedQuantity}x ${item.name}`,
       lastMessageTime: serverTimestamp(),
       unreadCount: {
         [buyer.uid]: 0,
         [sellerId]: 1
       },
       // Add purchase request data to chat
       pendingPurchase: {
         itemId,
         itemName: item.name,
         unitPrice: parseFloat(unitPrice),
         requestedQuantity: parseInt(requestedQuantity),
         totalPrice,
         status: 'pending_seller_acceptance',
         buyerName: buyer.displayName || buyer.email,
         availableQuantity
       }
     };

     await setDoc(doc(db, 'chats', transactionId), chatDoc);

     // Add system message about purchase request
     await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: `🛒 Purchase request sent:\n${requestedQuantity}x ${item.name} at $${unitPrice.toFixed(2)} each (Total: $${totalPrice.toFixed(2)}).\nStatus: Waiting for seller acceptance.`,
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'quantity_purchase_request',
        purchaseData: {
          itemName: item.name,
          unitPrice: parseFloat(unitPrice),
          requestedQuantity: parseInt(requestedQuantity),
          totalPrice,
          meetupType,
          availableQuantity
        }
      });

     return {
       transactionId,
       status: 'pending_seller_acceptance'
     };
   } catch (error) {
     console.error('Error initiating quantity transaction:', error);
     throw error;
   }
 },

 // Step 2: Seller accepts/rejects/adjusts the quantity request
 respondToQuantityRequest: async (transactionId, decision, approvedQuantity = null) => {
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

     // Get current item availability
     const shopRef = doc(db, 'shops', transaction.sellerId);
     const shopSnap = await getDoc(shopRef);
     const shopData = shopSnap.data();
     const item = shopData.items.find(item => item.id === transaction.itemId);
     const currentAvailableQuantity = parseInt(item.quantity) || 0;

     if (decision === 'accept') {
       const finalQuantity = approvedQuantity || transaction.requestedQuantity;
       
       if (finalQuantity > currentAvailableQuantity) {
         throw new Error(`Only ${currentAvailableQuantity} items currently available`);
       }

       const finalTotalPrice = transaction.unitPrice * finalQuantity;
       
       // Update transaction status to accepted
       await updateDoc(transactionRef, {
         status: 'seller_accepted',
         approvedQuantity: finalQuantity,
         finalTotalPrice: finalTotalPrice,
         sellerAcceptedAt: serverTimestamp(),
         updatedAt: serverTimestamp()
       });

       // Update chat with acceptance
       await updateDoc(doc(db, 'chats', transactionId), {
         lastMessage: `Seller approved ${finalQuantity}x ${transaction.itemName}`,
         lastMessageTime: serverTimestamp(),
         pendingPurchase: {
           ...transaction,
           status: 'seller_accepted',
           approvedQuantity: finalQuantity,
           finalTotalPrice: finalTotalPrice
         },
         [`unreadCount.${transaction.buyerId}`]: 1
       });

       // Add system message
       const adjustmentText = finalQuantity !== transaction.requestedQuantity ? 
         ` (adjusted from ${transaction.requestedQuantity} to ${finalQuantity})` : '';
       
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: `✅ Seller approved:\n${finalQuantity}x ${transaction.itemName}${adjustmentText}.\nTotal: $${finalTotalPrice.toFixed(2)}.\nStatus: Buyer may now pay.`,
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'seller_accepted',
        purchaseData: {
          approvedQuantity: finalQuantity,
          finalTotalPrice: finalTotalPrice,
          sellerName: transaction.sellerName,
          wasAdjusted: finalQuantity !== transaction.requestedQuantity
        }
      });

       return { success: true, approvedQuantity: finalQuantity, finalTotalPrice };
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
          text: '❌ Purchase request declined:\nItem is currently not available.\nStatus: Transaction cancelled.',
          sender: 'system',
          senderName: 'System',
          timestamp: serverTimestamp(),
          type: 'seller_rejected'
        });

       return { success: true, rejected: true };
     }
   } catch (error) {
     console.error('Error responding to quantity request:', error);
     throw error;
   }
 },

 withdrawPayment: async (transactionId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Authentication required');

    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionSnap = await getDoc(transactionRef);
    
    if (!transactionSnap.exists()) {
      throw new Error('Transaction not found');
    }
    
    const transaction = transactionSnap.data();
    
    // Verify this is the buyer
    if (transaction.buyerId !== currentUser.uid) {
      throw new Error('Only the buyer can withdraw payment');
    }

    // Can only withdraw if payment is escrowed but not yet picked up
    if (transaction.status !== 'paid') {
      throw new Error('Payment can only be withdrawn when transaction is in paid status');
    }

    // Update transaction status to withdrawn
    await updateDoc(transactionRef, {
      status: 'withdrawn',
      paymentStatus: 'refunded',
      withdrawnAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Restore item quantity back to shop
    const shopRef = doc(db, 'shops', transaction.sellerId);
    const shopSnap = await getDoc(shopRef);
    if (shopSnap.exists()) {
      const shopData = shopSnap.data();
      const itemIndex = shopData.items.findIndex(item => item.id === transaction.itemId);
      
      if (itemIndex !== -1) {
        const updatedItems = [...shopData.items];
        const restoredQuantity = transaction.approvedQuantity || transaction.requestedQuantity || 1;
        const currentQuantity = parseInt(updatedItems[itemIndex].quantity) || 0;
        
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: currentQuantity + restoredQuantity
        };

        await updateDoc(shopRef, { items: updatedItems });
      }
    }

    // Update chat
    await updateDoc(doc(db, 'chats', transactionId), {
      lastMessage: 'Payment withdrawn by buyer',
      lastMessageTime: serverTimestamp(),
      pendingPurchase: {
        ...transaction,
        status: 'withdrawn'
      },
      [`unreadCount.${transaction.sellerId}`]: 1
    });

    // Add system message about withdrawal
    const quantity = transaction.approvedQuantity || transaction.requestedQuantity || 1;
    const amount = transaction.finalTotalPrice || transaction.totalPrice || 0;
    
    await addDoc(collection(db, 'chats', transactionId, 'messages'), {
      text: `🔄 Payment withdrawn by buyer:\n\n📦 Transaction cancelled: ${quantity}x ${transaction.itemName}\n💰 Amount refunded: $${amount.toFixed(2)}\n📈 Items returned to inventory\n\nStatus: Transaction cancelled.`,
      sender: 'system',
      senderName: 'System',
      timestamp: serverTimestamp(),
      type: 'payment_withdrawn',
      purchaseData: {
        withdrawnQuantity: quantity,
        refundAmount: amount
      }
    });
    
    console.log(`Refunded ${amount} to buyer ${transaction.buyerId} and restored ${quantity}x ${transaction.itemName} to inventory`);
    
    return {
      success: true,
      message: 'Payment withdrawn successfully',
      refundAmount: amount,
      restoredQuantity: quantity
    };
  } catch (error) {
    console.error('Error withdrawing payment:', error);
    throw error;
  }
},

 // Step 3: Buyer processes payment after seller acceptance
 processQuantityPayment: async (transactionId, paymentMethodData) => {
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
     const finalAmount = transaction.finalTotalPrice || transaction.totalPrice;

     // Mock payment processing
     console.log('Processing payment for quantity transaction:', {
       quantity: transaction.approvedQuantity,
       unitPrice: transaction.unitPrice,
       total: finalAmount
     });
     
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
        text: `💳 Payment processed successfully!\n\n📦 Your pickup details:\n• Quantity: ${transaction.approvedQuantity}x ${transaction.itemName}\n• Total paid: $${finalAmount.toFixed(2)}\n• Pickup code: ${transactionCode}\n\nStatus: Show this code to the seller during pickup.`,
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'payment_success',
        visibleTo: [transaction.buyerId],
        purchaseData: {
          transactionCode,
          approvedQuantity: transaction.approvedQuantity,
          finalTotalPrice: finalAmount
        }
      });

     // Add separate message for seller (without code)
     await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: `💰 Buyer payment received:\n${transaction.approvedQuantity}x ${transaction.itemName} ($${finalAmount.toFixed(2)}).\nStatus: Funds held in escrow until pickup confirmed.\n\nPlease coordinate with buyer for pickup details.`,
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'payment_notification',
        visibleTo: [transaction.sellerId],
        purchaseData: {
          approvedQuantity: transaction.approvedQuantity,
          finalTotalPrice: finalAmount
        }
      });

     // Reserve items (decrease quantity in shop)
     const shopRef = doc(db, 'shops', transaction.sellerId);
     const shopSnap = await getDoc(shopRef);
     if (shopSnap.exists()) {
       const shopData = shopSnap.data();
       const itemIndex = shopData.items.findIndex(item => item.id === transaction.itemId);
       
       if (itemIndex !== -1) {
         const updatedItems = [...shopData.items];
         const currentQuantity = parseInt(updatedItems[itemIndex].quantity) || 0;
         updatedItems[itemIndex] = {
           ...updatedItems[itemIndex],
           quantity: Math.max(0, currentQuantity - transaction.approvedQuantity)
         };

         await updateDoc(shopRef, { items: updatedItems });
       }
     }

     return {
       success: true,
       transactionCode,
       approvedQuantity: transaction.approvedQuantity,
       finalTotalPrice: finalAmount
     };
   } catch (error) {
     console.error('Error processing quantity payment:', error);
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
     
     const finalAmount = transaction.finalTotalPrice || transaction.totalPrice;
     const quantity = transaction.approvedQuantity || transaction.requestedQuantity;
     
     // Add completion message
     await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: `🎉 Transaction completed successfully!\n\n📦 Items delivered: ${quantity}x ${transaction.itemName}\n💰 Amount released: $${finalAmount.toFixed(2)}\nStatus: Transaction complete.\n\nThank you for using our marketplace!`,
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'transaction_completed'
      });
     
     console.log(`Released ${finalAmount} from escrow to seller ${transaction.sellerId} for ${quantity}x ${transaction.itemName}`);
     
     return {
       success: true,
       message: 'Transaction completed successfully',
       quantity: quantity,
       totalAmount: finalAmount
     };
   } catch (error) {
     console.error('Error completing transaction:', error);
     throw error;
   }
 },

 // Legacy method for backward compatibility
 initiateTransaction: async (itemId, sellerId, price, meetupType) => {
   // Default to quantity of 1 for legacy support
   return await TransactionService.initiateQuantityTransaction(
     itemId, 
     sellerId, 
     price, 
     1, 
     meetupType
   );
 },

 // Legacy method for backward compatibility  
 respondToPurchaseRequest: async (transactionId, decision, finalPrice = null) => {
   const transactionRef = doc(db, 'transactions', transactionId);
   const transactionSnap = await getDoc(transactionRef);
   const transaction = transactionSnap.data();
   
   if (finalPrice && transaction.unitPrice) {
     // Convert final price back to quantity if needed
     const approvedQuantity = Math.round(finalPrice / transaction.unitPrice);
     return await TransactionService.respondToQuantityRequest(transactionId, decision, approvedQuantity);
   }
   
   return await TransactionService.respondToQuantityRequest(transactionId, decision);
 },

 // Legacy method for backward compatibility
 processPayment: async (transactionId, paymentMethodData) => {
   return await TransactionService.processQuantityPayment(transactionId, paymentMethodData);
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
 },

 // Additional helper methods for quantity management
 
 // Check item availability before transaction
 checkItemAvailability: async (itemId, sellerId, requestedQuantity) => {
   try {
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

     const availableQuantity = parseInt(item.quantity) || 0;
     
     return {
       available: availableQuantity >= requestedQuantity,
       availableQuantity,
       requestedQuantity,
       item
     };
   } catch (error) {
     console.error('Error checking item availability:', error);
     throw error;
   }
 },

 // Get all transactions for a user (buyer or seller)
 getUserTransactions: async (userId, role = 'both') => {
   try {
     const transactions = [];
     
     if (role === 'buyer' || role === 'both') {
       const buyerQuery = query(
         collection(db, 'transactions'),
         where('buyerId', '==', userId),
         orderBy('createdAt', 'desc')
       );
       const buyerSnap = await getDocs(buyerQuery);
       buyerSnap.forEach(doc => {
         transactions.push({
           id: doc.id,
           ...doc.data(),
           userRole: 'buyer'
         });
       });
     }

     if (role === 'seller' || role === 'both') {
       const sellerQuery = query(
         collection(db, 'transactions'),
         where('sellerId', '==', userId),
         orderBy('createdAt', 'desc')
       );
       const sellerSnap = await getDocs(sellerQuery);
       sellerSnap.forEach(doc => {
         transactions.push({
           id: doc.id,
           ...doc.data(),
           userRole: 'seller'
         });
       });
     }

     // Sort by creation date, most recent first
     transactions.sort((a, b) => {
       const aTime = a.createdAt?.toDate() || new Date(0);
       const bTime = b.createdAt?.toDate() || new Date(0);
       return bTime - aTime;
     });

     return transactions;
   } catch (error) {
     console.error('Error getting user transactions:', error);
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