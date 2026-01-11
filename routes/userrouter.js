const express = require("express");
const router = express.Router();
// const usermodel = require("../models/user_model");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
const {registerUser,loginUser, logout} = require("../controllers/authcontroller");
const isloggin = require("../middlewares/isloggin");


router.get("/", (req, res) => {
    res.send("Chal raha hai....");
});

router.post("/register",registerUser);

router.post("/login",loginUser);

router.get("/logout",logout);




module.exports = router;
