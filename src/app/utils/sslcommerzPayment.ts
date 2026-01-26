import axios from 'axios';
import config from '../../config';

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
  product_name: string;
  product_category: string;
  product_profile: string;
  value_a?: string;
  value_b?: string;
}

interface SSLCommerzResponse {
  status: string;
  failedreason?: string;
  GatewayPageURL?: string;
}

interface SSLCommerzValidationResponse {
  status: string;
  tran_date: string;
  tran_id: string;
  val_id: string;
  bank_tran_id: string;
  card_type: string;
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

    // POST data as URLSearchParams for x-www-form-urlencoded
    const postData = new URLSearchParams({
      store_id: config.sslcommerz.store_id,
      store_passwd: config.sslcommerz.store_password,
      ...paymentData,
    } as any).toString();

    const response = await axios.post<SSLCommerzResponse>(
      getSSLCommerzURL('/gwprocess/v4/api.php'),
      postData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    console.log('SSLCommerz Init Response:', response.data);

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
    console.error('SSLCommerz Init Error:', error.response?.data || error.message);
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
      console.error('SSLCommerz credentials not configured');
      throw new Error('SSLCommerz credentials not configured');
    }

    console.log('🔍 Validating payment with SSLCommerz, val_id:', val_id);

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

    console.log('✅ SSLCommerz Validation Response:', {
      status: response.data.status,
      tran_id: response.data.tran_id,
      amount: response.data.amount,
    });

    if (response.data.status === 'VALID' || response.data.status === 'VALIDATED') {
      return {
        success: true,
        data: response.data,
      };
    }

    console.warn('⚠️ Payment validation failed with status:', response.data.status);
    return {
      success: false,
      error: `Payment validation failed with status: ${response.data.status}`,
    };
  } catch (error: any) {
    console.error('❌ SSLCommerz Validation Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Payment validation failed',
    };
  }
};

/**
 * Helper function to generate transaction ID
 */
export const generateTransactionId = (): string => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
};
