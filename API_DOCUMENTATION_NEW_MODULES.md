# API Documentation - Image Upload & Static Content Modules

This documentation covers the newly created modules for VPS-based image uploads and static content management.

---

## 🖼️ Image Module

The Image module provides complete CRUD operations for managing images stored on your VPS local filesystem.

### Base URL
```
/api/v1/images
```

### Endpoints

#### 1. Upload Single Image
**POST** `/api/v1/images/upload/single`

**Authorization:** Required (SUPERADMIN only)

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `image`
- Body (optional):
  ```json
  {
    "category": "product",
    "alt": "Product image",
    "description": "Main product photo"
  }
  ```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": "64f8a7b2c3d4e5f6a7b8c9d0",
    "filename": "a1b2c3d4e5f6g7h8i9j0.jpg",
    "originalName": "product.jpg",
    "path": "/path/to/upload/images/a1b2c3d4e5f6g7h8i9j0.jpg",
    "url": "http://localhost:5000/api/v1/images/serve/a1b2c3d4e5f6g7h8i9j0.jpg",
    "mimetype": "image/jpeg",
    "size": 245678,
    "category": "product",
    "alt": "Product image",
    "description": "Main product photo",
    "isActive": true,
    "createdAt": "2026-01-25T10:30:00.000Z",
    "updatedAt": "2026-01-25T10:30:00.000Z"
  }
}
```

#### 2. Upload Multiple Images
**POST** `/api/v1/images/upload/multiple`

**Authorization:** Required (SUPERADMIN only)

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `images` (array)
- Body (optional):
  ```json
  {
    "category": "gallery",
    "description": "Product gallery images"
  }
  ```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "3 images uploaded successfully",
  "data": [
    {
      "id": "64f8a7b2c3d4e5f6a7b8c9d0",
      "filename": "a1b2c3d4e5f6g7h8i9j0.jpg",
      "url": "http://localhost:5000/api/v1/images/serve/a1b2c3d4e5f6g7h8i9j0.jpg",
      ...
    },
    ...
  ]
}
```

#### 3. Get All Images
**GET** `/api/v1/images`

**Authorization:** Not required (Public)

**Query Parameters:**
- `searchTerm` (optional): Search in filename, description, alt
- `category` (optional): Filter by category
- `isActive` (optional): Filter by active status (true/false)
- `mimetype` (optional): Filter by MIME type
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `sortBy` (optional, default: createdAt)
- `sortOrder` (optional, default: desc)

**Example:**
```
GET /api/v1/images?category=product&page=1&limit=20
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Images retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  },
  "data": [...]
}
```

#### 4. Get Single Image by ID
**GET** `/api/v1/images/:id`

**Authorization:** Not required (Public)

#### 5. Serve Image File
**GET** `/api/v1/images/serve/:filename`

**Authorization:** Not required (Public)

This endpoint directly serves the image file with proper caching headers.

#### 6. Update Image Metadata
**PATCH** `/api/v1/images/:id`

**Authorization:** Required (SUPERADMIN only)

**Request:**
```json
{
  "category": "updated-category",
  "alt": "Updated alt text",
  "description": "Updated description",
  "isActive": true
}
```

#### 7. Replace Image File
**PUT** `/api/v1/images/:id/replace`

**Authorization:** Required (SUPERADMIN only)

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `image`
- Body (optional): metadata fields

This will delete the old file and upload a new one while keeping the same database record.

#### 8. Delete Single Image
**DELETE** `/api/v1/images/:id`

**Authorization:** Required (SUPERADMIN only)

This deletes both the database record and the physical file.

#### 9. Delete Multiple Images
**POST** `/api/v1/images/delete/multiple`

**Authorization:** Required (SUPERADMIN only)

**Request:**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

---

## ❓ FAQ Module

Manage Frequently Asked Questions with full CRUD operations.

### Base URL
```
/api/v1/faqs
```

### Endpoints

#### 1. Create FAQ
**POST** `/api/v1/faqs`

**Authorization:** Required (SUPERADMIN only)

**Request:**
```json
{
  "question": "What is your return policy?",
  "answer": "You can return any item within 30 days of purchase...",
  "category": "Returns",
  "order": 1,
  "isActive": true
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "FAQ created successfully",
  "data": {
    "id": "64f8a7b2c3d4e5f6a7b8c9d0",
    "question": "What is your return policy?",
    "answer": "You can return any item within 30 days of purchase...",
    "category": "Returns",
    "order": 1,
    "isActive": true,
    "createdAt": "2026-01-25T10:30:00.000Z",
    "updatedAt": "2026-01-25T10:30:00.000Z"
  }
}
```

#### 2. Get All FAQs
**GET** `/api/v1/faqs`

**Authorization:** Not required (Public)

**Query Parameters:**
- `searchTerm` (optional): Search in question and answer
- `category` (optional): Filter by category
- `isActive` (optional): Filter by active status (true/false)
- `page`, `limit`, `sortBy`, `sortOrder`

**Example:**
```
GET /api/v1/faqs?category=Shipping&isActive=true
```

#### 3. Get FAQ by ID
**GET** `/api/v1/faqs/:id`

**Authorization:** Not required (Public)

#### 4. Update FAQ
**PATCH** `/api/v1/faqs/:id`

**Authorization:** Required (SUPERADMIN only)

**Request:**
```json
{
  "question": "Updated question?",
  "answer": "Updated answer...",
  "order": 2,
  "isActive": false
}
```

#### 5. Delete FAQ
**DELETE** `/api/v1/faqs/:id`

**Authorization:** Required (SUPERADMIN only)

---

## 🔒 Privacy Policy Module

Manage privacy policy content with versioning support.

### Base URL
```
/api/v1/privacy-policy
```

### Endpoints

#### 1. Create Privacy Policy
**POST** `/api/v1/privacy-policy`

**Authorization:** Required (SUPERADMIN only)

**Request:**
```json
{
  "title": "Data Collection",
  "content": "We collect the following information...",
  "section": "Information Collection",
  "order": 1,
  "version": "2.0",
  "isActive": true,
  "effectiveDate": "2026-01-25T00:00:00.000Z"
}
```

#### 2. Get All Privacy Policies
**GET** `/api/v1/privacy-policy`

**Authorization:** Not required (Public)

**Query Parameters:**
- `searchTerm` (optional): Search in title and content
- `section` (optional): Filter by section
- `version` (optional): Filter by version
- `isActive` (optional): Filter by active status
- Standard pagination parameters

#### 3. Get Active Privacy Policies
**GET** `/api/v1/privacy-policy/active`

**Authorization:** Not required (Public)

Returns only active privacy policy sections, ordered by the `order` field.

#### 4. Get Privacy Policy by ID
**GET** `/api/v1/privacy-policy/:id`

**Authorization:** Not required (Public)

#### 5. Update Privacy Policy
**PATCH** `/api/v1/privacy-policy/:id`

**Authorization:** Required (SUPERADMIN only)

**Request:**
```json
{
  "title": "Updated Data Collection",
  "content": "Updated content...",
  "version": "2.1",
  "isActive": true
}
```

#### 6. Delete Privacy Policy
**DELETE** `/api/v1/privacy-policy/:id`

**Authorization:** Required (SUPERADMIN only)

---

## 📧 Contact Us Module

Manage contact form submissions with status tracking and response system.

### Base URL
```
/api/v1/contact
```

### Contact Status Values
- `PENDING` - New submission
- `IN_PROGRESS` - Being handled
- `RESOLVED` - Issue resolved
- `CLOSED` - Ticket closed

### Endpoints

#### 1. Submit Contact Form
**POST** `/api/v1/contact`

**Authorization:** Not required (Public)

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Product inquiry",
  "message": "I have a question about your product..."
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Contact message sent successfully",
  "data": {
    "id": "64f8a7b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "subject": "Product inquiry",
    "message": "I have a question about your product...",
    "status": "PENDING",
    "isRead": false,
    "createdAt": "2026-01-25T10:30:00.000Z",
    "updatedAt": "2026-01-25T10:30:00.000Z"
  }
}
```

#### 2. Get All Contact Messages
**GET** `/api/v1/contact`

**Authorization:** Required (SUPERADMIN only)

**Query Parameters:**
- `searchTerm` (optional): Search in name, email, subject, message
- `status` (optional): Filter by status (PENDING, IN_PROGRESS, RESOLVED, CLOSED)
- `email` (optional): Filter by email
- `isRead` (optional): Filter by read status (true/false)
- Standard pagination parameters

**Example:**
```
GET /api/v1/contact?status=PENDING&isRead=false
```

#### 3. Get Contact Statistics
**GET** `/api/v1/contact/statistics`

**Authorization:** Required (SUPERADMIN only)

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Contact statistics retrieved successfully",
  "data": {
    "total": 150,
    "pending": 25,
    "inProgress": 10,
    "resolved": 100,
    "closed": 15,
    "unread": 30
  }
}
```

#### 4. Get Contact Message by ID
**GET** `/api/v1/contact/:id`

**Authorization:** Required (SUPERADMIN only)

#### 5. Mark as Read
**PATCH** `/api/v1/contact/:id/mark-read`

**Authorization:** Required (SUPERADMIN only)

#### 6. Respond to Contact
**POST** `/api/v1/contact/:id/respond`

**Authorization:** Required (SUPERADMIN only)

**Request:**
```json
{
  "response": "Thank you for your inquiry. Here is the answer...",
  "status": "RESOLVED"
}
```

This endpoint:
- Saves the response
- Marks the message as read
- Updates the status
- Records who responded and when
- (Optional: Send email notification to the user)

#### 7. Update Contact Message
**PATCH** `/api/v1/contact/:id`

**Authorization:** Required (SUPERADMIN only)

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "isRead": true
}
```

#### 8. Delete Contact Message
**DELETE** `/api/v1/contact/:id`

**Authorization:** Required (SUPERADMIN only)

---

## 🔧 Setup Instructions

### 1. Generate Prisma Client
After creating the schemas, generate the Prisma client:

```bash
npx prisma generate
```

### 2. Sync Database
Push the schema changes to MongoDB:

```bash
npx prisma db push
```

### 3. Environment Variables
Ensure your `.env` file has the required variables:

```env
DATABASE_URL="mongodb://..."
BASE_URL_SERVER="http://localhost:5000"
BASE_URL_CLIENT="http://localhost:3000"
```

### 4. Image Storage Directory
The images are stored in: `src/app/upload/images/`

This directory is automatically created when the first image is uploaded.

---

## 📝 Usage Examples

### Upload Image with Postman/Curl

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/v1/images/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "category=product" \
  -F "alt=Product image"
```

**Using Postman:**
1. Select POST method
2. URL: `http://localhost:5000/api/v1/images/upload/single`
3. Headers: Add `Authorization: Bearer YOUR_TOKEN`
4. Body: Select `form-data`
5. Add key `image` with type `File`, select your image
6. Add other fields as needed (category, alt, description)

### Upload Multiple Images

```bash
curl -X POST http://localhost:5000/api/v1/images/upload/multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg" \
  -F "category=gallery"
```

### Create FAQ

```bash
curl -X POST http://localhost:5000/api/v1/faqs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I track my order?",
    "answer": "You can track your order using the tracking link sent to your email.",
    "category": "Shipping",
    "order": 1
  }'
```

### Submit Contact Form

```bash
curl -X POST http://localhost:5000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Order issue",
    "message": "I have not received my order yet."
  }'
```

---

## 🚀 Features

### Image Module
✅ Single and multiple image uploads  
✅ Images stored on VPS local filesystem  
✅ Accessible image URLs  
✅ Image metadata management (category, alt, description)  
✅ Replace image functionality  
✅ Bulk delete support  
✅ Filtering and pagination  
✅ File size limit: 10MB per image  
✅ Maximum 20 images per upload  
✅ Automatic cache headers for served images  

### FAQ Module
✅ Full CRUD operations  
✅ Category organization  
✅ Custom ordering  
✅ Active/Inactive status  
✅ Search functionality  

### Privacy Policy Module
✅ Full CRUD operations  
✅ Version tracking  
✅ Section organization  
✅ Effective date tracking  
✅ Custom ordering  
✅ Active/Inactive status  

### Contact Us Module
✅ Public contact form submission  
✅ Status tracking (PENDING, IN_PROGRESS, RESOLVED, CLOSED)  
✅ Read/Unread marking  
✅ Response system  
✅ Admin dashboard statistics  
✅ Email notification support (ready to implement)  

---

## 🛡️ Security

- All admin operations require SUPERADMIN authentication
- File type validation (images only)
- File size limits enforced
- Secure file naming using crypto random bytes
- Public endpoints are read-only
- Contact form has validation to prevent spam

---

## 📊 Database Schema

All schemas are defined in `prisma/schema/` directory:
- `image.prisma` - Image storage and metadata
- `faq.prisma` - FAQ entries
- `privacyPolicy.prisma` - Privacy policy content
- `contactUs.prisma` - Contact form submissions

All models use MongoDB with ObjectId as primary keys.

---

## 🔄 Next Steps

1. Run `npx prisma generate` to generate the Prisma client
2. Run `npx prisma db push` to sync with MongoDB
3. Test the APIs using Postman or cURL
4. Implement email notifications for contact responses (optional)
5. Add rate limiting for public endpoints (recommended)
6. Set up image optimization/resizing (optional)
7. Configure CDN for image serving (optional for production)

---

## 💡 Tips

- Use the `category` field to organize images by type (product, banner, profile, etc.)
- Use the `order` field in FAQ and Privacy Policy to control display order
- Monitor the Contact Statistics endpoint to track customer inquiries
- Regularly backup the `upload/images` directory
- Consider implementing automated responses for common contact subjects
