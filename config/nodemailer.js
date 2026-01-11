const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: "kavishvachheta11@gmail.com",
    pass: "dvtgysfyzjmetaqy",
  },
});


transporter.verify((err, success) => {
    if(err) console.log("Connection error:", err);
    else console.log("Connected to Gmail! Ready to send emails.");
});



module.exports = transporter;
