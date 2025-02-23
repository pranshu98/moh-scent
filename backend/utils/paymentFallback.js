class PaymentFallback {
  constructor() {
    this.mockTransactionIds = new Set();
  }

  // Generate a mock transaction ID
  generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `mock_${timestamp}_${random}`;
  }

  // Create a mock payment order
  async createOrder(amount, currency = 'INR') {
    const orderId = this.generateTransactionId();
    console.log(`[MOCK PAYMENT] Created order: ${orderId} for amount: ${amount} ${currency}`);
    return {
      id: orderId,
      amount,
      currency,
      mock: true
    };
  }

  // Process a mock payment
  async processPayment(orderId, amount, currency = 'INR') {
    if (this.mockTransactionIds.has(orderId)) {
      throw new Error('Transaction ID already processed');
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() < 0.9;

    if (!isSuccess) {
      throw new Error('Mock payment failed');
    }

    const paymentId = this.generateTransactionId();
    const signature = this.generateTransactionId();

    this.mockTransactionIds.add(orderId);

    console.log(`[MOCK PAYMENT] Processed payment: ${paymentId} for order: ${orderId}`);

    return {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
      mock: true
    };
  }

  // Verify mock payment
  async verifyPayment(paymentId, orderId, signature) {
    // For mock payments, always verify if the transaction ID exists
    const isValid = this.mockTransactionIds.has(orderId);
    
    console.log(`[MOCK PAYMENT] Verifying payment: ${paymentId} - ${isValid ? 'Valid' : 'Invalid'}`);
    
    return isValid;
  }

  // Refund a mock payment
  async refundPayment(paymentId) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const refundId = this.generateTransactionId();
    console.log(`[MOCK PAYMENT] Refunded payment: ${paymentId} with refund ID: ${refundId}`);

    return {
      id: refundId,
      payment_id: paymentId,
      status: 'processed',
      mock: true
    };
  }

  // Log mock payment events
  logPaymentEvent(eventType, data) {
    const timestamp = new Date().toISOString();
    console.log(`[MOCK PAYMENT EVENT] ${timestamp} - ${eventType}:`, data);
  }
}

// Create a singleton instance
const paymentFallback = new PaymentFallback();

module.exports = paymentFallback;
