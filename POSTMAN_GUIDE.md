# Postman Collection Guide - HaatGhor eCommerce API

## 📋 Setup Instructions

### 1. Create New Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it "HaatGhor eCommerce API"

### 2. Set Environment Variables

Create a new environment called "HaatGhor Development":

```
base_url: http://localhost:5000/api/v1
token: (will be auto-filled after login)
user_id: (will be auto-filled after login)
product_id: (save after creating product)
category_id: (save after creating category)
order_id: (save after creating order)
```

### 3. Pre-request Script (Collection Level)

Add this to your collection's Pre-request Scripts:

```javascript
// Auto-set token from environment variable
if (pm.environment.get("token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("token")
    });
}
```

---

## 🔐 Authentication Requests

### 1. Register User
```
POST {{base_url}}/auth/register
```
Body (JSON):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+8801712345678",
  "password": "SecurePass123",
  "isAgreeWithTerms": true
}
```

**Tests Script:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("OTP is returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('otp');
    pm.environment.set("otp", jsonData.data.otp);
});
```

---

### 2. Verify Email
```
POST {{base_url}}/auth/verify-email
```
Body (JSON):
```json
{
  "email": "john.doe@example.com",
  "otp": "{{otp}}"
}
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Token is returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('accessToken');
    pm.environment.set("token", jsonData.data.accessToken);
    pm.environment.set("user_id", jsonData.data.id);
});
```

---

### 3. Login
```
POST {{base_url}}/auth/login
```
Body (JSON):
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Tests Script:**
```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.accessToken);
    pm.environment.set("user_id", jsonData.data.id);
});
```

---

### 4. Refresh Token
```
POST {{base_url}}/auth/refresh-token
```
Headers: `Authorization: Bearer {{token}}`

---

### 5. Google OAuth URL
```
GET {{base_url}}/auth/google
```

Returns the Google OAuth URL to open in browser.

---

### 6. Forgot Password
```
POST {{base_url}}/auth/forget-password
```
Body (JSON):
```json
{
  "email": "john.doe@example.com"
}
```

---

### 7. Verify Forgot Password OTP
```
POST {{base_url}}/auth/verify-forgot-password-otp
```
Body (JSON):
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Tests Script:**
```javascript
var jsonData = pm.response.json();
pm.environment.set("reset_token", jsonData.data.resetToken);
```

---

### 8. Reset Password
```
POST {{base_url}}/auth/reset-password
```
Headers: `Authorization: {{reset_token}}`

Body (JSON):
```json
{
  "email": "john.doe@example.com",
  "newPassword": "NewSecurePass123"
}
```

---

## 👤 User Management

### 1. Get My Profile
```
GET {{base_url}}/users/me
```
Headers: `Authorization: Bearer {{token}}`

---

### 2. Update My Profile
```
PUT {{base_url}}/users/me
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "firstName": "John",
  "lastName": "Doe Updated",
  "bio": "Software Developer",
  "location": "Dhaka, Bangladesh"
}
```

---

### 3. Change Password
```
PATCH {{base_url}}/auth/change-password
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "oldPassword": "SecurePass123",
  "newPassword": "NewSecurePass123"
}
```

---

## 🗂️ Category Management

### 1. Create Category (Admin)
```
POST {{base_url}}/categories
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "name": "Electronics",
  "description": "Electronic items and gadgets",
  "image": "https://via.placeholder.com/300"
}
```

**Tests Script:**
```javascript
var jsonData = pm.response.json();
pm.environment.set("category_id", jsonData.data.id);
```

---

### 2. Get All Categories
```
GET {{base_url}}/categories?page=1&limit=10
```

---

### 3. Get Category by ID
```
GET {{base_url}}/categories/{{category_id}}
```

---

### 4. Update Category (Admin)
```
PUT {{base_url}}/categories/{{category_id}}
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "name": "Electronics & Gadgets",
  "isActive": true
}
```

---

### 5. Delete Category (Admin)
```
DELETE {{base_url}}/categories/{{category_id}}
```
Headers: `Authorization: Bearer {{token}}`

---

## 📦 Product Management

### 1. Create Product (Admin)
```
POST {{base_url}}/products
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with A17 Pro chip and titanium design",
  "categoryId": "{{category_id}}",
  "brand": "Apple",
  "images": [
    "https://via.placeholder.com/500",
    "https://via.placeholder.com/500/0000FF"
  ],
  "price": 1299.99,
  "discount": 10,
  "stock": 50,
  "variants": [
    {
      "name": "Storage",
      "value": "256GB"
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

**Tests Script:**
```javascript
var jsonData = pm.response.json();
pm.environment.set("product_id", jsonData.data.id);
```

---

### 2. Get All Products (with filters)
```
GET {{base_url}}/products?search=iphone&category={{category_id}}&brand=Apple&minPrice=100&maxPrice=2000&rating=4&sort=price_desc&page=1&limit=10
```

---

### 3. Get Product by ID
```
GET {{base_url}}/products/{{product_id}}
```

---

### 4. Update Product (Admin)
```
PUT {{base_url}}/products/{{product_id}}
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "price": 1199.99,
  "stock": 45,
  "discount": 15
}
```

---

### 5. Delete Product (Admin)
```
DELETE {{base_url}}/products/{{product_id}}
```
Headers: `Authorization: Bearer {{token}}`

---

## 🛒 Cart Management

### 1. Add to Cart
```
POST {{base_url}}/cart/add
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "productId": "{{product_id}}",
  "quantity": 2,
  "selectedVariants": [
    {
      "name": "Storage",
      "value": "256GB"
    }
  ]
}
```

---

### 2. Get Cart
```
GET {{base_url}}/cart
```
Headers: `Authorization: Bearer {{token}}`

---

### 3. Update Cart Item
```
PUT {{base_url}}/cart/update/{{product_id}}
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "quantity": 3
}
```

---

### 4. Remove from Cart
```
DELETE {{base_url}}/cart/remove/{{product_id}}
```
Headers: `Authorization: Bearer {{token}}`

---

### 5. Clear Cart
```
DELETE {{base_url}}/cart/clear
```
Headers: `Authorization: Bearer {{token}}`

---

## 📦 Order Management

### 1. Create Order
```
POST {{base_url}}/orders
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+8801712345678",
    "email": "john@example.com",
    "address": "123 Main Street, Apartment 4B",
    "city": "Dhaka",
    "state": "Dhaka",
    "zipCode": "1200",
    "country": "Bangladesh"
  },
  "paymentMethod": "CASH_ON_DELIVERY",
  "notes": "Please deliver during daytime"
}
```

**Tests Script:**
```javascript
var jsonData = pm.response.json();
pm.environment.set("order_id", jsonData.data.id);
```

---

### 2. Get My Orders
```
GET {{base_url}}/orders/me?page=1&limit=10
```
Headers: `Authorization: Bearer {{token}}`

---

### 3. Get Order by ID
```
GET {{base_url}}/orders/{{order_id}}
```
Headers: `Authorization: Bearer {{token}}`

---

### 4. Get All Orders (Admin)
```
GET {{base_url}}/orders/admin/all?status=PENDING&page=1&limit=10
```
Headers: `Authorization: Bearer {{token}}`

---

### 5. Update Order Status (Admin)
```
PUT {{base_url}}/orders/admin/{{order_id}}/status
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRACK123456789"
}
```

---

## ⭐ Review & Rating

### 1. Create Review
```
POST {{base_url}}/reviews
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "productId": "{{product_id}}",
  "rating": 5,
  "comment": "Excellent product! Highly recommended.",
  "images": ["https://via.placeholder.com/300"]
}
```

---

### 2. Get Product Reviews
```
GET {{base_url}}/reviews/product/{{product_id}}?page=1&limit=10
```

---

### 3. Update Review
```
PUT {{base_url}}/reviews/{{review_id}}
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "rating": 4,
  "comment": "Updated review - Good product"
}
```

---

### 4. Delete Review
```
DELETE {{base_url}}/reviews/{{review_id}}
```
Headers: `Authorization: Bearer {{token}}`

---

## ❤️ Wishlist

### 1. Add to Wishlist
```
POST {{base_url}}/wishlist/add
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "productId": "{{product_id}}"
}
```

---

### 2. Get Wishlist
```
GET {{base_url}}/wishlist
```
Headers: `Authorization: Bearer {{token}}`

---

### 3. Remove from Wishlist
```
DELETE {{base_url}}/wishlist/remove/{{product_id}}
```
Headers: `Authorization: Bearer {{token}}`

---

## 🏠 Address Management

### 1. Create Address
```
POST {{base_url}}/addresses
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
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

---

### 2. Get All Addresses
```
GET {{base_url}}/addresses
```
Headers: `Authorization: Bearer {{token}}`

---

### 3. Update Address
```
PUT {{base_url}}/addresses/{{address_id}}
```
Headers: `Authorization: Bearer {{token}}`

---

### 4. Delete Address
```
DELETE {{base_url}}/addresses/{{address_id}}
```
Headers: `Authorization: Bearer {{token}}`

---

## 🎨 Banners

### 1. Create Banner (Admin)
```
POST {{base_url}}/banners
```
Headers: `Authorization: Bearer {{token}}`

Body (JSON):
```json
{
  "title": "Summer Sale 2026",
  "subtitle": "Up to 50% off on all electronics",
  "image": "https://via.placeholder.com/1200x400",
  "link": "https://example.com/sale",
  "position": 1,
  "type": "HOME",
  "isActive": true
}
```

---

### 2. Get All Banners
```
GET {{base_url}}/banners?type=HOME&isActive=true
```

---

### 3. Update Banner (Admin)
```
PUT {{base_url}}/banners/{{banner_id}}
```
Headers: `Authorization: Bearer {{token}}`

---

### 4. Delete Banner (Admin)
```
DELETE {{base_url}}/banners/{{banner_id}}
```
Headers: `Authorization: Bearer {{token}}`

---

## 📊 Admin Dashboard

### Get Dashboard Stats
```
GET {{base_url}}/admin/dashboard/stats
```
Headers: `Authorization: Bearer {{token}}`

---

## 🧪 Testing Flow

### Complete Testing Sequence:

1. **Register** → Save OTP
2. **Verify Email** → Save Token
3. **Create Category** → Save Category ID
4. **Create Product** → Save Product ID
5. **Get Products** → Browse products
6. **Add to Cart** → Add product to cart
7. **Get Cart** → View cart
8. **Create Order** → Place order (saves Order ID)
9. **Get My Orders** → View orders
10. **Create Review** → Add product review
11. **Get Dashboard Stats** (Admin) → View statistics

---

## 📝 Tips

1. **Save IDs:** After creating resources, save their IDs to environment variables
2. **Admin Token:** Login with super admin credentials for admin endpoints
3. **Auto-Authorization:** The pre-request script automatically adds the token
4. **Test Scripts:** Use test scripts to automatically save response data
5. **Environment:** Switch between Development, Staging, and Production environments

---

## 🔧 Collection Settings

### Authorization
Type: Bearer Token
Token: `{{token}}`

### Tests (Collection Level)
```javascript
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Response has success property", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});
```

---

## 📤 Exporting Collection

1. Click on your collection
2. Click "..." → "Export"
3. Choose "Collection v2.1"
4. Save as `HaatGhor-API.postman_collection.json`

---

Happy Testing! 🚀
