// src/services/EmailNotificationService.js
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

class EmailNotificationService {
  // Queue an email to be sent by Firebase Functions
  async queueEmail(to, subject, template, data) {
    try {
      const emailRef = await addDoc(collection(db, 'emailQueue'), {
        to,
        subject,
        template,
        data,
        status: 'pending',
        createdAt: serverTimestamp(),
        retryCount: 0
      });
      
      console.log('Email queued:', emailRef.id);
      return { success: true, emailId: emailRef.id };
    } catch (error) {
      console.error('Error queuing email:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user email preferences
  async getUserEmailPreferences(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          emailNotificationsEnabled: data.emailNotificationsEnabled ?? true,
          email: data.email,
          notificationPreferences: data.notificationPreferences || {
            newMessages: true,
            orderRequests: true,
            orderUpdates: true,
            paymentConfirmations: true,
            transactionComplete: true,
            promotions: false,
            weeklyDigest: false
          }
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching email preferences:', error);
      return null;
    }
  }

  // Update user email preferences
  async updateEmailPreferences(userId, preferences) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        emailNotificationsEnabled: preferences.emailNotificationsEnabled,
        notificationPreferences: preferences.notificationPreferences,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating email preferences:', error);
      return { success: false, error: error.message };
    }
  }

  // Send test email
  async sendTestEmail(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      
      const result = await this.queueEmail(
        userData.email,
        'Test Email from KalKode',
        'test',
        {
          userName: userData.displayName || 'User',
          timestamp: new Date().toISOString()
        }
      );
      
      return result;
    } catch (error) {
      console.error('Error sending test email:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if notification type should trigger email
  shouldSendEmail(preferences, notificationType) {
    if (!preferences || !preferences.emailNotificationsEnabled) {
      return false;
    }

    const typeMapping = {
      'new_message': 'newMessages',
      'order_request': 'orderRequests',
      'order_accepted': 'orderUpdates',
      'order_rejected': 'orderUpdates',
      'payment_received': 'paymentConfirmations',
      'transaction_complete': 'transactionComplete',
      'item_sold': 'orderUpdates'
    };

    const preferenceKey = typeMapping[notificationType];
    return preferences.notificationPreferences[preferenceKey] ?? true;
  }

  // Queue notification email if user preferences allow
  async sendNotificationEmail(userId, notificationType, emailData) {
    try {
      const preferences = await this.getUserEmailPreferences(userId);
      
      if (!this.shouldSendEmail(preferences, notificationType)) {
        console.log(`Email notifications disabled for ${notificationType}`);
        return { success: false, reason: 'Notifications disabled' };
      }

      return await this.queueEmail(
        preferences.email,
        emailData.subject,
        emailData.template,
        emailData.data
      );
    } catch (error) {
      console.error('Error sending notification email:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailNotificationService();