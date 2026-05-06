const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
    }],
    orders: {
        type: Array,
        default: []
    },
    contact: Number,
    image: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {
    timestamps: true
});

module.exports = mongoose.model("user", UserSchema);