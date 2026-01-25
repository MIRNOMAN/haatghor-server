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
  const { val_id, tran_id } = req.body;

  const result = await PaymentService.validatePaymentSuccess(val_id, tran_id);

  // Redirect to success page
  res.redirect(`${process.env.BASE_URL_CLIENT}/payment/success?order=${result.order.orderNumber}`);
});

// SSLCommerz payment failure callback
const sslCommerzFail = catchAsync(async (req, res) => {
  const { tran_id } = req.body;

  await PaymentService.handlePaymentFailure(tran_id);

  // Redirect to failure page
  res.redirect(`${process.env.BASE_URL_CLIENT}/payment/fail`);
});

// SSLCommerz payment cancellation callback
const sslCommerzCancel = catchAsync(async (req, res) => {
  const { tran_id } = req.body;

  await PaymentService.handlePaymentCancellation(tran_id);

  // Redirect to cancellation page
  res.redirect(`${process.env.BASE_URL_CLIENT}/payment/cancel`);
});

// SSLCommerz IPN handler
const sslCommerzIPN = catchAsync(async (req, res) => {
  await PaymentService.handleSSLCommerzIPN(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'IPN processed successfully',
    data: null,
  });
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