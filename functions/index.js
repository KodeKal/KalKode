// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure Gmail credentials
// Set these in Firebase Functions config:
// firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword // Use App Password, not regular password
  }
});

// Cloud Function triggered by Firestore document creation
exports.sendEmailNotification = functions.firestore
  .document('emailQueue/{docId}')
  .onCreate(async (snap, context) => {
    const emailData = snap.data();
    
    try {
      // Validate required fields
      if (!emailData.to || !emailData.subject || !emailData.html) {
        throw new Error('Missing required email fields');
      }

      // Prepare email options
      const mailOptions = {
        from: `KalKode Marketplace <${gmailEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || '', // Plain text fallback
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);

      // Update the document with success status
      await snap.ref.update({
        status: 'sent',
        messageId: info.messageId,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        error: null
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Update the document with error status
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        failedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: false, error: error.message };
    }
  });

// Cloud Function to send email on transaction status changes
exports.onTransactionUpdate = functions.firestore
  .document('transactions/{transactionId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if status changed
    if (before.status === after.status) {
      return null;
    }

    try {
      // Get user details
      const buyerDoc = await admin.firestore().doc(`users/${after.buyerId}`).get();
      const sellerDoc = await admin.firestore().doc(`users/${after.sellerId}`).get();
      
      const buyerData = buyerDoc.data();
      const sellerData = sellerDoc.data();

      let emailData = null;

      // Determine email to send based on status change
      switch (after.status) {
        case 'pending_seller_acceptance':
          // Notify seller of new order
          if (sellerData?.emailNotificationsEnabled !== false) {
            emailData = {
              to: sellerData.email,
              subject: `New Order: ${after.requestedQuantity}x ${after.itemName}`,
              template: 'orderRequest',
              data: {
                sellerName: sellerData.displayName || 'Seller',
                buyerName: after.buyerName,
                itemName: after.itemName,
                quantity: after.requestedQuantity,
                unitPrice: after.unitPrice,
                totalPrice: after.totalPrice,
                transactionId: context.params.transactionId
              }
            };
          }
          break;

        case 'seller_accepted':
          // Notify buyer of acceptance
          if (buyerData?.emailNotificationsEnabled !== false) {
            emailData = {
              to: buyerData.email,
              subject: `Order Accepted: ${after.itemName}`,
              template: 'orderAccepted',
              data: {
                buyerName: buyerData.displayName || 'Buyer',
                itemName: after.itemName,
                quantity: after.approvedQuantity || after.requestedQuantity,
                totalPrice: after.finalTotalPrice || after.totalPrice,
                transactionId: context.params.transactionId
              }
            };
          }
          break;

        case 'paid':
          // Notify seller of payment
          if (sellerData?.emailNotificationsEnabled !== false) {
            emailData = {
              to: sellerData.email,
              subject: `Payment Received: $${after.finalTotalPrice || after.totalPrice}`,
              template: 'paymentReceived',
              data: {
                sellerName: sellerData.displayName || 'Seller',
                itemName: after.itemName,
                quantity: after.approvedQuantity || after.requestedQuantity,
                amount: after.finalTotalPrice || after.totalPrice,
                transactionId: context.params.transactionId
              }
            };
          }
          break;

        case 'completed':
          // Notify both parties
          const completionEmails = [];
          
          if (sellerData?.emailNotificationsEnabled !== false) {
            completionEmails.push({
              to: sellerData.email,
              subject: `Transaction Complete: $${after.finalTotalPrice || after.totalPrice} Released`,
              template: 'transactionComplete',
              data: {
                userName: sellerData.displayName || 'Seller',
                itemName: after.itemName,
                amount: after.finalTotalPrice || after.totalPrice,
                role: 'seller'
              }
            });
          }
          
          if (buyerData?.emailNotificationsEnabled !== false) {
            completionEmails.push({
              to: buyerData.email,
              subject: `Purchase Complete: ${after.itemName}`,
              template: 'transactionComplete',
              data: {
                userName: buyerData.displayName || 'Buyer',
                itemName: after.itemName,
                amount: after.finalTotalPrice || after.totalPrice,
                role: 'buyer'
              }
            });
          }
          
          // Queue multiple emails
          for (const email of completionEmails) {
            await queueEmail(email);
          }
          return;
      }

      // Queue the email if emailData was set
      if (emailData) {
        await queueEmail(emailData);
      }

    } catch (error) {
      console.error('Error processing transaction update:', error);
    }

    return null;
  });

// Cloud Function to send email on new chat messages
exports.onNewChatMessage = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const chatId = context.params.chatId;
    
    // Don't send emails for system messages
    if (message.sender === 'system' || message.type === 'system') {
      return null;
    }

    try {
      // Get chat document
      const chatDoc = await admin.firestore().doc(`chats/${chatId}`).get();
      const chatData = chatDoc.data();
      
      // Determine recipient
      const recipientId = message.sender === chatData.buyerId ? chatData.sellerId : chatData.buyerId;
      
      // Get recipient data
      const recipientDoc = await admin.firestore().doc(`users/${recipientId}`).get();
      const recipientData = recipientDoc.data();
      
      // Check if email notifications are enabled
      if (recipientData?.emailNotificationsEnabled === false) {
        return null;
      }
      
      // Check notification preferences for messages
      if (recipientData?.notificationPreferences?.newMessages === false) {
        return null;
      }

      // Queue email
      await queueEmail({
        to: recipientData.email,
        subject: `New message from ${message.senderName}`,
        template: 'newMessage',
        data: {
          recipientName: recipientData.displayName || 'User',
          senderName: message.senderName,
          messagePreview: message.text.substring(0, 100) + (message.text.length > 100 ? '...' : ''),
          itemName: chatData.itemName,
          chatId: chatId
        }
      });

    } catch (error) {
      console.error('Error sending message notification:', error);
    }

    return null;
  });

// Helper function to queue emails
async function queueEmail(emailData) {
  try {
    // Generate HTML from template
    const html = generateEmailHTML(emailData.template, emailData.data);
    const text = generateEmailText(emailData.template, emailData.data);
    
    // Add to email queue
    await admin.firestore().collection('emailQueue').add({
      to: emailData.to,
      subject: emailData.subject,
      html: html,
      text: text,
      template: emailData.template,
      data: emailData.data,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Email queued successfully:', emailData.subject);
  } catch (error) {
    console.error('Error queuing email:', error);
  }
}

// Generate HTML email template
function generateEmailHTML(template, data) {
  const baseURL = 'https://your-app-url.com'; // Replace with your actual URL
  
  const header = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(45deg, #800000, #4A0404); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f4f4f4; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #800000; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>KalKode Marketplace</h1>
        </div>
        <div class="content">
  `;
  
  const footer = `
        </div>
        <div class="footer">
          <p>This email was sent by KalKode Marketplace. To manage your notification preferences, visit your profile settings.</p>
          <p>&copy; 2024 KalKode. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  let body = '';

  switch (template) {
    case 'orderRequest':
      body = `
        <h2>New Order Request!</h2>
        <p>Hi ${data.sellerName},</p>
        <p>${data.buyerName} wants to purchase:</p>
        <div style="background: white; padding: 15px; border-left: 4px solid #800000; margin: 20px 0;">
          <strong>${data.quantity}x ${data.itemName}</strong><br>
          Unit Price: $${data.unitPrice.toFixed(2)}<br>
          <strong>Total: $${data.totalPrice.toFixed(2)}</strong>
        </div>
        <a href="${baseURL}/messages?chat=${data.transactionId}" class="button">Review Order</a>
      `;
      break;

    case 'orderAccepted':
      body = `
        <h2>Order Accepted!</h2>
        <p>Hi ${data.buyerName},</p>
        <p>Great news! Your order has been accepted:</p>
        <div style="background: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
          <strong>${data.quantity}x ${data.itemName}</strong><br>
          <strong>Total: $${data.totalPrice.toFixed(2)}</strong>
        </div>
        <p>Please proceed with payment to complete your order.</p>
        <a href="${baseURL}/messages?chat=${data.transactionId}" class="button">Complete Payment</a>
      `;
      break;

    case 'paymentReceived':
      body = `
        <h2>Payment Received!</h2>
        <p>Hi ${data.sellerName},</p>
        <p>Payment has been received for:</p>
        <div style="background: white; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
          <strong>${data.quantity}x ${data.itemName}</strong><br>
          <strong>Amount: $${data.amount.toFixed(2)}</strong>
        </div>
        <p>Please coordinate with the buyer for pickup/delivery.</p>
        <a href="${baseURL}/messages?chat=${data.transactionId}" class="button">View Transaction</a>
      `;
      break;

    case 'transactionComplete':
      body = `
        <h2>Transaction Complete!</h2>
        <p>Hi ${data.userName},</p>
        <p>Your transaction for <strong>${data.itemName}</strong> has been completed successfully.</p>
        ${data.role === 'seller' ? 
          `<p>The payment of <strong>$${data.amount.toFixed(2)}</strong> has been released to you.</p>` :
          `<p>Thank you for your purchase!</p>`
        }
        <a href="${baseURL}/messages" class="button">View Messages</a>
      `;
      break;

    case 'newMessage':
      body = `
        <h2>New Message</h2>
        <p>Hi ${data.recipientName},</p>
        <p>${data.senderName} sent you a message about <strong>${data.itemName}</strong>:</p>
        <div style="background: white; padding: 15px; border-left: 4px solid #800000; margin: 20px 0;">
          <em>"${data.messagePreview}"</em>
        </div>
        <a href="${baseURL}/messages?chat=${data.chatId}" class="button">View Message</a>
      `;
      break;

    default:
      body = `<p>You have a new notification from KalKode Marketplace.</p>`;
  }

  return header + body + footer;
}

// Generate plain text email
function generateEmailText(template, data) {
  switch (template) {
    case 'orderRequest':
      return `New Order Request!\n\n${data.buyerName} wants to purchase ${data.quantity}x ${data.itemName} for $${data.totalPrice.toFixed(2)}`;
    case 'orderAccepted':
      return `Order Accepted!\n\nYour order for ${data.quantity}x ${data.itemName} ($${data.totalPrice.toFixed(2)}) has been accepted.`;
    case 'paymentReceived':
      return `Payment Received!\n\nPayment of $${data.amount.toFixed(2)} received for ${data.itemName}.`;
    case 'transactionComplete':
      return `Transaction Complete!\n\nYour transaction for ${data.itemName} has been completed.`;
    case 'newMessage':
      return `New Message from ${data.senderName}\n\n${data.messagePreview}`;
    default:
      return 'You have a new notification from KalKode Marketplace.';
  }
}