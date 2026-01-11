const transporter = require('../config/nodemailer');

// Email template for owner
const ownerOrderEmail = (order, userDetails) => {
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .order-details { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white; }
        th { background-color: #4CAF50; color: white; padding: 12px; text-align: left; }
        td { border: 1px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; color: #4CAF50; text-align: right; margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px; }
        .address-box { background-color: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; border-radius: 5px; }
        .info-row { padding: 8px 0; border-bottom: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New Order Received!</h1>
        </div>
        <div class="content">
          <h2>Order Details</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px;">
            <div class="info-row"><strong>Order ID:</strong> ${order._id}</div>
            <div class="info-row"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
            <div class="info-row"><strong>Payment Method:</strong> ${order.paymentMethod}</div>
            <div class="info-row"><strong>Payment Status:</strong> <span style="color: ${order.paymentStatus === 'Paid' ? '#4CAF50' : '#FF9800'};">${order.paymentStatus}</span></div>
          </div>

          <h3 style="margin-top: 25px;">Customer Information</h3>
          <div style="background-color: white; padding: 15px; border-radius: 5px;">
            <div class="info-row"><strong>Name:</strong> ${userDetails.fullname}</div>
            <div class="info-row"><strong>Email:</strong> ${userDetails.email}</div>
            <div class="info-row"><strong>Contact:</strong> ${userDetails.contact || 'Not provided'}</div>
          </div>

          <div class="address-box">
            <h3 style="margin-top: 0;">📍 Shipping Address</h3>
            <p style="margin: 5px 0;">${order.shippingAddress.address}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
            <p style="margin: 5px 0;"><strong>PIN:</strong> ${order.shippingAddress.pincode}</p>
          </div>

          <h3>📦 Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <div class="total">
            <strong>Total Amount: ₹${order.totalAmount.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for customer
const customerOrderEmail = (order, userName) => {
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background-color: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white; }
        th { background-color: #2196F3; color: white; padding: 12px; text-align: left; }
        td { border: 1px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; color: #2196F3; text-align: right; margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px; }
        .address-box { background-color: white; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
        .info-box { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Thank you for your order! We're excited to get your items to you. 🎉</p>

          <h3>Order Summary</h3>
          <div class="info-box">
            <p style="margin: 8px 0;"><strong>Order ID:</strong> ${order._id}</p>
            <p style="margin: 8px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p style="margin: 8px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p style="margin: 8px 0;"><strong>Order Status:</strong> <span style="color: #4CAF50;">${order.orderStatus}</span></p>
          </div>

          <div class="address-box">
            <h3 style="margin-top: 0;">🚚 Delivery Address</h3>
            <p style="margin: 5px 0;">${order.shippingAddress.address}</p>
            <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
            <p style="margin: 5px 0;"><strong>PIN:</strong> ${order.shippingAddress.pincode}</p>
          </div>

          <h3>📦 Items Ordered</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <div class="total">
            <strong>Total Amount: ₹${order.totalAmount.toFixed(2)}</strong>
          </div>

          <div style="background-color: #E3F2FD; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0;"><strong>📧 What's Next?</strong></p>
            <p style="margin: 10px 0 0 0;">We'll send you another email when your order ships with tracking information.</p>
          </div>
        </div>
        <div class="footer">
          <p>If you have any questions, please contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} The Scatch Team. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ========== CANCEL ORDER EMAIL TEMPLATES ==========

// Email template for owner when order is cancelled
const ownerCancelEmail = (order, userDetails) => {
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f44336; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background-color: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white; }
        th { background-color: #f44336; color: white; padding: 12px; text-align: left; }
        td { border: 1px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; color: #f44336; text-align: right; margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px; }
        .info-row { padding: 8px 0; border-bottom: 1px solid #eee; }
        .warning-box { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Order Cancelled</h1>
        </div>
        <div class="content">
          <div class="warning-box">
            <h3 style="margin-top: 0;">Order Cancellation Notice</h3>
            <p>An order has been cancelled by the customer. Stock has been restored.</p>
          </div>

          <h2>Order Details</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px;">
            <div class="info-row"><strong>Order ID:</strong> ${order._id}</div>
            <div class="info-row"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
            <div class="info-row"><strong>Cancelled Date:</strong> ${new Date(order.cancelledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
            <div class="info-row"><strong>Payment Method:</strong> ${order.paymentMethod}</div>
            <div class="info-row"><strong>Payment Status:</strong> <span style="color: #f44336;">${order.paymentStatus}</span></div>
          </div>

          <h3 style="margin-top: 25px;">Customer Information</h3>
          <div style="background-color: white; padding: 15px; border-radius: 5px;">
            <div class="info-row"><strong>Name:</strong> ${userDetails.fullname}</div>
            <div class="info-row"><strong>Email:</strong> ${userDetails.email}</div>
            <div class="info-row"><strong>Contact:</strong> ${userDetails.contact || 'Not provided'}</div>
          </div>

          <h3>📦 Cancelled Items (Stock Restored)</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <div class="total">
            <strong>Order Amount: ₹${order.totalAmount.toFixed(2)}</strong>
          </div>

          ${order.paymentStatus === 'Refund Pending' || order.paymentStatus === 'Paid' ? 
            '<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;"><p style="margin: 0;"><strong>⚠️ Refund Required:</strong> Customer paid online. Please process refund.</p></div>' : ''}
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for customer when order is cancelled
const customerCancelEmail = (order, userName) => {
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f44336; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background-color: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white; }
        th { background-color: #f44336; color: white; padding: 12px; text-align: left; }
        td { border: 1px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; color: #f44336; text-align: right; margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px; }
        .info-box { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
        .success-box { background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Cancelled</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Your order has been successfully cancelled as per your request.</p>

          <div class="success-box">
            <h3 style="margin-top: 0;">✅ Cancellation Confirmed</h3>
            <p style="margin: 0;">Your order has been cancelled and the items have been returned to our inventory.</p>
          </div>

          <h3>Order Details</h3>
          <div class="info-box">
            <p style="margin: 8px 0;"><strong>Order ID:</strong> ${order._id}</p>
            <p style="margin: 8px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p style="margin: 8px 0;"><strong>Cancelled Date:</strong> ${new Date(order.cancelledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #f44336;">Cancelled</span></p>
          </div>

          <h3>📦 Cancelled Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <div class="total">
            <strong>Order Amount: ₹${order.totalAmount.toFixed(2)}</strong>
          </div>

          ${order.paymentStatus === 'Refund Pending' || order.paymentStatus === 'Paid' ? 
            `<div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <p style="margin: 0;"><strong>💰 Refund Information:</strong></p>
              <p style="margin: 10px 0 0 0;">Your refund of ₹${order.totalAmount.toFixed(2)} will be processed within 5-7 business days to your original payment method.</p>
            </div>` 
            : 
            '<div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin-top: 20px;"><p style="margin: 0;">Since you chose Cash on Delivery, no refund is necessary.</p></div>'}

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0;">We hope to serve you again soon! Browse our latest products anytime.</p>
          </div>
        </div>
        <div class="footer">
          <p>If you have any questions, please contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} Your Store Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Function to send owner notification
const sendOwnerNotification = async (order, userDetails) => {
  try {
    const mailOptions = {
      from: '"The Scatch Team" <kavishvachheta11@gmail.com>',
      to: 'kavishvachheta11@gmail.com', // Change this to your owner email
      subject: `🔔 New Order Received - #${order._id}`,
      html: ownerOrderEmail(order, userDetails)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Owner notification sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending owner email:', error);
    return { success: false, error: error.message };
  }
};

// Function to send customer confirmation
const sendCustomerConfirmation = async (order, userEmail, userName) => {
  try {
    const mailOptions = {
      from: '"The Scatch Team" <kavishvachheta11@gmail.com>',
      to: userEmail,
      subject: `Order Confirmation - #${order._id}`,
      html: customerOrderEmail(order, userName)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Customer confirmation sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending customer email:', error);
    return { success: false, error: error.message };
  }
};

// Function to send owner cancellation notification
const sendOwnerCancelNotification = async (order, userDetails) => {
  try {
    const mailOptions = {
      from: '"The Scatch Team" <kavishvachheta11@gmail.com>',
      to: 'kavishvachheta11@gmail.com', // Change to actual owner email
      subject: `⚠️ Order Cancelled - #${order._id}`,
      html: ownerCancelEmail(order, userDetails)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Owner cancellation notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending owner cancellation email:', error);
    return { success: false, error: error.message };
  }
};

// Function to send customer cancellation confirmation
const sendCustomerCancelConfirmation = async (order, userEmail, userName) => {
  try {
    const mailOptions = {
      from: '"The Scatch Team" <kavishvachheta11@gmail.com>',
      to: userEmail,
      subject: `Order Cancelled - #${order._id}`,
      html: customerCancelEmail(order, userName)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Customer cancellation confirmation sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending customer cancellation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOwnerNotification,
  sendCustomerConfirmation,
  sendOwnerCancelNotification,
  sendCustomerCancelConfirmation
};