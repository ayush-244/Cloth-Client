import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Image Skeleton */}
      <div className="h-96 w-full bg-gray-150 rounded-lg mb-4" />
      
      {/* Content Skeleton */}
      <div className="space-y-2">
        {/* Title */}
        <div className="h-5 bg-gray-150 rounded w-3/4" />
        
        {/* Price */}
        <div className="h-4 bg-gray-150 rounded w-1/2" />
      </div>
    </div>
  );
};

export default SkeletonCard;
