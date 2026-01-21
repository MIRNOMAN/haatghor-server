import axios from 'axios';
import crypto from 'crypto';
import config from '../../config';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

interface INagadPaymentRequest {
  amount: number;
  orderId: string;
  productDetails?: string;
}

const generateSignature = (data: string): string => {
  try {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(config.nagad?.private_key as string, 'base64');
  } catch (error) {
    console.error('Nagad signature error:', error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate signature');
  }
};

export const createNagadPayment = async (payload: INagadPaymentRequest) => {
  try {
    const dateTime = new Date().toISOString();
    const orderId = payload.orderId;
    const amount = payload.amount.toString();

    // Initialize payment
    const sensitiveData = {
      merchantId: config.nagad?.merchant_id,
      datetime: dateTime,
      orderId: orderId,
      challenge: crypto.randomBytes(10).toString('hex'),
    };

    const sensitiveDataString = JSON.stringify(sensitiveData);
    const signature = generateSignature(sensitiveDataString);

    const initResponse = await axios.post(
      `${config.nagad?.base_url}/check-out/initialize/${config.nagad?.merchant_id}/${orderId}`,
      {
        dateTime,
        sensitiveData: Buffer.from(sensitiveDataString).toString('base64'),
        signature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': '103.205.129.56',
          'X-KM-Client-Type': 'PC_WEB',
        },
      },
    );

    // Complete payment
    const paymentData = {
      merchantId: config.nagad?.merchant_id,
      orderId: orderId,
      currencyCode: '050',
      amount: amount,
      challenge: initResponse.data.challenge,
    };

    const paymentDataString = JSON.stringify(paymentData);
    const paymentSignature = generateSignature(paymentDataString);

    const completeResponse = await axios.post(
      `${config.nagad?.base_url}/check-out/complete/${initResponse.data.paymentReferenceId}`,
      {
        paymentRefId: initResponse.data.paymentReferenceId,
        sensitiveData: Buffer.from(paymentDataString).toString('base64'),
        signature: paymentSignature,
        merchantCallbackURL: `${config.base_url_server}/api/v1/payments/nagad/callback`,
        additionalMerchantInfo: {
          productDetails: payload.productDetails || 'eCommerce Order',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': '103.205.129.56',
          'X-KM-Client-Type': 'PC_WEB',
        },
      },
    );

    return {
      paymentReferenceId: initResponse.data.paymentReferenceId,
      nagadURL: completeResponse.data.callBackUrl,
      orderId: orderId,
    };
  } catch (error: any) {
    console.error('Nagad payment error:', error.response?.data || error.message);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create Nagad payment');
  }
};

export const verifyNagadPayment = async (paymentRefId: string) => {
  try {
    const { data } = await axios.get(
      `${config.nagad?.base_url}/verify/payment/${paymentRefId}`,
      {
        headers: {
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': '103.205.129.56',
          'X-KM-Client-Type': 'PC_WEB',
        },
      },
    );

    return data;
  } catch (error: any) {
    console.error('Nagad verify payment error:', error.response?.data || error.message);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to verify Nagad payment');
  }
};
