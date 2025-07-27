// Application constants
export const ADMIN_EMAILS = ['admin@k-xpert.co.kr', 'admin2@k-xpert.co.kr'];

// Pagination constants
export const ITEMS_PER_PAGE = 10;

// Timeout constants
export const LOADING_TIMEOUT = 3000;
export const AUTH_REDIRECT_TIMEOUT = 100;

// Payment constants
export const CERTIFICATE_FEE = 10000;
export const TEST_PAYMENT_MODE = true;

// Environment configuration
export const ENV_CONFIG = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_SUPABASE_URL,
  devMode: import.meta.env.VITE_DEV_MODE === 'true',
} as const;

// Application settings
export const APP_SETTINGS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
} as const;