const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import models
const User = require('../../models/user_model');
const Product = require('../../models/product_model');
const Order = require('../../models/order');
const Review = require('../../models/review_model');
const Cart = require('../../models/cart_model');
const Owner = require('../../models/owners_model');
const Wishlist = require('../../models/wishlist');

// ==================== USER MODEL ====================
describe('User Model', () => {
  it('should create a user successfully', async () => {
    const userData = {
      fullname: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123'
    };
    const user = await User.create(userData);
    
    expect(user._id).toBeDefined();
    expect(user.fullname).toBe('Test User');
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('hashedpassword123');
  });

  it('should have default values for cart, wishlist, orders', async () => {
    const user = await User.create({
      fullname: 'Default User',
      email: 'default@example.com',
      password: 'pass123'
    });
    
    expect(user.cart).toEqual([]);
    expect(user.wishlist).toEqual([]);
    expect(user.orders).toEqual([]);
    expect(user.isBanned).toBe(false);
  });

  it('should have timestamps', async () => {
    const user = await User.create({
      fullname: 'Timestamp User',
      email: 'ts@example.com',
      password: 'pass123'
    });
    
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it('should store resetPasswordToken and resetPasswordExpires', async () => {
    const user = await User.create({
      fullname: 'Reset User',
      email: 'reset@example.com',
      password: 'pass123',
      resetPasswordToken: 'abc123token',
      resetPasswordExpires: new Date(Date.now() + 3600000)
    });
    
    expect(user.resetPasswordToken).toBe('abc123token');
    expect(user.resetPasswordExpires).toBeDefined();
  });
});

// ==================== PRODUCT MODEL ====================
describe('Product Model', () => {
  it('should create a product successfully', async () => {
    const product = await Product.create({
      name: 'Test Shoe',
      price: 1999,
      description: 'A test shoe',
      category: 'Footwear',
      brand: 'TestBrand',
      stock: 50
    });
    
    expect(product._id).toBeDefined();
    expect(product.name).toBe('Test Shoe');
    expect(product.price).toBe(1999);
    expect(product.stock).toBe(50);
  });

  it('should have correct default values', async () => {
    const product = await Product.create({
      name: 'Minimal Product',
      price: 500
    });
    
    expect(product.discount).toBe(0);
    expect(product.stock).toBe(0);
    expect(product.rating).toBe(0);
    expect(product.numReviews).toBe(0);
  });

  it('should have timestamps', async () => {
    const product = await Product.create({
      name: 'TS Product',
      price: 100
    });
    
    expect(product.createdAt).toBeDefined();
    expect(product.updatedAt).toBeDefined();
  });

  it('should have proper indexes defined', async () => {
    const indexes = await Product.collection.indexes();
    const indexFields = indexes.map(idx => Object.keys(idx.key));
    
    // Check that our custom indexes exist
    expect(indexFields).toEqual(
      expect.arrayContaining([
        expect.arrayContaining(['price']),
        expect.arrayContaining(['createdAt']),
        expect.arrayContaining(['category']),
        expect.arrayContaining(['discount'])
      ])
    );
  });
});

// ==================== ORDER MODEL ====================
describe('Order Model', () => {
  it('should create an order with valid data', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    
    const order = await Order.create({
      user: userId,
      items: [{
        product: productId,
        name: 'Test Product',
        price: 999,
        quantity: 2
      }],
      shippingAddress: {
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      paymentMethod: 'Razorpay',
      totalAmount: 1998
    });
    
    expect(order._id).toBeDefined();
    expect(order.items).toHaveLength(1);
    expect(order.totalAmount).toBe(1998);
    expect(order.orderStatus).toBe('Placed');
    expect(order.paymentStatus).toBe('Pending');
  });

  it('should accept valid order status enums', async () => {
    const validStatuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const userId = new mongoose.Types.ObjectId();
    
    for (const status of validStatuses) {
      const order = await Order.create({
        user: userId,
        items: [],
        totalAmount: 100,
        orderStatus: status
      });
      expect(order.orderStatus).toBe(status);
    }
  });

  it('should reject invalid order status', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    await expect(Order.create({
      user: userId,
      items: [],
      totalAmount: 100,
      orderStatus: 'InvalidStatus'
    })).rejects.toThrow();
  });

  it('should accept valid payment status enums', async () => {
    const validStatuses = ['Pending', 'Paid', 'Failed', 'Refund Pending', 'Refunded'];
    const userId = new mongoose.Types.ObjectId();
    
    for (const status of validStatuses) {
      const order = await Order.create({
        user: userId,
        items: [],
        totalAmount: 100,
        paymentStatus: status
      });
      expect(order.paymentStatus).toBe(status);
    }
  });

  it('should reject invalid payment status', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    await expect(Order.create({
      user: userId,
      items: [],
      totalAmount: 100,
      paymentStatus: 'InvalidPayment'
    })).rejects.toThrow();
  });

  it('should require user field', async () => {
    await expect(Order.create({
      items: [],
      totalAmount: 100
    })).rejects.toThrow();
  });
});

// ==================== REVIEW MODEL ====================
describe('Review Model', () => {
  it('should create a review successfully', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    
    const review = await Review.create({
      user: userId,
      product: productId,
      rating: 4,
      comment: 'Great product!'
    });
    
    expect(review._id).toBeDefined();
    expect(review.rating).toBe(4);
    expect(review.comment).toBe('Great product!');
  });

  it('should require rating between 1 and 5', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    
    // Rating too low
    await expect(Review.create({
      user: userId,
      product: productId,
      rating: 0,
      comment: 'Bad'
    })).rejects.toThrow();
    
    // Rating too high
    await expect(Review.create({
      user: userId,
      product: productId,
      rating: 6,
      comment: 'Too high'
    })).rejects.toThrow();
  });

  it('should require comment', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    
    await expect(Review.create({
      user: userId,
      product: productId,
      rating: 3
    })).rejects.toThrow();
  });

  it('should enforce unique user+product compound index', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    
    await Review.create({
      user: userId,
      product: productId,
      rating: 5,
      comment: 'First review'
    });
    
    // Second review from same user on same product should fail
    await expect(Review.create({
      user: userId,
      product: productId,
      rating: 3,
      comment: 'Duplicate review'
    })).rejects.toThrow();
  });

  it('should have timestamps', async () => {
    const review = await Review.create({
      user: new mongoose.Types.ObjectId(),
      product: new mongoose.Types.ObjectId(),
      rating: 4,
      comment: 'Nice!'
    });
    
    expect(review.createdAt).toBeDefined();
    expect(review.updatedAt).toBeDefined();
  });
});

// ==================== CART MODEL ====================
describe('Cart Model', () => {
  it('should create a cart with items', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    
    const cart = await Cart.create({
      userId: userId,
      items: [{ productId: productId, quantity: 2 }]
    });
    
    expect(cart._id).toBeDefined();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
  });

  it('should default quantity to 1', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    
    const cart = await Cart.create({
      userId: userId,
      items: [{ productId: productId }]
    });
    
    expect(cart.items[0].quantity).toBe(1);
  });

  it('should have createdAt default', async () => {
    const cart = await Cart.create({
      userId: new mongoose.Types.ObjectId(),
      items: []
    });
    
    expect(cart.createdAt).toBeDefined();
  });
});

// ==================== OWNER MODEL ====================
describe('Owner Model', () => {
  it('should create an owner successfully', async () => {
    const owner = await Owner.create({
      fullname: 'Admin Owner',
      email: 'owner@shopora.com',
      password: 'plaintext123'
    });
    
    expect(owner._id).toBeDefined();
    expect(owner.fullname).toBe('Admin Owner');
    expect(owner.email).toBe('owner@shopora.com');
  });

  it('should auto-hash password on save via pre-save hook', async () => {
    const plainPassword = 'mySecretPassword';
    const owner = await Owner.create({
      fullname: 'Hash Test Owner',
      email: 'hashtest@shopora.com',
      password: plainPassword
    });
    
    // Password should be hashed, not plain
    expect(owner.password).not.toBe(plainPassword);
    
    // Verify the hash matches the original
    const isMatch = await bcrypt.compare(plainPassword, owner.password);
    expect(isMatch).toBe(true);
  });

  it('should have default empty product array', async () => {
    const owner = await Owner.create({
      fullname: 'Product Owner',
      email: 'products@shopora.com',
      password: 'pass123'
    });
    
    expect(owner.product).toEqual([]);
  });

  it('should require fullname, email, and password', async () => {
    await expect(Owner.create({})).rejects.toThrow();
    await expect(Owner.create({ fullname: 'Test' })).rejects.toThrow();
    await expect(Owner.create({ fullname: 'Test', email: 'a@b.com' })).rejects.toThrow();
  });
});

// ==================== WISHLIST MODEL ====================
describe('Wishlist Model', () => {
  it('should create a wishlist for a user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId1 = new mongoose.Types.ObjectId();
    const productId2 = new mongoose.Types.ObjectId();
    
    const wishlist = await Wishlist.create({
      user: userId,
      items: [productId1, productId2]
    });
    
    expect(wishlist._id).toBeDefined();
    expect(wishlist.items).toHaveLength(2);
  });

  it('should require user field', async () => {
    await expect(Wishlist.create({
      items: []
    })).rejects.toThrow();
  });
});
