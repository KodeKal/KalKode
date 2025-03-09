// src/utils/stripe-js.js
// Mock of @stripe/stripe-js for development
export const loadStripe = (publishableKey) => {
    console.log(`Mock Stripe loaded with key: ${publishableKey}`);
    
    return {
      elements: () => ({
        create: (type, options) => ({
          mount: (element) => {},
          on: (event, handler) => {},
          update: (options) => {}
        })
      }),
      confirmCardPayment: async () => ({
        paymentIntent: { id: 'mock_payment_intent_id', status: 'succeeded' }
      }),
      createPaymentMethod: async () => ({
        paymentMethod: { id: 'mock_payment_method_id' }
      })
    };
  };