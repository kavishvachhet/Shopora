const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Set test environment variables before anything else
process.env.JWT_SECRET = 'test-jwt-secret-key-for-ci-cd';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.NODE_ENV = 'test';
process.env.RAZORPAY_KEY_ID = 'rzp_test_dummy';
process.env.RAZORPAY_KEY_SECRET = 'dummy_razorpay_secret';
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY = 'test_api_key';
process.env.CLOUDINARY_API_SECRET = 'test_api_secret';
process.env.EMAIL_USER = 'test@test.com';
process.env.EMAIL_PASS = 'testpass';

// Mock Redis Client
jest.mock('../config/redis_connection', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  setEx: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  keys: jest.fn().mockResolvedValue([]),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  isOpen: true,
  isReady: true
}));

// Mock Cloudinary
jest.mock('../config/cloudinary', () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue({
    secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
    public_id: 'test_image_id'
  })
}));

// Mock Nodemailer
jest.mock('../config/nodemailer', () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
}));

// Mock Email Helpers
jest.mock('../utils/email_helper', () => ({
  sendOwnerNotification: jest.fn().mockResolvedValue(undefined),
  sendCustomerConfirmation: jest.fn().mockResolvedValue(undefined),
  sendOwnerCancelNotification: jest.fn().mockResolvedValue(undefined),
  sendCustomerCancelConfirmation: jest.fn().mockResolvedValue(undefined)
}));

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
