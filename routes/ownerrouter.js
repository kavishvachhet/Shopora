const express = require("express");
const router  = express.Router();
const ownermodel = require("../models/owners_model");
const { route } = require(".");
const { loginadmin } = require("../controllers/authcontroller");

router.get("/login", (req, res) => {
  console.log(req.cookies);
  res.render("owner_login.ejs");
});

router.get("/admin",async function (req,res) {
  console.log(req.cookies);
  
  if(req.cookies.token){
    res.render("createproducts.ejs");
  } else {
    let error = req.flash("error", "Owner Login Required");
    res.render("owner_login.ejs", {error});
  }
});

router.post("/login",loginadmin);

module.exports = router;