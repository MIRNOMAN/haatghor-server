# Payment Gateway Integration Guide

Complete guide for setting up SSLCommerz, bKash, and Nagad payment gateways for HaatGhor e-commerce platform.

## Table of Contents
1. [Overview](#overview)
2. [SSLCommerz Setup](#sslcommerz-setup)
3. [bKash Setup](#bkash-setup)
4. [Nagad Setup](#nagad-setup)
5. [Environment Variables](#environment-variables)
6. [Testing Payment Flow](#testing-payment-flow)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### Payment Methods Supported
- **SSLCommerz**: All-in-one payment gateway (Cards, bKash, Nagad, Mobile Banking, Internet Banking)
- **bKash**: Direct bKash integration (Coming Soon)
- **Nagad**: Direct Nagad integration (Coming Soon)
- **Cash on Delivery**: No payment gateway required

### Current Implementation Status
✅ **SSLCommerz** - Fully implemented and ready to use
⏳ **bKash** - Config ready, integration pending
⏳ **Nagad** - Config ready, integration pending
✅ **COD** - Fully implemented

---

## SSLCommerz Setup

### Step 1: Register for SSLCommerz Account

#### For Testing (Sandbox):
1. Visit https://sandbox.sslcommerz.com/registration/
2. Fill out the registration form
3. You'll receive credentials via email:
   - `Store ID`
   - `Store Password`

#### For Production (Live):
1. Visit https://www.sslcommerz.com/
2. Contact their sales team
3. Complete business verification
4. Receive live credentials

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```bash
# SSLCommerz Configuration
SSLCOMMERZ_STORE_ID=testbox123456     # Replace with your Store ID
SSLCOMMERZ_STORE_PASSWORD=testbox123456@ssl  # Replace with your Store Password
SSLCOMMERZ_IS_LIVE=false              # Set to 'true' for production

# Callback URLs (Must match your frontend routes)
SSLCOMMERZ_SUCCESS_URL=http://localhost:3000/en/payment/success
SSLCOMMERZ_FAIL_URL=http://localhost:3000/en/payment/failed
SSLCOMMERZ_CANCEL_URL=http://localhost:3000/en/payment/cancelled
SSLCOMMERZ_IPN_URL=http://localhost:5000/api/v1/payments/sslcommerz/ipn
```

### Step 3: Update Production URLs

For production deployment, update URLs:
```bash
SSLCOMMERZ_IS_LIVE=true
SSLCOMMERZ_SUCCESS_URL=https://yourdomain.com/en/payment/success
SSLCOMMERZ_FAIL_URL=https://yourdomain.com/en/payment/failed
SSLCOMMERZ_CANCEL_URL=https://yourdomain.com/en/payment/cancelled
SSLCOMMERZ_IPN_URL=https://yourdomain.com/api/v1/payments/sslcommerz/ipn
```

### Step 4: Verify Implementation

The SSLCommerz integration includes:
- ✅ Payment initialization
- ✅ Payment validation
- ✅ Success/Fail/Cancel callbacks
- ✅ IPN (Instant Payment Notification) handler
- ✅ Transaction status checking
- ✅ Refund support

**Files:**
- Backend: `src/app/utils/sslcommerzPayment.ts`
- Service: `src/app/modules/Payment/payment.service.ts`
- Controller: `src/app/modules/Payment/payment.controller.ts`
- Routes: `src/app/modules/Payment/payment.route.ts`

---

## bKash Setup

### Overview
bKash is the most popular mobile financial service in Bangladesh. Direct integration provides:
- Lower transaction fees
- Better control over payment flow
- Direct settlement to your bKash merchant account

### Step 1: Register for bKash Merchant Account

1. **For Testing (Sandbox)**:
   - Visit https://developer.bka.sh/
   - Register as a developer
   - Create an app in the developer portal
   - Get sandbox credentials:
     - `App Key`
     - `App Secret`
     - `Username`
     - `Password`

2. **For Production (Live)**:
   - Visit your nearest bKash office or call 16247
   - Apply for a merchant account
   - Complete KYC (Know Your Customer) verification
   - Receive live credentials

### Step 2: Configure Environment Variables

```bash
# bKash Configuration
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=your_bkash_app_key_here
BKASH_APP_SECRET=your_bkash_app_secret_here
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password
```

### Step 3: Implementation Status

⏳ **To Be Implemented:**
1. Token generation endpoint
2. Create payment endpoint
3. Execute payment endpoint
4. Query payment endpoint
5. Refund endpoint

**Recommended Implementation:**
- Use bKash Checkout URL (easiest)
- Or use bKash Tokenized API (more control)

### Step 4: Testing

**Sandbox Test Cards:**
- **Success**: Use any phone number starting with 01
- **Failed**: Use phone number 01400000000
- **OTP**: Use 123456 for all sandbox transactions

---

## Nagad Setup

### Overview
Nagad is Bangladesh Post Office's mobile financial service. Integration provides:
- Government-backed reliability
- Competitive transaction fees
- Growing user base

### Step 1: Register for Nagad Merchant Account

1. **For Testing (Sandbox)**:
   - Contact Nagad's technical team at techsupport@mynagad.com
   - Request sandbox access
   - Receive test credentials

2. **For Production (Live)**:
   - Visit https://nagad.com.bd/merchant/
   - Fill out merchant registration form
   - Complete business verification
   - Receive live credentials

### Step 2: Configure Environment Variables

```bash
# Nagad Configuration
NAGAD_BASE_URL=http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs
NAGAD_MERCHANT_ID=your_merchant_id
NAGAD_MERCHANT_NUMBER=your_merchant_number
NAGAD_PUBLIC_KEY=your_public_key
NAGAD_PRIVATE_KEY=your_private_key
```

### Step 3: Implementation Status

⏳ **To Be Implemented:**
1. Payment initialization with PGP encryption
2. Payment processing
3. Payment verification
4. Callback handling

**Note**: Nagad uses PGP encryption for API requests, which requires additional crypto libraries.

---

## Environment Variables

### Complete `.env` Configuration

```bash
# =================================
# Server Configuration
# =================================
NODE_ENV=development
PORT=5000
BASE_URL_SERVER=http://localhost:5000
BASE_URL_CLIENT=http://localhost:3000

# =================================
# Database
# =================================
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/haatghor

# =================================
# JWT Configuration
# =================================
JWT_ACCESS_SECRET=your_super_secret_access_key_change_in_production
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_REFRESH_EXPIRES_IN=30d

# =================================
# SSLCommerz Payment (ACTIVE)
# =================================
SSLCOMMERZ_STORE_ID=testbox123456
SSLCOMMERZ_STORE_PASSWORD=testbox123456@ssl
SSLCOMMERZ_IS_LIVE=false
SSLCOMMERZ_SUCCESS_URL=http://localhost:3000/en/payment/success
SSLCOMMERZ_FAIL_URL=http://localhost:3000/en/payment/failed
SSLCOMMERZ_CANCEL_URL=http://localhost:3000/en/payment/cancelled
SSLCOMMERZ_IPN_URL=http://localhost:5000/api/v1/payments/sslcommerz/ipn

# =================================
# bKash Payment (PENDING)
# =================================
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password

# =================================
# Nagad Payment (PENDING)
# =================================
NAGAD_BASE_URL=http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs
NAGAD_MERCHANT_ID=your_merchant_id
NAGAD_MERCHANT_NUMBER=your_merchant_number
NAGAD_PUBLIC_KEY=your_public_key
NAGAD_PRIVATE_KEY=your_private_key

# =================================
# Stripe (International - OPTIONAL)
# =================================
STRIPE_PUBLISHED_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK=whsec_your_webhook_secret
```

---

## Testing Payment Flow

### 1. SSLCommerz Test Flow

#### Step 1: Create Test Order
1. Login to frontend
2. Add products to cart
3. Go to checkout
4. Fill shipping details
5. Select payment method: **bKash**, **Nagad**, or **SSLCOMMERZ**
6. Click "Place Order"

#### Step 2: Payment Gateway
1. Backend creates order with status `PENDING`
2. Backend calls SSLCommerz init API
3. User redirected to SSLCommerz payment page
4. SSLCommerz shows available payment methods:
   - Credit/Debit Cards
   - bKash (via SSLCommerz)
   - Nagad (via SSLCommerz)
   - Internet Banking
   - Mobile Banking

#### Step 3: Test Payment
**For Sandbox Testing:**

**Test Cards:**
```
Card Number: 4111 1111 1111 1111 (Visa)
Card Number: 5555 5555 5555 4444 (Mastercard)
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
```

**Test bKash (via SSLCommerz):**
```
bKash Number: 01XXXXXXXXX (any 11-digit number)
OTP: 123456
PIN: 12345
```

#### Step 4: Callback Handling
- **Success**: Redirects to `/payment/success?order=ORD-XXX`
- **Failed**: Redirects to `/payment/failed`
- **Cancelled**: Redirects to `/payment/cancelled`

#### Step 5: Verify Order
1. Check order status changed to `PROCESSING`
2. Check payment status changed to `SUCCESS`
3. Cart should be cleared
4. User receives email confirmation

### 2. Cash on Delivery Flow

1. Select payment method: **CASH_ON_DELIVERY**
2. Click "Place Order"
3. Order created with status `PENDING`
4. No payment gateway involvement
5. Redirect to `/order-success?orderId=XXX`

---

## Troubleshooting

### Common Issues

#### 1. "Order not found" Error
**Problem**: Frontend can't find the order after payment initialization.

**Solutions**:
- ✅ Verify orderId is being passed correctly
- ✅ Check user authentication token
- ✅ Ensure order belongs to logged-in user
- ✅ Check MongoDB connection

**Debug Steps**:
```bash
# Check console logs
# Frontend: Browser Console
# Backend: Terminal/Server logs

# Verify order in database
use haatghor
db.orders.find({ userId: "YOUR_USER_ID" })
```

#### 2. "SSLCommerz credentials not configured"
**Problem**: Environment variables not loaded.

**Solutions**:
- ✅ Check `.env` file exists in root directory
- ✅ Verify variable names match exactly
- ✅ Restart server after changing `.env`
- ✅ Check for spaces or quotes in values

#### 3. Payment Gateway Not Loading
**Problem**: Redirect to SSLCommerz fails.

**Solutions**:
- ✅ Check internet connection
- ✅ Verify SSLCommerz sandbox is online
- ✅ Check browser console for CORS errors
- ✅ Verify `BASE_URL_CLIENT` is correct

#### 4. Callback URLs Not Working
**Problem**: After payment, callbacks fail.

**Solutions**:
- ✅ Verify callback URLs in `.env` match frontend routes
- ✅ Check for typos: `/payment/fail` vs `/payment/failed`
- ✅ Ensure URLs include locale: `/en/payment/success`
- ✅ For localhost, SSLCommerz may not call IPN URL

#### 5. Payment Success but Order Not Updated
**Problem**: Payment succeeds but order status doesn't change.

**Solutions**:
- ✅ Check IPN handler is receiving requests
- ✅ Verify transaction validation logic
- ✅ Check database connection
- ✅ Review server logs for errors

### Debug Checklist

- [ ] Environment variables are set correctly
- [ ] Database connection is active
- [ ] Server is running without errors
- [ ] Frontend can communicate with backend
- [ ] User is authenticated
- [ ] Cart has items
- [ ] Order is created successfully
- [ ] Payment gateway credentials are valid
- [ ] Callback URLs are accessible
- [ ] CORS is configured properly

### Getting Help

**SSLCommerz Support:**
- Email: operation@sslcommerz.com
- Phone: +88-02-8189788
- Developer Docs: https://developer.sslcommerz.com/

**bKash Support:**
- Email: merchantcare@bka.sh
- Phone: 16247
- Developer Docs: https://developer.bka.sh/

**Nagad Support:**
- Email: techsupport@mynagad.com
- Phone: 16167

---

## Production Checklist

Before going live:

### Security
- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Hide sensitive logs in production
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable SQL injection protection

### Payment Gateway
- [ ] Switch to live credentials
- [ ] Update `SSLCOMMERZ_IS_LIVE=true`
- [ ] Configure production callback URLs
- [ ] Test with real payments (small amounts)
- [ ] Set up payment reconciliation process
- [ ] Configure refund policies
- [ ] Set up payment failure notifications

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure payment logs
- [ ] Set up transaction monitoring
- [ ] Enable alert notifications
- [ ] Monitor server performance
- [ ] Track payment success/failure rates

### Legal & Compliance
- [ ] Terms and Conditions
- [ ] Privacy Policy
- [ ] Refund Policy
- [ ] PCI-DSS compliance (if storing card data)
- [ ] Bangladesh Bank compliance

---

## API Endpoints

### Payment Initialization
```http
POST /api/v1/payments/sslcommerz/init
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "paymentUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/...",
    "tranId": "TXN-1234567890-ABC123",
    "orderId": "order_id_here"
  }
}
```

### Payment Success Callback
```http
POST /api/v1/payments/sslcommerz/success
Content-Type: application/x-www-form-urlencoded

val_id=<validation_id>
&tran_id=<transaction_id>
&amount=<amount>
&...
```

### Payment Failure Callback
```http
POST /api/v1/payments/sslcommerz/fail
Content-Type: application/x-www-form-urlencoded

tran_id=<transaction_id>
&error=<error_message>
```

### Payment Cancellation Callback
```http
POST /api/v1/payments/sslcommerz/cancel
Content-Type: application/x-www-form-urlencoded

tran_id=<transaction_id>
```

---

## Next Steps

1. **Immediate**: Test SSLCommerz integration thoroughly
2. **Short-term**: Implement direct bKash integration
3. **Short-term**: Implement direct Nagad integration
4. **Long-term**: Add Stripe for international payments
5. **Long-term**: Implement subscription billing

---

## Changelog

### Version 1.0.0 (Current)
- ✅ SSLCommerz integration complete
- ✅ Order payment flow implemented
- ✅ Frontend callback pages created
- ✅ Payment status tracking
- 🔄 bKash direct integration (pending)
- 🔄 Nagad direct integration (pending)

---

## Support

For technical issues or questions:
- **Project Issues**: Create an issue on GitHub
- **Payment Gateway Issues**: Contact respective gateway support
- **General Questions**: Check documentation first

---

**Last Updated**: January 2026
**Author**: HaatGhor Development Team
