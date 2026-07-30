const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/user_model');

describe('Auth API Endpoints', () => {
  
  // ==================== REGISTER ====================
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.fullname).toBe('John Doe');
      expect(res.body.user.email).toBe('john@example.com');
      // Should NOT return password
      expect(res.body.user.password).toBeUndefined();
    });

    it('should set an httpOnly cookie on registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'Cookie User',
          email: 'cookie@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.startsWith('token='))).toBe(true);
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'First User',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      // Second registration with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'Second User',
          email: 'duplicate@example.com',
          password: 'password456'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('already exists');
    });

    it('should hash the password before storing', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'Hash Check',
          email: 'hashcheck@example.com',
          password: 'plaintext123'
        });

      const user = await User.findOne({ email: 'hashcheck@example.com' });
      expect(user.password).not.toBe('plaintext123');
      
      const isMatch = await bcrypt.compare('plaintext123', user.password);
      expect(isMatch).toBe(true);
    });
  });

  // ==================== LOGIN ====================
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      const hash = await bcrypt.hash('correctPassword', 10);
      await User.create({
        fullname: 'Login User',
        email: 'login@example.com',
        password: hash
      });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'correctPassword'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('login@example.com');
    });

    it('should set a cookie on successful login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'correctPassword'
        });

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.startsWith('token='))).toBe(true);
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongPassword'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anyPassword'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should reject banned user login', async () => {
      // Ban the user
      await User.updateOne(
        { email: 'login@example.com' },
        { isBanned: true }
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'correctPassword'
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('banned');
    });
  });

  // ==================== LOGOUT ====================
  describe('GET /api/auth/logout', () => {
    it('should clear the token cookie', async () => {
      const res = await request(app).get('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      // Cookie should be cleared (empty value)
      expect(cookies.some(c => c.startsWith('token=;') || c.includes('token=;'))).toBe(true);
    });
  });

  // ==================== AUTH ME ====================
  describe('GET /api/auth/me', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should return user data when authenticated', async () => {
      // Register first to get a cookie
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          fullname: 'Auth Me User',
          email: 'authme@example.com',
          password: 'password123'
        });

      const cookies = registerRes.headers['set-cookie'];

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.user.fullname).toBe('Auth Me User');
      expect(res.body.user.email).toBe('authme@example.com');
      expect(res.body.loggedin).toBe(true);
      expect(res.body.cartCount).toBeDefined();
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['token=invalid-garbage-token']);

      expect(res.status).toBe(401);
    });
  });
});
