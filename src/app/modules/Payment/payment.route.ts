import express from 'express';
import auth from '../../middlewares/auth';
import { PaymentController } from './payment.controller';
import { parseBody } from '../../middlewares/parseBody';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';

const router = express.Router();



router.post(
  '/buy-subscription',
  auth('ANY'),
  validateRequest.body(PaymentValidation.buySubscriptionSchema),
  PaymentController.handleBuySubscription,
);

router.post(
  '/renew-subscription',
  auth('ANY'),
  validateRequest.body(PaymentValidation.renewSubscriptionSchema),
  PaymentController.handleRenewSubscription,
);

// Get user's active subscriptions
router.get('/active-subscriptions', auth('ANY'), PaymentController.getUserActiveSubscriptions);

// Payment history and management
router.get('/', auth('ANY'), PaymentController.getAllPayments);

router.get('/:id', auth('ANY'), PaymentController.singleTransactionHistory);

router.get('/session/:sessionId', auth('ANY'), PaymentController.singleTransactionHistoryBySessionId);

router.patch('/:id/cancel', auth('ANY'), PaymentController.cancelPayment);

// SSLCommerz payment routes
router.post('/sslcommerz/init', auth('ANY'), PaymentController.initOrderPayment);
router.post('/sslcommerz/success', PaymentController.sslCommerzSuccess);
router.post('/sslcommerz/fail', PaymentController.sslCommerzFail);
router.post('/sslcommerz/cancel', PaymentController.sslCommerzCancel);
router.post('/sslcommerz/ipn', PaymentController.sslCommerzIPN);

export const PaymentRoutes = router;