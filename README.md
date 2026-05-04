# Shopora 🛍️

Shopora is a premium, full-stack e-commerce platform designed for a seamless shopping and management experience. This project is currently undergoing a strategic migration from a monolithic EJS-based architecture to a modern, decoupled React frontend with a robust Express API backend.

## 🚀 Vision
The goal of Shopora is to provide owners with powerful inventory management tools while offering customers a fast, responsive, and visually stunning interface.

## 🛠️ Tech Stack
- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [React Router 7](https://reactrouter.com/), [React Icons](https://react-icons.github.io/react-icons/)
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens), bcrypt for password hashing
- **Styling**: Premium CSS3 with focus on responsiveness and modern aesthetics

## ✨ Key Features
- **Owner Dashboard**: Secure management of products (Create, Read, Update, Delete).
- **Product Gallery**: Dynamic product listings with real-time updates.
- **Secure Authentication**: Multi-role authentication (Owner/User) with protected routes.
- **Modern UI/UX**: Clean, minimal design with smooth transitions and micro-animations.
- **API First**: Scalable RESTful API architecture.
- **Razorpay Integration**: Seamless payment processing with server-side signature verification.

## 📁 Project Structure
- `/client`: The React frontend application (Vite-powered).
- `/routes/api.js`: The central hub for all API communications.
- `/models`: Mongoose schemas for Users, Owners, and Products.
- `/controllers`: Logic for handling requests and responses.
- `/config`: Database and environment configurations.

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user status
- `POST /api/password/forgot` - Request password reset
- `POST /api/password/reset/:token` - Reset password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/discounted` - Get products with discounts

### Cart & Wishlist
- `GET /api/cart` - Get user cart
- `POST /api/cart/add/:productId` - Add item to cart
- `POST /api/cart/increase/:productId` - Increase quantity
- `POST /api/cart/decrease/:productId` - Decrease quantity
- `POST /api/cart/remove/:productId` - Remove from cart
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/toggle/:id` - Toggle item in wishlist

### Orders
- `GET /api/orders` - Get order history
- `POST /api/orders/place` - Place new order
- `POST /api/orders/razorpay/create` - Create Razorpay order
- `POST /api/orders/razorpay/verify` - Verify payment signature
- `POST /api/orders/cancel/:orderId` - Cancel order

### Owner (Admin)
- `POST /api/owner/login` - Owner login
- `GET /api/owner/products` - Get all products (Owner view)
- `POST /api/owner/products/create` - Create product (Owner only)
- `POST /api/owner/products/edit/:id` - Update product (Owner only)
- `POST /api/owner/products/delete/:id` - Delete product (Owner only)

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

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
   JWT_KEY=your_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

### Running the App
- **Start the Server**:
  ```bash
  nodemon app.js
  ```
- **Start the Frontend**:
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
