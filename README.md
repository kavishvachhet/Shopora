# Shopora 🛍️

[![CI/CD Pipeline](https://github.com/kavishvachhet/Shopora/actions/workflows/ci.yml/badge.svg)](https://github.com/kavishvachhet/Shopora/actions/workflows/ci.yml)

Shopora is a premium, enterprise-ready full-stack e-commerce platform. Originally built as a monolithic EJS application, Shopora has been completely re-architected into a modern, decoupled React application backed by a high-performance Express API, Redis caching, and PM2 clustering.

## 🚀 Enterprise-Grade Performance & Scalability

Shopora is engineered to handle massive concurrent traffic, proven by rigorous load testing:

- **High-Speed Redis Caching**: Integrated a Dockerized Redis instance for server-side caching of the product catalog. Intelligent cache invalidation ensures data consistency, reducing API latency drastically.
- **PM2 Clustering**: Utilizes Node.js cluster mode via PM2 to leverage all available CPU cores. This acts as a local load balancer, enabling the backend to handle peaks of **nearly 1,000 requests per second** during stress tests.
- **MongoDB Indexing**: Strategic indexing on Mongoose schemas (e.g., `price`, `createdAt`, `category`) translates slow database collection scans into instant index scans.
- **Server-Side Pagination & Search**: Efficiently processes thousands of products with cursor-based pagination and debounced regex searching to minimize database and network overhead.
- **Cloudinary CDN**: Migrated from local disk storage (Multer) to Cloudinary for optimized, lightning-fast image delivery and bandwidth reduction.
- **Progressive UI/UX**: Custom CSS shimmer skeleton loaders guarantee non-blocking, fluid UI transitions.
- **Automated CI/CD Pipeline**: Parallel GitHub Actions workflow with 88 Jest backend tests, 22 Vitest frontend tests, and production Vite compilation verification on Node 20.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [React Router 7](https://reactrouter.com/)
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Caching & Scale**: [Redis](https://redis.io/) (via Docker) & [PM2](https://pm2.keymetrics.io/)
- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **Authentication**: JWT (JSON Web Tokens), bcrypt
- **Email Delivery**: Nodemailer (via STARTTLS)
- **CI/CD & Testing**: [GitHub Actions](https://github.com/features/actions), [Jest](https://jestjs.io/), [Vitest](https://vitest.dev/), [Supertest](https://github.com/ladjs/supertest), [Husky](https://typicode.github.io/husky/)

## ✨ Key Features

- **Intelligent Search & Filter**: Real-time product searching and multi-attribute filtering (Category, Price, Recency).
- **Secure Authentication**: Multi-role authentication (Owner/User) with protected HTTP-only cookies and bcrypt password hashing.
- **Advanced Owner Admin Panel**:
  - Full CRUD inventory management.
  - Comprehensive Order Management with visual timeline tracking and stock auto-restoration.
  - Customer Management Panel for calculating lifetime value and managing user bans.
  - Centralized Review Moderation.
- **Customer Experience**: 
  - Dynamic Product Reviews and 5-Star Ratings engine.
  - Robust persistent Wishlist and Cart synchronization.
  - Content-Based "You Might Also Like" Recommendation Engine.
  - Deep Account Management (profile editing, password resets).
- **Checkout & Fulfillment**: Razorpay Integration with server-side cryptographic signature verification and automated transactional emails via Nodemailer.

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Docker Desktop (for Redis)
- Cloudinary Account (for image uploads)
- PM2 (Install globally: `npm install -g pm2`)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/kavishvachhet/Shopora.git
   ```
2. Install root dependencies:
   ```bash
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```
4. Set up environment variables in a `.env` file:
   ```env
   MONGO_DB_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   SESSION_SECRET=your_session_secret
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   ```

### Running the App (Production & Docker)

Shopora uses **Docker Compose** for a seamless, "one-click" development and production environment. The provided `docker-compose.yml` automatically orchestrates MongoDB, Redis, the Node.js backend (using PM2), and the Vite React frontend.

1. **Start the Entire Enterprise Stack**:
   ```bash
   docker-compose up --build
   ```

2. **Access the App**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

*(To stop the cluster, press `Ctrl+C` and then run `docker-compose down`)*

## 🧪 Automated Testing & CI/CD

Shopora includes an enterprise-grade automated testing suite and multi-stage CI/CD pipeline.

### Running Tests Locally

```bash
# Run all backend unit & integration tests (Jest + mongodb-memory-server)
npm test

# Run backend tests with code coverage report
npm run test:ci

# Run all React client component tests (Vitest + React Testing Library)
cd client && npm test

# Run client tests with code coverage report
cd client && npm run test:ci

# Run full pre-commit verification (lint + tests)
npm run precommit
```

### 🔄 CI Pipeline Stages

Every `git push` or `pull_request` to `main` triggers a high-performance parallel GitHub Actions workflow:

```
┌────────────────────────────────┐       ┌────────────────────────────────┐
│   🧪 1. Backend Tests          │  AND  │   🎨 2. Frontend Tests & Build │
│   (88 Unit & Integration Tests)│       │   (22 React Tests + Vite Build)│
└────────────────────────────────┘       └────────────────────────────────┘
```

1. **Backend Tests**: Executes 88 unit and integration test cases using Jest, Supertest, and an in-memory MongoDB server (`mongodb-memory-server`) on Node 20.
2. **Frontend Tests & Build**: Executes 22 Vitest React component tests and verifies production Vite bundle compilation.

### 🛡️ Pre-Push Git Hook (Husky)

A local pre-push hook is configured via Husky. Attempting to `git push` broken code will automatically trigger linting and test suites locally, blocking the push if any test fails.

---
Built by [Kavish Vachheta](https://github.com/kavishvachhet)
