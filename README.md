# Shopora 🛍️

A full-featured e-commerce application that provides a seamless shopping experience for customers and comprehensive product management for store owners.

## Features

### Customer Features
- **User Authentication**: Secure login system required before placing orders
- **Product Browsing**: Browse through available products with detailed information
- **Product Details Page**: View comprehensive product information including price, description, and specifications
- **Shopping Cart**: Add products to cart and manage quantities before checkout
- **Wishlist**: Save products for later purchase
- **Order Management**: 
  - Complete checkout with total billing breakdown
  - View discount calculations and final amount
  - Track order history with detailed order lists
- **Email Notifications**: Receive order confirmation emails after successful purchase
- **Password Recovery**: Reset forgotten passwords through email verification

### Owner Features
- **Admin Authentication**: Secure login portal for store owners
- **Product Management**: Full CRUD operations
  - Create new products
  - Read/view product details
  - Update existing products
  - Delete products from inventory
- **Order Notifications**: Receive email alerts when customers place orders
- **Password Recovery**: Reset forgotten admin passwords

## Technology Stack

*Add your tech stack here, for example:*
- **Frontend**: React.js / Angular / Vue.js
- **Backend**: Node.js / Python / Java
- **Database**: MongoDB / MySQL / PostgreSQL
- **Authentication**: JWT / OAuth
- **Email Service**: SendGrid / Nodemailer

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Database (MongoDB/MySQL/PostgreSQL)

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/shopora.git
cd shopora
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

4. Run database migrations
```bash
npm run migrate
```

5. Start the application
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Customer Flow
1. Register or login to your account
2. Browse products and view detailed information
3. Add desired products to cart or wishlist
4. Proceed to checkout and review total billing
5. Place order and receive confirmation email
6. Track orders in order history

### Owner Flow
1. Login to admin dashboard
2. Add new products with details and pricing
3. Update or remove existing products
4. Monitor orders and receive email notifications
5. Manage inventory and product listings

## Project Structure

```
shopora/
├── client/              # Frontend application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
├── server/              # Backend application
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── config/          # Configuration files
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Owner only)
- `PUT /api/products/:id` - Update product (Owner only)
- `DELETE /api/products/:id` - Delete product (Owner only)

### Cart & Wishlist
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist

### Orders
- `POST /api/orders` - Place new order
- `GET /api/orders` - Get order history
- `GET /api/orders/:id` - Get order details

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/shopora](https://github.com/yourusername/shopora)

## Acknowledgments

- Thanks to all contributors
- Inspiration from modern e-commerce platforms
- Built with dedication and care for the best shopping experience

---

Made with ❤️ by [Your Name]
