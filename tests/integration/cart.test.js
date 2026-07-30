const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/user_model');
const Product = require('../../models/product_model');
const Cart = require('../../models/cart_model');

// Helper: create authenticated user and return cookie
async function createAuthUser(email) {
  const hash = await bcrypt.hash('testpass123', 10);
  const user = await User.create({
    fullname: 'Cart Tester',
    email: email || `cart-${Date.now()}@test.com`,
    password: hash
  });
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET
  );
  return { user, cookie: `token=${token}` };
}

// Helper: create a test product
async function createProduct(overrides = {}) {
  return Product.create({
    name: 'Test Product',
    price: 999,
    stock: 10,
    category: 'Electronics',
    ...overrides
  });
}

describe('Cart API Endpoints', () => {

  // ==================== AUTH GUARD ====================
  describe('Cart — Authentication Required', () => {
    it('GET /api/cart should return 401 without auth', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
    });

    it('POST /api/cart/add/:id should return 401 without auth', async () => {
      const productId = new mongoose.Types.ObjectId();
      const res = await request(app).post(`/api/cart/add/${productId}`);
      expect(res.status).toBe(401);
    });
  });

  // ==================== ADD TO CART ====================
  describe('POST /api/cart/add/:productId', () => {
    it('should add a product to cart', async () => {
      const { cookie } = await createAuthUser();
      const product = await createProduct();

      const res = await request(app)
        .post(`/api/cart/add/${product._id}`)
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Cart');
    });

    it('should increment quantity when adding same product again', async () => {
      const { user, cookie } = await createAuthUser();
      const product = await createProduct();

      // Add twice
      await request(app)
        .post(`/api/cart/add/${product._id}`)
        .set('Cookie', [cookie]);
      await request(app)
        .post(`/api/cart/add/${product._id}`)
        .set('Cookie', [cookie]);

      const cart = await Cart.findOne({ userId: user._id });
      const item = cart.items.find(i => i.productId.toString() === product._id.toString());
      expect(item.quantity).toBe(2);
    });

    it('should reject out-of-stock product', async () => {
      const { cookie } = await createAuthUser();
      const product = await createProduct({ stock: 0 });

      const res = await request(app)
        .post(`/api/cart/add/${product._id}`)
        .set('Cookie', [cookie]);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('out of stock');
    });

    it('should reject when quantity exceeds stock', async () => {
      const { cookie } = await createAuthUser();
      const product = await createProduct({ stock: 1 });

      // First add succeeds
      await request(app)
        .post(`/api/cart/add/${product._id}`)
        .set('Cookie', [cookie]);

      // Second add exceeds stock
      const res = await request(app)
        .post(`/api/cart/add/${product._id}`)
        .set('Cookie', [cookie]);

      expect(res.status).toBe(400);
    });
  });

  // ==================== GET CART ====================
  describe('GET /api/cart', () => {
    it('should return empty cart for new user', async () => {
      const { cookie } = await createAuthUser();

      const res = await request(app)
        .get('/api/cart')
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });

    it('should return cart items with product details', async () => {
      const { user, cookie } = await createAuthUser();
      const product = await createProduct({ name: 'Cart Item Product' });

      // Add to cart
      await request(app)
        .post(`/api/cart/add/${product._id}`)
        .set('Cookie', [cookie]);

      const res = await request(app)
        .get('/api/cart')
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].productId.name).toBe('Cart Item Product');
      expect(res.body.items[0].quantity).toBe(1);
    });
  });

  // ==================== INCREASE / DECREASE ====================
  describe('POST /api/cart/increase/:productId', () => {
    it('should increase item quantity', async () => {
      const { user, cookie } = await createAuthUser();
      const product = await createProduct({ stock: 10 });

      await request(app)
        .post(`/api/cart/add/${product._id}`)
        .set('Cookie', [cookie]);

      const res = await request(app)
        .post(`/api/cart/increase/${product._id}`)
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cart = await Cart.findOne({ userId: user._id });
      const item = cart.items.find(i => i.productId.toString() === product._id.toString());
      expect(item.quantity).toBe(2);
    });
  });

  describe('POST /api/cart/decrease/:productId', () => {
    it('should decrease item quantity', async () => {
      const { user, cookie } = await createAuthUser();
      const product = await createProduct({ stock: 10 });

      // Add and increase to qty 2
      await request(app).post(`/api/cart/add/${product._id}`).set('Cookie', [cookie]);
      await request(app).post(`/api/cart/increase/${product._id}`).set('Cookie', [cookie]);

      // Decrease back to 1
      const res = await request(app)
        .post(`/api/cart/decrease/${product._id}`)
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      const cart = await Cart.findOne({ userId: user._id });
      const item = cart.items.find(i => i.productId.toString() === product._id.toString());
      expect(item.quantity).toBe(1);
    });

    it('should remove item when quantity reaches 0', async () => {
      const { user, cookie } = await createAuthUser();
      const product = await createProduct({ stock: 10 });

      await request(app).post(`/api/cart/add/${product._id}`).set('Cookie', [cookie]);
      
      // Decrease from 1 to 0 = removal
      const res = await request(app)
        .post(`/api/cart/decrease/${product._id}`)
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      const cart = await Cart.findOne({ userId: user._id });
      expect(cart.items).toHaveLength(0);
    });
  });

  // ==================== REMOVE FROM CART ====================
  describe('POST /api/cart/remove/:productId', () => {
    it('should remove an item from cart', async () => {
      const { user, cookie } = await createAuthUser();
      const product = await createProduct();

      await request(app).post(`/api/cart/add/${product._id}`).set('Cookie', [cookie]);

      const res = await request(app)
        .post(`/api/cart/remove/${product._id}`)
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cart = await Cart.findOne({ userId: user._id });
      expect(cart.items).toHaveLength(0);
    });
  });
});
