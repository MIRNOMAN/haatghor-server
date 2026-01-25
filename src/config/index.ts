import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  mail: process.env.MAIL,
  mail_password: process.env.MAIL_PASS,
  base_url_server: process.env.BASE_URL_SERVER,
  base_url_client: process.env.BASE_URL_CLIENT,
  website_identifier: process.env.WEBSITE_IDENTIFIER || '',
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  do_space: {
    endpoints: process.env.DO_SPACE_ENDPOINT,
    access_key: process.env.DO_SPACE_ACCESS_KEY,
    secret_key: process.env.DO_SPACE_SECRET_KEY,
    bucket: process.env.DO_SPACE_BUCKET
  },
  mi_space: {
    endpoints: process.env.MI_SPACE_ENDPOINT,
    access_key: process.env.MI_SPACE_ACCESS_KEY,
    secret_key: process.env.MI_SPACE_SECRET_KEY,
    bucket: process.env.MI_SPACE_BUCKET,
    port: process.env.MI_PORT,
    ssl: process.env.MI_USE_SSL,
  },
  stripe: {
    published_key: process.env.STRIPE_PUBLISHED_KEY,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_webhook: process.env.STRIPE_WEBHOOK
  },
  google: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    callback_url: process.env.GOOGLE_CALLBACK_URL,
  },
  bkash: {
    base_url: process.env.BKASH_BASE_URL,
    app_key: process.env.BKASH_APP_KEY,
    app_secret: process.env.BKASH_APP_SECRET,
    username: process.env.BKASH_USERNAME,
    password: process.env.BKASH_PASSWORD,
  },
  nagad: {
    base_url: process.env.NAGAD_BASE_URL,
    merchant_id: process.env.NAGAD_MERCHANT_ID,
    merchant_number: process.env.NAGAD_MERCHANT_NUMBER,
    public_key: process.env.NAGAD_PUBLIC_KEY,
    private_key: process.env.NAGAD_PRIVATE_KEY,
  },
  sslcommerz: {
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_password: process.env.SSLCOMMERZ_STORE_PASSWORD,
    is_live: process.env.SSLCOMMERZ_IS_LIVE === 'true',
    success_url: process.env.SSLCOMMERZ_SUCCESS_URL,
    fail_url: process.env.SSLCOMMERZ_FAIL_URL,
    cancel_url: process.env.SSLCOMMERZ_CANCEL_URL,
    ipn_url: process.env.SSLCOMMERZ_IPN_URL,
  },
  image: {
    upload_type: process.env.IMAGE_UPLOAD_TYPE || 'vps',
    max_size: parseInt(process.env.IMAGE_MAX_SIZE || '10'),
    allowed_types: process.env.IMAGE_ALLOWED_TYPES?.split(',') || ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  },
};
