const mongoose = require('mongoose');

// mongoose.connect("mongodb://localhost:27017/lastproject");

const OwnerModel = mongoose.Schema({
    fullname : String,
    email : String,
    password : String,
    product : {
        type : Array,
        default : []
    },
    picture : String,
    gstin : String,
});

module.exports = mongoose.model("owner",OwnerModel);