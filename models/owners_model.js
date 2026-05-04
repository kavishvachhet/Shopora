const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const OwnerSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  product: {
    type: Array,
    default: []
  },
  picture: String,
  gstin: String
});

/* 🔐 AUTO-HASH PASSWORD */
OwnerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Owner", OwnerSchema);