# 📮 Postman Collection Import Guide

## 📦 Files Provided

1. **HaatGhor-eCommerce-API.postman_collection.json** - Complete API collection (60+ endpoints)
2. **HaatGhor-Environment.postman_environment.json** - Environment variables

---

## 🚀 Quick Import Steps

### Step 1: Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop **HaatGhor-eCommerce-API.postman_collection.json**
4. Click **Import**

### Step 2: Import Environment

1. Click **Import** again
2. Drag and drop **HaatGhor-Environment.postman_environment.json**
3. Click **Import**
4. Select **HaatGhor Development** from environment dropdown (top right)

---

## ✅ What's Included

### 📁 Collection Structure (8 Folders)

1. **Authentication** (10 endpoints)
   - Register, Login, Verify Email, OTP, Password Reset, Google OAuth

2. **Users** (2 endpoints)
   - Get/Update Profile

3. **Categories** (5 endpoints)
   - CRUD operations

4. **Products** (5 endpoints)
   - CRUD with advanced filtering

5. **Cart** (5 endpoints)
   - Add, Update, Remove, Clear

6. **Orders** (5 endpoints)
   - Create, View, Admin Management

7. **Reviews** (5 endpoints)
   - Create, View, Update, Delete

8. **Wishlist** (3 endpoints)
   - Add, View, Remove

9. **Addresses** (5 endpoints)
   - CRUD operations

10. **Banners** (5 endpoints)
    - CRUD operations (Admin)

11. **Admin** (1 endpoint)
    - Dashboard Statistics

### 🔧 Environment Variables

Auto-populated by test scripts:
- `base_url` - API base URL
- `token` - JWT access token
- `user_id` - Current user ID
- `otp` - Verification OTP
- `reset_token` - Password reset token
- `category_id` - Sample category ID
- `product_id` - Sample product ID
- `order_id` - Sample order ID
- `review_id` - Sample review ID
- `address_id` - Sample address ID
- `banner_id` - Sample banner ID

---

## 🧪 Testing Flow (Recommended Order)

### 1️⃣ **Setup Phase**
```
1. Register User → Saves OTP
2. Verify Email → Saves Token & User ID
3. Login → Confirms authentication
```

### 2️⃣ **Admin Setup (if you have admin credentials)**
```
4. Login as Admin → Update token
5. Create Category → Saves Category ID
6. Create Product → Saves Product ID
7. Create Banner → Saves Banner ID
```

### 3️⃣ **User Shopping Flow**
```
8. Get All Products → Browse catalog
9. Get Product by ID → View details
10. Add to Cart → Add product
11. Get Cart → View cart
12. Update Cart Item → Change quantity
13. Create Address → Save shipping address
14. Create Order → Place order (saves Order ID)
```

### 4️⃣ **Post-Purchase**
```
15. Get My Orders → View order history
16. Create Review → Add product review
17. Add to Wishlist → Save for later
```

### 5️⃣ **Admin Operations**
```
18. Get All Orders (Admin) → View all orders
19. Update Order Status (Admin) → Change to SHIPPED
20. Get Dashboard Stats → View analytics
```

---

## 🎯 Features

### ✅ Auto-Authentication
- Token automatically added to protected endpoints
- No need to manually copy/paste tokens

### ✅ Auto-Save IDs
- Test scripts automatically save IDs from responses
- Use `{{variable_name}}` in requests

### ✅ Built-in Tests
All requests include:
- Response time validation (< 2000ms)
- Success property check
- Specific data validation

### ✅ Query Parameters
Most GET requests include disabled query params for easy filtering:
- Enable/disable as needed
- See examples in each request

---

## 🔐 Authentication

### For Regular Users:
1. Use **Register User** → **Verify Email** → **Login**
2. Token auto-saved and used in all requests

### For Admin Access:
1. Use super admin credentials from `.env` file
2. Login with admin email/password
3. Token automatically applied

---

## 📝 Request Examples

### Create Product (Admin)
```json
{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone...",
  "categoryId": "{{category_id}}",
  "brand": "Apple",
  "images": ["url1", "url2"],
  "price": 1299.99,
  "discount": 10,
  "stock": 50,
  "variants": [
    {"name": "Storage", "value": "256GB"}
  ],
  "tags": ["smartphone", "5g"],
  "isFeatured": true
}
```

### Search Products
```
GET /products?searchTerm=iphone&category={{category_id}}&minPrice=100&maxPrice=2000&sort=price_desc&page=1&limit=20
```

### Create Order
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+8801712345678",
    "address": "123 Main Street",
    "city": "Dhaka",
    "state": "Dhaka",
    "zipCode": "1200",
    "country": "Bangladesh"
  },
  "paymentMethod": "CASH_ON_DELIVERY",
  "notes": "Deliver during daytime"
}
```

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" errors
**Solution:** 
1. Login again to refresh token
2. Check if token is saved: `{{token}}`
3. Verify environment is selected

### Issue: "Not Found" errors
**Solution:**
1. Check if required ID is saved in environment
2. Run the create endpoint first
3. Verify the ID in environment variables

### Issue: Validation errors
**Solution:**
1. Check request body format
2. Ensure all required fields are present
3. Verify data types match schema

### Issue: No response
**Solution:**
1. Ensure backend server is running
2. Check `base_url` in environment
3. Verify no port conflicts

---

## 🎨 Customization

### Change Base URL
For production/staging:
1. Duplicate environment
2. Rename to "HaatGhor Production"
3. Update `base_url` to production URL

### Add Custom Tests
Edit request → Tests tab → Add custom scripts:
```javascript
pm.test("Custom test", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.exist;
});
```

---

## 📊 Collection Statistics

- **Total Endpoints:** 60+
- **Authenticated Endpoints:** 45+
- **Public Endpoints:** 15+
- **Admin Only:** 20+
- **Test Scripts:** 50+
- **Environment Variables:** 11

---

## 💡 Tips

1. **Run in Sequence:** Use Collection Runner for automated testing
2. **Save Responses:** Use "Save Response" for reference
3. **Use Folders:** Organize custom requests in folders
4. **Share Collection:** Export and share with team
5. **Version Control:** Keep collection in Git (optional)

---

## 🔄 Updates

To update the collection:
1. Re-import the JSON file
2. Postman will ask to replace or merge
3. Choose **Replace** for clean update

---

## 📞 Support

For issues:
1. Check API Documentation (API_DOCUMENTATION.md)
2. Review Setup Guide (SETUP_GUIDE.md)
3. Verify backend is running
4. Check environment variables

---

## ✅ Validation Checklist

Before testing:
- [ ] Backend server is running
- [ ] Database is connected
- [ ] Environment is selected in Postman
- [ ] Collection is imported
- [ ] `base_url` is correct

---

**Ready to test!** 🚀

Start with: **Authentication → Register User**

Happy Testing! 🎉
