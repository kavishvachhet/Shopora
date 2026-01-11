const express = require("express");
const router = express.Router();
const usermodel = require("../models/user_model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.registerUser = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        const acc_alr = await usermodel.findOne({ email });
        if (acc_alr) {
            req.flash("error","Account Already Exists..");
            return res.redirect("/register");
            // return res.status(400).json({
            //     message: "Account Already Exists.."
            // });
        }

        // Generate salt & hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Create user
        const user = await usermodel.create({
            fullname,
            email,
            password: hash
        });

        // Create JWT token
        const token = jwt.sign(
            { email, id: user._id },
            process.env.JWT_SECRET
        );

        // Send token as cookie
        res.cookie("token", token);

        // res.status(201).json({ message: "User registered successfully!"});
        req.flash("success","Account Created Successfully");
        res.redirect("/shop");
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

module.exports.loginUser = async function (req, res) {
    const { email, password } = req.body;

    const user = await usermodel.findOne({ email });
    if (!user) {
        return res.send("Email or Password Incorrect..");
    }

    bcrypt.compare(password, user.password, function (err, result) {
        if (err || !result) {
            return res.send("Email or Password Incorrect..");
        }

        // Create JWT token
        const token = jwt.sign(
            { email, id: user._id },
            process.env.JWT_SECRET
        );

        // Send token as cookie
        res.cookie("token", token);

        // Send success message
        // res.send("You can Login...");
        res.redirect("/shop");
    });
};

module.exports.logout = async function (req,res) {
    res.cookie("token","");
    res.redirect("/");
}