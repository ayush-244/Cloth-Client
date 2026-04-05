export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  category: 'men' | 'women' | 'footwear';
  description?: string;
  rentPrice: number;
  buyPrice?: number;
  totalStock: number;
  availableStock: number;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export interface CreateProductRequest extends FormData {
  name: string;
  category: 'men' | 'women' | 'footwear';
  rentPrice: number;
  totalStock: number;
  availableStock: number;
}

export interface ApiError {
  success: boolean;
  message: string;
  error?: string;
}

// Cart & Checkout
export interface CartItem {
  productId: string;
  product: Product;
  rentalDays: number;
  quantity?: number;
  pricePerDay: number;
  totalPrice: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Address
export interface Address {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

// Booking/Order
export interface Booking {
  _id?: string;
  id?: string;
  userId: string;
  productId: string;
  rentedDays: number;
  rentalStartDate: string;
  rentalEndDate: string;
  totalPrice: number;
  paymentId?: string;
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'returned' | 'cancelled';
  shippingAddress: Address;
  createdAt?: string;
  updatedAt?: string;
}

// Payment
export interface RazorpayOrder {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
}

export interface CheckoutData {
  items: CartItem[];
  shippingAddress: Address;
  totalPrice: number;
  rentalStartDate: string;
}