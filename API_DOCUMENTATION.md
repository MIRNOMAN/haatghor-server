# HaatGhor eCommerce Backend API Documentation

## Base URL
```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication & User Management

### Auth APIs

#### POST /auth/register
Register a new user account.
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+8801712345678",
  "password": "SecurePass123",
  "isAgreeWithTerms": true
}
```

#### POST /auth/login
Login with email and password.
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### POST /auth/verify-email
Verify email with OTP sent to email.
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### POST /auth/resend-verification-otp
Resend verification OTP.
```json
{
  "email": "john@example.com"
}
```

#### POST /auth/refresh-token
Refresh access token (requires authentication).

#### POST /auth/forget-password
Request password reset OTP.
```json
{
  "email": "john@example.com"
}
```

#### POST /auth/verify-forgot-password-otp
Verify forgot password OTP.
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### POST /auth/reset-password
Reset password with reset token.
```json
{
  "email": "john@example.com",
  "newPassword": "NewSecurePass123"
}
```
Headers: `Authorization: <reset_token>`

#### GET /auth/google
Get Google OAuth URL for authentication.

#### GET /auth/google/callback
Google OAuth callback (handled automatically).

---

### User APIs

#### GET /users/me
Get current user profile (requires authentication).

#### PUT /users/me
Update current user profile (requires authentication).
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Software Developer",
  "location": "Dhaka, Bangladesh",
  "profilePhoto": "https://example.com/photo.jpg"
}
```

#### PATCH /auth/change-password
Change user password (requires authentication).
```json
{
  "oldPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

---

### Admin - User Management

#### GET /admin/users
Get all users (Admin only).
Query params: `?page=1&limit=10&searchTerm=john`

#### GET /admin/users/:id
Get user by ID (Admin only).

#### PUT /admin/users/:id
Update user by ID (Admin only).
```json
{
  "status": "ACTIVE",
  "role": "USER"
}
```

#### DELETE /admin/users/:id
Delete user by ID (Admin only).

---

## 🗂️ Category & Product Management

### Category APIs

#### POST /categories
Create category (Admin only).
```json
{
  "name": "Electronics",
  "description": "Electronic items and gadgets",
  "image": "https://example.com/electronics.jpg"
}
```

#### GET /categories
Get all categories.
Query params: `?searchTerm=electronics&isActive=true&page=1&limit=10`

#### GET /categories/:id
Get category by ID.

#### PUT /categories/:id
Update category (Admin only).
```json
{
  "name": "Electronics & Gadgets",
  "isActive": true
}
```

#### DELETE /categories/:id
Delete category (Admin only).

---

### Product APIs

#### POST /products
Create product (Admin only).
```json
{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced features",
  "categoryId": "category_id_here",
  "brand": "Apple",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "price": 1299.99,
  "discount": 10,
  "stock": 50,
  "variants": [
    {
      "name": "Storage",
      "value": "256GB",
      "price": 0
    },
    {
      "name": "Color",
      "value": "Titanium Blue"
    }
  ],
  "tags": ["smartphone", "5g", "premium"],
  "isFeatured": true
}
```

#### GET /products
Get all products with advanced filtering.
Query params:
- `search=iphone` - Search in name, description, brand
- `category=category_id` - Filter by category
- `brand=Apple` - Filter by brand
- `minPrice=100&maxPrice=2000` - Price range
- `rating=4` - Minimum rating
- `tags=smartphone` - Filter by tag
- `isFeatured=true` - Featured products only
- `sort=price_asc|price_desc|newest|top_rated` - Sorting
- `page=1&limit=20` - Pagination

#### GET /products/:id
Get product by ID with reviews.

#### GET /products/slug/:slug
Get product by slug.

#### PUT /products/:id
Update product (Admin only).
```json
{
  "price": 1199.99,
  "stock": 45,
  "discount": 15
}
```

#### DELETE /products/:id
Delete product (Admin only).

---

## 🛒 Cart System

#### POST /cart/add
Add item to cart (requires authentication).
```json
{
  "productId": "product_id_here",
  "quantity": 2,
  "selectedVariants": [
    {
      "name": "Storage",
      "value": "256GB"
    }
  ]
}
```

#### GET /cart
Get user's cart (requires authentication).

#### PUT /cart/update/:productId
Update cart item quantity (requires authentication).
```json
{
  "quantity": 3
}
```

#### DELETE /cart/remove/:productId
Remove item from cart (requires authentication).

#### DELETE /cart/clear
Clear entire cart (requires authentication).

---

## 📦 Order & Checkout

### Order APIs

#### POST /orders
Create order from cart (requires authentication).
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+8801712345678",
    "email": "john@example.com",
    "address": "123 Main Street",
    "city": "Dhaka",
    "state": "Dhaka",
    "zipCode": "1200",
    "country": "Bangladesh"
  },
  "paymentMethod": "BKASH",
  "notes": "Please deliver during daytime"
}
```

#### GET /orders/me
Get user's orders (requires authentication).
Query params: `?status=PENDING&paymentStatus=SUCCESS&page=1&limit=10`

#### GET /orders/:id
Get order by ID (requires authentication).

---

### Admin Order APIs

#### GET /orders/admin/all
Get all orders (Admin only).
Query params: `?status=PENDING&userId=user_id&searchTerm=ORD&page=1&limit=10`

#### PUT /orders/admin/:id/status
Update order status (Admin only).
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRACK123456"
}
```

Status flow: `PENDING → PAID → PROCESSING → SHIPPED → DELIVERED → CANCELLED`

---

## 💳 Payment Integration

### Payment Methods
- **Bkash** - Mobile banking (Bangladesh)
- **Nagad** - Mobile banking (Bangladesh)
- **Cash on Delivery** - COD
- **Stripe** - International cards

#### POST /payments/create-intent
Create payment intent (Stripe).
```json
{
  "orderId": "order_id_here",
  "amount": 1500
}
```

#### POST /payments/verify
Verify payment status.
```json
{
  "orderId": "order_id_here",
  "paymentId": "payment_id_here"
}
```

---

## ⭐ Review & Rating

#### POST /reviews
Create product review (requires authentication, must have purchased).
```json
{
  "productId": "product_id_here",
  "rating": 5,
  "comment": "Excellent product! Highly recommended.",
  "images": ["https://example.com/review1.jpg"]
}
```

#### GET /reviews/product/:productId
Get product reviews.
Query params: `?rating=5&isVerifiedPurchase=true&page=1&limit=10`

#### GET /reviews/:id
Get review by ID.

#### PUT /reviews/:id
Update own review (requires authentication).
```json
{
  "rating": 4,
  "comment": "Updated review"
}
```

#### DELETE /reviews/:id
Delete own review (requires authentication).

---

## ❤️ Wishlist

#### POST /wishlist/add
Add product to wishlist (requires authentication).
```json
{
  "productId": "product_id_here"
}
```

#### GET /wishlist
Get user's wishlist (requires authentication).

#### DELETE /wishlist/remove/:productId
Remove product from wishlist (requires authentication).

---

## 🚚 Address & Shipping

#### POST /addresses
Create shipping address (requires authentication).
```json
{
  "fullName": "John Doe",
  "phone": "+8801712345678",
  "email": "john@example.com",
  "address": "123 Main Street",
  "city": "Dhaka",
  "state": "Dhaka",
  "zipCode": "1200",
  "country": "Bangladesh",
  "isDefault": true
}
```

#### GET /addresses
Get all user addresses (requires authentication).

#### GET /addresses/:id
Get address by ID (requires authentication).

#### PUT /addresses/:id
Update address (requires authentication).

#### DELETE /addresses/:id
Delete address (requires authentication).

---

## 🎨 Banners

#### POST /banners
Create banner (Admin only).
```json
{
  "title": "Summer Sale",
  "subtitle": "Up to 50% off",
  "image": "https://example.com/banner.jpg",
  "link": "https://example.com/sale",
  "position": 1,
  "type": "HOME",
  "isActive": true
}
```

#### GET /banners
Get all banners.
Query params: `?type=HOME&isActive=true`

#### GET /banners/:id
Get banner by ID.

#### PUT /banners/:id
Update banner (Admin only).

#### DELETE /banners/:id
Delete banner (Admin only).

---

## 📊 Admin Dashboard

#### GET /admin/dashboard/stats
Get comprehensive dashboard statistics (Admin only).

Returns:
- Total users, orders, revenue
- Monthly sales data
- Order status breakdown
- Top selling products
- Recent orders
- Low stock products

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "statusCode": 400,
    "message": "Detailed error message"
  }
}
```

---

## Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Rate Limiting
API rate limiting: 100 requests per 15 minutes per IP

## Pagination
Default: `page=1&limit=10`
Max limit: 100

## Sorting
- `sortBy=createdAt` (default)
- `sortOrder=desc` (default) or `asc`
- Product specific: `price_asc`, `price_desc`, `newest`, `top_rated`
