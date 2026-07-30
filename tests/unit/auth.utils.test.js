const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ==================== JWT TESTS ====================
describe('JWT Token Utils', () => {
  const SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-ci-cd';

  it('should generate a valid JWT token', () => {
    const payload = { email: 'test@example.com', id: '12345' };
    const token = jwt.sign(payload, SECRET);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should verify a valid token and return payload', () => {
    const payload = { email: 'test@example.com', id: '12345' };
    const token = jwt.sign(payload, SECRET);
    const decoded = jwt.verify(token, SECRET);

    expect(decoded.email).toBe('test@example.com');
    expect(decoded.id).toBe('12345');
  });

  it('should reject a token signed with wrong secret', () => {
    const token = jwt.sign({ email: 'test@example.com' }, 'wrong-secret');

    expect(() => {
      jwt.verify(token, SECRET);
    }).toThrow(jwt.JsonWebTokenError);
  });

  it('should reject an expired token', () => {
    const token = jwt.sign(
      { email: 'test@example.com' },
      SECRET,
      { expiresIn: '0s' } // Already expired
    );

    // Small delay to ensure expiration
    expect(() => {
      jwt.verify(token, SECRET);
    }).toThrow(jwt.TokenExpiredError);
  });

  it('should respect expiresIn option', () => {
    const token = jwt.sign(
      { email: 'test@example.com' },
      SECRET,
      { expiresIn: '1h' }
    );

    const decoded = jwt.verify(token, SECRET);
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp - decoded.iat).toBe(3600); // 1 hour in seconds
  });

  it('should reject a malformed token', () => {
    expect(() => {
      jwt.verify('not.a.valid.token.at.all', SECRET);
    }).toThrow();
  });
});

// ==================== BCRYPT TESTS ====================
describe('Bcrypt Hash Utils', () => {
  it('should hash a password', async () => {
    const password = 'mySecurePassword123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are ~60 chars
  });

  it('should verify correct password against hash', async () => {
    const password = 'correctPassword';
    const hash = await bcrypt.hash(password, 10);

    const isMatch = await bcrypt.compare(password, hash);
    expect(isMatch).toBe(true);
  });

  it('should reject incorrect password against hash', async () => {
    const password = 'correctPassword';
    const hash = await bcrypt.hash(password, 10);

    const isMatch = await bcrypt.compare('wrongPassword', hash);
    expect(isMatch).toBe(false);
  });

  it('should produce different hashes for same password (due to salt)', async () => {
    const password = 'samePassword';
    const hash1 = await bcrypt.hash(password, 10);
    const hash2 = await bcrypt.hash(password, 10);

    expect(hash1).not.toBe(hash2); // Different salts = different hashes
    
    // But both should verify against the original
    expect(await bcrypt.compare(password, hash1)).toBe(true);
    expect(await bcrypt.compare(password, hash2)).toBe(true);
  });

  it('should handle empty string password', async () => {
    const hash = await bcrypt.hash('', 10);
    expect(await bcrypt.compare('', hash)).toBe(true);
    expect(await bcrypt.compare('notempty', hash)).toBe(false);
  });
});
