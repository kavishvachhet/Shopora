const express = require("express");
const router = express.Router();  // Fixed the typo here
const productmodel = require("../models/product_model");
const usermodel = require("../models/user_model");
const cartmodel = require("../models/cart_model");
const upload = require("../config/multer-config");
const isloggedin = require("../middlewares/isloggin");

const crypto = require("crypto");
const Order = require("../models/order");
const bcrypt = require("bcrypt");
const transporter = require("../config/nodemailer"); // adjust path
const order = require("../models/order");
const { 
  sendOwnerNotification, 
  sendCustomerConfirmation,
  sendOwnerCancelNotification,
  sendCustomerCancelConfirmation
} = require("../utils/email_helper");


router.get("/", function (req, res) {
  if (req.cookies.token) {
    // user is logged in
    return res.redirect("/shop");
  }

  // user is logged out
  res.render("index");
});


router.get("/shop", isloggedin, async function (req, res) {
    try {
        let user = await usermodel.findOne({ email: req.user.email });

        // Read sorting query from dropdown
        const sortby = req.query.sortby;

        // Decide sorting rule
        let sortOption = {};

        switch (sortby) {
            case "newest":
                sortOption = { createdAt: -1 }; // newest first
                break;

            case "price-low":
                sortOption = { price: 1 }; // ascending
                break;

            case "price-high":
                sortOption = { price: -1 }; // descending
                break;

        }

        // Apply sorting to products
        let products = await productmodel.find().sort(sortOption);

        res.render("shop", { products, user, sortby });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.get("/register",async function (req,res) {
    res.render("register");
});

router.get("/login",async function (req,res) {
    res.render("login");
});

router.get("/cart/remove/:productId", isloggedin, async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.productId;

        // Find user's cart
        let cart = await cartmodel.findOne({ userId });

        if (!cart) {
            req.flash("error", "Cart not found.");
            return res.redirect("/cart");
        }

        cart.items = cart.items.filter(item => 
            item.productId.toString() !== productId
        );

        await cart.save();

        req.flash("success", "Item removed from cart.");
        res.redirect("/cart");

    } catch (error) {
        console.error("Remove Cart Item Error:", error);
        req.flash("error", "Something went wrong while removing item.");
        res.redirect("/cart");
    }
});


router.get("/product/:id", isloggedin,async function (req, res) {
    // console.log("HEY");
    // console.log(req.params.id);

    try {
      const product = await productmodel.findById(req.params.id);
      if (!product) {
            return res.status(404).send("Product not found");
        }

        res.render("about_product", { product  });
    } catch (error) {
      res.status(500).send("Invalid Product ID");
    } 


    // res.render("about_product", { id: req.params.id });
});


router.get("/owner/products", isloggedin,async (req, res) => {
  try {
    // Fetch all products
    const products = await productmodel.find().sort({ createdAt: -1 });

    res.render("owner_products", { products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server Error");
  }
});


router.get("/owner/products/edit/:pro_id", isloggedin, async function (req, res) {
  try {
    const product = await productmodel.findById(req.params.pro_id);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/owner/products");
    }

    res.render("edit_product", { product });
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong");
    res.redirect("/owner/products");
  }
});

router.post("/owner/products/edit/:pro_id", upload.single("image"),async (req,res) => {
      try {
        const product = await productmodel.findById(req.params.pro_id);

        if(!product){
          req.flash("error","Product Not Found");
          return res.redirect("/owner/products");
        }

        product.name = req.body.name;
        product.price = req.body.price;
        product.discount = req.body.discount || 0;
        product.description = req.body.description;
        product.stock = req.body.stock;
        product.brand = req.body.brand;
        product.category = req.body.category;
        product.subcategory = req.body.subcategory;
        product.bgcolor = req.body.bgcolor;
        product.panelcolor = req.body.panelcolor;
        product.textcolor = req.body.textcolor;
        product.rating = req.body.rating;

        if(req.file){
          product.image = req.file.buffer;
        }

        await product.save();

        req.flash("success", "Product updated successfully");
        res.redirect("/owner/products");
      } catch (error) {
          console.error(error);
          req.flash("error", "Something went wrong");
          res.redirect("/owner/products");
      }
});

router.post("/owner/products/delete/:pro_id", async (req,res) => {
    try {
      const product = await productmodel.findById(req.params.pro_id);

      if(!product){
        req.flash("error","Product Not Found..");
        return res.redirect("/owner/products");
      }
      await productmodel.findByIdAndDelete(req.params.pro_id);

      req.flash("success", "Product deleted successfully");
      res.redirect("/owner/products");
    } catch (error) {
      req.flash("error", "Something went wrong while deleting product");
      res.redirect("/owner/products");
    }
});

router.get("/shop/discounted", isloggedin,async (req, res) => {
    try {
        // Find only products that have discount > 0
        const products = await productmodel.find({
            discount: { $gt: 0 }
        }).sort({ createdAt: -1 });  // newest first (optional)

        res.render("shop", {
            products,
            user: req.user,
            sortby: null,
            success: null
        });

    } catch (err) {
        console.log("Error loading discounted products:", err);
        res.redirect("/shop");
    }
});


router.get('/checkout', isloggedin, async (req, res) => {
  try {
    // 🔹 Get full user document
    const user = await usermodel.findOne({ email: req.user.email });

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/login");
    }

    // 🔹 Get cart
    const cart = await cartmodel
      .findOne({ userId: user._id })
      .populate('items.productId');

    if (!cart || cart.items.length === 0) {
      req.flash("error", "Your cart is empty! Add items before checkout.");
      return res.redirect("/shop");
    }

    // 🔹 Calculate total correctly (percentage discount)
    let totalAmount = 0;

    const validItems = cart.items.filter(i => i.productId); // remove deleted products

    validItems.forEach(item => {
      const product = item.productId;
      const discount = product.discount || 0;
      const finalPrice =
        product.price - (product.price * discount) / 100;

      totalAmount += finalPrice * item.quantity;
    });

    res.render('checkout', {
      user,
      cartItems: validItems,
      totalAmount: totalAmount.toFixed(0)
    });

  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).send("Server Error");
  }
});


router.post("/placeorder", isloggedin, async (req, res) => {
  try {
    const { address, city, state, pincode, paymentMethod } = req.body;

    // Fetch cart with populated product details
    const cart = await cartmodel.findOne({ userId: req.user._id })
      .populate('items.productId');

    // Check if cart exists and has items
    if (!cart || !cart.items || cart.items.length === 0) {
      req.flash("error", "Your cart is empty..");
      return res.redirect("/shop");
    }

    let totalAmount = 0;
    const orderItems = [];

    // Process cart items
    for (let item of cart.items) {
      // Check if product exists and is populated
      if (!item.productId) {
        console.error("Product not found in cart item:", item);
        continue; // Skip this item instead of throwing error
      }

      // Check if product has sufficient stock
      if (item.productId.stock < item.quantity) {
        req.flash("error", `Insufficient stock for ${item.productId.name}`);
        return res.redirect("/checkout");
      }

      const price = item.productId.price || 0;
      const discount = item.productId.discount || 0;
      const finalPrice = price - (price * discount) / 100;

      totalAmount += finalPrice * item.quantity;

      orderItems.push({
        product: item.productId._id,
        name: item.productId.name,
        price: finalPrice,
        quantity: item.quantity
      });
    }

    // Check if we have valid items to order
    if (orderItems.length === 0) {
      req.flash("error", "No valid items in cart");
      return res.redirect("/shop");
    }

    // Create new order
    const newOrder = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: { address, city, state, pincode },
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Placed",
      totalAmount
    });

    await newOrder.save();

    // Reduce stock for each product
    for (let item of cart.items) {
      if (item.productId && item.productId._id) {
        await productmodel.findByIdAndUpdate(
          item.productId._id,
          { $inc: { stock: -item.quantity } },
          { new: true } // Return updated document
        );
      }
    }

    // Clear the cart
    cart.items = [];
    await cart.save();

    const userDetails = {
      fullname : req.user.fullname,
      email : req.user.email,
      contact : req.user.contact,
    }

    sendOwnerNotification(newOrder, userDetails).catch(err => 
      console.error('Owner email failed:', err)
    );

    sendCustomerConfirmation(newOrder, req.user.email, req.user.fullname).catch(err => 
      console.error('Customer email failed:', err)
    );

    req.flash("success", "Order placed successfully!");
    res.redirect("/orders");

  } catch (err) {
    console.error("Place order error:", err);
    req.flash("error", "Failed to place order. Please try again.");
    res.redirect("/checkout");
  }
});


router.post("/users/orders/cancel/:orderId", isloggedin, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user._id 
    });

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/orders");
    }

    if (order.orderStatus === "Cancelled") {
      req.flash("error", "Order is already cancelled");
      return res.redirect("/orders");
    }

    if (order.orderStatus === "Delivered") {
      req.flash("error", "Cannot cancel delivered orders. Please contact support for returns.");
      return res.redirect("/orders");
    }

    if (order.orderStatus === "Shipped") {
      req.flash("error", "Cannot cancel shipped orders. Please contact support.");
      return res.redirect("/orders");
    }

    // Restore stock for each item
    for (let item of order.items) {
      await productmodel.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();
    
    if (order.paymentStatus === "Paid") {
      order.paymentStatus = "Refund Pending";
    }

    await order.save();

    const userDetails = {
      fullname: req.user.fullname,
      email: req.user.email,
      contact: req.user.contact
    };

    sendOwnerCancelNotification(order, userDetails).catch(err => 
      console.error('Owner cancellation email failed:', err)
    );
    
    sendCustomerCancelConfirmation(order, req.user.email, req.user.fullname).catch(err => 
      console.error('Customer cancellation email failed:', err)
    );

    req.flash("success", "Order cancelled successfully. Check your email for confirmation.");
    res.redirect("/orders");

  } catch (err) {
    console.error("Cancel order error:", err);
    req.flash("error", "Failed to cancel order. Please try again.");
    res.redirect("/orders");
  }
});

router.post("/users/orders/clear-history",isloggedin,async (req,res) => {
  try {
    const result = await Order.deleteMany({
      user : req.user._id,
      orderStatus:'Cancelled'
    });
    req.flash('success', `${result.deletedCount} cancelled order(s) deleted successfully`);
    
    res.redirect('/orders');
  } catch (error) {
    console.error('Error clearing order history:', error);
    req.flash('error', 'Failed to clear order history');
    res.redirect('/orders');
  }
})

router.get("/orders", isloggedin, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product"); 

    res.render("order.ejs", { orders });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to fetch orders!");
    res.redirect("/shop");
  }
});

router.post("/removewishlist/:pro_id", isloggedin, async function (req, res) {
    try {
        const productId = req.params.pro_id;

        // Remove productId from wishlist array
        await usermodel.updateOne(
            { email: req.user.email },
            { $pull: { wishlist: productId } }
        );

        req.flash("success", "Removed from Wishlist!");
        res.redirect("/wishlist");
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        req.flash("error", "Something went wrong!");
        res.redirect("/wishlist");
    }
});

router.get("/wishlist", isloggedin,async function (req, res) {
  try {
    const user = await usermodel
      .findOne({ email: req.user.email })
      .populate("wishlist")
      .exec();
    const wishlist = user?.wishlist || [];
    // if (user && user.wishlist.length > 0) {
    //   console.log("🧾 First wishlist product:", user.wishlist[0]);
    // } else {
    //   console.log("📭 Wishlist is empty or user not found");
    // }
    res.render("wishlist", { wishlist, user });
  } catch (error) {
    console.error("🔥 Error in /wishlist route:", error);
    res.status(500).send("Server Error");
  }
});


router.post("/addtocart/:pro_id", isloggedin, async function (req, res) {
  try {
    const user = await usermodel.findOne({ email: req.user.email });
    const productId = req.params.pro_id;

    const product = await productmodel.findById(productId);

    // ❌ Product missing or no stock
    if (!product || product.stock <= 0) {
      req.flash("error", "Product is out of stock!");
      return res.redirect("/shop");
    }

    let cart = await cartmodel.findOne({ userId: user._id });

    if (!cart) {
      // First time cart
      cart = new cartmodel({
        userId: user._id,
        items: [{ productId, quantity: 1 }],
      });
    } else {
      let itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

      if (itemIndex > -1) {
        // 🚫 STOP if quantity reached stock
        if (cart.items[itemIndex].quantity >= product.stock) {
          req.flash(
            "error",
            `Only ${product.stock} item available in stock`
          );
          return res.redirect("/shop");
        }

        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1 });
      }
    }

    await cart.save();
    req.flash("success", "Added to Cart!");
    res.redirect("/shop");

  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong!");
    res.redirect("/shop");
  }
});


router.get("/cart/increase/:pro_id", isloggedin, async function (req, res) {
  try {
    const user = await usermodel.findOne({ email: req.user.email });
    const productId = req.params.pro_id;

    let cart = await cartmodel.findOne({ userId: user._id });

    // ✅ Create cart if it doesn't exist
    if (!cart) {
      cart = new cartmodel({
        userId: user._id,
        items: []
      });
    }

    // ✅ Find product in cart
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      // ✅ Add product if not in cart
      cart.items.push({ productId, quantity: 1 });
    } else {
      // ✅ OPTIONAL: stock check
      const product = await productmodel.findById(productId);
      if (!product || cart.items[itemIndex].quantity >= product.stock) {
        req.flash("error", "Stock limit reached!");
        return res.redirect("/cart");
      }

      cart.items[itemIndex].quantity += 1;
    }

    await cart.save();
    req.flash("success", "Quantity increased!");
    res.redirect("/cart");

  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong!");
    res.redirect("/shop");
  }
});


router.get("/cart/decrease/:pro_id", isloggedin, async function (req, res) {
  try {
    const user = await usermodel.findOne({ email: req.user.email });
    const productId = req.params.pro_id;

    let cart = await cartmodel.findOne({ userId: user._id });

    if (!cart) {
      req.flash("error", "Cart not found!");
      return res.redirect("/cart");
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      req.flash("error", "Item not found in cart!");
      return res.redirect("/cart");
    }

    // decrease safely
    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();
    req.flash("success", "Quantity decreased!");
    res.redirect("/cart");

  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong!");
    res.redirect("/shop");
  }
});



router.get("/cart", isloggedin, async function (req, res) {
  try {
    const user = await usermodel.findOne({ email: req.user.email });

    const cart = await cartmodel
      .findOne({ userId: user._id })
      .populate("items.productId");

    res.render("cart", { cart });   // let EJS handle empty cart
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error...");
  }
});


router.get("/checking", isloggedin, async function (req, res) {
  try {
    // Check if login cookie exists
    if (req.cookies.token) {
      // User is logged in
      return res.redirect("/shop");
    } else {
      // Not logged in
      return res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});


router.get("/myaccount", isloggedin, async function (req, res) {
  try {
    const user = await usermodel.findOne({ email: req.user.email });

    if (!user) {
      req.flash("error", "User Not Found..");
      return res.redirect("/");
    }

    res.render("myaccount", { user });
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong..");
    res.redirect("/");
  }
});

router.post("/upload-image",isloggedin,upload.single("image"),async function (req,res) {
    try {
      const user = await usermodel.findOne({email : req.user.email});


    if (!user) {
      req.flash("error", "User not found!");
      return res.redirect("/");
    }
    if(!req.file){
       req.flash("error", "No file selected!");
      return res.redirect("/myaccount");
    } 

    user.image = req.file.buffer,
    await user.save();
    req.flash("success", "Profile picture updated!");
    res.redirect("/myaccount");
    } catch (error) {
      req.flash("error", "Something went wrong!");
      res.redirect("/myaccount");
    }
});

router.get("/forgot", async function (req,res) {
    res.render("forgot");
})

router.post("/remove-image", isloggedin, async function (req, res) {
  try {
    const user = await usermodel.findOne({ email: req.user.email });

    if (!user) {
      req.flash("error", "User not found!");
      return res.redirect("/");
    }

    // Properly remove the image
    user.image = undefined;
    // user.image = user.fullname.charAt(0).toUpperCase();
    await user.save();

    req.flash("success", "Profile picture removed!");
    res.redirect("/myaccount");
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong!");
    res.redirect("/myaccount");
  }
});



router.post("/send-reset-link", async function (req, res) {
  try {
    const user = await usermodel.findOne({ email: req.body.email });

    if (!user) {
      req.flash("success", "A password reset link has been sent to your email address.");
      // console.log("Here");
      return res.redirect("/login");
    }

    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token before storing (security best practice)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Store token and expiry in database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.fullname || 'User'},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #e74c3c; font-weight: bold;">⏰ This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    // console.log("Here");
    req.flash("success", "A password reset link has been sent to your email address.");
    res.redirect("/login");

  } catch (error) {
    console.error("Password reset error:", error);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/forgot");
  }
});


router.get("/reset-password/:token", async function (req, res) {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await usermodel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/forgot");
    }

    res.render("reset-password", { token: req.params.token });
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong.");
    res.redirect("/forgot");
  }
});

router.post("/reset-password/:token", async function (req, res) {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await usermodel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("forgot");
    }

    // Validate password
    if (!req.body.password || req.body.password.length < 6) {
      req.flash("error", "Password must be at least 6 characters long.");
      return res.redirect(`/reset-password/${req.params.token}`);
    }

    // Check if passwords match
    if (req.body.password !== req.body.confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect(`/reset-password/${req.params.token}`);
    }

    // Hash new password
    user.password = await bcrypt.hash(req.body.password, 10);
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash("success", "Password has been reset successfully. Please login.");
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong.");
    res.redirect("forgot");
  }
});

router.post('/togglewishlist/:id', isloggedin, async (req, res) => {
    try {
        let user = await usermodel.findOne({ email: req.user.email });
        
        // Check if product is already in wishlist
        const productIndex = user.wishlist.findIndex(item => item.toString() === req.params.id);
        
        if (productIndex !== -1) {
            // Product exists, remove it
            user.wishlist.splice(productIndex, 1);
            await user.save();
            req.flash('success', 'Product removed from wishlist');
        } else {
            // Product doesn't exist, add it
            user.wishlist.push(req.params.id);
            await user.save();
            req.flash('success', 'Product added to wishlist');
        }
        
        res.redirect('/shop');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong');
        res.redirect('/shop');
    }
});



module.exports = router;  
