const express = require("express");
const router  = express.Router();
const ownermodel = require("../models/owners_model");
const { route } = require(".");

// if(process.env.NODE_ENV == "development"){
//     router.post("/create", async function (req,res) {
//         let owners = await ownermodel.find();

//         if(owners.length >  0){
//             return res.status(503).send("You don't have Permission to create an owner...");
//         }

//         let {fullname,email,password} = req.body;

//         let createdowner = await ownermodel.create({
//             fullname,
//             email,
//             password
//         });

//         res.send(createdowner);
//     })
// }


// if(process.env.NODE_ENV == "development"){
//     router.post("/create", function (req,res) {
//         let owners = await
//     })
// }

router.get("/login", (req, res) => {

  // If owner already logged in, redirect to dashboard
  if (req.session.owner) {
    return res.redirect("/owner/dashboard");
  }
  res.render("owner_login.ejs");
});

router.get("/admin",function (req,res) {
    // res.send("Chal raha haii....")
    let success = req.flash("success");
    res.render("createproducts.ejs" , { success });
})

module.exports = router;