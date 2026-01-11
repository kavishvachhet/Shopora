const express = require("express");
const router  = express.Router();
const upload = require("../config/multer-config");
const productmodel = require("../models/product_model");

router.post("/create", upload.single("image"), async function (req, res) {
    try {
        let {
            name,
            price,
            discount,
            bgcolor,
            panelcolor,
            textcolor,
            description,
            stock,
            category,
            subcategory,
            brand,
            rating
        } = req.body;

        // required validation (keeping your logic)
        if (
            !req.file ||
            !name ||
            !price ||
            !bgcolor ||
            !panelcolor ||
            !textcolor
        ) {
            req.flash("error", "Missing required fields");
            return res.redirect("/owner/admin");
        }

        let product = await productmodel.create({
            image: req.file.buffer, // 🔒 untouched
            name,
            price,
            discount,
            bgcolor,
            panelcolor,
            textcolor,
            description,
            stock,
            category,
            subcategory,
            brand,
            rating
        });

        req.flash("success", "Product Created Successfully...");
        res.redirect("/owner/admin");

    } catch (err) {
        req.flash("error", "Something Went Wrong");
        return res.redirect("/owner/admin");
    }
});

module.exports = router;
