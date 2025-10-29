// src/components/common/SkeletonLoader.tsx
import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width = '100%',
  height,
  count = 1,
  className = '',
}) => {
  const getHeightClass = () => {
    if (height) return height;
    switch (variant) {
      case 'text':
        return 'h-4';
      case 'circular':
        return 'h-12 w-12';
      case 'rectangular':
        return 'h-48';
      case 'card':
        return 'h-64';
      default:
        return 'h-4';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
      case 'card':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const skeletonClasses = `
    bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
    animate-pulse
    ${getVariantClasses()}
    ${getHeightClass()}
    ${className}
  `.trim();

  if (count === 1) {
    return <div className={skeletonClasses} style={{ width }} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${skeletonClasses} ${index > 0 ? 'mt-2' : ''}`} style={{ width }} />
      ))}
    </>
  );
};

export default SkeletonLoader;

// Preset skeleton components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
    <SkeletonLoader variant="text" width="60%" height="h-6" />
    <SkeletonLoader variant="text" width="100%" count={3} className="mt-2" />
    <div className="flex gap-2 mt-4">
      <SkeletonLoader variant="rectangular" width="80px" height="h-8" />
      <SkeletonLoader variant="rectangular" width="80px" height="h-8" />
    </div>
  </div>
);

export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({ 
  count = 5,
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow p-4">
        <div className="flex items-start gap-3">
          <SkeletonLoader variant="circular" />
          <div className="flex-1">
            <SkeletonLoader variant="text" width="40%" height="h-5" />
            <SkeletonLoader variant="text" width="100%" count={2} className="mt-2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5,
  columns = 4
}) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 p-4 border-b">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonLoader key={index} variant="text" width={`${100 / columns}%`} height="h-5" />
        ))}
      </div>
    </div>
    {/* Rows */}
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonLoader key={colIndex} variant="text" width={`${100 / columns}%`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
