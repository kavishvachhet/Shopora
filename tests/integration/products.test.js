const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/user_model');
const Product = require('../../models/product_model');

// Helper: create a user and return auth cookie
async function createAuthUser(overrides = {}) {
  const hash = await bcrypt.hash('testpass123', 10);
  const user = await User.create({
    fullname: 'Product Tester',
    email: `user-${Date.now()}@test.com`,
    password: hash,
    ...overrides
  });
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET
  );
  return { user, cookie: `token=${token}` };
}

// Helper: seed products
async function seedProducts(count = 5) {
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push({
      name: `Product ${i + 1}`,
      price: (i + 1) * 100,
      description: `Description for product ${i + 1}`,
      category: i % 2 === 0 ? 'Electronics' : 'Clothing',
      brand: `Brand${i + 1}`,
      stock: 10 + i,
      discount: i * 5
    });
  }
  return Product.insertMany(products);
}

describe('Products API Endpoints', () => {

  // ==================== AUTH REQUIRED ====================
  describe('GET /api/products — Authentication', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Cookie', ['token=invalid-token']);
      expect(res.status).toBe(401);
    });
  });

  // ==================== PRODUCT LISTING ====================
  describe('GET /api/products — Listing', () => {
    let authCookie;

    beforeEach(async () => {
      const { cookie } = await createAuthUser();
      authCookie = cookie;
      await seedProducts(15);
    });

    it('should return paginated products (default page 1, limit 12)', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(res.body.products.length).toBeLessThanOrEqual(12);
      expect(res.body.totalPages).toBeDefined();
      expect(res.body.currentPage).toBe(1);
    });

    it('should respect page and limit query params', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=5')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(5);
    });

    it('should return page 2 with remaining products', async () => {
      const res = await request(app)
        .get('/api/products?page=2&limit=10')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(5); // 15 total, 10 on page 1
      expect(res.body.currentPage).toBe(2);
    });
  });

  // ==================== SEARCH ====================
  describe('GET /api/products — Search', () => {
    let authCookie;

    beforeEach(async () => {
      const { cookie } = await createAuthUser();
      authCookie = cookie;
      await Product.create([
        { name: 'Nike Air Max', price: 5000, brand: 'Nike', category: 'Footwear' },
        { name: 'Adidas Ultraboost', price: 6000, brand: 'Adidas', category: 'Footwear' },
        { name: 'Samsung Galaxy', price: 30000, brand: 'Samsung', category: 'Electronics' }
      ]);
    });

    it('should filter products by name search', async () => {
      const res = await request(app)
        .get('/api/products?search=Nike')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].name).toContain('Nike');
    });

    it('should filter products by brand search', async () => {
      const res = await request(app)
        .get('/api/products?search=Samsung')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(1);
    });

    it('should filter products by category search', async () => {
      const res = await request(app)
        .get('/api/products?search=Footwear')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(2);
    });

    it('should return empty for non-matching search', async () => {
      const res = await request(app)
        .get('/api/products?search=NonExistentBrand')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(0);
    });

    it('should be case-insensitive', async () => {
      const res = await request(app)
        .get('/api/products?search=nike')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(1);
    });
  });

  // ==================== SORTING ====================
  describe('GET /api/products — Sorting', () => {
    let authCookie;

    beforeEach(async () => {
      const { cookie } = await createAuthUser();
      authCookie = cookie;
      await Product.create([
        { name: 'Cheap', price: 100 },
        { name: 'Mid', price: 500 },
        { name: 'Expensive', price: 1000 }
      ]);
    });

    it('should sort by price low-to-high', async () => {
      const res = await request(app)
        .get('/api/products?sortby=price-low')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      const prices = res.body.products.map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('should sort by price high-to-low', async () => {
      const res = await request(app)
        .get('/api/products?sortby=price-high')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      const prices = res.body.products.map(p => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it('should sort by newest first', async () => {
      const res = await request(app)
        .get('/api/products?sortby=newest')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      const dates = res.body.products.map(p => new Date(p.createdAt).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });
  });
});
