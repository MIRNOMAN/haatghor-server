import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentService } from './payment.service';


const handleBuySubscription = catchAsync(async (req, res) => {
  const subscriptionId = req.body.subscriptionId;
  const userId = req.user.id;
  const email = req.user.email;
  const role = req.user.role;

  const result = await PaymentService.handleBuySubscription(subscriptionId, userId, email, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Subscription payment session created successfully',
    data: result,
  });
});

// Renew expired/cancelled subscription
const handleRenewSubscription = catchAsync(async (req, res) => {
  const subscriptionId = req.body.subscriptionId; // Subscription package ID from your DB
  const userId = req.user.id;
  const email = req.user.email;
  const role = req.user.role;

  const result = await PaymentService.handleRenewSubscription(subscriptionId, userId, email, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Subscription renewal session created successfully',
    data: result,
  });
});

// Get user's active subscriptions
const getUserActiveSubscriptions = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await PaymentService.getUserActiveSubscriptions(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Active subscriptions retrieved successfully',
    data: result,
  });
});

// Get all payments (superadmin -> all, others -> own)
const getAllPayments = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  const result = await PaymentService.getAllPayments(userId, role, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payments retrieved successfully',
    data: result,
  });
});

// Single transaction history by ID
const singleTransactionHistory = catchAsync(async (req, res) => {
  const query = {
    id: req.params.id,
    ...(req.user.role !== 'SUPERADMIN' && { userId: req.user.id }),
  };

  const result = await PaymentService.singleTransactionHistory(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Transaction history retrieved successfully',
    data: result,
  });
});

// Single transaction history by Stripe sessionId
const singleTransactionHistoryBySessionId = catchAsync(async (req, res) => {
  const query = {
    stripeSessionId: req.params.sessionId,
    ...(req.user.role !== 'SUPERADMIN' && { userId: req.user.id }),
  };

  const result = await PaymentService.singleTransactionHistoryBySessionId(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Transaction history retrieved successfully by sessionId',
    data: result,
  });
});

// Cancel payment
const cancelPayment = catchAsync(async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const role = req.user.role;

  const result = await PaymentService.cancelPayment(id, userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment cancelled successfully',
    data: result,
  });
});

// Initialize SSLCommerz payment for order
const initOrderPayment = catchAsync(async (req, res) => {
  const { orderId } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;
  const userName = `${req.user.firstName} ${req.user.lastName}`;
  const userPhone = req.user.phoneNumber || 'N/A';

  const result = await PaymentService.initOrderPayment(
    orderId,
    userId,
    userEmail,
    userName,
    userPhone,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment initialized successfully',
    data: result,
  });
});

// SSLCommerz payment success callback
const sslCommerzSuccess = catchAsync(async (req, res) => {
  console.log('\n\n🎉 ='.repeat(40));
  console.log('=== SSLCommerz Success Callback RECEIVED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request Method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('Request Query:', JSON.stringify(req.query, null, 2));
  console.log('='.repeat(80));
  
  // SSLCommerz sends data in req.body (form-urlencoded)
  const { val_id, tran_id, amount, card_type, status } = req.body;
  
  console.log('📋 Extracted Data:');
  console.log('  - Validation ID:', val_id);
  console.log('  - Transaction ID:', tran_id);
  console.log('  - Amount:', amount);
  console.log('  - Card Type:', card_type);
  console.log('  - Status:', status);

  if (!val_id || !tran_id) {
    console.error('❌ Missing val_id or tran_id in callback');
    return res.redirect(`${process.env.BASE_URL_CLIENT}/en/payment/failed?message=Invalid callback data`);
  }

  try {
    console.log('🔄 Starting payment validation...');
    const result = await PaymentService.validatePaymentSuccess(val_id, tran_id);
    console.log('✅ Payment validation successful for order:', result.order.orderNumber);
    console.log('✅ Payment Status:', result.order.paymentStatus);
    console.log('✅ Order Status:', result.order.status);
    
    // Redirect to success page with order number
    const redirectUrl = `${process.env.BASE_URL_CLIENT}/en/payment/success?order=${result.order.orderNumber}&orderId=${result.order.id}`;
    console.log('🔀 Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('❌ Payment validation error:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.redirect(`${process.env.BASE_URL_CLIENT}/en/payment/failed?message=${encodeURIComponent(error.message)}`);
  }
});

// SSLCommerz payment failure callback
const sslCommerzFail = catchAsync(async (req, res) => {
  console.log('=== SSLCommerz Failure Callback ===');
  console.log('Request Body:', req.body);
  
  const { tran_id } = req.body;
  
  if (tran_id) {
    await PaymentService.handlePaymentFailure(tran_id);
  }

  // Redirect to failure page
  res.redirect(`${process.env.BASE_URL_CLIENT}/en/payment/failed`);
});

// SSLCommerz payment cancellation callback
const sslCommerzCancel = catchAsync(async (req, res) => {
  console.log('=== SSLCommerz Cancellation Callback ===');
  console.log('Request Body:', req.body);
  
  const { tran_id } = req.body;
  
  if (tran_id) {
    await PaymentService.handlePaymentCancellation(tran_id);
  }

  // Redirect to cancellation page
  res.redirect(`${process.env.BASE_URL_CLIENT}/en/payment/cancelled`);
});

// SSLCommerz IPN handler
const sslCommerzIPN = catchAsync(async (req, res) => {
  console.log('=== SSLCommerz IPN Received ===');
  console.log('IPN Data:', req.body);
  
  try {
    await PaymentService.handleSSLCommerzIPN(req.body);
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'IPN processed successfully',
      data: null,
    });
  } catch (error: any) {
    console.error('IPN Processing Error:', error.message);
    
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'IPN processing failed',
      data: null,
    });
  }
});

export const PaymentController = {
  handleBuySubscription,
  handleRenewSubscription,
  getUserActiveSubscriptions,
  getAllPayments,
  singleTransactionHistory,
  singleTransactionHistoryBySessionId,
  cancelPayment,
  initOrderPayment,
  sslCommerzSuccess,
  sslCommerzFail,
  sslCommerzCancel,
  sslCommerzIPN,
};