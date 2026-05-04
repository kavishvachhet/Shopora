const mongoose = require("mongoose");
const config = require("config");
const debug = require("debug")("development:mongoose");

mongoose.connect(`${config.get("MONGO_URI")}/lastproject`)
  .then(() => {
    debug("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    debug("❌ MongoDB connection error:", err);
  });

module.exports = mongoose.connection;