const customerCancelEmail = (order, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; border-top: 4px solid #d9534f; padding: 40px; border: 1px solid #e5e5e5;">
        <h1 style="font-size: 22px; color: #111;">Order Cancelled</h1>
        <p>Dear ${userName},</p>
        <p>Your order <strong>#${order._id}</strong> has been successfully cancelled. We have initiated a refund of <strong>₹${order.totalAmount.toFixed(2)}</strong> to your original payment method.</p>
        <p style="font-size: 14px; color: #666;">Note: It may take 5-7 business days for the funds to appear in your account depending on your bank.</p>
        <p style="margin-top: 30px; font-size: 14px;">If you didn't request this, please contact our support team immediately.</p>
        <footer style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} Your Company Name
        </footer>
      </div>
    </body>
    </html>
  `;
};

module.exports = customerCancelEmail;
