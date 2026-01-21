# HaatGhor eCommerce Backend - Setup Guide

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn package manager

## 🚀 Installation Steps

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory. Use `env.example.txt` as reference:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
BASE_URL_SERVER=http://localhost:5000
BASE_URL_CLIENT=http://localhost:3000
WEBSITE_IDENTIFIER=haatghor

# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/haatghor?retryWrites=true&w=majority

# JWT Configuration
JWT_ACCESS_SECRET=your_complex_secret_key_here_minimum_32_characters
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here_minimum_32_characters
JWT_REFRESH_EXPIRES_IN=30d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Super Admin (Initial setup)
SUPER_ADMIN_PASSWORD=your_strong_admin_password

# Email Configuration (Gmail)
MAIL=your-email@gmail.com
MAIL_PASS=your-app-specific-password

# Image Upload - Digital Ocean Spaces
DO_SPACE_ENDPOINT=https://sgp1.digitaloceanspaces.com
DO_SPACE_ACCESS_KEY=your_do_access_key
DO_SPACE_SECRET_KEY=your_do_secret_key
DO_SPACE_BUCKET=your_bucket_name

# Stripe Payment (Optional)
STRIPE_PUBLISHED_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK=whsec_your_webhook_secret

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Bkash Payment (Bangladesh - Optional)
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password

# Nagad Payment (Bangladesh - Optional)
NAGAD_BASE_URL=http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs
NAGAD_MERCHANT_ID=your_merchant_id
NAGAD_MERCHANT_NUMBER=your_merchant_number
NAGAD_PUBLIC_KEY=your_public_key
NAGAD_PRIVATE_KEY=your_private_key
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run pg

# Run database migrations
npm run pm
```

This will:
- Generate Prisma client types
- Create all database collections
- Seed super admin account

### 4. Start Development Server

```bash
# Development mode with auto-reload
npm run dev

# Production build
npm run build

# Start production server
npm start
```

Server will run on: `http://localhost:5000`

---

## 📧 Email Configuration (Gmail)

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate App Password:
   - Go to Security → App Passwords
   - Select "Mail" and your device
   - Copy the generated 16-character password
4. Use this password in `MAIL_PASS` environment variable

---

## 🗄️ MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier available)
3. Create database user with password
4. Whitelist IP address (or use 0.0.0.0/0 for all IPs)
5. Get connection string and update `DATABASE_URL`

---

## 🖼️ Image Upload - Digital Ocean Spaces Setup

1. Create Digital Ocean account
2. Create a Space (like AWS S3)
3. Generate API keys (Access Key & Secret Key)
4. Update environment variables
5. Set Space permissions to public read

**Alternative:** You can modify the code to use AWS S3, Cloudinary, or local storage.

---

## 💳 Payment Gateway Setup

### Stripe (International)
1. Create account at [Stripe](https://stripe.com)
2. Get API keys from Dashboard → Developers → API Keys
3. Use test keys for development

### Bkash (Bangladesh)
1. Register as merchant at [Bkash Merchant](https://merchant.bka.sh)
2. Get API credentials from developer portal
3. Use sandbox URL for testing

### Nagad (Bangladesh)
1. Apply for merchant account
2. Get API credentials
3. Generate RSA keys for secure communication

**Note:** Cash on Delivery works without any setup.

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/v1/auth/google/callback`
   - Your production callback URL
6. Copy Client ID and Secret

---

## 🧪 Testing the API

### Using Postman

1. Import the API collection (if provided)
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api/v1`
   - `token`: (will be set automatically after login)

### Test Flow

1. **Register User:**
   - POST `/auth/register`
   - Verify email with OTP

2. **Login:**
   - POST `/auth/login`
   - Save the access token

3. **Create Category (Admin):**
   - Login as super admin
   - POST `/categories`

4. **Create Product (Admin):**
   - POST `/products`

5. **Browse Products (Public):**
   - GET `/products`

6. **Add to Cart (User):**
   - POST `/cart/add`

7. **Create Order:**
   - POST `/orders`

---

## 🏗️ Project Structure

```
haatghor-backend/
├── prisma/               # Database schemas
│   ├── schema.prisma    # Main schema
│   ├── user.prisma      # User schema
│   ├── product.prisma   # Product schema
│   └── ...              # Other schemas
├── src/
│   ├── app/
│   │   ├── modules/     # Feature modules
│   │   │   ├── Auth/
│   │   │   ├── Category/
│   │   │   ├── Product/
│   │   │   ├── Cart/
│   │   │   ├── Order/
│   │   │   └── ...
│   │   ├── middlewares/ # Express middlewares
│   │   ├── utils/       # Utility functions
│   │   ├── errors/      # Error handlers
│   │   └── routes/      # Route definitions
│   ├── config/          # Configuration
│   ├── app.ts           # Express app
│   └── server.ts        # Server entry point
├── .env                 # Environment variables
├── package.json
└── tsconfig.json
```

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build           # Build TypeScript to JavaScript
npm start               # Start production server

# Database
npm run pm              # Run Prisma migrations
npm run pg              # Generate Prisma client

# Code Quality
npm run lint:check      # Check linting errors
npm run lint:fix        # Fix linting errors
npm run prettier:check  # Check code formatting
npm run prettier:fix    # Fix code formatting
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Added to `.gitignore`
2. **Use strong JWT secrets** - Minimum 32 characters
3. **Enable CORS properly** - Update allowed origins in `app.ts`
4. **Rate limiting** - Implemented for all routes
5. **Input validation** - Zod validation on all inputs
6. **Password hashing** - Bcrypt with 12 rounds
7. **SQL Injection prevention** - Prisma ORM handles this
8. **XSS prevention** - Input sanitization

---

## 🐛 Troubleshooting

### Database Connection Error
- Check MongoDB Atlas IP whitelist
- Verify DATABASE_URL format
- Ensure network connectivity

### Prisma Errors
```bash
# Clear Prisma cache
npx prisma generate --force

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Email Sending Issues
- Verify Gmail App Password
- Check "Less secure app access" (deprecated, use App Password)
- Ensure 2FA is enabled on Google account

### Port Already in Use
```bash
# Kill process on port 5000 (Unix/Mac)
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 🤝 Support

For issues and questions:
1. Check API Documentation
2. Review error logs in console
3. Check environment variables

---

## 📄 License

This project is proprietary and confidential.

---

## 🎉 You're All Set!

The backend is now ready for development. Access the API at:
- Local: `http://localhost:5000/api/v1`
- Health Check: `http://localhost:5000/`

Happy Coding! 🚀
