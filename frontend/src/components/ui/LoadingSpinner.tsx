import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="w-full h-full rounded-full border-4 border-primary-200 border-t-primary-500 shadow-lg" />
      </div>
      {text && <p className="text-dark-600 font-medium text-center">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
