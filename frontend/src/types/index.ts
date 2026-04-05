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
  // Rating fields
  averageRating?: number;
  totalReviews?: number;
  ratingDistribution?: RatingDistribution;
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
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'returned' | 'cancelled' | 'booked' | 'inUse' | 'outForDelivery' | 'late';
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

// Reviews & Ratings
export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface Review {
  _id: string;
  id?: string;
  userId: string | {
    _id: string;
    name: string;
    email?: string;
  };
  productId: string;
  orderId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  reviewerName: string;
  reviewerEmail?: string;
  helpful: number;
  unhelpful: number;
  isVerifiedPurchase?: boolean;
  isRecent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
  percentages: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ProductReviewResponse {
  success: boolean;
  data: {
    reviews: Review[];
    stats: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: RatingDistribution;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface CreateReviewRequest {
  productId: string;
  orderId?: string;
  userId: string;  // Required for authentication
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  reviewerName?: string;
  reviewerEmail?: string;
}

export interface ReviewEligibilityResponse {
  success: boolean;
  data: {
    canReview: boolean;
    reason: string;
    hasReviewed: boolean;
  };
}