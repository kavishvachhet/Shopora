const customerOrderEmail = (order, userName) => {
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
        <div style="font-weight: 600; color: #111111;">${item.name}</div>
        <div style="font-size: 13px; color: #666666;">Quantity: ${item.quantity}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right; color: #111111;">
        ₹${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin: 0; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; background-color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; padding: 40px; border-radius: 4px;">
        <h1 style="font-size: 24px; font-weight: 500; margin: 0 0 10px; color: #111;">Order Confirmation</h1>
        <p style="font-size: 15px; color: #555;">Hello ${userName},</p>
        <p style="font-size: 15px; color: #555;">Thank you for your order. We'll send a confirmation email as soon as your items ship.</p>
        
        <div style="margin: 30px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
          <span style="font-size: 12px; color: #777; text-transform: uppercase;">Order ID</span><br>
          <span style="font-size: 16px; font-weight: 600;">#${order._id}</span>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="text-align: left; font-size: 12px; color: #888; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #333;">Items Ordered</th>
              <th style="text-align: right; font-size: 12px; color: #888; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #333;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsList}</tbody>
        </table>

        <div style="text-align: right;">
          <p style="margin: 0; font-size: 14px; color: #666;">Total Amount</p>
          <p style="margin: 5px 0 0; font-size: 22px; font-weight: 700; color: #111;">₹${order.totalAmount.toFixed(2)}</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

module.exports = customerOrderEmail;
