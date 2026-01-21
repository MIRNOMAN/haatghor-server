import axios from 'axios';
import config from '../../config';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

let bkashToken: string | null = null;
let tokenExpiry: number = 0;

interface IBkashPaymentRequest {
  amount: number;
  orderId: string;
  intent: 'sale' | 'authorization';
}

interface IBkashExecuteRequest {
  paymentID: string;
}

const getBkashToken = async (): Promise<string> => {
  // Return cached token if still valid
  if (bkashToken && Date.now() < tokenExpiry) {
    return bkashToken;
  }

  try {
    const { data } = await axios.post(
      `${config.bkash?.base_url}/tokenized/checkout/token/grant`,
      {
        app_key: config.bkash?.app_key,
        app_secret: config.bkash?.app_secret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          username: config.bkash?.username,
          password: config.bkash?.password,
        },
      },
    );

    bkashToken = data.id_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Refresh 1 minute before expiry

    return bkashToken!;
  } catch (error: any) {
    console.error('Bkash token error:', error.response?.data || error.message);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get Bkash token');
  }
};

export const createBkashPayment = async (payload: IBkashPaymentRequest) => {
  try {
    const token = await getBkashToken();

    const { data } = await axios.post(
      `${config.bkash?.base_url}/tokenized/checkout/create`,
      {
        mode: '0011',
        payerReference: payload.orderId,
        callbackURL: `${config.base_url_server}/api/v1/payments/bkash/callback`,
        amount: payload.amount.toString(),
        currency: 'BDT',
        intent: payload.intent,
        merchantInvoiceNumber: payload.orderId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
          'X-APP-Key': config.bkash?.app_key,
        },
      },
    );

    return {
      paymentID: data.paymentID,
      bkashURL: data.bkashURL,
      callbackURL: data.callbackURL,
      successCallbackURL: data.successCallbackURL,
      failureCallbackURL: data.failureCallbackURL,
      cancelledCallbackURL: data.cancelledCallbackURL,
    };
  } catch (error: any) {
    console.error('Bkash create payment error:', error.response?.data || error.message);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create Bkash payment');
  }
};

export const executeBkashPayment = async (payload: IBkashExecuteRequest) => {
  try {
    const token = await getBkashToken();

    const { data } = await axios.post(
      `${config.bkash?.base_url}/tokenized/checkout/execute`,
      {
        paymentID: payload.paymentID,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
          'X-APP-Key': config.bkash?.app_key,
        },
      },
    );

    return {
      paymentID: data.paymentID,
      trxID: data.trxID,
      transactionStatus: data.transactionStatus,
      amount: data.amount,
      currency: data.currency,
      intent: data.intent,
      paymentExecuteTime: data.paymentExecuteTime,
      merchantInvoiceNumber: data.merchantInvoiceNumber,
    };
  } catch (error: any) {
    console.error('Bkash execute payment error:', error.response?.data || error.message);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to execute Bkash payment');
  }
};

export const queryBkashPayment = async (paymentID: string) => {
  try {
    const token = await getBkashToken();

    const { data } = await axios.post(
      `${config.bkash?.base_url}/tokenized/checkout/payment/status`,
      {
        paymentID,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
          'X-APP-Key': config.bkash?.app_key,
        },
      },
    );

    return data;
  } catch (error: any) {
    console.error('Bkash query payment error:', error.response?.data || error.message);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to query Bkash payment');
  }
};
