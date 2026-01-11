const mongoose = require('mongoose');
// const upload = require("../config/multer-config");

const ProductSchema = mongoose.Schema({

    /* EXISTING FIELDS – DO NOT TOUCHED */
    image: Buffer,
    name: String,
    price: Number,
    discount: {
        type: Number,
        default: 0,
    },
    bgcolor: String,
    panelcolor: String,
    textcolor: String,

    description: {
        type: String,
    },

    stock: {
        type: Number,
        default: 0,
    },

    category: {
        type: String,
    },

    subcategory: {
        type: String,
    },

    brand: {
        type: String,
    },

    rating: {
        type: Number,
        default: 0,
    },

}, { timestamps: true });

module.exports = mongoose.model("product", ProductSchema);
