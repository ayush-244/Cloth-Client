import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useReviews } from '../../hooks/useReviews';
import { Review } from '../../types';
import {
  RatingDistribution,
  ReviewForm,
  ReviewList,
  LoadingSpinner,
  Alert
} from '../index';

interface ReviewsSectionProps {
  productId: string;
}

/**
 * ReviewsSection Component
 * 
 * Complete reviews section for ProductDetails page
 * Includes:
 * - Rating distribution display
 * - Review form (always available - anyone can review)
 * - Reviews list with pagination
 * - Error handling and loading states
 * 
 * @param productId - Product ID to fetch reviews for
 */
const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const {
    reviews,
    stats,
    pagination,
    loading,
    error,
    fetchProductReviews,
    fetchReviewStats,
    getUserReview,
    createReview,
    updateReview,
    deleteReview,
    markHelpful
  } = useReviews();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);

  // Initial load: fetch reviews and stats
  useEffect(() => {
    fetchProductReviews(productId, 1, 10, sortBy);
    fetchReviewStats(productId);
  }, [productId]);

  // Fetch user's existing review if authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      getUserReview(productId, user.id).then(setUserReview);
    } else {
      setUserReview(null);
    }
  }, [isAuthenticated, user?.id, productId]);

  // Fetch reviews when sort/page changes
  useEffect(() => {
    fetchProductReviews(productId, currentPage, 10, sortBy);
  }, [sortBy, currentPage]);

  const handleCreateReview = async (data: { 
    rating: number; 
    comment: string; 
    reviewerName?: string;
    reviewerEmail?: string;
  }) => {
    if (!isAuthenticated || !user?.id) {
      setSubmitError('Please log in to submit a review');
      return false;
    }

    try {
      setSubmitError(null);
      const result = await createReview({
        productId,
        rating: data.rating as 1 | 2 | 3 | 4 | 5,
        comment: data.comment,
        reviewerName: data.reviewerName || user?.name,
        reviewerEmail: user?.email,
        userId: user?.id
      });

      if (result) {
        setShowReviewForm(false);
        setUserReview(result);
        // Refresh reviews list
        fetchProductReviews(productId, 1, 10, sortBy);
        fetchReviewStats(productId);
        return true;
      }
      return false;
    } catch (err) {
      setSubmitError('Failed to create review');
      return false;
    }
  };

  const handleUpdateReview = async (reviewId: string, data: { 
    rating: number; 
    comment: string; 
    reviewerName?: string;
  }) => {
    try {
      setSubmitError(null);
      const result = await updateReview(reviewId, {
        rating: data.rating,
        comment: data.comment,
        reviewerName: data.reviewerName
      });

      if (result) {
        setShowReviewForm(false);
        setUserReview(result);
        // Refresh reviews list
        fetchProductReviews(productId, currentPage, 10, sortBy);
        fetchReviewStats(productId);
        return true;
      }
      return false;
    } catch (err) {
      setSubmitError('Failed to update review');
      return false;
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const success = await deleteReview(reviewId);
    if (success) {
      setUserReview(null);
      // Refresh reviews list
      fetchProductReviews(productId, currentPage, 10, sortBy);
      fetchReviewStats(productId);
    }
  };

  const handleMarkHelpful = async (reviewId: string, action: 'helpful' | 'unhelpful') => {
    await markHelpful(reviewId, action);
  };

  if (!stats && loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error alert */}
      {error && (
        <Alert
          type="error"
          title="Error Loading Reviews"
          message={error}
        />
      )}

      {/* Ratings Distribution */}
      {stats && (
        <div>
          <RatingDistribution
            distribution={stats.ratingDistribution}
            averageRating={stats.averageRating}
            totalReviews={stats.totalReviews}
          />
        </div>
      )}

      {/* Review Form Section - Authentication Required */}
      {isAuthenticated ? (
        <div>
          {!showReviewForm && !userReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share Your Review
            </button>
          )}

          {showReviewForm && (
            <div className="space-y-4">
              {submitError && (
                <Alert
                  type="error"
                  title="Review Error"
                  message={submitError}
                />
              )}
              <ReviewForm
                productId={productId}
                existingReview={userReview}
                onSubmit={handleCreateReview}
                onUpdate={handleUpdateReview}
                onCancel={() => setShowReviewForm(false)}
                loading={loading}
                error={submitError}
                isAuthenticated={isAuthenticated}
                userName={user?.name}
                userEmail={user?.email}
              />
            </div>
          )}

          {/* Show existing review in edit mode */}
          {userReview && !showReviewForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900">Your Review</h4>
              <p className="text-sm text-blue-800 mt-2">Rating: {userReview.rating}/5</p>
              <p className="text-sm text-blue-800">{userReview.comment}</p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Edit Review
              </button>
            </div>
          )}
        </div>
      ) : (
        <Alert
          type="info"
          title="Sign In to Review"
          message="Please sign in to share your experience with this product"
        />
      )}

      {/* Reviews List */}
      <ReviewList
        productId={productId}
        reviews={reviews}
        totalReviews={stats?.totalReviews || 0}
        currentPage={pagination.page}
        totalPages={pagination.pages}
        loading={loading}
        currentUserId={user?.id}
        isAdmin={user?.role === 'admin'}
        onPageChange={setCurrentPage}
        onSortChange={setSortBy}
        onDelete={handleDeleteReview}
        onMarkHelpful={handleMarkHelpful}
        sortBy={sortBy}
        emptyMessage="No reviews yet. Be the first to review this product!"
      />
    </div>
  );
};

export default ReviewsSection;
