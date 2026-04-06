import { useState, useCallback } from 'react';
import api from '../services/api';
import {
  Review,
  ReviewStats,
  ProductReviewResponse,
  ReviewEligibilityResponse,
  CreateReviewRequest
} from '../types';

interface UseReviewsResponse {
  reviews: Review[];
  stats: ReviewStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch product reviews with pagination and sorting
   */
  const fetchProductReviews = useCallback(async (
    productId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'recent'
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ProductReviewResponse>(
        `/api/reviews/product/${productId}`,
        {
          params: { page, limit, sortBy }
        }
      );

      if (response.data.success) {
        // Backend returns flat structure: { success, reviews, stats }
        const responseData = response.data as any;
        const reviews = responseData.reviews || [];
        const stats = responseData.stats || {};
        
        setReviews(reviews);
        setStats({
          averageRating: stats.averageRating || 0,
          totalReviews: stats.totalReviews || 0,
          ratingDistribution: stats.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          percentages: calculatePercentages(stats.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
        });
        
        // Set pagination with defaults if not provided
        setPagination({
          page: page,
          limit: limit,
          total: reviews.length,
          pages: Math.ceil(reviews.length / limit) || 0
        });
        return true;
      }
      return false;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch reviews';
      setError(null); // Clear error after a moment for glitches
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch review statistics for a product
   */
  const fetchReviewStats = useCallback(async (productId: string): Promise<ReviewStats | null> => {
    try {
      const response = await api.get(`/api/reviews/stats/${productId}`);
      if (response.data.success) {
        const statsData = response.data.data;
        setStats(statsData);
        return statsData;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch review stats:', err);
      return null;
    }
  }, []);

  /**
   * Check if user can review a product
   */
  const checkReviewEligibility = useCallback(async (
    productId: string,
    orderId: string
  ): Promise<ReviewEligibilityResponse['data'] | null> => {
    try {
      const response = await api.get<ReviewEligibilityResponse>(
        `/api/reviews/check/${productId}/${orderId}`
      );
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to check review eligibility:', err);
      return null;
    }
  }, []);

  /**
   * Get user's review for a product (if exists)
   * Supports both authenticated users (by userId) and anonymous users (by email)
   */
  const getUserReview = useCallback(async (
    productId: string, 
    userId?: string, 
    email?: string
  ): Promise<Review | null> => {
    try {
      const params: any = {};
      if (userId) params.userId = userId;
      if (email) params.email = email;
      
      const response = await api.get(`/api/reviews/user-review/${productId}`, { params });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch user review:', err);
      return null;
    }
  }, []);

  /**
   * Create a new review
   * Requires authentication - userId must be provided
   */
  const createReview = useCallback(async (reviewData: {
    productId: string;
    rating: number;
    comment: string;
    reviewerName?: string;
    reviewerEmail?: string;
    orderId?: string;
    userId: string;  // Required
  }): Promise<Review | null> => {
    try {
      setError(null);
      const response = await api.post(`/api/reviews`, reviewData);
      if (response.data.success) {
        // Refresh reviews list
        await fetchProductReviews(reviewData.productId);
        return response.data.data;
      }
      return null;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create review';
      setError(errorMessage);
      return null;
    }
  }, [fetchProductReviews]);

  /**
   * Update an existing review
   */
  const updateReview = useCallback(async (
    reviewId: string,
    updateData: {
      rating?: number;
      comment?: string;
      reviewerName?: string;
    }
  ): Promise<Review | null> => {
    try {
      setError(null);
      const response = await api.put(`/api/reviews/${reviewId}`, updateData);
      if (response.data.success) {
        // Refresh reviews list
        const firstReview = reviews[0];
        if (firstReview && firstReview.productId) {
          await fetchProductReviews(firstReview.productId);
        }
        return response.data.data;
      }
      return null;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to update review';
      setError(errorMessage);
      return null;
    }
  }, [fetchProductReviews, reviews]);

  /**
   * Delete a review
   */
  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await api.delete(`/api/reviews/${reviewId}`);
      if (response.data.success) {
        // Remove from local state
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        return true;
      }
      return false;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to delete review';
      setError(errorMessage);
      return false;
    }
  }, []);

  /**
   * Mark review as helpful/unhelpful
   */
  const markHelpful = useCallback(async (
    reviewId: string,
    action: 'helpful' | 'unhelpful'
  ): Promise<boolean> => {
    try {
      const response = await api.post(`/api/reviews/${reviewId}/helpful`, { action });
      if (response.data.success) {
        // Update review in local state
        setReviews(prev =>
          prev.map(r => {
            if (r._id === reviewId) {
              return {
                ...r,
                helpful: action === 'helpful' ? r.helpful + 1 : r.helpful,
                unhelpful: action === 'unhelpful' ? r.unhelpful + 1 : r.unhelpful
              };
            }
            return r;
          })
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to mark review:', err);
      return false;
    }
  }, []);

  return {
    // State
    reviews,
    stats,
    pagination,
    loading,
    error,

    // Methods
    fetchProductReviews,
    fetchReviewStats,
    checkReviewEligibility,
    getUserReview,
    createReview,
    updateReview,
    deleteReview,
    markHelpful
  };
};

/**
 * Helper function to calculate percentages from rating distribution
 */
function calculatePercentages(distribution: { 5: number; 4: number; 3: number; 2: number; 1: number }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  return {
    5: total > 0 ? Math.round((distribution[5] / total) * 100) : 0,
    4: total > 0 ? Math.round((distribution[4] / total) * 100) : 0,
    3: total > 0 ? Math.round((distribution[3] / total) * 100) : 0,
    2: total > 0 ? Math.round((distribution[2] / total) * 100) : 0,
    1: total > 0 ? Math.round((distribution[1] / total) * 100) : 0
  };
}
