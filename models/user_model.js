const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    fullname : String,
    email : String,
    password : String,
    cart : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "product",
    }],
    wishlist : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "product",
    }],
    orders : {
        type : Array,
        default : []
    },
    contact : Number,
    image: Buffer,
    // Password reset fields
    resetPasswordToken : String,
    resetPasswordExpires : Date,
}, {
    timestamps: true // Optional: adds createdAt and updatedAt
});

module.exports = mongoose.model("user", UserSchema);