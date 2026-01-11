const transporter = require("../config/nodemailer");

const ownerOrderEmail = require("../utils/ownerorder");
const customerOrderEmail = require("../utils/customerOrder");
const ownerCancelEmail = require("../utils/ownercancel");
const customerCancelEmail = require("../utils/customerCancel");

const sendOwnerNotification = async (order, userDetails) => {
  return transporter.sendMail({
    from: '"Your Store" <kavishvachheta11@gmail.com>',
    to: 'kavishvachheta11@gmail.com',
    subject: `🔔 New Order - #${order._id}`,
    html: ownerOrderEmail(order, userDetails)
  });
};

const sendCustomerConfirmation = async (order, userEmail, userName) => {
  return transporter.sendMail({
    from: '"Your Store" <kavishvachheta11@gmail.com>',
    to: userEmail,
    subject: `Order Confirmation - #${order._id}`,
    html: customerOrderEmail(order, userName)
  });
};

const sendOwnerCancelNotification = async (order, userDetails) => {
  return transporter.sendMail({
    from: '"Your Store" <kavishvachheta11@gmail.com>',
    to: 'kavishvachheta11@gmail.com',
    subject: `⚠️ Order Cancelled - #${order._id}`,
    html: ownerCancelEmail(order, userDetails)
  });
};

const sendCustomerCancelConfirmation = async (order, userEmail, userName) => {
  return transporter.sendMail({
    from: '"Your Store" <kavishvachheta11@gmail.com>',
    to: userEmail,
    subject: `Order Cancelled - #${order._id}`,
    html: customerCancelEmail(order, userName)
  });
};

module.exports = {
  sendOwnerNotification,
  sendCustomerConfirmation,
  sendOwnerCancelNotification,
  sendCustomerCancelConfirmation
};
