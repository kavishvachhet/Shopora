# Shopora 🛍️

Shopora is a premium, enterprise-ready full-stack e-commerce platform. Originally built as a monolithic EJS application, Shopora has been completely re-architected into a modern, decoupled React application backed by a high-performance Express API, Redis caching, and PM2 clustering.

## 🚀 Enterprise-Grade Performance & Scalability

Shopora is engineered to handle massive concurrent traffic, proven by rigorous load testing:

- **High-Speed Redis Caching**: Integrated a Dockerized Redis instance for server-side caching of the product catalog. Intelligent cache invalidation ensures data consistency, reducing API latency drastically.
- **PM2 Clustering**: Utilizes Node.js cluster mode via PM2 to leverage all available CPU cores. This acts as a local load balancer, enabling the backend to handle peaks of **nearly 1,000 requests per second** during stress tests.
- **MongoDB Indexing**: Strategic indexing on Mongoose schemas (e.g., `price`, `createdAt`, `category`) translates slow database collection scans into instant index scans.
- **Server-Side Pagination & Search**: Efficiently processes thousands of products with cursor-based pagination and debounced regex searching to minimize database and network overhead.
- **Cloudinary CDN**: Migrated from local disk storage (Multer) to Cloudinary for optimized, lightning-fast image delivery and bandwidth reduction.
- **Progressive UI/UX**: Custom CSS shimmer skeleton loaders guarantee non-blocking, fluid UI transitions.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [React Router 7](https://reactrouter.com/)
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Caching & Scale**: [Redis](https://redis.io/) (via Docker) & [PM2](https://pm2.keymetrics.io/)
- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **Authentication**: JWT (JSON Web Tokens), bcrypt
- **Email Delivery**: Nodemailer (via STARTTLS)

## ✨ Key Features

- **Intelligent Search & Filter**: Real-time product searching and multi-attribute filtering (Category, Price, Recency).
- **Owner Dashboard**: Secure, role-based management for inventory and products (Full CRUD).
- **Secure Authentication**: Multi-role authentication (Owner/User) with protected HTTP-only cookies.
- **Razorpay Integration**: Seamless payment processing with server-side cryptographic signature verification.
- **Order Management**: End-to-end checkout flow with automated email confirmations via Nodemailer.
- **Wishlist & Cart**: Persistent, synchronized storage for user shopping preferences.

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

### Running the App (Production/Cluster Mode)

1. **Start Redis Container**:
   ```bash
   docker run -d --name shopora-redis -p 6379:6379 redis
   ```
2. **Start the Backend (PM2 Cluster)**:
   ```bash
   pm2 start app.js -i max --name shopora-api
   ```
3. **Start the Frontend**:
   ```bash
   cd client
   npm run dev
   ```

## 💳 Payment Integration
Shopora is integrated with **Razorpay** for a secure checkout experience.
- **Test Mode**: To test payments, use the [Razorpay Test Card details](https://razorpay.com/docs/payments/payments/test-card-details/).
- **Workflow**: The system creates a unique Razorpay Order, processes the payment on the frontend, and performs a cryptographic signature verification on the backend before finalizing the order.

---
Built with ❤️ by [Kavish Vachheta](https://github.com/kavishvachhet)
