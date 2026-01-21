# HaatGhor eCommerce Backend

A comprehensive, production-ready eCommerce backend built with Node.js, Express, Prisma, and MongoDB. Features include complete product management, cart system, order processing, payment integration (Bkash, Nagad, Stripe, COD), real-time chat, and admin dashboard.

## ✨ Features

### 🔐 Authentication & User Management
- Email/Password authentication with OTP verification
- Google OAuth integration
- JWT-based authentication with refresh tokens
- Role-based access control (User/Admin)
- Password reset functionality
- Email verification

### 🛍️ eCommerce Core Features
- **Product Management**
  - Multiple images per product
  - Product variants (size, color, RAM, storage, etc.)
  - Stock management
  - Product ratings and reviews
  - Featured products
  - Product tags and categories
  
- **Category Management**
  - Hierarchical category structure
  - Category-based filtering
  
- **Shopping Cart**
  - Add/Update/Remove items
  - Auto quantity increase for duplicate products
  - Stock limit validation
  - Real-time price calculation
  
- **Order Management**
  - Order creation from cart
  - Order status tracking (Pending → Paid → Processing → Shipped → Delivered → Cancelled)
  - Order history
  - Admin order management
  
- **Review & Rating System**
  - Verified purchase reviews
  - One review per product per user
  - Rating statistics
  - Review images
  
- **Wishlist**
  - Save products for later
  - Quick add to cart from wishlist
  
- **Address Management**
  - Multiple shipping addresses
  - Default address selection

### 💳 Payment Integration
- **Stripe** - International card payments
- **Bkash** - Bangladesh mobile banking
- **Nagad** - Bangladesh mobile banking
- **Cash on Delivery** - COD option

### 🎨 Banner Management
- Dynamic homepage banners
- Category-specific banners
- Promotional banners

### 📊 Admin Dashboard
- Total users, orders, revenue statistics
- Monthly sales analytics
- Order status breakdown
- Top-selling products
- Recent orders overview
- Low stock alerts

### 🔍 Advanced Search & Filtering
- Full-text search across products
- Filter by:
  - Category
  - Brand
  - Price range
  - Rating
  - Tags
  - Featured status
- Sorting options:
  - Price (ascending/descending)
  - Newest first
  - Top rated
- Pagination support

### 💬 Real-time Chat (Socket.IO)
- Customer support chat
- Admin-customer messaging
- Message history

### 🛡️ Security Features
- Input validation with Zod
- Password hashing with Bcrypt
- JWT authentication
- Rate limiting
- CORS configuration
- Global error handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Installation

1. **Clone and install:**
```bash
npm install
```

2. **Configure environment:**
Create a `.env` file using `env.example.txt` as reference:
```env
DATABASE_URL=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_secret_key
# ... other variables
```

3. **Setup database:**
```bash
npm run pg      # Generate Prisma client
npm run pm      # Run migrations
```

4. **Start server:**
```bash
npm run dev     # Development mode
npm start       # Production mode
```

Server runs on: `http://localhost:5000`

## 📚 Documentation

- **[Complete Setup Guide](./SETUP_GUIDE.md)** - Detailed installation and configuration
- **[API Documentation](./API_DOCUMENTATION.md)** - All API endpoints with examples
- **[Environment Variables](./env.example.txt)** - Required environment variables

## 🗂️ Project Structure

```
haatghor-backend/
├── prisma/                    # Database schemas
│   ├── schema.prisma         # Main Prisma config
│   ├── user.prisma          # User model
│   ├── product.prisma       # Product model
│   ├── cart.prisma          # Cart model
│   ├── order.prisma         # Order model
│   ├── review.prisma        # Review model
│   ├── wishlist.prisma      # Wishlist model
│   ├── address.prisma       # Address model
│   ├── banner.prisma        # Banner model
│   ├── category.prisma      # Category model
│   └── ...                  # Other schemas
├── src/
│   ├── app/
│   │   ├── modules/         # Feature modules
│   │   │   ├── Auth/        # Authentication
│   │   │   ├── AuthByOtp/   # OTP-based auth
│   │   │   ├── User/        # User management
│   │   │   ├── Category/    # Category management
│   │   │   ├── Product/     # Product management
│   │   │   ├── Cart/        # Shopping cart
│   │   │   ├── Order/       # Order management
│   │   │   ├── Review/      # Reviews & ratings
│   │   │   ├── Wishlist/    # Wishlist
│   │   │   ├── Address/     # Address management
│   │   │   ├── Banner/      # Banner management
│   │   │   ├── Admin/       # Admin dashboard
│   │   │   ├── Payment/     # Payment processing
│   │   │   └── ...          # Other modules
│   │   ├── middlewares/     # Express middlewares
│   │   ├── utils/           # Utility functions
│   │   ├── errors/          # Error handling
│   │   ├── interface/       # TypeScript interfaces
│   │   └── routes/          # Route definitions
│   ├── config/              # Configuration
│   ├── app.ts               # Express application
│   └── server.ts            # Server entry point
├── .env                     # Environment variables (create this)
├── env.example.txt          # Environment template
├── package.json
├── tsconfig.json
├── API_DOCUMENTATION.md     # API documentation
├── SETUP_GUIDE.md          # Setup instructions
└── Readme.md               # This file
```

## 🔧 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Prisma ORM
- **Authentication:** JWT, Google OAuth
- **Validation:** Zod
- **Payments:** Stripe, Bkash, Nagad
- **Real-time:** Socket.IO
- **Email:** Nodemailer
- **File Upload:** Digital Ocean Spaces / AWS S3
- **Security:** Bcrypt, CORS, Rate Limiting

## 📦 Available Scripts

```bash
npm run dev              # Start development server
npm run build           # Build for production
npm start               # Start production server
npm run pm              # Run Prisma migrations
npm run pg              # Generate Prisma client
npm run lint:check      # Check linting
npm run lint:fix        # Fix linting issues
npm run prettier:fix    # Format code
```

## 🌐 API Endpoints Overview

### Authentication
- POST `/auth/register` - Register new user
- POST `/auth/login` - User login
- POST `/auth/refresh-token` - Refresh access token
- GET `/auth/google` - Google OAuth
- POST `/auth/forget-password` - Request password reset
- POST `/auth/reset-password` - Reset password

### Products
- GET `/products` - List products with filters
- GET `/products/:id` - Get product details
- POST `/products` - Create product (Admin)
- PUT `/products/:id` - Update product (Admin)
- DELETE `/products/:id` - Delete product (Admin)

### Cart
- POST `/cart/add` - Add to cart
- GET `/cart` - Get user cart
- PUT `/cart/update/:productId` - Update quantity
- DELETE `/cart/remove/:productId` - Remove from cart
- DELETE `/cart/clear` - Clear cart

### Orders
- POST `/orders` - Create order
- GET `/orders/me` - Get user orders
- GET `/orders/:id` - Get order details
- PUT `/orders/admin/:id/status` - Update order status (Admin)

### Reviews
- POST `/reviews` - Create review
- GET `/reviews/product/:productId` - Get product reviews
- PUT `/reviews/:id` - Update review
- DELETE `/reviews/:id` - Delete review

### Admin
- GET `/admin/dashboard/stats` - Dashboard statistics
- GET `/admin/users` - Manage users

See [API Documentation](./API_DOCUMENTATION.md) for complete endpoint list.

## 🔐 Authentication Flow

1. User registers with email/password
2. OTP sent to email for verification
3. User verifies email with OTP
4. User logs in and receives JWT access token
5. Token included in Authorization header for protected routes
6. Refresh token endpoint available for token renewal

**Google OAuth Flow:**
1. GET `/auth/google` - Get OAuth URL
2. User authenticates with Google
3. Callback to `/auth/google/callback`
4. User receives JWT token

## 💰 Payment Flow

### Online Payments (Bkash/Nagad/Stripe)
1. User creates order
2. Payment intent created
3. User redirected to payment gateway
4. Payment verified via webhook
5. Order status updated to PAID
6. Stock reduced, cart cleared

### Cash on Delivery
1. User creates order with COD
2. Order status: PENDING
3. Payment collected on delivery
4. Admin updates to PAID after collection

## 🛡️ Security

- **Authentication:** JWT with secure secret keys
- **Password:** Bcrypt hashing (12 rounds)
- **Validation:** Zod schema validation
- **Rate Limiting:** 100 requests per 15 minutes
- **CORS:** Configured origins only
- **Input Sanitization:** Prevents XSS attacks
- **SQL Injection:** Protected by Prisma ORM

## 🎯 Production Deployment

1. Build the project:
```bash
npm run build
```

2. Set environment variables on hosting platform

3. Run migrations:
```bash
npm run pm
```

4. Start server:
```bash
npm start
```

**Recommended Platforms:**
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

## 📄 License

Proprietary and Confidential

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Status:** Production Ready ✅

Happy Coding! 🚀
