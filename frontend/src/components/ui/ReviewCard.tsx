import React, { useState } from 'react';
import { Trash2, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { Review } from '../../types';
import RatingStars from './RatingStars';

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete?: (reviewId: string) => void;
  onMarkHelpful?: (reviewId: string, action: 'helpful' | 'unhelpful') => void;
  loading?: boolean;
}

/**
 * ReviewCard Component
 * 
 * Displays a single review with:
 * - User info and rating
 * - Review comment
 * - Helpful votes
 * - Delete button (if user owns it)
 * - Verified purchase badge
 * 
 * @param review - Review data
 * @param currentUserId - Current user ID (for authorization)
 * @param isAdmin - Whether current user is admin
 * @param onDelete - Callback when delete is clicked
 * @param onMarkHelpful - Callback when helpful/unhelpful is clicked
 */
const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  isAdmin = false,
  onDelete,
  onMarkHelpful,
  loading = false
}) => {
  // Null safety check - return null if review is undefined
  if (!review) {
    return null;
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [helpfulLoading, setHelpfulLoading] = useState(false);

  const isOwnReview = currentUserId && review.userId ? currentUserId === (typeof review.userId === 'string' ? review.userId : review.userId._id) : false;
  const canDelete = isOwnReview || isAdmin;

  const handleDelete = async () => {
    if (onDelete && !loading) {
      setShowDeleteConfirm(false);
      onDelete(review._id);
    }
  };

  const handleMarkHelpful = async (action: 'helpful' | 'unhelpful') => {
    if (onMarkHelpful && !helpfulLoading) {
      setHelpfulLoading(true);
      await onMarkHelpful(review._id, action);
      setHelpfulLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <article className="border-b border-gray-200 py-6 last:border-b-0">
      {/* Header: User info and rating */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* User name and verification badge */}
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">
              {typeof review.userId === 'string' ? 'Anonymous User' : review.userId?.name || 'Anonymous User'}
            </h4>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Verified Purchase
              </span>
            )}
          </div>

          {/* Rating and date */}
          <div className="flex items-center gap-4">
            <RatingStars rating={review.rating} size="sm" readOnly />
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={14} />
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>

        {/* Delete button */}
        {canDelete && (
          <div className="relative">
            {showDeleteConfirm ? (
              <div className="absolute right-0 top-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 whitespace-nowrap">
                <p className="text-xs text-gray-600 mb-2">Delete review?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Deleting...' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-gray-100"
                title="Delete review"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review comment */}
      {review.comment && (
        <p className="text-gray-700 leading-relaxed mb-4">
          {review.comment}
        </p>
      )}

      {/* Helpful feedback section */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">Was this helpful?</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMarkHelpful('helpful')}
            disabled={helpfulLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <ThumbsUp size={14} />
            <span>{review.helpful > 0 ? review.helpful : 'Yes'}</span>
          </button>

          <button
            onClick={() => handleMarkHelpful('unhelpful')}
            disabled={helpfulLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <ThumbsDown size={14} />
            <span>{review.unhelpful > 0 ? review.unhelpful : 'No'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ReviewCard;
