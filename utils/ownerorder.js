const ownerOrderEmail = (order, userDetails) => {
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px 30px; text-align: center;">
                  <div style="background-color: #ffffff; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 32px;">🎉</span>
                  </div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">New Order Received!</h1>
                  <p style="color: #e6ffe6; margin: 10px 0 0; font-size: 14px;">Action required</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  
                  <!-- Customer Info -->
                  <div style="background-color: #f0fdf4; border-left: 4px solid #38ef7d; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p style="margin: 0 0 15px; color: #333; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Customer Details</p>
                    <table width="100%">
                      <tr>
                        <td style="padding: 5px 0;">
                          <p style="margin: 0; color: #666; font-size: 12px;">Name</p>
                          <p style="margin: 3px 0 0; color: #333; font-size: 16px; font-weight: 600;">${userDetails.fullname}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;">
                          <p style="margin: 0; color: #666; font-size: 12px;">Order ID</p>
                          <p style="margin: 3px 0 0; color: #333; font-size: 16px; font-weight: 600;">#${order._id}</p>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Items Table -->
                  <p style="margin: 0 0 15px; color: #333; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Order Items</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #f8f9fa;">
                        <th style="padding: 15px; text-align: left; color: #333; font-size: 14px; font-weight: 600; border-bottom: 2px solid #ddd;">Product</th>
                        <th style="padding: 15px; text-align: center; color: #333; font-size: 14px; font-weight: 600; border-bottom: 2px solid #ddd;">Qty</th>
                        <th style="padding: 15px; text-align: right; color: #333; font-size: 14px; font-weight: 600; border-bottom: 2px solid #ddd;">Price</th>
                        <th style="padding: 15px; text-align: right; color: #333; font-size: 14px; font-weight: 600; border-bottom: 2px solid #ddd;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsList}
                    </tbody>
                  </table>

                  <!-- Total -->
                  <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; border-radius: 8px; text-align: right;">
                    <p style="margin: 0; color: #e6ffe6; font-size: 14px;">Total Amount</p>
                    <p style="margin: 5px 0 0; color: #ffffff; font-size: 32px; font-weight: 700;">₹${order.totalAmount.toFixed(2)}</p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                  <p style="margin: 0; color: #666; font-size: 14px;">Please process this order as soon as possible</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = ownerOrderEmail;
