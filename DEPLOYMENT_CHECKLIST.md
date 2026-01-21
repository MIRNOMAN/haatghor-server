# Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 🔐 Security
- [ ] All environment variables are set securely
- [ ] JWT secrets are strong (minimum 32 characters)
- [ ] Database passwords are strong and unique
- [ ] API keys are not exposed in code
- [ ] CORS origins are properly configured for production
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented on all endpoints
- [ ] SQL injection protection (Prisma ORM handles this)
- [ ] XSS protection is in place

### 🗄️ Database
- [ ] MongoDB Atlas cluster is created
- [ ] Database connection string is secured
- [ ] IP whitelist is configured (or 0.0.0.0/0 for dynamic IPs)
- [ ] Database user has appropriate permissions
- [ ] Backup strategy is in place
- [ ] Prisma migrations are up to date
- [ ] Database indexes are optimized

### 📧 Email Service
- [ ] Email service (Gmail/SendGrid/etc.) is configured
- [ ] App-specific password is generated (for Gmail)
- [ ] Email templates are tested
- [ ] Email delivery is working

### 💳 Payment Gateways
- [ ] Stripe production keys are configured (if using)
- [ ] Bkash production credentials are set (if using)
- [ ] Nagad production credentials are set (if using)
- [ ] Webhook endpoints are properly configured
- [ ] Payment testing is complete
- [ ] Refund flow is tested

### 🖼️ File Upload
- [ ] Digital Ocean Spaces / AWS S3 is configured
- [ ] Bucket permissions are set correctly
- [ ] File size limits are configured
- [ ] Allowed file types are validated
- [ ] Upload testing is complete

### 🔑 OAuth
- [ ] Google OAuth production credentials are set
- [ ] Redirect URIs are configured for production
- [ ] OAuth flow is tested

### 🧪 Testing
- [ ] All API endpoints are tested
- [ ] User registration and login flow works
- [ ] Product CRUD operations work
- [ ] Cart functionality is tested
- [ ] Order creation and management works
- [ ] Payment integration is tested
- [ ] Email notifications are working
- [ ] Admin dashboard loads correctly

---

## 🚀 Deployment Steps

### 1. Prepare Environment

```bash
# Build the project
npm run build

# Test the build locally
npm start
```

### 2. Set Environment Variables

On your hosting platform, set these environment variables:

**Required:**
- `NODE_ENV=production`
- `PORT=5000`
- `DATABASE_URL=<your_mongodb_connection>`
- `JWT_ACCESS_SECRET=<strong_secret>`
- `JWT_REFRESH_SECRET=<strong_secret>`
- `BASE_URL_SERVER=<your_production_url>`
- `BASE_URL_CLIENT=<your_frontend_url>`

**Optional (based on features used):**
- Email: `MAIL`, `MAIL_PASS`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK`
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Bkash: `BKASH_APP_KEY`, `BKASH_APP_SECRET`, etc.
- Nagad: `NAGAD_MERCHANT_ID`, `NAGAD_PRIVATE_KEY`, etc.

### 3. Deploy to Hosting Platform

#### Option A: Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Option B: Render
1. Connect your GitHub repository
2. Select "Web Service"
3. Build Command: `npm install && npm run build && npx prisma generate`
4. Start Command: `npm start`
5. Add environment variables

#### Option C: Heroku
```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add buildpack
heroku buildpacks:set heroku/nodejs

# Deploy
git push heroku main

# Run migrations
heroku run npm run pm
```

#### Option D: DigitalOcean App Platform
1. Create new app from GitHub repo
2. Configure build command: `npm install && npm run build && npx prisma generate`
3. Configure run command: `npm start`
4. Add environment variables
5. Deploy

#### Option E: AWS EC2
```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd your-project

# Install dependencies
npm install

# Build
npm run build

# Setup environment
nano .env
# Paste your environment variables

# Run migrations
npm run pm

# Start with PM2
pm2 start dist/server.js --name "haatghor-api"
pm2 save
pm2 startup
```

### 4. Post-Deployment

```bash
# Run database migrations
npm run pm

# Verify deployment
curl https://your-domain.com/
```

---

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy
      # Add your deployment script here
      run: echo "Deploy to your platform"
```

---

## 📊 Monitoring Setup

### Health Check Endpoint
Already available at: `GET /`

### Recommended Monitoring Tools
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Error Tracking:** Sentry
- **Performance:** New Relic, Datadog
- **Logs:** Loggly, Papertrail

### Setup Example (Sentry)

```bash
npm install @sentry/node
```

In `server.ts`:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 🔒 SSL/HTTPS Setup

### Option 1: Platform-Provided SSL
Most platforms (Railway, Render, Heroku) provide free SSL automatically.

### Option 2: Custom Domain with Let's Encrypt (EC2/VPS)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 📈 Performance Optimization

### 1. Database Indexing
Already configured in Prisma schemas for:
- User email (unique)
- Product slug (unique)
- Category slug (unique)
- Order orderNumber (unique)

### 2. Enable Compression

Already configured in Express app.

### 3. Caching Strategy (Optional)

Install Redis:
```bash
npm install redis
```

Example caching:
```typescript
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

// Cache product list
const cacheKey = 'products:all';
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const products = await prisma.product.findMany();
await redis.set(cacheKey, JSON.stringify(products), { EX: 300 });
```

### 4. CDN for Static Assets
Use Cloudflare, AWS CloudFront, or DigitalOcean CDN for images.

---

## 🔐 Backup Strategy

### Database Backups

**MongoDB Atlas (Recommended):**
- Automated backups are enabled by default
- Point-in-time recovery available
- Download manual backups from Atlas dashboard

**Manual Backup:**
```bash
mongodump --uri="mongodb+srv://..." --out=./backup
```

**Restore:**
```bash
mongorestore --uri="mongodb+srv://..." ./backup
```

### Schedule Automated Backups (Cron Job)

```bash
# Create backup script
nano ~/backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$DATABASE_URL" --out=~/backups/backup_$DATE
find ~/backups -mtime +7 -delete

# Make executable
chmod +x ~/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * ~/backup.sh
```

---

## 🐛 Debugging Production Issues

### View Logs

**Railway:**
```bash
railway logs
```

**Heroku:**
```bash
heroku logs --tail
```

**PM2 (EC2):**
```bash
pm2 logs haatghor-api
```

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL
   - Verify IP whitelist in MongoDB Atlas
   - Check network connectivity

2. **502 Bad Gateway**
   - Application crashed
   - Check logs for errors
   - Verify build was successful

3. **Environment Variables Not Loaded**
   - Restart the application
   - Verify variable names match exactly
   - Check for typos in `.env`

---

## 📊 Feature Completion Status

### ✅ Completed Features

- [x] User authentication (Email/Password)
- [x] OTP verification
- [x] Google OAuth
- [x] JWT with refresh tokens
- [x] Password reset
- [x] User profile management
- [x] Role-based access control
- [x] Category management
- [x] Product management with variants
- [x] Multiple product images
- [x] Cart system with stock validation
- [x] Order management
- [x] Order status tracking
- [x] Review and rating system
- [x] Wishlist
- [x] Address management
- [x] Banner management
- [x] Admin dashboard with statistics
- [x] Advanced search and filtering
- [x] Pagination
- [x] Payment integration (Stripe, Bkash, Nagad, COD)
- [x] Real-time chat (Socket.IO)
- [x] Email notifications
- [x] File upload
- [x] Input validation
- [x] Error handling
- [x] API documentation
- [x] Postman collection guide

---

## 🎯 Post-Launch Tasks

### Week 1
- [ ] Monitor error logs daily
- [ ] Check payment transactions
- [ ] Verify email delivery
- [ ] Monitor server performance
- [ ] Check database queries performance

### Week 2-4
- [ ] Gather user feedback
- [ ] Analyze API usage patterns
- [ ] Optimize slow endpoints
- [ ] Review and fix any bugs
- [ ] Add monitoring alerts

### Monthly
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Database performance tuning
- [ ] Backup verification
- [ ] Cost optimization review

---

## 📞 Support Contacts

- **Database:** MongoDB Atlas Support
- **Hosting:** Check your platform's support
- **Email:** Gmail/SendGrid Support
- **Payments:** Stripe/Bkash/Nagad Support

---

## 🎉 Launch Checklist

- [ ] All features tested
- [ ] Documentation complete
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificate active
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Performance optimized
- [ ] Error tracking configured
- [ ] Team notified

---

**Status:** Ready for Production ✅

**Version:** 1.0.0

**Launch Date:** ___________

---

Good luck with your launch! 🚀
