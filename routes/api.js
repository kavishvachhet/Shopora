const express = require("express");
const router = express.Router();
const redisClient = require("../config/redis_connection");
const { uploadToCloudinary } = require("../config/cloudinary");
const productmodel = require("../models/product_model");
const usermodel = require("../models/user_model");
const cartmodel = require("../models/cart_model");
const ownermodel = require("../models/owners_model");
const Order = require("../models/order");
const upload = require("../config/multer-config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const transporter = require("../config/nodemailer");
const Razorpay = require("razorpay");
const {
  sendOwnerNotification,
  sendCustomerConfirmation,
  sendOwnerCancelNotification,
  sendCustomerCancelConfirmation,
} = require("../utils/email_helper");

// --- AUTH MIDDLEWARE (JSON version) ---
async function apiAuth(req, res, next) {
  console.log("🔒 API Auth Check...");
  if (!req.cookies.token) {
    console.log("❌ No Token Found in Cookies");
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);

    // First check user model
    let user = await usermodel.findOne({ email: decoded.email }).select("-password");

    // If not user, check owner model
    if (!user) {
      user = await ownermodel.findOne({ email: decoded.email }).select("-password");
      if (user) {
        req.user = user;
        req.userRole = "owner";
        return next();
      }
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    req.userRole = "user";
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ========== AUTH ==========
router.post("/auth/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const exists = await usermodel.findOne({ email });
    if (exists) return res.status(400).json({ error: "Account already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await usermodel.create({ fullname, email, password: hash });
    const token = jwt.sign({ email, id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.json({ success: true, user: { fullname: user.fullname, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await usermodel.findOne({ email });
    if (!user) return res.status(400).json({ error: "Email or Password Incorrect" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Email or Password Incorrect" });

    const token = jwt.sign({ email, id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.json({ success: true, user: { fullname: user.fullname, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/auth/logout", (req, res) => {
  res.cookie("token", "");
  res.json({ success: true });
});

router.get("/auth/me", apiAuth, async (req, res) => {
  if (req.userRole === "owner") {
    return res.json({
      user: {
        _id: req.user._id,
        fullname: req.user.fullname,
        email: req.user.email,
        role: "owner"
      },
      cartCount: 0,
      loggedin: true
    });
  }

  const user = await usermodel.findOne({ email: req.user.email }).select("-password");
  if (!user) return res.status(404).json({ error: "User not found" });

  const cart = await cartmodel.findOne({ userId: user._id });
  const cartCount = cart ? cart.items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  res.json({
    user: {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      contact: user.contact,
      image: user.image || null,
      wishlist: user.wishlist || [],
      role: "user"
    },
    cartCount,
    loggedin: true,
  });
});

// Helper to clear product cache
const clearProductCache = async () => {
  try {
    const keys = await redisClient.keys('products_*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    // console.log("Failed to clear Redis cache", err);
  }
};

// ========== PRODUCTS ==========
router.get("/products", apiAuth, async (req, res) => {
  try {
    const sortby = req.query.sortby;
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // 1. Create a unique Cache Key
    const cacheKey = `products_${sortby}_${search}_${page}_${limit}`;
    console.log(`🔍 Request received for: ${cacheKey}`);

    try {
      // 2. Check if data is in Redis
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log("⚡ Serving from Redis Cache");
        const user = await usermodel.findOne({ email: req.user.email });
        const parsed = JSON.parse(cachedData);
        // We still need fresh wishlist data for the specific user
        parsed.wishlist = user.wishlist || [];
        return res.json(parsed);
      }
      console.log("❌ Cache Miss: Fetching from MongoDB");
    } catch (redisErr) {
      console.log("Redis Error:", redisErr.message);
    }

    // 3. Build Filter Query (Search)
    let filterQuery = {};
    if (search) {
      filterQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } }
        ]
      };
    }

    let sortOption = {};
    if (sortby === "newest") sortOption = { createdAt: -1 };
    else if (sortby === "price-low") sortOption = { price: 1 };
    else if (sortby === "price-high") sortOption = { price: -1 };

    // 4. Fetch filtered chunk from MongoDB
    const products = await productmodel.find(filterQuery).sort(sortOption).skip(skip).limit(limit);
    const totalProducts = await productmodel.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    const user = await usermodel.findOne({ email: req.user.email });

    const mapped = products.map((p) => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      discount: p.discount,
      bgcolor: p.bgcolor,
      panelcolor: p.panelcolor,
      textcolor: p.textcolor,
      description: p.description,
      stock: p.stock,
      category: p.category,
      subcategory: p.subcategory,
      brand: p.brand,
      rating: p.rating,
      image: p.image || null,
      createdAt: p.createdAt,
    }));

    const response = {
      products: mapped,
      wishlist: user.wishlist || [],
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProducts
    };

    try {
      // 5. Save result to Redis for 5 minutes (300 seconds)
      await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
    } catch (redisErr) {
      // Ignore Redis errors
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/products/discounted", apiAuth, async (req, res) => {
  try {
    const products = await productmodel.find({ discount: { $gt: 0 } }).sort({ createdAt: -1 });
    const user = await usermodel.findOne({ email: req.user.email });

    const mapped = products.map((p) => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      discount: p.discount,
      bgcolor: p.bgcolor,
      panelcolor: p.panelcolor,
      textcolor: p.textcolor,
      image: p.image || null,
      stock: p.stock,
      rating: p.rating,
    }));

    res.json({ products: mapped, wishlist: user.wishlist || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/products/:id", apiAuth, async (req, res) => {
  try {
    const product = await productmodel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        bgcolor: product.bgcolor,
        panelcolor: product.panelcolor,
        textcolor: product.textcolor,
        description: product.description,
        stock: product.stock,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        rating: product.rating,
        image: product.image || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Invalid Product ID" });
  }
});

// ========== CART ==========
router.get("/cart", apiAuth, async (req, res) => {
  try {
    const cart = await cartmodel.findOne({ userId: req.user._id }).populate("items.productId");
    if (!cart || cart.items.length === 0) return res.json({ items: [] });

    const items = cart.items
      .filter((i) => i.productId)
      .map((item) => ({
        productId: {
          _id: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          discount: item.productId.discount || 0,
          bgcolor: item.productId.bgcolor,
          image: item.productId.image || null,
          stock: item.productId.stock,
        },
        quantity: item.quantity,
      }));

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/cart/add/:productId", apiAuth, async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await productmodel.findById(productId);
    if (!product || product.stock <= 0) return res.status(400).json({ error: "Product is out of stock!" });

    let cart = await cartmodel.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new cartmodel({ userId: req.user._id, items: [{ productId, quantity: 1 }] });
    } else {
      const idx = cart.items.findIndex((i) => i.productId.toString() === productId);
      if (idx > -1) {
        if (cart.items[idx].quantity >= product.stock)
          return res.status(400).json({ error: `Only ${product.stock} available` });
        cart.items[idx].quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1 });
      }
    }
    await cart.save();
    res.json({ success: true, message: "Added to Cart!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/cart/increase/:productId", apiAuth, async (req, res) => {
  try {
    const productId = req.params.productId;
    let cart = await cartmodel.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new cartmodel({ userId: req.user._id, items: [] });
    }
    const idx = cart.items.findIndex((i) => i.productId.toString() === productId);
    if (idx === -1) {
      cart.items.push({ productId, quantity: 1 });
    } else {
      const product = await productmodel.findById(productId);
      if (!product || cart.items[idx].quantity >= product.stock)
        return res.status(400).json({ error: "Stock limit reached!" });
      cart.items[idx].quantity += 1;
    }
    await cart.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/cart/decrease/:productId", apiAuth, async (req, res) => {
  try {
    const productId = req.params.productId;
    let cart = await cartmodel.findOne({ userId: req.user._id });
    if (!cart) return res.status(400).json({ error: "Cart not found" });

    const idx = cart.items.findIndex((i) => i.productId.toString() === productId);
    if (idx === -1) return res.status(400).json({ error: "Item not found in cart" });

    if (cart.items[idx].quantity > 1) {
      cart.items[idx].quantity -= 1;
    } else {
      cart.items.splice(idx, 1);
    }
    await cart.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/cart/remove/:productId", apiAuth, async (req, res) => {
  try {
    let cart = await cartmodel.findOne({ userId: req.user._id });
    if (!cart) return res.status(400).json({ error: "Cart not found" });

    cart.items = cart.items.filter((i) => i.productId.toString() !== req.params.productId);
    await cart.save();
    res.json({ success: true, message: "Item removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== WISHLIST ==========
router.get("/wishlist", apiAuth, async (req, res) => {
  try {
    const user = await usermodel.findOne({ email: req.user.email }).populate("wishlist").exec();
    const items = (user.wishlist || []).map((p) => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      discount: p.discount,
      bgcolor: p.bgcolor,
      image: p.image || null,
    }));
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/wishlist/toggle/:id", apiAuth, async (req, res) => {
  try {
    let user = await usermodel.findOne({ email: req.user.email });
    const idx = user.wishlist.findIndex((i) => i.toString() === req.params.id);
    if (idx !== -1) {
      user.wishlist.splice(idx, 1);
      await user.save();
      res.json({ success: true, message: "Removed from wishlist", action: "removed" });
    } else {
      user.wishlist.push(req.params.id);
      await user.save();
      res.json({ success: true, message: "Added to wishlist", action: "added" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/wishlist/remove/:id", apiAuth, async (req, res) => {
  try {
    await usermodel.updateOne({ email: req.user.email }, { $pull: { wishlist: req.params.id } });
    res.json({ success: true, message: "Removed from Wishlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== CHECKOUT & ORDERS ==========
router.get("/checkout", apiAuth, async (req, res) => {
  try {
    const user = await usermodel.findOne({ email: req.user.email });
    const cart = await cartmodel.findOne({ userId: user._id }).populate("items.productId");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ error: "Cart is empty" });

    const validItems = cart.items.filter((i) => i.productId);
    let totalAmount = 0;
    const items = validItems.map((item) => {
      const discount = item.productId.discount || 0;
      const finalPrice = item.productId.price - (item.productId.price * discount) / 100;
      totalAmount += finalPrice * item.quantity;
      return {
        productId: {
          _id: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          discount: item.productId.discount,
          image: item.productId.image || null,
        },
        quantity: item.quantity,
        finalPrice,
      };
    });

    res.json({ items, totalAmount: totalAmount.toFixed(0), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Razorpay Order
router.post("/orders/razorpay/create", apiAuth, async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(req.body.amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).json({ error: "Some error occurred with Razorpay" });

    res.json(order);
  } catch (err) {
    console.error("Razorpay Error:", err);
    res.status(500).json({ error: err.error?.description || err.message || "Razorpay API Error" });
  }
});

// Verify Razorpay Payment Signature
router.post("/orders/razorpay/verify", apiAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ error: "Invalid payment signature" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/orders/place", apiAuth, async (req, res) => {
  try {
    const { address, city, state, pincode, paymentMethod } = req.body;
    const cart = await cartmodel.findOne({ userId: req.user._id }).populate("items.productId");
    if (!cart || !cart.items || cart.items.length === 0)
      return res.status(400).json({ error: "Cart is empty" });

    let totalAmount = 0;
    const orderItems = [];

    for (let item of cart.items) {
      if (!item.productId) continue;
      if (item.productId.stock < item.quantity)
        return res.status(400).json({ error: `Insufficient stock for ${item.productId.name}` });

      const price = item.productId.price || 0;
      const discount = item.productId.discount || 0;
      const finalPrice = price - (price * discount) / 100;
      totalAmount += finalPrice * item.quantity;

      orderItems.push({
        product: item.productId._id,
        name: item.productId.name,
        price: finalPrice,
        quantity: item.quantity,
      });
    }

    if (orderItems.length === 0) return res.status(400).json({ error: "No valid items" });

    const newOrder = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: { address, city, state, pincode },
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Placed",
      totalAmount,
    });

    await newOrder.save();

    for (let item of cart.items) {
      if (item.productId && item.productId._id) {
        await productmodel.findByIdAndUpdate(item.productId._id, { $inc: { stock: -item.quantity } });
      }
    }

    cart.items = [];
    await cart.save();

    const userDetails = { fullname: req.user.fullname, email: req.user.email, contact: req.user.contact };
    sendOwnerNotification(newOrder, userDetails).catch(console.error);
    sendCustomerConfirmation(newOrder, req.user.email, req.user.fullname).catch(console.error);

    res.json({ success: true, message: "Order placed successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/orders", apiAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate("items.product");
    const mapped = orders.map((o) => ({
      _id: o._id,
      items: o.items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.product && i.product.image ? i.product.image : null,
      })),
      shippingAddress: o.shippingAddress,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
    }));
    res.json({ orders: mapped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/orders/cancel/:orderId", apiAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.orderStatus === "Cancelled") return res.status(400).json({ error: "Already cancelled" });
    if (order.orderStatus === "Delivered") return res.status(400).json({ error: "Cannot cancel delivered orders" });
    if (order.orderStatus === "Shipped") return res.status(400).json({ error: "Cannot cancel shipped orders" });

    for (let item of order.items) {
      await productmodel.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();
    if (order.paymentStatus === "Paid") order.paymentStatus = "Refund Pending";
    await order.save();

    const userDetails = { fullname: req.user.fullname, email: req.user.email, contact: req.user.contact };
    sendOwnerCancelNotification(order, userDetails).catch(console.error);
    sendCustomerCancelConfirmation(order, req.user.email, req.user.fullname).catch(console.error);

    res.json({ success: true, message: "Order cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/orders/clear-history", apiAuth, async (req, res) => {
  try {
    const result = await Order.deleteMany({ user: req.user._id, orderStatus: "Cancelled" });
    res.json({ success: true, message: `${result.deletedCount} cancelled order(s) deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ACCOUNT ==========
router.get("/account", apiAuth, async (req, res) => {
  try {
    const user = await usermodel.findOne({ email: req.user.email });
    res.json({
      user: {
        fullname: user.fullname,
        email: user.email,
        contact: user.contact,
        image: user.image || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/account/upload-image", apiAuth, upload.single("image"), async (req, res) => {
  try {
    const user = await usermodel.findOne({ email: req.user.email });
    if (!req.file) return res.status(400).json({ error: "No file selected" });

    // Upload buffer to Cloudinary and get URL
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'shopora_users');

    user.image = imageUrl;
    await user.save();
    res.json({ success: true, image: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/account/remove-image", apiAuth, async (req, res) => {
  try {
    const user = await usermodel.findOne({ email: req.user.email });
    user.image = undefined;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== PASSWORD RESET ==========
router.post("/password/forgot", async (req, res) => {
  try {
    const user = await usermodel.findOne({ email: req.body.email });
    if (!user) return res.json({ success: true, message: "If account exists, reset link sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `<div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:0 auto;">
        <h2>Password Reset</h2>
        <p>Hello ${user.fullname || "User"},</p>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 30px;background:#1a1a2e;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a>
        <p style="color:#e74c3c;font-weight:bold;margin-top:20px;">⏰ Expires in 1 hour.</p>
      </div>`,
    });

    res.json({ success: true, message: "Reset link sent to your email." });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/password/reset/:token", async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await usermodel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ error: "Token invalid or expired" });

    if (!req.body.password || req.body.password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    if (req.body.password !== req.body.confirmPassword)
      return res.status(400).json({ error: "Passwords do not match" });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully." });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ========== OWNER ==========
router.post("/owner/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and Password required" });

    const owner = await ownermodel.findOne({ email });
    if (!owner) return res.status(400).json({ error: "Email or Password Incorrect" });

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(400).json({ error: "Email or Password Incorrect" });

    const token = jwt.sign({ id: owner._id, email: owner.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/owner/products", apiAuth, async (req, res) => {
  if (req.userRole !== "owner") return res.status(403).json({ error: "Forbidden" });
  try {
    const products = await productmodel.find().sort({ createdAt: -1 });
    const mapped = products.map((p) => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      discount: p.discount,
      stock: p.stock,
      category: p.category,
      brand: p.brand,
      bgcolor: p.bgcolor,
      panelcolor: p.panelcolor,
      textcolor: p.textcolor,
      rating: p.rating,
      image: p.image || null,
      createdAt: p.createdAt,
    }));
    res.json({ products: mapped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/owner/products/:id", apiAuth, async (req, res) => {
  if (req.userRole !== "owner") return res.status(403).json({ error: "Forbidden" });
  try {
    const p = await productmodel.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json({
      product: {
        _id: p._id,
        name: p.name,
        price: p.price,
        discount: p.discount,
        description: p.description,
        stock: p.stock,
        category: p.category,
        subcategory: p.subcategory,
        brand: p.brand,
        bgcolor: p.bgcolor,
        panelcolor: p.panelcolor,
        textcolor: p.textcolor,
        rating: p.rating,
        image: p.image || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/owner/products/create", apiAuth, upload.single("image"), async (req, res) => {
  if (req.userRole !== "owner") return res.status(403).json({ error: "Forbidden" });
  try {
    const { name, price, discount, description, stock, category, subcategory, brand, rating } = req.body;
    let { bgcolor, panelcolor, textcolor } = req.body;

    // Provide defaults if not provided to prevent creation failure
    bgcolor = bgcolor || "#faf8f5";
    panelcolor = panelcolor || "#ffffff";
    textcolor = textcolor || "#1a1a2e";

    if (!req.file || !name || !price)
      return res.status(400).json({ error: "Missing required fields (image, name, price)" });

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'shopora_products');
    }

    await productmodel.create({
      image: imageUrl,
      name, price, discount, bgcolor, panelcolor, textcolor, description, stock, category, subcategory, brand, rating,
    });
    
    await clearProductCache();
    res.json({ success: true, message: "Product created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/owner/products/edit/:id", apiAuth, upload.single("image"), async (req, res) => {
  if (req.userRole !== "owner") return res.status(403).json({ error: "Forbidden" });
  try {
    const product = await productmodel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Ensure stock is not negative
    let updatedStock = parseInt(req.body.stock) || 0;
    if (updatedStock < 0) {
      return res.status(400).json({ error: "Stock cannot be negative" });
    }

    Object.assign(product, {
      name: req.body.name,
      price: req.body.price,
      discount: req.body.discount || 0,
      description: req.body.description,
      stock: updatedStock,
      brand: req.body.brand,
      category: req.body.category,
      subcategory: req.body.subcategory,
      bgcolor: req.body.bgcolor,
      panelcolor: req.body.panelcolor,
      textcolor: req.body.textcolor,
      rating: req.body.rating,
    });

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'shopora_products');
      product.image = imageUrl;
    }

    await product.save();
    await clearProductCache();
    res.json({ success: true, message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/owner/products/delete/:id", apiAuth, async (req, res) => {
  if (req.userRole !== "owner") return res.status(403).json({ error: "Forbidden" });
  try {
    await productmodel.findByIdAndDelete(req.params.id);
    await clearProductCache();
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
