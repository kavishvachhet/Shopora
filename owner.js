// const mongoose = require("mongoose");
// const config = require("config");
// const ownermodel = require("./models/owners_model")

// mongoose.connect(`${config.get("MONGO_URI")}/lastproject`);

// async function createOwner() {
//   try {
//     const owner = new ownermodel({
//       fullname: "Admin",
//       email: "admin@gmail.com",
//       password: "admin@123", // Plain password - will be auto-hashed by pre-save hook
//       gstin: "27ABCDE1234F1Z5"
//     });

//     await owner.save();
//     console.log("✅ Owner created successfully");
//     mongoose.disconnect();
//   } catch (err) {
//     console.error("❌ Error creating owner:", err);
//     mongoose.disconnect();
//   }
// }

// createOwner();