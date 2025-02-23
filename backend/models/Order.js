const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['razorpay', 'mock'],
    default: 'razorpay'
  },
  paymentResult: {
    razorpay_payment_id: { type: String },
    razorpay_order_id: { type: String },
    razorpay_signature: { type: String },
    status: { type: String },
    email_address: { type: String }
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate total price before saving
orderSchema.pre('save', function(next) {
  this.totalPrice = this.orderItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0) + this.shippingPrice + this.taxPrice;
  
  next();
});

// Update product stock after order is placed
orderSchema.post('save', async function() {
  if (this.isPaid) {
    const Product = mongoose.model('Product');
    for (const item of this.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);
