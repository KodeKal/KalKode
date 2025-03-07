// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();
const db = admin.firestore();

// Create a payment intent for a transaction
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  try {
    const { transactionId, amount, sellerId, buyerId, itemId, itemName } = data;
    
    // Get seller's Stripe account ID
    const sellerDoc = await db.collection('users').doc(sellerId).get();
    const sellerData = sellerDoc.data();
    
    if (!sellerData || !sellerData.stripeAccountId) {
      throw new functions.https.HttpsError('failed-precondition', 'Seller is not set up to accept payments');
    }
    
    // Create a payment intent with application fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      capture_method: 'manual', // Important: This creates an authorized payment that will be captured later
      application_fee_amount: Math.round(amount * 5), // 5% platform fee
      transfer_data: {
        destination: sellerData.stripeAccountId,
      },
      metadata: {
        transactionId,
        buyerId,
        sellerId,
        itemId,
        itemName
      }
    });
    
    // Update transaction with payment intent ID
    await db.collection('transactions').doc(transactionId).update({
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: 'awaiting_payment',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      clientSecret: paymentIntent.client_secret
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Capture a payment (release from escrow to seller)
exports.capturePayment = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  try {
    const { transactionId, verificationCode } = data;
    
    // Get transaction details
    const transactionDoc = await db.collection('transactions').doc(transactionId).get();
    const transaction = transactionDoc.data();
    
    // Verify transaction code
    if (transaction.transactionCode !== verificationCode) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid verification code');
    }
    
    // Verify payment intent exists
    if (!transaction.stripePaymentIntentId) {
      throw new functions.https.HttpsError('failed-precondition', 'No payment found for this transaction');
    }
    
    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(transaction.stripePaymentIntentId);
    
    // Update transaction status
    await db.collection('transactions').doc(transactionId).update({
      status: 'completed',
      paymentStatus: 'paid',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Add system message to chat
    await db.collection('chats').doc(transactionId).collection('messages').add({
      text: 'Payment has been released to the seller. Transaction completed successfully!',
      sender: 'system',
      senderName: 'System',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'system'
    });
    
    return { success: true, paymentStatus: paymentIntent.status };
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Cancel a payment and refund the buyer
exports.cancelPayment = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  try {
    const { transactionId, reason } = data;
    
    // Get transaction details
    const transactionDoc = await db.collection('transactions').doc(transactionId).get();
    const transaction = transactionDoc.data();
    
    // Verify payment intent exists
    if (!transaction.stripePaymentIntentId) {
      throw new functions.https.HttpsError('failed-precondition', 'No payment found for this transaction');
    }
    
    // Cancel the payment intent
    const paymentIntent = await stripe.paymentIntents.cancel(transaction.stripePaymentIntentId, {
      cancellation_reason: reason
    });
    
    // Update transaction status
    await db.collection('transactions').doc(transactionId).update({
      status: 'cancelled',
      paymentStatus: 'cancelled',
      cancellationReason: reason,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Add system message to chat
    await db.collection('chats').doc(transactionId).collection('messages').add({
      text: `Transaction cancelled: ${reason}`,
      sender: 'system',
      senderName: 'System',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'system'
    });
    
    return { success: true, paymentStatus: paymentIntent.status };
  } catch (error) {
    console.error('Error cancelling payment:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Create a Stripe Connect account for a seller
exports.createSellerAccount = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  try {
    const userId = context.auth.uid;
    const { email, name } = data;
    
    // Check if user already has a Stripe account
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() || {};
    
    if (userData.stripeAccountId) {
      return { accountId: userData.stripeAccountId, exists: true };
    }
    
    // Create a new Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        name: name || 'KalKode Seller'
      }
    });
    
    // Save account ID to user document
    await db.collection('users').doc(userId).set({
      stripeAccountId: account.id,
      stripeAccountStatus: account.details_submitted ? 'complete' : 'pending',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return { accountId: account.id, exists: false };
  } catch (error) {
    console.error('Error creating seller account:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get a seller's account status
exports.getSellerAccountStatus = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  try {
    const userId = data.userId || context.auth.uid;
    
    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() || {};
    
    if (!userData.stripeAccountId) {
      return { status: 'not_created' };
    }
    
    // Get Stripe account details
    const account = await stripe.accounts.retrieve(userData.stripeAccountId);
    
    // Update account status in Firestore
    const status = account.details_submitted ? 
      (account.charges_enabled ? 'complete' : 'pending_verification') : 
      'pending_details';
      
    await db.collection('users').doc(userId).update({
      stripeAccountStatus: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { 
      status,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted
    };
  } catch (error) {
    console.error('Error getting seller status:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get an onboarding link for seller
exports.getSellerOnboardingLink = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  try {
    const userId = context.auth.uid;
    
    // Get user's Stripe account ID
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() || {};
    
    if (!userData.stripeAccountId) {
      throw new functions.https.HttpsError('failed-precondition', 'Seller account not created');
    }
    
    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: userData.stripeAccountId,
      refresh_url: `${functions.config().app.url}/seller/onboarding?refresh=true`,
      return_url: `${functions.config().app.url}/seller/dashboard`,
      type: 'account_onboarding',
    });
    
    return { url: accountLink.url };
  } catch (error) {
    console.error('Error creating onboarding link:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Webhook to handle Stripe events
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    
    // Handle various event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;
      // Add more event handlers as needed
    }
    
    res.status(200).send({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Handle successful payments
async function handlePaymentIntentSucceeded(paymentIntent) {
  const { transactionId } = paymentIntent.metadata;
  
  if (!transactionId) return;
  
  try {
    // Update transaction status
    await db.collection('transactions').doc(transactionId).update({
      paymentStatus: 'succeeded',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Add system message to chat
    await db.collection('chats').doc(transactionId).collection('messages').add({
      text: 'Payment received and held in escrow. It will be released to the seller when you provide the verification code upon pickup.',
      sender: 'system',
      senderName: 'System',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'system'
    });
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle Stripe account updates
async function handleAccountUpdated(account) {
  try {
    // Find user with this Stripe account ID
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('stripeAccountId', '==', account.id).get();
    
    if (querySnapshot.empty) return;
    
    // Update account status
    const userDoc = querySnapshot.docs[0];
    const status = account.details_submitted ? 
      (account.charges_enabled ? 'complete' : 'pending_verification') : 
      'pending_details';
      
    await userDoc.ref.update({
      stripeAccountStatus: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error handling account update:', error);
  }
}