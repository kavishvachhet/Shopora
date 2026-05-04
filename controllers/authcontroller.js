const express = require("express");
const router = express.Router();
const usermodel = require("../models/user_model");
const bcrypt = require("bcrypt");
const ownermodel = require("../models/owners_model");
const jwt = require("jsonwebtoken");

module.exports.registerUser = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        const acc_alr = await usermodel.findOne({ email });
        if (acc_alr) {
            req.flash("error","Account Already Exists..");
            return res.redirect("/register");
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = await usermodel.create({
            fullname,
            email,
            password: hash
        });

        const token = jwt.sign(
            { email, id: user._id },
            process.env.JWT_SECRET
        );

        res.cookie("token", token);

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

        const token = jwt.sign(
            { email, id: user._id },
            process.env.JWT_SECRET
        );

        res.cookie("token", token);

        res.redirect("/shop");
    });
};

module.exports.loginadmin = async function (req, res) {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    if (!email || !password) {
      req.flash("error", "Email and Password are required");
      return res.redirect("/owner/login");
    }

    const owner = await ownermodel.findOne({ email });

    if (!owner) {
      console.log("Owner not found");
      req.flash("error", "Email or Password Incorrect");
      return res.redirect("/owner/login");
    }

    console.log("Owner found:", owner.email);

    // Compare with the 'password' field (not 'passwordHash')
    const isMatch = await bcrypt.compare(password, owner.password);

    if (!isMatch) {
      console.log("Password match failed");
      req.flash("error", "Email or Password Incorrect");
      return res.redirect("/owner/login");
    }

    console.log("✅ Password matched");

    const token = jwt.sign(
      { id: owner._id, email: owner.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true
    });

    res.redirect("/owner/admin");

  } catch (err) {
    console.error("Login error:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/owner/login");
  }
};

module.exports.logout = async function (req,res) {
    res.cookie("token","");
    res.redirect("/");
}