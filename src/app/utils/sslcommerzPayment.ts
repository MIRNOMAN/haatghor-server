import axios from 'axios';
import config from '../../config';
import { customConsole } from './customConsole';

interface SSLCommerzInitData {
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url?: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_add2?: string;
  cus_city: string;
  cus_state?: string;
  cus_postcode?: string;
  cus_country: string;
  cus_phone: string;
  cus_fax?: string;
  shipping_method?: string;
  product_name: string;
  product_category: string;
  product_profile: string;
  ship_name?: string;
  ship_add1?: string;
  ship_add2?: string;
  ship_city?: string;
  ship_state?: string;
  ship_postcode?: string;
  ship_country?: string;
  multi_card_name?: string;
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;
}

interface SSLCommerzResponse {
  status: string;
  failedreason?: string;
  sessionkey?: string;
  gw?: {
    visa?: string;
    master?: string;
    amex?: string;
    othercards?: string;
    internetbank?: string;
    mobilebank?: string;
  };
  GatewayPageURL?: string;
  storeBanner?: string;
  storeLogo?: string;
  redirectGatewayURL?: string;
  directPaymentURLBank?: string;
  directPaymentURLCard?: string;
  directPaymentURL?: string;
}

interface SSLCommerzValidationResponse {
  status: string;
  tran_date: string;
  tran_id: string;
  val_id: string;
  amount: string;
  store_amount: string;
  currency: string;
  bank_tran_id: string;
  card_type: string;
  card_no: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
  currency_type: string;
  currency_amount: string;
  currency_rate: string;
  base_fair: string;
  value_a: string;
  value_b: string;
  value_c: string;
  value_d: string;
  risk_title: string;
  risk_level: string;
  APIConnect?: string;
  validated_on?: string;
  gw_version?: string;
}

/**
 * Get SSLCommerz API URL based on environment
 */
const getSSLCommerzURL = (endpoint: string = ''): string => {
  const baseURL = config.sslcommerz.is_live
    ? 'https://securepay.sslcommerz.com'
    : 'https://sandbox.sslcommerz.com';
  return `${baseURL}${endpoint}`;
};

/**
 * Initialize SSLCommerz payment session
 */
export const initSSLCommerzPayment = async (
  paymentData: SSLCommerzInitData,
): Promise<{ success: boolean; GatewayPageURL?: string; error?: string }> => {
  try {
    if (!config.sslcommerz.store_id || !config.sslcommerz.store_password) {
      throw new Error('SSLCommerz credentials not configured');
    }

    const data = {
      store_id: config.sslcommerz.store_id,
      store_passwd: config.sslcommerz.store_password,
      ...paymentData,
    };

    const response = await axios.post<SSLCommerzResponse>(
      getSSLCommerzURL('/gwprocess/v4/api.php'),
      data,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    customConsole.info('SSLCommerz Init Response:', response.data);

    if (response.data.status === 'SUCCESS' && response.data.GatewayPageURL) {
      return {
        success: true,
        GatewayPageURL: response.data.GatewayPageURL,
      };
    }

    return {
      success: false,
      error: response.data.failedreason || 'Failed to initialize payment',
    };
  } catch (error: any) {
    customConsole.error('SSLCommerz Init Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.failedreason || error.message || 'Payment initialization failed',
    };
  }
};

/**
 * Validate SSLCommerz payment
 */
export const validateSSLCommerzPayment = async (
  val_id: string,
): Promise<{ success: boolean; data?: SSLCommerzValidationResponse; error?: string }> => {
  try {
    if (!config.sslcommerz.store_id || !config.sslcommerz.store_password) {
      throw new Error('SSLCommerz credentials not configured');
    }

    const response = await axios.get<SSLCommerzValidationResponse>(
      getSSLCommerzURL('/validator/api/validationserverAPI.php'),
      {
        params: {
          val_id: val_id,
          store_id: config.sslcommerz.store_id,
          store_passwd: config.sslcommerz.store_password,
          format: 'json',
        },
      },
    );

    customConsole.info('SSLCommerz Validation Response:', response.data);

    if (response.data.status === 'VALID' || response.data.status === 'VALIDATED') {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: 'Payment validation failed',
    };
  } catch (error: any) {
    customConsole.error('SSLCommerz Validation Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message || 'Payment validation failed',
    };
  }
};

/**
 * Check transaction status
 */
export const checkSSLCommerzTransactionStatus = async (
  tran_id: string,
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    if (!config.sslcommerz.store_id || !config.sslcommerz.store_password) {
      throw new Error('SSLCommerz credentials not configured');
    }

    const response = await axios.get(
      getSSLCommerzURL('/validator/api/merchantTransIDvalidationAPI.php'),
      {
        params: {
          tran_id: tran_id,
          store_id: config.sslcommerz.store_id,
          store_passwd: config.sslcommerz.store_password,
          format: 'json',
        },
      },
    );

    customConsole.info('SSLCommerz Transaction Status:', response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    customConsole.error('SSLCommerz Transaction Status Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message || 'Failed to check transaction status',
    };
  }
};

/**
 * Initiate refund
 */
export const initiateSSLCommerzRefund = async (
  bank_tran_id: string,
  refund_amount: number,
  refund_remarks: string,
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    if (!config.sslcommerz.store_id || !config.sslcommerz.store_password) {
      throw new Error('SSLCommerz credentials not configured');
    }

    const data = {
      store_id: config.sslcommerz.store_id,
      store_passwd: config.sslcommerz.store_password,
      bank_tran_id: bank_tran_id,
      refund_amount: refund_amount,
      refund_remarks: refund_remarks,
      format: 'json',
    };

    const response = await axios.post(
      getSSLCommerzURL('/validator/api/merchantTransIDvalidationAPI.php'),
      data,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    customConsole.info('SSLCommerz Refund Response:', response.data);

    if (response.data.status === 'SUCCESS') {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.data.errorReason || 'Refund initiation failed',
    };
  } catch (error: any) {
    customConsole.error('SSLCommerz Refund Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message || 'Refund initiation failed',
    };
  }
};

/**
 * Helper function to generate transaction ID
 */
export const generateTransactionId = (): string => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
};
