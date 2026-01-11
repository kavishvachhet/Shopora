const ownerCancelEmail = (order, userDetails) => {
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
                <td style="background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%); padding: 40px 30px; text-align: center;">
                  <div style="background-color: #ffffff; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 32px;">⚠️</span>
                  </div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Order Cancelled</h1>
                  <p style="color: #ffe6e6; margin: 10px 0 0; font-size: 14px;">Customer cancellation notification</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 30px;">A customer has cancelled their order. Please process the refund and update inventory accordingly.</p>
                  
                  <!-- Cancellation Details -->
                  <div style="background-color: #fff5f0; border-left: 4px solid #ff5e62; padding: 20px; border-radius: 8px;">
                    <table width="100%">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
                          <p style="margin: 5px 0 0; color: #333; font-size: 16px; font-weight: 600;">#${order._id}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Customer Name</p>
                          <p style="margin: 5px 0 0; color: #333; font-size: 16px; font-weight: 600;">${userDetails.fullname}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Refund Amount</p>
                          <p style="margin: 5px 0 0; color: #ff5e62; font-size: 24px; font-weight: 700;">₹${order.totalAmount.toFixed(2)}</p>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                  <p style="margin: 0; color: #666; font-size: 14px;">Please take necessary action for refund processing</p>
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

module.exports = ownerCancelEmail;
