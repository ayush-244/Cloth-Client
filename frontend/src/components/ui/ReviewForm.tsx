import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import RatingStars from './RatingStars';
import { Review } from '../../types';

interface ReviewFormProps {
  productId: string;
  existingReview?: Review | null;
  onSubmit: (data: { rating: number; comment: string; reviewerName?: string; reviewerEmail?: string }) => Promise<boolean>;
  onUpdate?: (reviewId: string, data: { rating: number; comment: string; reviewerName?: string }) => Promise<boolean>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string | null;
  isAuthenticated?: boolean;
  userName?: string;
  userEmail?: string;
}

/**
 * ReviewForm Component
 * 
 * Form for creating or editing a review
 * Features:
 * - Star rating selector (1-5)
 * - Optional comment field (max 1000 chars)
 * - Anonymous review support (name & email fields)
 * - Validation and error handling
 * - Success feedback
 * - Works for both authenticated and anonymous users
 * 
 * @param productId - Product ID
 * @param existingReview - Pre-fill if editing existing review
 * @param onSubmit - Callback when creating a new review
 * @param onUpdate - Callback when updating an existing review
 * @param onCancel - Callback to close form
 * @param loading - Show loading state
 * @param error - Display error message
 * @param isAuthenticated - Whether user is logged in
 * @param userName - Current user's name (if authenticated)
 * @param userEmail - Current user's email (if authenticated)
 */
const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  existingReview,
  onSubmit,
  onUpdate,
  onCancel,
  loading = false,
  error = null,
  isAuthenticated = false,
  userName = '',
  userEmail = ''
}) => {
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditing = !!existingReview;
  const charCount = comment.length;
  const maxChars = 1000;
  const isValid = rating > 0;

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!isValid) {
      setFormError('Please select a rating');
      return;
    }

    if (comment.length > maxChars) {
      setFormError('Comment is too long');
      return;
    }

    try {
      let success = false;
      
      if (isEditing && existingReview && onUpdate) {
        // Update existing review
        success = await onUpdate(existingReview._id || existingReview.id || '', {
          rating,
          comment,
          reviewerName: userName || ''
        });
      } else {
        // Create new review
        success = await onSubmit({
          rating,
          comment,
          reviewerName: userName || '',
          reviewerEmail: userEmail || ''
        });
      }

      if (success) {
        setShowSuccess(true);
        // Reset form
        setRating(0);
        setComment('');
        setFormError(null);
        
        // Auto close after 2 seconds
        setTimeout(() => {
          if (onCancel) {
            onCancel();
          }
        }, 2000);
      }
    } catch (err) {
      setFormError('Failed to submit review');
    }
  };

  // Success message
  if (showSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="mx-auto mb-3 text-green-600" size={32} />
        <p className="text-green-900 font-medium">Thank You!</p>
        <p className="text-green-700 text-sm mt-1">
          Your review helps other customers make better decisions.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isEditing ? 'Edit Your Review' : 'Share Your Experience'}
        </h3>
        <p className="text-sm text-gray-600">
          Help other customers by sharing your rental experience
        </p>
      </div>

      {/* Error message */}
      {(formError || error) && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-red-900">{formError || error}</p>
          </div>
        </div>
      )}

      {/* Rating selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Rating <span className="text-red-600">*</span>
        </label>
        <RatingStars
          rating={rating}
          size="lg"
          interactive={true}
          onRatingChange={setRating}
          showLabel={true}
        />
        <p className="text-xs text-gray-500 mt-2">
          How would you rate your rental experience?
        </p>
      </div>

      {/* User info display */}
      <div className="mb-6 bg-blue-50 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          <strong>Reviewing as:</strong> {userName || 'User'}
        </p>
      </div>

      {/* Comment input */}
      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-900 mb-2">
          Your Review <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value.slice(0, maxChars));
            setFormError(null);
          }}
          placeholder="Tell other customers about your experience. What did you like or dislike about the product?"
          maxLength={maxChars}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            Be honest and helpful. Avoid offensive content.
          </p>
          <p className={`text-xs ${charCount > maxChars * 0.9 ? 'text-red-600' : 'text-gray-500'}`}>
            {charCount}/{maxChars}
          </p>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading || !isValid}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader size={18} className="animate-spin" />}
          <span>{loading ? 'Submitting...' : isEditing ? 'Update Review' : 'Post Review'}</span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        💡 Your honest feedback helps us improve our rental service
      </p>
    </form>
  );
};

export default ReviewForm;
