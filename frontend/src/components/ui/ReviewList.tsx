import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { Review } from '../../types';
import ReviewCard from './ReviewCard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ReviewListProps {
  productId: string;
  reviews: Review[];
  totalReviews: number;
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortBy: string) => void;
  onDelete?: (reviewId: string) => void;
  onMarkHelpful?: (reviewId: string, action: 'helpful' | 'unhelpful') => void;
  sortBy?: string;
  emptyMessage?: string;
}

/**
 * ReviewList Component
 * 
 * Displays a paginated list of reviews with:
 * - Sorting options (recent, helpful, rating)
 * - Pagination controls
 * - Individual review cards
 * - Loading and empty states
 * 
 * @param productId - Product ID
 * @param reviews - Array of reviews
 * @param totalReviews - Total number of reviews
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param loading - Show loading state
 * @param currentUserId - Current user ID
 * @param isAdmin - Whether user is admin
 * @param onPageChange - Callback when page changes
 * @param onSortChange - Callback when sort changes
 * @param onDelete - Callback when review is deleted
 * @param onMarkHelpful - Callback when review is marked helpful
 */
const ReviewList: React.FC<ReviewListProps> = ({
  productId,
  reviews,
  totalReviews,
  currentPage,
  totalPages,
  loading = false,
  currentUserId,
  isAdmin = false,
  onPageChange,
  onSortChange,
  onDelete,
  onMarkHelpful,
  sortBy = 'recent',
  emptyMessage = 'No reviews yet. Be the first to review this product!'
}) => {
  const [localPage, setLocalPage] = useState(currentPage);

  useEffect(() => {
    setLocalPage(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setLocalPage(newPage);
      onPageChange?.(newPage);
      // Scroll to top of reviews section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange?.(e.target.value);
  };

  // Empty state
  if (!loading && reviews.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        </div>
        <p className="text-gray-600 text-lg font-medium">{emptyMessage}</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header with sorting */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Customer Reviews
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {totalReviews === 1 ? '1 review' : `${totalReviews} reviews`} total
          </p>
        </div>

        {totalReviews > 0 && (
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        )}
      </div>

      {/* Reviews list */}
      <div className="px-6 divide-y divide-gray-200">
        {reviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onDelete={onDelete}
            onMarkHelpful={onMarkHelpful}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => handlePageChange(localPage - 1)}
            disabled={localPage === 1 || loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="flex gap-2">
            {/* Page indicators */}
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              // Show first page, last page, current page, and neighbors
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= localPage - 1 && pageNum <= localPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pageNum === localPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                pageNum === localPage - 2 ||
                pageNum === localPage + 2
              ) {
                return (
                  <span key={pageNum} className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(localPage + 1)}
            disabled={localPage === totalPages || loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
