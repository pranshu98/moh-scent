const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOrderConfirmation(order, user) {
    const message = {
      from: `Moh-Scent <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation - Order #${order._id}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Hi ${user.name},</p>
        <p>We're happy to let you know that we've received your order.</p>
        
        <h2>Order Details:</h2>
        <p>Order Number: ${order._id}</p>
        <p>Order Date: ${order.createdAt.toLocaleDateString()}</p>
        
        <h3>Items:</h3>
        ${order.orderItems.map(item => `
          <div>
            <p>${item.name} x ${item.quantity} - $${item.price * item.quantity}</p>
          </div>
        `).join('')}
        
        <p>Subtotal: $${order.itemsPrice}</p>
        <p>Shipping: $${order.shippingPrice}</p>
        <p>Tax: $${order.taxPrice}</p>
        <p><strong>Total: $${order.totalPrice}</strong></p>
        
        <h3>Shipping Address:</h3>
        <p>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}<br>
          ${order.shippingAddress.postalCode}<br>
          ${order.shippingAddress.country}
        </p>
        
        <p>We'll send you another email when your order ships.</p>
        
        <p>Thank you for shopping with Moh-Scent!</p>
      `,
    };

    try {
      await this.transporter.sendMail(message);
      console.log('Order confirmation email sent successfully');
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      // Don't throw error as email sending should not block order processing
    }
  }

  async sendShippingConfirmation(order, user, trackingNumber) {
    const message = {
      from: `Moh-Scent <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Your Order Has Shipped - Order #${order._id}`,
      html: `
        <h1>Your Order is on its way!</h1>
        <p>Hi ${user.name},</p>
        <p>Great news! Your order has been shipped.</p>
        
        <h2>Shipping Details:</h2>
        <p>Order Number: ${order._id}</p>
        <p>Tracking Number: ${trackingNumber}</p>
        
        <h3>Shipping Address:</h3>
        <p>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}<br>
          ${order.shippingAddress.postalCode}<br>
          ${order.shippingAddress.country}
        </p>
        
        <p>Thank you for shopping with Moh-Scent!</p>
      `,
    };

    try {
      await this.transporter.sendMail(message);
      console.log('Shipping confirmation email sent successfully');
    } catch (error) {
      console.error('Error sending shipping confirmation email:', error);
    }
  }
}

module.exports = new EmailService();
