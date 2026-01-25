# Quick Start Guide - New Modules

## ✅ What's Been Created

I've successfully created a complete backend system for image uploads and static content management with the following modules:

### 1. **Image Module** (`/api/v1/images`)
- ✅ Upload single images to VPS local filesystem
- ✅ Upload multiple images (up to 20 at once)
- ✅ Get all images with filtering and pagination
- ✅ Serve images with proper caching headers
- ✅ Update image metadata
- ✅ Replace image files
- ✅ Delete single or multiple images
- ✅ Images stored in: `src/app/upload/images/`
- ✅ Returns accessible URLs for all uploaded images

### 2. **FAQ Module** (`/api/v1/faqs`)
- ✅ Create, Read, Update, Delete FAQs
- ✅ Organize by category
- ✅ Custom ordering support
- ✅ Active/Inactive status
- ✅ Search functionality

### 3. **Privacy Policy Module** (`/api/v1/privacy-policy`)
- ✅ Full CRUD operations
- ✅ Version tracking
- ✅ Section organization
- ✅ Effective date tracking
- ✅ Get active policies endpoint

### 4. **Contact Us Module** (`/api/v1/contact`)
- ✅ Public contact form submission
- ✅ Admin dashboard with statistics
- ✅ Status tracking (PENDING, IN_PROGRESS, RESOLVED, CLOSED)
- ✅ Response system
- ✅ Mark as read/unread
- ✅ Email notifications (ready to implement)

---

## 🚀 Next Steps

### 1. Sync Database with MongoDB

Run this command to push the new schemas to your MongoDB database:

```bash
bunx prisma db push --schema=".\prisma\schema\schema.prisma"
```

**OR** if you want to create a migration:

```bash
bunx prisma migrate dev --name add_image_faq_privacy_contact --schema=".\prisma\schema\schema.prisma"
```

### 2. Start the Server

```bash
bun run dev
```

### 3. Test the APIs

#### Option A: Use Postman
1. Import the `New-Modules-Postman-Collection.json` file into Postman
2. Set the environment variables:
   - `baseUrl`: `http://localhost:5000/api/v1`
   - `accessToken`: Your admin access token
3. Test the endpoints!

#### Option B: Use cURL

**Upload an Image:**
```bash
curl -X POST http://localhost:5000/api/v1/images/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@path/to/image.jpg" \
  -F "category=product"
```

**Create FAQ:**
```bash
curl -X POST http://localhost:5000/api/v1/faqs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I track my order?",
    "answer": "You can track your order using the tracking link...",
    "category": "Shipping"
  }'
```

**Submit Contact Form:**
```bash
curl -X POST http://localhost:5000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Product inquiry",
    "message": "I have a question..."
  }'
```

---

## 📁 Files Created

### Prisma Schemas (`prisma/schema/`)
- `image.prisma` - Image storage model
- `faq.prisma` - FAQ model
- `privacyPolicy.prisma` - Privacy policy model
- `contactUs.prisma` - Contact form model

### Image Module (`src/app/modules/Image/`)
- `image.interface.ts` - TypeScript interfaces
- `image.validation.ts` - Zod validation schemas
- `image.service.ts` - Business logic
- `image.controller.ts` - Request handlers
- `image.route.ts` - Route definitions

### FAQ Module (`src/app/modules/FAQ/`)
- `faq.interface.ts`
- `faq.validation.ts`
- `faq.service.ts`
- `faq.controller.ts`
- `faq.route.ts`

### Privacy Policy Module (`src/app/modules/PrivacyPolicy/`)
- `privacyPolicy.interface.ts`
- `privacyPolicy.validation.ts`
- `privacyPolicy.service.ts`
- `privacyPolicy.controller.ts`
- `privacyPolicy.route.ts`

### Contact Us Module (`src/app/modules/ContactUs/`)
- `contactUs.interface.ts`
- `contactUs.validation.ts`
- `contactUs.service.ts`
- `contactUs.controller.ts`
- `contactUs.route.ts`

### Utilities
- `src/app/utils/uploadToVPS.ts` - VPS file upload utility functions

### Documentation
- `API_DOCUMENTATION_NEW_MODULES.md` - Complete API documentation
- `New-Modules-Postman-Collection.json` - Postman collection for testing
- `QUICKSTART_NEW_MODULES.md` - This file

---

## 🔐 Authentication

Most endpoints require SUPERADMIN authentication except:

**Public Endpoints:**
- `GET /api/v1/images` - Get all images
- `GET /api/v1/images/:id` - Get single image
- `GET /api/v1/images/serve/:filename` - Serve image file
- `GET /api/v1/faqs` - Get all FAQs
- `GET /api/v1/faqs/:id` - Get single FAQ
- `GET /api/v1/privacy-policy/*` - All privacy policy read endpoints
- `POST /api/v1/contact` - Submit contact form

**Admin Only:**
- All POST, PUT, PATCH, DELETE operations
- Contact message management
- Statistics endpoints

---

## 🎯 Key Features

### Image Upload Features
- **File Storage**: Images stored on VPS local filesystem in `src/app/upload/images/`
- **Unique Filenames**: Generated using crypto random bytes
- **Accessible URLs**: `http://your-server/api/v1/images/serve/{filename}`
- **Size Limit**: 10MB per image
- **Batch Upload**: Up to 20 images at once
- **Metadata**: Category, alt text, description
- **Replace**: Replace image file while keeping metadata
- **Bulk Delete**: Delete multiple images at once

### FAQ Features
- **Organization**: Category-based grouping
- **Custom Order**: Control display order with `order` field
- **Search**: Full-text search in questions and answers
- **Status**: Active/Inactive toggle

### Privacy Policy Features
- **Versioning**: Track policy versions
- **Sections**: Organize into logical sections
- **Effective Dates**: Track when policies become effective
- **Active Filter**: Show only active policies

### Contact Us Features
- **Status Workflow**: PENDING → IN_PROGRESS → RESOLVED → CLOSED
- **Response System**: Admin can respond to messages
- **Statistics**: Dashboard showing message counts by status
- **Read/Unread**: Track which messages have been viewed
- **Email Ready**: Structure in place for email notifications

---

## 📊 Database Models

### Image Model
```typescript
{
  id: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  mimetype: string;
  size: number;
  category?: string;
  alt?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### FAQ Model
```typescript
{
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### PrivacyPolicy Model
```typescript
{
  id: string;
  title: string;
  content: string;
  section?: string;
  order: number;
  version: string;
  isActive: boolean;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### ContactUs Model
```typescript
{
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  response?: string;
  respondedAt?: Date;
  respondedBy?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔧 Configuration

### Environment Variables
Ensure these are set in your `.env` file:

```env
DATABASE_URL="mongodb://..."
BASE_URL_SERVER="http://localhost:5000"
BASE_URL_CLIENT="http://localhost:3000"
```

### Upload Directory
The upload directory is automatically created at: `src/app/upload/images/`

Images are accessible via: `http://localhost:5000/api/v1/images/serve/{filename}`

---

## 📝 Example Usage

### 1. Upload Product Images
```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);
formData.append('category', 'product');
formData.append('description', 'Product gallery');

fetch('http://localhost:5000/api/v1/images/upload/multiple', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

### 2. Create FAQ
```javascript
fetch('http://localhost:5000/api/v1/faqs', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: 'What is your return policy?',
    answer: 'You can return items within 30 days...',
    category: 'Returns',
    order: 1
  })
});
```

### 3. Get Active Privacy Policies
```javascript
fetch('http://localhost:5000/api/v1/privacy-policy/active')
  .then(res => res.json())
  .then(data => console.log(data));
```

### 4. Submit Contact Form
```javascript
fetch('http://localhost:5000/api/v1/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Product inquiry',
    message: 'I have a question about your products...'
  })
});
```

---

## 🔄 Workflow Examples

### Contact Form Workflow

1. **User submits form** → Status: PENDING, isRead: false
2. **Admin views message** → Mark as Read
3. **Admin starts working** → Update status to IN_PROGRESS
4. **Admin responds** → Sends response, status: RESOLVED
5. **Case closed** → Update status to CLOSED

### Image Management Workflow

1. **Upload product images** → Multiple images uploaded
2. **Get image URLs** → Use in product creation
3. **Update metadata** → Add alt text, categories
4. **Replace image** → Update product photo
5. **Clean up** → Delete unused images

---

## ⚡ Performance Tips

1. **Image Caching**: Images are served with `Cache-Control: public, max-age=31536000`
2. **Pagination**: Use `page` and `limit` parameters for large datasets
3. **Filtering**: Use category and status filters to reduce data
4. **Indexes**: MongoDB indexes on commonly queried fields

---

## 🛡️ Security Notes

- File upload is restricted to SUPERADMIN users
- File type validation enforces images only
- File size limited to 10MB per image
- Unique filename generation prevents conflicts
- All admin operations require authentication

---

## 📞 Support

For more details, see:
- `API_DOCUMENTATION_NEW_MODULES.md` - Complete API reference
- `New-Modules-Postman-Collection.json` - API testing collection

---

## ✨ Ready to Use!

Your backend is now equipped with:
- ✅ Image upload and management system
- ✅ FAQ management
- ✅ Privacy policy management
- ✅ Contact form with admin dashboard

Just run `bunx prisma db push --schema=".\prisma\schema\schema.prisma"` and start testing!
