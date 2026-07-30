const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/user_model');
const Product = require('../../models/product_model');
const Cart = require('../../models/cart_model');
const Order = require('../../models/order');

// Helper: create authenticated user and return cookie
async function createAuthUser(email) {
  const hash = await bcrypt.hash('testpass123', 10);
  const user = await User.create({
    fullname: 'Order Tester',
    email: email || `order-${Date.now()}@test.com`,
    password: hash
  });
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET
  );
  return { user, cookie: `token=${token}` };
}

// Helper: create product and add to user's cart
async function setupCartWithProduct(userId, cookie) {
  const product = await Product.create({
    name: 'Order Test Product',
    price: 500,
    stock: 10,
    category: 'Electronics',
    discount: 0
  });

  // Add to cart via API
  await request(app)
    .post(`/api/cart/add/${product._id}`)
    .set('Cookie', [cookie]);

  return product;
}

describe('Orders API Endpoints', () => {

  // ==================== AUTH GUARD ====================
  describe('Orders — Authentication Required', () => {
    it('GET /api/orders should return 401 without auth', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });

    it('POST /api/orders/place should return 401 without auth', async () => {
      const res = await request(app)
        .post('/api/orders/place')
        .send({ address: '123 St', city: 'Mumbai', state: 'MH', pincode: '400001' });
      expect(res.status).toBe(401);
    });
  });

  // ==================== PLACE ORDER ====================
  describe('POST /api/orders/place', () => {
    it('should place an order successfully with items in cart', async () => {
      const { user, cookie } = await createAuthUser();
      await setupCartWithProduct(user._id, cookie);

      const res = await request(app)
        .post('/api/orders/place')
        .set('Cookie', [cookie])
        .send({
          address: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          paymentMethod: 'COD'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Order placed');
    });

    it('should decrement product stock after order', async () => {
      const { user, cookie } = await createAuthUser();
      const product = await setupCartWithProduct(user._id, cookie);

      const stockBefore = product.stock;

      await request(app)
        .post('/api/orders/place')
        .set('Cookie', [cookie])
        .send({
          address: '123 Street',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          paymentMethod: 'COD'
        });

      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stock).toBe(stockBefore - 1);
    });

    it('should clear the cart after placing order', async () => {
      const { user, cookie } = await createAuthUser();
      await setupCartWithProduct(user._id, cookie);

      await request(app)
        .post('/api/orders/place')
        .set('Cookie', [cookie])
        .send({
          address: '123 Street',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          paymentMethod: 'COD'
        });

      const cart = await Cart.findOne({ userId: user._id });
      expect(cart.items).toHaveLength(0);
    });

    it('should reject order with empty cart', async () => {
      const { cookie } = await createAuthUser();

      const res = await request(app)
        .post('/api/orders/place')
        .set('Cookie', [cookie])
        .send({
          address: '123 Street',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          paymentMethod: 'COD'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('empty');
    });

    it('should set correct payment status for COD', async () => {
      const { user, cookie } = await createAuthUser();
      await setupCartWithProduct(user._id, cookie);

      await request(app)
        .post('/api/orders/place')
        .set('Cookie', [cookie])
        .send({
          address: '123 Street',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          paymentMethod: 'COD'
        });

      const order = await Order.findOne({ user: user._id });
      expect(order.paymentStatus).toBe('Pending');
      expect(order.orderStatus).toBe('Placed');
    });
  });

  // ==================== GET ORDERS ====================
  describe('GET /api/orders', () => {
    it('should return empty array for user with no orders', async () => {
      const { cookie } = await createAuthUser();

      const res = await request(app)
        .get('/api/orders')
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.orders).toEqual([]);
    });

    it('should return user orders sorted by newest first', async () => {
      const { user, cookie } = await createAuthUser();

      // Create two orders directly in DB
      await Order.create({
        user: user._id,
        items: [{ name: 'First Order', price: 100, quantity: 1 }],
        totalAmount: 100,
        orderStatus: 'Placed',
        paymentStatus: 'Pending',
        shippingAddress: { address: 'A', city: 'B', state: 'C', pincode: '123' }
      });

      await Order.create({
        user: user._id,
        items: [{ name: 'Second Order', price: 200, quantity: 1 }],
        totalAmount: 200,
        orderStatus: 'Placed',
        paymentStatus: 'Paid',
        shippingAddress: { address: 'D', city: 'E', state: 'F', pincode: '456' }
      });

      const res = await request(app)
        .get('/api/orders')
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(2);
      // Newest first
      expect(res.body.orders[0].totalAmount).toBe(200);
    });
  });

  // ==================== CANCEL ORDER ====================
  describe('POST /api/orders/cancel/:id', () => {
    it('should cancel a placed order', async () => {
      const { user, cookie } = await createAuthUser();
      const product = await Product.create({
        name: 'Cancel Test',
        price: 500,
        stock: 5
      });

      const order = await Order.create({
        user: user._id,
        items: [{ product: product._id, name: 'Cancel Test', price: 500, quantity: 1 }],
        totalAmount: 500,
        orderStatus: 'Placed',
        paymentStatus: 'Pending',
        shippingAddress: { address: 'X', city: 'Y', state: 'Z', pincode: '000' }
      });

      const res = await request(app)
        .post(`/api/orders/cancel/${order._id}`)
        .set('Cookie', [cookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cancelled = await Order.findById(order._id);
      expect(cancelled.orderStatus).toBe('Cancelled');
    });

    it('should restore stock when order is cancelled', async () => {
      const { user, cookie } = await createAuthUser();
      const product = await Product.create({
        name: 'Stock Restore Test',
        price: 500,
        stock: 5
      });

      const order = await Order.create({
        user: user._id,
        items: [{ product: product._id, name: 'Stock Restore Test', price: 500, quantity: 2 }],
        totalAmount: 1000,
        orderStatus: 'Placed',
        paymentStatus: 'Pending',
        shippingAddress: { address: 'X', city: 'Y', state: 'Z', pincode: '000' }
      });

      await request(app)
        .post(`/api/orders/cancel/${order._id}`)
        .set('Cookie', [cookie]);

      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stock).toBe(7); // 5 + 2 restored
    });
  });
});
