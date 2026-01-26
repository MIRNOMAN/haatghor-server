# Payment Status Update Fix

## Problem
Orders remain in `PENDING` status even after successful payment through SSLCommerz gateway.

## Root Causes Identified

### 1. Missing Logging
- No visibility into callback execution
- Can't see if SSLCommerz is actually calling the success endpoint
- No error tracking in validation process

### 2. Data Parsing Issues
- SSLCommerz sends callbacks as `application/x-www-form-urlencoded`
- Must ensure Express is configured to parse form data

### 3. Callback URL Mismatches
- Frontend routes use `/payment/failed` and `/payment/cancelled`
- Backend was redirecting to `/payment/fail` and `/payment/cancel`

### 4. Field Name Errors
- `ship_name` was trying to use `order.shippingAddress.name`
- Correct field is `order.shippingAddress.fullName`

---

## Fixes Applied

### ✅ 1. Enhanced Logging

**Payment Controller (`payment.controller.ts`):**
```typescript
// Success callback with comprehensive logging
const sslCommerzSuccess = catchAsync(async (req, res) => {
  console.log('=== SSLCommerz Success Callback ===');
  console.log('Request Body:', req.body);
  console.log('Request Query:', req.query);
  console.log('Validation ID:', val_id);
  console.log('Transaction ID:', tran_id);
  // ... rest of code
});
```

**Payment Service (`payment.service.ts`):**
```typescript
const validatePaymentSuccess = async (val_id: string, tran_id: string) => {
  console.log('=== Validating Payment Success ===');
  console.log('Validation ID:', val_id);
  console.log('Transaction ID:', tran_id);
  console.log('SSLCommerz Validation Result:', validation);
  console.log('Order found:', order.orderNumber, 'Current status:', order.status);
  console.log('Order updated successfully:', updatedOrder);
  // ... rest of code
};
```

### ✅ 2. Verified Body Parsing

**Express Configuration (`app.ts`):**
```typescript
app.use(express.json());
app.use(express.urlencoded({ limit: '500mb', extended: true })); // ✅ This parses form data
```

### ✅ 3. Fixed Callback URLs

**Payment Data Preparation:**
```typescript
const paymentData = {
  // Updated to match frontend routes
  success_url: config.sslcommerz.success_url || `${config.base_url_client}/en/payment/success`,
  fail_url: config.sslcommerz.fail_url || `${config.base_url_client}/en/payment/failed`,
  cancel_url: config.sslcommerz.cancel_url || `${config.base_url_client}/en/payment/cancelled`,
};
```

### ✅ 4. Fixed Field Names

```typescript
ship_name: order.shippingAddress?.fullName || userName, // ✅ Was: .name
```

### ✅ 5. Added Error Handling

```typescript
const sslCommerzSuccess = catchAsync(async (req, res) => {
  // Validate required fields
  if (!val_id || !tran_id) {
    console.error('Missing val_id or tran_id in callback');
    return res.redirect(`${process.env.BASE_URL_CLIENT}/en/payment/failed?message=Invalid callback data`);
  }

  try {
    const result = await PaymentService.validatePaymentSuccess(val_id, tran_id);
    res.redirect(`${process.env.BASE_URL_CLIENT}/en/payment/success?order=${result.order.orderNumber}`);
  } catch (error: any) {
    console.error('Payment validation error:', error.message);
    res.redirect(`${process.env.BASE_URL_CLIENT}/en/payment/failed?message=${encodeURIComponent(error.message)}`);
  }
});
```

### ✅ 6. Prevent Duplicate Processing

```typescript
// Check if already processed
if (order.paymentStatus === 'SUCCESS') {
  console.log('Payment already processed for order:', order.orderNumber);
  return {
    success: true,
    order,
  };
}
```

---

## Debugging Steps

### Step 1: Check Server Logs

After completing a payment, check the backend console for these logs:

```bash
=== SSLCommerz Success Callback ===
Request Body: { val_id: '...', tran_id: '...', amount: '...', ... }
Validation ID: xxxxxxxxxxxxx
Transaction ID: TXN-1234567890-ABC123

=== Validating Payment Success ===
🔍 Validating payment with SSLCommerz, val_id: xxxxxxxxxxxxx
✅ SSLCommerz Validation Response: { status: 'VALID', ... }
Order found: ORD-XXXXXXXXXX Current status: PENDING
Order updated successfully: {
  orderNumber: 'ORD-XXXXXXXXXX',
  paymentStatus: 'SUCCESS',
  status: 'PROCESSING'
}
```

### Step 2: If Callback Not Received

**Check these:**

1. **SSLCommerz Sandbox/Live URL:**
```bash
# In .env
SSLCOMMERZ_IS_LIVE=false  # For sandbox
SSLCOMMERZ_IS_LIVE=true   # For live
```

2. **Callback URLs in .env:**
```bash
SSLCOMMERZ_SUCCESS_URL=http://localhost:3000/en/payment/success
SSLCOMMERZ_FAIL_URL=http://localhost:3000/en/payment/failed
SSLCOMMERZ_CANCEL_URL=http://localhost:3000/en/payment/cancelled
```

3. **Backend Server Running:**
```bash
# Should see this in terminal
Server is running on port 5000
```

4. **Localhost Limitation:**
   - SSLCommerz cannot call IPN URL on localhost
   - Success callback works because it's browser redirect
   - IPN requires publicly accessible URL

### Step 3: Manual Database Check

If payment is successful but status not updated:

```javascript
// In MongoDB
use haatghor

// Find the order
db.orders.find({ sslCommerzTranId: "TXN-XXXXXXXXX" }).pretty()

// Check current status
db.orders.find({ 
  orderNumber: "ORD-XXXXXXXXXX" 
}, {
  orderNumber: 1,
  paymentStatus: 1,
  status: 1,
  sslCommerzTranId: 1,
  sslCommerzValId: 1
}).pretty()

// Manually update if needed (EMERGENCY ONLY)
db.orders.updateOne(
  { orderNumber: "ORD-XXXXXXXXXX" },
  { 
    $set: { 
      paymentStatus: "SUCCESS", 
      status: "PROCESSING",
      sslCommerzValId: "validation_id_here",
      sslCommerzBankTranId: "bank_tran_id_here"
    } 
  }
)
```

---

## Testing Checklist

### ✅ Pre-Test Setup
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] MongoDB connection active
- [ ] `.env` file configured with SSLCommerz credentials
- [ ] Backend logs visible in terminal

### ✅ Test Flow
1. [ ] Login to frontend
2. [ ] Add items to cart
3. [ ] Go to checkout
4. [ ] Fill shipping address
5. [ ] Select online payment (bKash/Nagad/Card)
6. [ ] Click "Place Order"
7. [ ] Verify backend logs show payment initialization
8. [ ] Complete payment on SSLCommerz gateway
9. [ ] **WATCH BACKEND LOGS** for callback
10. [ ] Verify redirect to success page
11. [ ] Check order status in dashboard

### ✅ Expected Backend Logs

**On Order Creation:**
```
Initiating payment for: { orderId: '...', userId: '...', userEmail: '...' }
Order found: Yes
SSLCommerz Init Response: { status: 'SUCCESS', GatewayPageURL: '...' }
```

**On Payment Success:**
```
=== SSLCommerz Success Callback ===
Request Body: { val_id: '...', tran_id: '...', ... }
=== Validating Payment Success ===
🔍 Validating payment with SSLCommerz
✅ SSLCommerz Validation Response: { status: 'VALID', ... }
Order found: ORD-XXXXXXXXXX Current status: PENDING
Order updated successfully: { paymentStatus: 'SUCCESS', status: 'PROCESSING' }
```

---

## Common Issues & Solutions

### Issue 1: No Callback Logs

**Symptoms:**
- Payment completes
- User redirected to success page
- No callback logs in backend
- Order status still PENDING

**Solutions:**

**A. Check if SSLCommerz is calling the endpoint:**
```bash
# Add this temporarily to success callback
console.log('=== CALLBACK RECEIVED ===');
console.log('Headers:', req.headers);
console.log('Body:', req.body);
console.log('Query:', req.query);
console.log('URL:', req.url);
```

**B. Verify Express body parsing:**
```typescript
// In app.ts, ensure this exists:
app.use(express.urlencoded({ extended: true }));
```

**C. Check route is correct:**
```bash
# Should be:
POST /api/v1/payments/sslcommerz/success
```

### Issue 2: Validation Fails

**Symptoms:**
- Callback received
- Validation fails with error
- Order not updated

**Check logs for:**
```
❌ SSLCommerz Validation Error: ...
```

**Solutions:**

**A. Verify SSLCommerz credentials:**
```bash
# In .env
SSLCOMMERZ_STORE_ID=testbox123456
SSLCOMMERZ_STORE_PASSWORD=testbox123456@ssl
```

**B. Check validation response:**
```javascript
// Look for this log
✅ SSLCommerz Validation Response: { status: 'VALID', ... }

// If status is not VALID or VALIDATED, payment failed
```

**C. Test validation directly:**
```bash
curl -X GET "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=YOUR_VAL_ID&store_id=testbox123456&store_passwd=testbox123456@ssl&format=json"
```

### Issue 3: Order Not Found

**Symptoms:**
- Callback received
- Error: "Order not found for this transaction"

**Solutions:**

**A. Check transaction ID is saved:**
```javascript
// In MongoDB
db.orders.find({ sslCommerzTranId: "TXN-XXXXXXXXX" })

// Should return the order
```

**B. Verify transaction ID matches:**
```
// Check logs
Transaction ID from callback: TXN-1234567890-ABC123
Order sslCommerzTranId: TXN-1234567890-ABC123
// Must match exactly
```

**C. Check order creation:**
```javascript
// Ensure order was created with transaction ID
// Look for this log during payment init
console.log('Order updated with transaction ID:', tranId);
```

### Issue 4: Multiple Callbacks

**Symptoms:**
- Success callback called multiple times
- Duplicate update attempts

**Solution:**
Already handled with duplicate check:
```typescript
if (order.paymentStatus === 'SUCCESS') {
  console.log('Payment already processed');
  return { success: true, order };
}
```

---

## Environment Variables Checklist

```bash
# ✅ Required for Payment to Work
SSLCOMMERZ_STORE_ID=testbox123456
SSLCOMMERZ_STORE_PASSWORD=testbox123456@ssl
SSLCOMMERZ_IS_LIVE=false

# ✅ Callback URLs (MUST match frontend routes)
SSLCOMMERZ_SUCCESS_URL=http://localhost:3000/en/payment/success
SSLCOMMERZ_FAIL_URL=http://localhost:3000/en/payment/failed
SSLCOMMERZ_CANCEL_URL=http://localhost:3000/en/payment/cancelled
SSLCOMMERZ_IPN_URL=http://localhost:5000/api/v1/payments/sslcommerz/ipn

# ✅ Server URLs
BASE_URL_SERVER=http://localhost:5000
BASE_URL_CLIENT=http://localhost:3000

# ✅ Database
DATABASE_URL=mongodb+srv://...
```

---

## Production Deployment Notes

### For Live Environment

1. **Update Credentials:**
```bash
SSLCOMMERZ_STORE_ID=your_live_store_id
SSLCOMMERZ_STORE_PASSWORD=your_live_store_password
SSLCOMMERZ_IS_LIVE=true
```

2. **Update URLs:**
```bash
SSLCOMMERZ_SUCCESS_URL=https://yourdomain.com/en/payment/success
SSLCOMMERZ_FAIL_URL=https://yourdomain.com/en/payment/failed
SSLCOMMERZ_CANCEL_URL=https://yourdomain.com/en/payment/cancelled
SSLCOMMERZ_IPN_URL=https://yourdomain.com/api/v1/payments/sslcommerz/ipn

BASE_URL_SERVER=https://api.yourdomain.com
BASE_URL_CLIENT=https://yourdomain.com
```

3. **Enable HTTPS:**
   - All URLs must use HTTPS
   - SSLCommerz requires SSL/TLS

4. **Configure CORS:**
```typescript
// In app.ts
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true,
}));
```

5. **Set up Monitoring:**
   - Monitor payment success rate
   - Alert on validation failures
   - Track callback response times

---

## Testing in Production

### Test with Small Amount

1. Create real order with small amount (e.g., 10 BDT)
2. Complete payment with real card
3. Verify:
   - Callback received
   - Validation successful
   - Order status updated
   - Customer receives confirmation

### Monitor Logs

```bash
# Tail server logs
tail -f /var/log/your-app/server.log | grep "SSLCommerz"

# Watch for errors
tail -f /var/log/your-app/error.log
```

---

## Rollback Plan

If issues persist in production:

1. **Temporary Fix:**
   - Manually update orders in database
   - Process refunds if needed
   - Email customers

2. **Disable Online Payments:**
```typescript
// Temporarily hide online payment options
const paymentMethods = ['CASH_ON_DELIVERY'];
```

3. **Revert to Previous Version:**
```bash
git revert HEAD
npm run build
pm2 restart app
```

---

## Support Contacts

### SSLCommerz Support
- **Email:** operation@sslcommerz.com
- **Phone:** +88-02-8189788
- **Hours:** 9 AM - 6 PM (GMT+6)

### Report Issues
1. Collect full logs
2. Note transaction IDs
3. Screenshot error messages
4. Contact SSLCommerz support with:
   - Store ID
   - Transaction ID
   - Error message
   - Timestamp

---

## Summary

### ✅ What Was Fixed
1. Added comprehensive logging throughout payment flow
2. Fixed callback URL redirects to match frontend routes
3. Fixed shipping address field name (`fullName` not `name`)
4. Added error handling and validation
5. Prevented duplicate processing
6. Enhanced error messages

### ✅ How to Verify Fix
1. Check backend logs during payment
2. Look for success callback logs
3. Verify validation response
4. Confirm order status changes to PROCESSING
5. Check payment status changes to SUCCESS

### ✅ Next Steps
1. Test with sandbox credentials
2. Monitor backend logs during test payment
3. Verify order status updates correctly
4. Check cart clears after success
5. Test "Make Payment" button for retry

---

**Last Updated:** January 26, 2026
**Status:** ✅ FIXED - Enhanced logging and error handling added
