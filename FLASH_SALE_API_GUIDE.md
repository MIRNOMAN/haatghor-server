# Flash Sale API - Complete Guide

## 📋 Overview

The Flash Sale API provides endpoints for managing time-limited product sales with custom discounts. All admin operations require authentication with `ADMIN` role.

## 🔗 Base URL

```
http://localhost:5000/api/flash-sales
```

## 📍 Endpoints

### 1. Get All Flash Sales (Public)

```http
GET /api/flash-sales
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `searchTerm` (optional): Search by title
- `status` (optional): Filter by status - `UPCOMING`, `LIVE`, or `ENDED`
- `isActive` (optional): Filter by active status - `true` or `false`
- `isFeatured` (optional): Filter featured sales - `true` or `false`
- `sortBy` (optional): Sort field (default: `createdAt`)
- `sortOrder` (optional): Sort order - `asc` or `desc` (default: `desc`)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/flash-sales?page=1&limit=10&status=LIVE"
```

**Response:**
```json
{
  "success": true,
  "message": "Flash sales retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  },
  "data": [
    {
      "id": "60d5ec49f1b2c8b9e8c8e9a2",
      "title": "Weekend Flash Sale",
      "description": "Amazing deals for the weekend",
      "productId": "60d5ec49f1b2c8b9e8c8e9a1",
      "originalPrice": 99.99,
      "flashPrice": 49.99,
      "discount": 50.0,
      "totalStock": 50,
      "soldCount": 15,
      "remainingStock": 35,
      "startTime": "2024-01-29T10:00:00.000Z",
      "endTime": "2024-01-29T22:00:00.000Z",
      "isActive": true,
      "isFeatured": true,
      "createdAt": "2024-01-29T09:00:00.000Z",
      "updatedAt": "2024-01-29T09:00:00.000Z",
      "product": {
        "id": "60d5ec49f1b2c8b9e8c8e9a1",
        "name": "Premium Headphones",
        "slug": "premium-headphones",
        "images": ["https://example.com/image.jpg"],
        "price": 99.99,
        "stock": 100,
        "category": {
          "id": "cat123",
          "name": "Electronics"
        },
        "rating": 4.5,
        "totalReviews": 120
      }
    }
  ]
}
```

---

### 2. Get Live Flash Sales (Public)

```http
GET /api/flash-sales/live
```

Returns only currently active flash sales (within time range, active status, and with remaining stock).

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/flash-sales/live"
```

**Response:**
```json
{
  "success": true,
  "message": "Live flash sales retrieved successfully",
  "data": [
    {
      "id": "60d5ec49f1b2c8b9e8c8e9a2",
      "title": "Weekend Flash Sale",
      "flashPrice": 49.99,
      "discount": 50.0,
      "remainingStock": 35,
      "endTime": "2024-01-29T22:00:00.000Z",
      "product": { /* ... */ }
    }
  ]
}
```

---

### 3. Get Flash Sale by ID (Public)

```http
GET /api/flash-sales/:id
```

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/flash-sales/60d5ec49f1b2c8b9e8c8e9a2"
```

**Response:**
```json
{
  "success": true,
  "message": "Flash sale retrieved successfully",
  "data": {
    "id": "60d5ec49f1b2c8b9e8c8e9a2",
    "title": "Weekend Flash Sale",
    "description": "Amazing deals for the weekend",
    "productId": "60d5ec49f1b2c8b9e8c8e9a1",
    "originalPrice": 99.99,
    "flashPrice": 49.99,
    "discount": 50.0,
    "totalStock": 50,
    "soldCount": 15,
    "remainingStock": 35,
    "startTime": "2024-01-29T10:00:00.000Z",
    "endTime": "2024-01-29T22:00:00.000Z",
    "isActive": true,
    "isFeatured": true,
    "product": {
      "id": "60d5ec49f1b2c8b9e8c8e9a1",
      "name": "Premium Headphones",
      "category": {
        "id": "cat123",
        "name": "Electronics"
      }
    }
  }
}
```

---

### 4. Create Flash Sale (Admin Only)

```http
POST /api/flash-sales
```

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Weekend Flash Sale",
  "description": "Amazing deals for the weekend",
  "productId": "60d5ec49f1b2c8b9e8c8e9a1",
  "flashPrice": 49.99,
  "totalStock": 50,
  "startTime": "2024-01-29T10:00:00.000Z",
  "endTime": "2024-01-29T22:00:00.000Z",
  "isFeatured": true
}
```

**Field Descriptions:**
- `title` (required): Flash sale title
- `description` (optional): Description of the flash sale
- `productId` (required): MongoDB ObjectId of the product
- `flashPrice` (required): Discounted price (must be positive)
- `totalStock` (required): Available quantity for flash sale (must be positive integer)
- `startTime` (required): ISO 8601 date string for start time
- `endTime` (required): ISO 8601 date string for end time
- `isFeatured` (optional): Whether to feature this sale (default: false)

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/flash-sales" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekend Flash Sale",
    "description": "Amazing deals for the weekend",
    "productId": "60d5ec49f1b2c8b9e8c8e9a1",
    "flashPrice": 49.99,
    "totalStock": 50,
    "startTime": "2024-01-29T10:00:00.000Z",
    "endTime": "2024-01-29T22:00:00.000Z",
    "isFeatured": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Flash sale created successfully",
  "data": {
    "id": "60d5ec49f1b2c8b9e8c8e9a2",
    "title": "Weekend Flash Sale",
    "description": "Amazing deals for the weekend",
    "productId": "60d5ec49f1b2c8b9e8c8e9a1",
    "originalPrice": 99.99,
    "flashPrice": 49.99,
    "discount": 50.0,
    "totalStock": 50,
    "soldCount": 0,
    "remainingStock": 50,
    "startTime": "2024-01-29T10:00:00.000Z",
    "endTime": "2024-01-29T22:00:00.000Z",
    "isActive": true,
    "isFeatured": true,
    "product": { /* ... */ },
    "createdAt": "2024-01-29T09:00:00.000Z",
    "updatedAt": "2024-01-29T09:00:00.000Z"
  }
}
```

**Business Logic:**
- Automatically calculates `discount` percentage based on original and flash price
- Sets `originalPrice` from the product's current price
- Initializes `remainingStock` equal to `totalStock`
- Sets `soldCount` to 0
- Validates that product exists
- Prevents creating duplicate active flash sales for the same product

**Error Responses:**
```json
// Product not found
{
  "success": false,
  "message": "Product not found",
  "statusCode": 404
}

// Active flash sale already exists
{
  "success": false,
  "message": "An active flash sale already exists for this product",
  "statusCode": 400
}

// Validation error
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "flashPrice",
      "message": "Flash price is required"
    }
  ],
  "statusCode": 400
}
```

---

### 5. Update Flash Sale (Admin Only)

```http
PATCH /api/flash-sales/:id
```

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated Flash Sale Title",
  "description": "Updated description",
  "flashPrice": 39.99,
  "totalStock": 75,
  "startTime": "2024-01-30T10:00:00.000Z",
  "endTime": "2024-01-30T22:00:00.000Z",
  "isActive": false,
  "isFeatured": true
}
```

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/flash-sales/60d5ec49f1b2c8b9e8c8e9a2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flashPrice": 39.99,
    "isActive": false
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Flash sale updated successfully",
  "data": {
    "id": "60d5ec49f1b2c8b9e8c8e9a2",
    "title": "Weekend Flash Sale",
    "flashPrice": 39.99,
    "discount": 60.0,
    "isActive": false,
    // ... other fields
  }
}
```

**Business Logic:**
- If `flashPrice` is updated, automatically recalculates `discount` percentage
- If `totalStock` is updated, recalculates `remainingStock` (totalStock - soldCount)
- Converts date strings to Date objects
- Cannot change `productId` (delete and recreate instead)

**Error Response:**
```json
{
  "success": false,
  "message": "Flash sale not found",
  "statusCode": 404
}
```

---

### 6. Delete Flash Sale (Admin Only)

```http
DELETE /api/flash-sales/:id
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Example Request:**
```bash
curl -X DELETE "http://localhost:5000/api/flash-sales/60d5ec49f1b2c8b9e8c8e9a2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Flash sale deleted successfully",
  "data": {
    "id": "60d5ec49f1b2c8b9e8c8e9a2",
    "title": "Weekend Flash Sale",
    // ... deleted flash sale data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Flash sale not found",
  "statusCode": 404
}
```

---

## 🔐 Authentication

Admin endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

To obtain a token:
1. Login via `/api/auth/login` with admin credentials
2. Use the returned `accessToken` in subsequent requests

---

## 📊 Status Types

Flash sales can have different statuses based on time and active state:

1. **UPCOMING**: `startTime` is in the future
2. **LIVE**: Current time is between `startTime` and `endTime`, and `isActive = true`
3. **ENDED**: `endTime` has passed

---

## 🧪 Testing with Postman

### Import Collection

A Postman collection is available in the server repository:
- `HaatGhor-Complete-API-Collection.postman_collection.json`

### Environment Variables

Set these in your Postman environment:
```json
{
  "baseUrl": "http://localhost:5000/api",
  "adminToken": "your-admin-jwt-token",
  "productId": "valid-product-id"
}
```

### Test Sequence

1. **Login as Admin**
   ```
   POST {{baseUrl}}/auth/login
   ```

2. **Create Flash Sale**
   ```
   POST {{baseUrl}}/flash-sales
   Headers: Authorization: Bearer {{adminToken}}
   ```

3. **Get All Flash Sales**
   ```
   GET {{baseUrl}}/flash-sales
   ```

4. **Get Live Flash Sales**
   ```
   GET {{baseUrl}}/flash-sales/live
   ```

5. **Update Flash Sale**
   ```
   PATCH {{baseUrl}}/flash-sales/:id
   Headers: Authorization: Bearer {{adminToken}}
   ```

6. **Delete Flash Sale**
   ```
   DELETE {{baseUrl}}/flash-sales/:id
   Headers: Authorization: Bearer {{adminToken}}
   ```

---

## ⚠️ Common Errors

### 1. Product Not Found
```json
{
  "success": false,
  "message": "Product not found",
  "statusCode": 404
}
```
**Solution**: Ensure the `productId` exists in the database.

### 2. Duplicate Active Flash Sale
```json
{
  "success": false,
  "message": "An active flash sale already exists for this product",
  "statusCode": 400
}
```
**Solution**: Deactivate or delete the existing flash sale first.

### 3. Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "statusCode": 401
}
```
**Solution**: Include valid admin token in Authorization header.

### 4. Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [...],
  "statusCode": 400
}
```
**Solution**: Check request body matches required schema.

---

## 💡 Best Practices

1. **Time Management**
   - Use ISO 8601 format for dates
   - Ensure `endTime` > `startTime`
   - Consider timezone differences

2. **Stock Management**
   - Don't exceed product's available stock
   - Monitor `remainingStock` regularly
   - Use `soldCount` for analytics

3. **Pricing**
   - Ensure `flashPrice` < `originalPrice`
   - Discount is auto-calculated
   - Test pricing before going live

4. **Status Management**
   - Use `isActive` for manual control
   - Time-based status is automatic
   - Featured sales get priority display

5. **Error Handling**
   - Always check response status
   - Handle validation errors gracefully
   - Log errors for debugging

---

## 🔄 Integration with Orders

When a customer purchases a flash sale product:

1. Check if flash sale is active and has stock
2. Use `flashPrice` instead of regular price
3. Call `incrementSoldCount` service method
4. This automatically:
   - Increments `soldCount`
   - Decrements `remainingStock`
   - Validates stock availability

**Note**: This integration should be implemented in the Order module.

---

## 📈 Analytics Queries

### Get Best Performing Flash Sales
```
GET /api/flash-sales?sortBy=soldCount&sortOrder=desc&limit=10
```

### Get Featured Flash Sales
```
GET /api/flash-sales?isFeatured=true
```

### Get Upcoming Sales
```
GET /api/flash-sales?status=UPCOMING
```

---

## 🚀 Performance Tips

1. **Pagination**: Always use `limit` to avoid large responses
2. **Caching**: Cache live flash sales for 1-5 minutes
3. **Indexing**: Database indexes on `startTime`, `endTime`, `isActive`
4. **Filtering**: Use specific filters to reduce query load

---

## 📝 Database Schema

```prisma
model FlashSale {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String?
  productId   String   @db.ObjectId
  
  // Pricing
  originalPrice Float
  flashPrice    Float
  discount      Float   // Discount percentage
  
  // Stock
  totalStock    Int
  soldCount     Int     @default(0)
  remainingStock Int
  
  // Time
  startTime   DateTime
  endTime     DateTime
  
  // Status
  isActive    Boolean  @default(true)
  isFeatured  Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  product Product @relation(fields: [productId], references: [id])

  @@map("flash_sales")
}
```

---

## ✅ Implementation Checklist

- [x] CRUD endpoints implemented
- [x] Authentication & authorization
- [x] Input validation with Zod
- [x] Error handling
- [x] Pagination support
- [x] Filtering & search
- [x] Product relation
- [x] Automatic calculations (discount, stock)
- [x] Time-based status filtering
- [x] Database schema
- [x] API documentation

---

**API Version**: 1.0  
**Last Updated**: January 29, 2024  
**Maintained By**: HaatGhor Development Team
