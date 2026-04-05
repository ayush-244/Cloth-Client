import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  showLabel?: boolean;
}

/**
 * RatingStars Component
 * 
 * Displays a 5-star rating visualization
 * Can be interactive (clickable) for review forms or read-only for displaying reviews
 * 
 * @param rating - Rating value (1-5)
 * @param size - Size of stars ('sm' | 'md' | 'lg')
 * @param interactive - Allow user to click and change rating
 * @param onRatingChange - Callback when rating changes
 * @param readOnly - Disable interaction
 * @param showLabel - Show rating text (e.g., "4.5 out of 5")
 */
const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 'md',
  interactive = false,
  onRatingChange,
  readOnly = false,
  showLabel = false
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizeMap = {
    sm: { icon: 16, gap: 'gap-0.5' },
    md: { icon: 20, gap: 'gap-1' },
    lg: { icon: 28, gap: 'gap-2' }
  };

  const { icon: iconSize, gap } = sizeMap[size];

  const handleStarClick = (starRating: number) => {
    if (!readOnly && interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className={`flex ${gap} cursor-${interactive && !readOnly ? 'pointer' : 'default'}`}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= Math.floor(displayRating);
          const isHalf = starIndex === Math.ceil(displayRating) && displayRating % 1 !== 0;

          return (
            <div
              key={starIndex}
              onMouseEnter={() => interactive && !readOnly && setHoverRating(starIndex)}
              onMouseLeave={() => interactive && !readOnly && setHoverRating(0)}
              onClick={() => handleStarClick(starIndex)}
              className={`transition-transform ${interactive && !readOnly ? 'hover:scale-110' : ''}`}
            >
              {isHalf ? (
                <div className="relative inline-block">
                  {/* Background star (empty) */}
                  <Star
                    size={iconSize}
                    className="text-gray-300 stroke-gray-400"
                    fill="none"
                  />
                  {/* Foreground star (half filled) */}
                  <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                    <Star
                      size={iconSize}
                      className="text-yellow-400 stroke-yellow-500"
                      fill="currentColor"
                    />
                  </div>
                </div>
              ) : (
                <Star
                  size={iconSize}
                  className={
                    isFilled
                      ? 'text-yellow-400 stroke-yellow-500'
                      : 'text-gray-300 stroke-gray-400'
                  }
                  fill={isFilled ? 'currentColor' : 'none'}
                />
              )}
            </div>
          );
        })}
      </div>

      {showLabel && (
        <div className="text-sm text-gray-600 mt-1">
          <span className="font-semibold text-gray-900">{displayRating.toFixed(1)}</span>
          <span className="text-gray-500"> out of 5</span>
        </div>
      )}
    </div>
  );
};

export default RatingStars;
