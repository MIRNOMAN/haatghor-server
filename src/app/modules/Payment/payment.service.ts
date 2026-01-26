import { UserRoleEnum } from '@prisma/client';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { subscriptionCheckout } from '../../utils/StripeUtils';
import {
  initSSLCommerzPayment,
  validateSSLCommerzPayment,
  generateTransactionId,
} from '../../utils/sslcommerzPayment';
import config from '../../../config';

const handleBuySubscription = async (
  id: string,
  userId: string,
  email: string,
  role: UserRoleEnum,
) => {
  const subscription = await prisma.subscription.findUniqueOrThrow({
    where: {
      id,
      isVisible: true,
    },
  });
  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  const isHaveSubscription = await prisma.payment.findFirst({
    where: {
      userId,
      paymentStatus: 'SUCCESS',
      endAt: {
        gte: new Date(),
      },
      paymentType: 'SUBSCRIPTION',
    },
  });
  if (isHaveSubscription) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Already a subscription available!',
    );
  }

  const isPaymentExist = await prisma.payment.findUnique({
    where: {
      userId_subscriptionPackageId: {
        subscriptionPackageId: id,
        userId: userId,
      },
    },
    select: {
      id: true,
      userId: true,
      paymentMethodType: true,
      paymentStatus: true,
    },
  });
  if (isPaymentExist && isPaymentExist.paymentStatus === 'SUCCESS') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Already paid');
  }
  if (isPaymentExist) {
    const url = await subscriptionCheckout({
      email: email,
      paymentId: isPaymentExist.id,
      productId: subscription.stripeProductId,
      role: role,
    });
    return { url };
  } else {
    const paymentData = await prisma.payment.create({
      data: {
        userId: userId,
        subscriptionPackageId: id,
        amount: subscription.price,
        currency: 'sek',
        paymentType: 'SUBSCRIPTION',
      },
    });
    const url = await subscriptionCheckout({
      email: email,
      paymentId: paymentData.id,
      productId: subscription.stripeProductId,
      role: role,
    });
    return { url };
  }
};

const getAllPayments = async (
  userId: string,
  role: UserRoleEnum,
  query: Record<string, any>,
) => {
  if (role !== 'SUPERADMIN') {
    query.userId = userId;
  }
  const paymentQuery = new QueryBuilder<typeof prisma.transaction>(
    prisma.transaction,
    query,
  );
  const result = await paymentQuery
    .search([
      'user.name',
      'user.email',
      'vehicle.title',
      'stripePaymentId',
      'stripeSessionId',
    ])
    .filter()
    .sort()
    .customFields({
      id: true,
      amount: true,
      userId: true,
      cardBrand: true,
      cardExpMonth: true,
      cardExpYear: true,
      cardLast4: true,
      paymentId: true,
      payment: {
        select: {
          paymentType: true,
          paymentMethodType: true,
          paymentStatus: true,
          stripeCustomerId: true,
          stripePaymentId: true,
          startAt: true,
          endAt: true,
          stripeSubscriptionId: true,
          stripeSessionId: true,
        },
      },

      createdAt: true,

      stripeSessionId: true,

      user: {
        select: {
          profilePhoto: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    })
    .exclude()
    .paginate()
    .execute();
  return result;
};

const singleTransactionHistory = async (query: {
  id: string;
  userId?: string;
}) => {
  const result = await prisma.transaction.findUnique({
    where: query,
    select: {
      id: true,
      amount: true,
      userId: true,
      cardBrand: true,
      cardExpMonth: true,
      cardExpYear: true,
      cardLast4: true,
      paymentId: true,
      payment: {
        select: {
          paymentType: true,
          paymentMethodType: true,
          paymentStatus: true,
          stripeCustomerId: true,
          stripePaymentId: true,
          startAt: true,
          endAt: true,
          stripeSubscriptionId: true,
        },
      },

      createdAt: true,

      stripeSessionId: true,

      user: {
        select: {
          profilePhoto: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Transaction history not found');
  }
  return result;
};

const singleTransactionHistoryBySessionId = async (query: {
  stripeSessionId: string;
  userId?: string;
}) => {
  const result = await prisma.payment.findUnique({
    where: query,
    select: {
      id: true,
      amount: true,
      userId: true,
      paymentMethodType: true,
      createdAt: true,
      stripeCustomerId: true,
      stripePaymentId: true,
      stripeSessionId: true,
      currency: true,
      paymentStatus: true,
      startAt: true,
      endAt: true,
      stripeSubscriptionId: true,
      user: {
        select: {
          profilePhoto: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Transaction history not found');
  }
  return result;
};

const handleRenewSubscription = async (
  id: string,
  userId: string,
  email: string,
  role: UserRoleEnum,
) => {
  const subscription = await prisma.subscription.findUniqueOrThrow({
    where: {
      id,
      isVisible: true,
    },
  });

  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  // Check if user has an expired or cancelled subscription for this package
  const expiredPayment = await prisma.payment.findFirst({
    where: {
      userId: userId,
      subscriptionPackageId: id,
      paymentType: 'SUBSCRIPTION',
      OR: [
        { paymentStatus: 'EXPIRED' },
        { paymentStatus: 'CANCELLED' },
        {
          paymentStatus: 'SUCCESS',
          endAt: { lt: new Date() }, // Subscription has ended
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!expiredPayment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No expired subscription found to renew',
    );
  }

  // Create new payment for renewal
  const renewalPayment = await prisma.payment.create({
    data: {
      userId: userId,
      subscriptionPackageId: id,
      amount: 10,
      currency: 'sek',
      paymentType: 'SUBSCRIPTION',
    },
  });

  const url = await subscriptionCheckout({
    email: email,
    paymentId: renewalPayment.id,
    productId: subscription.stripeProductId,
    role: role,
  });

  return { url };
};

const getUserActiveSubscriptions = async (userId: string) => {
  const activeSubscriptions = await prisma.payment.findFirst({
    where: {
      userId: userId,
      paymentType: 'SUBSCRIPTION',
      paymentStatus: 'SUCCESS',
      endAt: { gt: new Date() }, // Still active
    },
    include: {
      subscriptionPackage: {
        select: {
          id: true,
          name: true,
          stripeProductId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return activeSubscriptions || {};
};

const cancelPayment = async (
  id: string,
  userId: string,
  role: UserRoleEnum,
) => {
  return await prisma.payment.update({
    where: {
      id,
      ...(role !== 'SUPERADMIN' && { userId }),
    },
    data: {
      paymentStatus: 'CANCELLED',
    },
  });
};

/**
 * Initialize SSLCommerz payment for order
 */
const initOrderPayment = async (
  orderId: string,
  userId: string,
  userEmail: string,
  userName: string,
  userPhone: string,
) => {
  // Debug logs
  console.log('Initiating payment for:', { orderId, userId, userEmail });
  
  // Get order details
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
  
  console.log('Order found:', order ? 'Yes' : 'No');
  if (!order) {
    console.log('Order not found with orderId:', orderId, 'and userId:', userId);
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  if (order.paymentStatus === 'SUCCESS') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Order already paid');
  }

  // Generate transaction ID
  const tranId = generateTransactionId();

  // Prepare payment data
  const paymentData = {
    total_amount: order.finalAmount,
    currency: 'BDT',
    tran_id: tranId,
    success_url: config.sslcommerz.success_url || `${config.base_url_client}/en/payment/success`,
    fail_url: config.sslcommerz.fail_url || `${config.base_url_client}/en/payment/failed`,
    cancel_url: config.sslcommerz.cancel_url || `${config.base_url_client}/en/payment/cancelled`,
    ipn_url: config.sslcommerz.ipn_url,
    cus_name: userName,
    cus_email: userEmail,
    cus_phone: userPhone,
    cus_add1: order.shippingAddress?.address || 'N/A',
    cus_city: order.shippingAddress?.city || 'Dhaka',
    cus_country: order.shippingAddress?.country || 'Bangladesh',
    product_name: `Order ${order.orderNumber}`,
    product_category: 'E-commerce',
    product_profile: 'general',
  
    // Shipping info (optional but recommended)
    shipping_method: order.shippingAddress ? 'YES' : 'NO',
    ship_name: order.shippingAddress?.fullName || userName, // ✅ Fixed: use fullName not name
    ship_add1: order.shippingAddress?.address,
    ship_city: order.shippingAddress?.city,
    ship_country: order.shippingAddress?.country || 'Bangladesh',
    ship_postcode: order.shippingAddress?.zipCode || '0000',
    ship_state: order.shippingAddress?.state || 'Dhaka',
  
    value_a: orderId, // Store order ID for later reference
    value_b: userId,
  };
  
  

  // Initialize payment
  const result = await initSSLCommerzPayment(paymentData);

  if (!result.success) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      result.error || 'Failed to initialize payment',
    );
  }

  // Update order with transaction ID
  await prisma.order.update({
    where: { id: orderId },
    data: {
      sslCommerzTranId: tranId,
    },
  });

  return {
    paymentUrl: result.GatewayPageURL,  // Changed key name for frontend consistency
    GatewayPageURL: result.GatewayPageURL,
    tranId,
    orderId,
  };
};

/**
 * Validate SSLCommerz payment success
 */
const validatePaymentSuccess = async (val_id: string, tran_id: string) => {
  console.log('\n🔍 ='.repeat(40));
  console.log('=== Validating Payment Success ===');
  console.log('Validation ID:', val_id);
  console.log('Transaction ID:', tran_id);

  // Get order by transaction ID FIRST
  const order = await prisma.order.findFirst({
    where: { sslCommerzTranId: tran_id },
  });

  if (!order) {
    console.error('❌ Order not found with transaction ID:', tran_id);
    
    // List recent orders for debugging
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        sslCommerzTranId: true,
        paymentStatus: true,
      },
    });
    console.log('📋 Recent orders with transaction IDs:', recentOrders);
    
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found for this transaction');
  }

  console.log('✅ Order found:', {
    orderNumber: order.orderNumber,
    currentStatus: order.status,
    currentPaymentStatus: order.paymentStatus,
  });

  // Check if already processed
  if (order.paymentStatus === 'SUCCESS') {
    console.log('⚠️ Payment already processed for order:', order.orderNumber);
    return {
      success: true,
      order,
    };
  }

  // Validate with SSLCommerz (skip in sandbox for testing)
  const isSandbox = config.sslcommerz.is_live === false;
  let validatedData: any = null;

  if (isSandbox) {
    console.log('⚠️ SANDBOX MODE: Skipping SSLCommerz validation');
    console.log('💡 In production, validation is mandatory!');
    validatedData = {
      bank_tran_id: 'SANDBOX_' + Date.now(),
      card_type: 'SANDBOX_CARD',
    };
  } else {
    console.log('🔄 Validating with SSLCommerz API...');
    const validation = await validateSSLCommerzPayment(val_id);
    console.log('SSLCommerz Validation Result:', validation);

    if (!validation.success || !validation.data) {
      console.error('❌ SSLCommerz validation failed:', validation.error);
      throw new AppError(
        httpStatus.BAD_REQUEST,
        validation.error || 'Payment validation failed',
      );
    }
    validatedData = validation.data;
  }

  // Update order payment status
  console.log('💾 Updating order in database...');
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'SUCCESS',
      status: 'PROCESSING',
      sslCommerzValId: val_id,
      sslCommerzBankTranId: validatedData.bank_tran_id,
      sslCommerzCardType: validatedData.card_type,
    },
  });

  console.log('✅ ✅ ✅ Order updated successfully ✅ ✅ ✅');
  console.log('📦 Order Details:', {
    orderNumber: updatedOrder.orderNumber,
    paymentStatus: updatedOrder.paymentStatus,
    status: updatedOrder.status,
    sslCommerzValId: updatedOrder.sslCommerzValId,
  });
  console.log('='.repeat(80));
  console.log('\n');

  return {
    success: true,
    order: updatedOrder,
  };
};

/**
 * Handle SSLCommerz payment failure
 */
const handlePaymentFailure = async (tran_id: string) => {
  const order = await prisma.order.findFirst({
    where: { sslCommerzTranId: tran_id },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'FAILED',
        status: 'CANCELLED',
      },
    });
  }

  return { success: true };
};

/**
 * Handle SSLCommerz payment cancellation
 */
const handlePaymentCancellation = async (tran_id: string) => {
  const order = await prisma.order.findFirst({
    where: { sslCommerzTranId: tran_id },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'CANCELLED',
        status: 'CANCELLED',
      },
    });
  }

  return { success: true };
};

/**
 * Handle SSLCommerz IPN (Instant Payment Notification)
 */
const handleSSLCommerzIPN = async (ipnData: any) => {
  const { val_id, tran_id, status } = ipnData;

  if (status === 'VALID' || status === 'VALIDATED') {
    await validatePaymentSuccess(val_id, tran_id);
  } else if (status === 'FAILED') {
    await handlePaymentFailure(tran_id);
  } else if (status === 'CANCELLED') {
    await handlePaymentCancellation(tran_id);
  }

  return { success: true };
};

export const PaymentService = {
  getAllPayments,
  singleTransactionHistory,
  singleTransactionHistoryBySessionId,
  cancelPayment,
  handleBuySubscription,
  handleRenewSubscription,
  getUserActiveSubscriptions,
  initOrderPayment,
  validatePaymentSuccess,
  handlePaymentFailure,
  handlePaymentCancellation,
  handleSSLCommerzIPN,
};
