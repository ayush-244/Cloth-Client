import React from 'react';

interface StockBadgeProps {
  available: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
}

const StockBadge: React.FC<StockBadgeProps> = ({ available, total, size = 'sm' }) => {
  const isInStock = available > 0;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-sm px-4 py-2'
  };

  return (
    <div
      className={`
        rounded-full font-light ${sizeClasses[size]}
        ${isInStock 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
        }
      `}
    >
      {isInStock ? '✓ In Stock' : '✗ Out of Stock'}
      {size !== 'sm' && <span className="ml-1">({available}/{total})</span>}
    </div>
  );
};

export default StockBadge;
