const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  shippingAddress: {
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: String,
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed', 'Refund Pending', 'Refunded'],
    default: 'Pending' 
  },
  orderStatus: { 
    type: String, 
    enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Placed' 
  },
  totalAmount: Number,
  cancelledAt: Date  // Only this field is needed
}, { timestamps: true });

module.exports = mongoose.model("order", OrderSchema);