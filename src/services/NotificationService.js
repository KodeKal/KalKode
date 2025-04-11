// src/services/NotificationService.js
import { db, auth } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment 
} from 'firebase/firestore';


// Helper functions for transaction messages
function getTransactionBuyerMessage(status) {
  switch (status) {
    case 'pending':
      return 'Your payment is pending. Complete payment to proceed.';
    case 'awaiting_seller':
      return 'Waiting for the seller to accept your order.';
    case 'confirmed':
      return 'Order confirmed! Coordinate with the seller for pickup.';
    default:
      return `Order status: ${status}`;
  }
}

function getTransactionSellerMessage(status) {
  switch (status) {
    case 'awaiting_seller':
      return 'New order waiting for your acceptance.';
    case 'confirmed':
      return 'Order confirmed. Coordinate with buyer for pickup.';
    default:
      return `Order status: ${status}`;
  }
}
// Changed to a regular class rather than static methods
class NotificationService {
  static async getNotifications(userId) {
    try {
      const notifications = [];
      
      // Get transaction notifications
      const transactionNotifications = await this.getTransactionNotifications(userId);
      notifications.push(...transactionNotifications);
      
      // Get message notifications
      const messageNotifications = await this.getMessageNotifications(userId);
      notifications.push(...messageNotifications);
      
      // Sort by timestamp (most recent first)
      notifications.sort((a, b) => b.timestamp - a.timestamp);
      
      return notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }
  
  static async getTransactionNotifications(userId) {
    try {
      // Get transactions where the user is either buyer or seller
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
          message: this.getTransactionStatusMessage(data.status, 'buyer'),
          timestamp: data.updatedAt?.toDate() || new Date(),
          status: data.status,
          role: 'buyer',
          itemImage: data.itemImage,
          unread: true // Transaction notifications are always considered unread
        });
      });
      
      sellerSnap.forEach(doc => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          type: 'transaction',
          title: `New Order: ${data.itemName}`,
          message: this.getTransactionStatusMessage(data.status, 'seller'),
          timestamp: data.updatedAt?.toDate() || new Date(),
          status: data.status,
          role: 'seller',
          itemImage: data.itemImage,
          unread: true // Transaction notifications are always considered unread
        });
      });
      
      return notifications;
    } catch (error) {
      console.error('Error getting transaction notifications:', error);
      throw error;
    }
  }
  
  static async getMessageNotifications(userId) {
    try {
      // Get chats with unread messages
      const chatsRef = collection(db, 'chats');
      const chatsQuery = query(
        chatsRef,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc'),
        limit(20)
      );
      
      const chatSnap = await getDocs(chatsQuery);
      const notifications = [];
      
      chatSnap.forEach(doc => {
        const chat = doc.data();
        const unreadCount = chat.unreadCount?.[userId] || 0;
        
        if (unreadCount > 0) {
          notifications.push({
            id: doc.id,
            type: 'message',
            title: `New message${unreadCount > 1 ? 's' : ''}`,
            message: `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''} in "${chat.itemName || 'Chat'}"`,
            timestamp: chat.lastMessageTime?.toDate() || new Date(),
            unread: true,
            count: unreadCount,
            transactionId: chat.transactionId,
            itemName: chat.itemName,
            itemImage: chat.itemImage
          });
        }
      });
      
      return notifications;
    } catch (error) {
      console.error('Error getting message notifications:', error);
      throw error;
    }
  }
  
  static async markNotificationAsRead(notification) {
    try {
      if (!auth.currentUser) return;
      
      if (notification.type === 'message') {
        // Mark chat as read
        await updateDoc(doc(db, 'chats', notification.id), {
          [`unreadCount.${auth.currentUser.uid}`]: 0
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  static async getUnreadCounts(userId) {
    try {
      const chatsRef = collection(db, 'chats');
      const chatsQuery = query(
        chatsRef,
        where('participants', 'array-contains', userId)
      );
      
      const chatSnap = await getDocs(chatsQuery);
      let messageCount = 0;
      
      chatSnap.forEach(doc => {
        const chat = doc.data();
        messageCount += chat.unreadCount?.[userId] || 0;
      });
      
      // Also get transaction notifications count
      const buyerQuery = query(
        collection(db, 'transactions'),
        where('buyerId', '==', userId),
        where('status', 'in', ['pending', 'awaiting_seller', 'confirmed'])
      );
      
      const sellerQuery = query(
        collection(db, 'transactions'),
        where('sellerId', '==', userId),
        where('status', 'in', ['awaiting_seller', 'confirmed'])
      );
      
      const [buyerSnap, sellerSnap] = await Promise.all([
        getDocs(buyerQuery),
        getDocs(sellerQuery)
      ]);
      
      const transactionCount = buyerSnap.size + sellerSnap.size;
      
      return {
        messages: messageCount,
        transactions: transactionCount,
        total: messageCount + transactionCount
      };
    } catch (error) {
      console.error('Error getting unread counts:', error);
      return {
        messages: 0,
        transactions: 0,
        total: 0
      };
    }
  }

  // src/services/NotificationService.js
// Add this new method to NotificationService:

static setupNotificationsListener(userId, callback) {
  if (!userId) return () => {};
  
  // Listen for chats
  const chatsRef = collection(db, 'chats');
  const chatsQuery = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );
  
  // Listen for transactions
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
  
  // Create merged listener
  const unsubChats = onSnapshot(chatsQuery, async (chatSnapshot) => {
    const transactionSnapshots = await Promise.all([
      getDocs(buyerQuery),
      getDocs(sellerQuery)
    ]);
    
    // Process all notifications
    const notifications = [];
    
    // Process chat notifications
    chatSnapshot.forEach(doc => {
      const chat = doc.data();
      const unreadCount = chat.unreadCount?.[userId] || 0;
      
      if (unreadCount > 0) {
        notifications.push({
          id: doc.id,
          type: 'message',
          title: `New message${unreadCount > 1 ? 's' : ''}`,
          message: `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''} related to "${chat.itemName || 'a conversation'}"`,
          timestamp: chat.lastMessageTime || new Date(),
          unread: true,
          count: unreadCount,
          itemName: chat.itemName,
          itemImage: chat.itemImage
        });
      }
    });
    
    // Process transaction notifications
    transactionSnapshots.forEach(snapshot => {
      snapshot.forEach(doc => {
        const transaction = doc.data();
        const isBuyer = transaction.buyerId === userId;
        
        notifications.push({
          id: doc.id,
          type: 'transaction',
          title: isBuyer ? 
            `Your order for ${transaction.itemName}` : 
            `New order: ${transaction.itemName}`,
          message: isBuyer ?
            getTransactionBuyerMessage(transaction.status) :
            getTransactionSellerMessage(transaction.status),
          timestamp: transaction.updatedAt || transaction.createdAt || new Date(),
          unread: true,
          status: transaction.status,
          role: isBuyer ? 'buyer' : 'seller',
          itemName: transaction.itemName,
          itemImage: transaction.itemImage
        });
      });
    });
    
    // Sort by timestamp
    notifications.sort((a, b) => 
      (b.timestamp?.toDate?.() || b.timestamp) - 
      (a.timestamp?.toDate?.() || a.timestamp)
    );
    
    callback(notifications);
  });
  
  return unsubChats;
}

  
  static getTransactionStatusMessage(status, role) {
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
    
    return messages[role]?.[status] || `Status: ${status}`;
  }
  
  // Setup real-time listener for unread notifications count
  static setupUnreadCountsListener(userId, callback) {
    if (!userId) return () => {};
    
    // Listen for chat unread counts
    const chatsRef = collection(db, 'chats');
    const chatsQuery = query(
      chatsRef,
      where('participants', 'array-contains', userId)
    );
    
    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      let messageCount = 0;
      
      snapshot.forEach(doc => {
        const chat = doc.data();
        messageCount += chat.unreadCount?.[userId] || 0;
      });
      
      // Also get transaction notifications count
      const counts = await this.getUnreadCounts(userId);
      
      callback(counts);
    });
    
    return unsubscribe;
  }

  
}

// Export properly - use default export
export default NotificationService;