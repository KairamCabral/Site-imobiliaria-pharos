/**
 * Property Grid Skeleton
 * 
 * Skeleton para grid de imóveis
 * Mostra múltiplos cards em loading
 */

import React from 'react';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';

interface PropertyGridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
}

export function PropertyGridSkeleton({
  count = 6,
  columns = 3,
}: PropertyGridSkeletonProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };
  
  return (
    <div className={`grid ${gridClasses[columns]} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Property List Skeleton
 * Para layout de lista (não grid)
 */
export function PropertyListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}





