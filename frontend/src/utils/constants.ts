export const CATEGORIES = [
  { value: 'men', label: 'Men', emoji: '👔' },
  { value: 'women', label: 'Women', emoji: '👗' },
  { value: 'footwear', label: 'Footwear', emoji: '👟' },
];

export const DEMO_CREDENTIALS = {
  email: 'user@example.com',
  password: 'password123',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
  },
  PRODUCTS: {
    GET_ALL: '/api/products',
    CREATE: '/api/products',
    DELETE: (id: string) => `/api/products/${id}`,
  },
};

export const ERROR_MESSAGES = {
  NETWORK: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An error occurred on the server. Please try again later.',
  VALIDATION: 'Please fill in all required fields correctly.',
};

export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome! You have successfully logged in.',
  LOGOUT: 'You have been logged out successfully.',
  PRODUCT_CREATED: 'Product created successfully!',
  PRODUCT_DELETED: 'Product deleted successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
};
