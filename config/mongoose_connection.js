const mongoose = require("mongoose");
const config = require("config");

const debug = require("debug")("development:mongoose");

// Use backticks for template literal
mongoose.connect(`${config.get("MONGO_URI")}/lastproject`)
  .then(() => {
    debug("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    debug("❌ MongoDB connection error:", err);
  });

module.exports = mongoose.connection;
