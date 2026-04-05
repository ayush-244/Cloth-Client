import React from 'react';
import RatingStars from './RatingStars';

interface RatingDistributionProps {
  distribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  } | null;
  averageRating: number;
  totalReviews: number;
}

/**
 * RatingDistribution Component
 * 
 * Displays rating breakdown like Amazon/Myntra
 * Shows percentage bars for each rating level
 * 
 * @param distribution - Object with counts for each rating (5, 4, 3, 2, 1)
 * @param averageRating - Average rating (1-5)
 * @param totalReviews - Total number of reviews
 */
const RatingDistribution: React.FC<RatingDistributionProps> = ({
  distribution,
  averageRating,
  totalReviews
}) => {
  // Default distribution if none provided
  const safeDistribution = distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const total = Object.values(safeDistribution).reduce((a, b) => a + b, 0);

  const getPercentage = (count: number): number => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const RatingBar = ({ rating, count }: { rating: number; count: number }) => {
    const percentage = getPercentage(count);

    return (
      <div className="flex items-center gap-3">
        {/* Rating label */}
        <div className="w-12">
          <button className="flex items-center gap-1 text-sm hover:text-yellow-600 transition-colors">
            <span className="font-medium">{rating}</span>
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        </div>

        {/* Percentage bar */}
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-yellow-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Percentage text */}
        <div className="w-12 text-right">
          <span className="text-sm font-medium text-gray-700">{percentage}%</span>
        </div>

        {/* Count */}
        <div className="w-16 text-right">
          <span className="text-xs text-gray-500">({count})</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Reviews</h3>

      {/* Average rating section */}
      <div className="flex items-start gap-8 mb-8 pb-8 border-b border-gray-200">
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <RatingStars rating={averageRating} size="md" readOnly />
          <div className="text-sm text-gray-500 mt-2">
            {totalReviews === 1 ? '1 review' : `${totalReviews} reviews`}
          </div>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-3">
          <RatingBar rating={5} count={safeDistribution[5]} />
          <RatingBar rating={4} count={safeDistribution[4]} />
          <RatingBar rating={3} count={safeDistribution[3]} />
          <RatingBar rating={2} count={safeDistribution[2]} />
          <RatingBar rating={1} count={safeDistribution[1]} />
        </div>
      </div>

      {/* Rating insights */}
      {totalReviews > 0 && (
        <div className="text-sm text-gray-600">
          <p>
            {(() => {
              if (averageRating >= 4.5) return "🎉 Customers love this product!";
              if (averageRating >= 4) return "✅ Highly rated by customers";
              if (averageRating >= 3) return "👍 Good overall reviews";
              if (averageRating >= 2) return "⚠️ Mixed reviews";
              return "❌ Consider before purchasing";
            })()}
          </p>
        </div>
      )}
    </div>
  );
};

export default RatingDistribution;
