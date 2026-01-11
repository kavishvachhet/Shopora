const mongoose = require('mongoose');
const Product = require('../models/product_model'); // Import Product model

const CartSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // Reference to User model
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' }, // Reference to Product
    quantity: { type: Number, default: 1 }, // Track quantity added
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('cart', CartSchema);
