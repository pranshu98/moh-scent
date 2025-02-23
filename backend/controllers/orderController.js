const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const paymentFallback = require('../utils/paymentFallback');
const emailService = require('../utils/emailService');

// Initialize Razorpay
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (error) {
  console.error('Failed to initialize Razorpay:', error);
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Calculate prices
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Create order in database
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  // Create payment order
  try {
    let paymentOrder;
    if (paymentMethod === 'razorpay' && razorpay) {
      paymentOrder = await razorpay.orders.create({
        amount: Math.round(totalPrice * 100), // Razorpay expects amount in smallest currency unit
        currency: 'INR',
        receipt: order._id.toString(),
      });
    } else {
      // Use fallback payment system
      paymentOrder = await paymentFallback.createOrder(totalPrice, 'INR');
    }

    res.status(201).json({
      success: true,
      data: {
        order,
        paymentOrder,
      },
    });
  } catch (error) {
    // If payment order creation fails, delete the order and throw error
    await Order.findByIdAndDelete(order._id);
    throw error;
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check for user authorization
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.json({
    success: true,
    data: order,
  });
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  try {
    let isValid = false;

    if (order.paymentMethod === 'razorpay' && razorpay) {
      // Verify Razorpay payment
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      isValid = razorpay.validateWebhookSignature(body, razorpay_signature);
    } else {
      // Verify fallback payment
      isValid = await paymentFallback.verifyPayment(
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      );
    }

    if (!isValid) {
      res.status(400);
      throw new Error('Invalid payment verification');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      status: 'completed',
    };

    const updatedOrder = await order.save();

    // Send order confirmation email
    await emailService.sendOrderConfirmation(updatedOrder, req.user);

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(400);
    throw new Error('Payment verification failed');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.status = 'delivered';
  order.trackingNumber = req.body.trackingNumber;

  const updatedOrder = await order.save();

  // Send shipping confirmation email
  await emailService.sendShippingConfirmation(
    updatedOrder,
    await User.findById(order.user),
    req.body.trackingNumber
  );

  res.json({
    success: true,
    data: updatedOrder,
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json({
    success: true,
    data: orders,
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json({
    success: true,
    data: orders,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = req.body.status;
  const updatedOrder = await order.save();

  res.json({
    success: true,
    data: updatedOrder,
  });
});

module.exports = {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
};
