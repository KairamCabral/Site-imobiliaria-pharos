/**
 * Hero Section Skeleton
 * 
 * Skeleton para hero da homepage
 */

import React from 'react';
import { Skeleton, SkeletonImage, SkeletonText } from './Skeleton';

export function HeroSkeleton() {
  return (
    <div className="relative w-full">
      {/* Hero Image/Background */}
      <SkeletonImage aspectRatio="21/9" className="w-full min-h-[400px] md:min-h-[500px]" />
      
      {/* Overlay Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Title */}
            <div className="space-y-3">
              <Skeleton variant="rounded" width="80%" height={48} className="mx-auto" />
              <Skeleton variant="rounded" width="60%" height={48} className="mx-auto" />
            </div>
            
            {/* Subtitle */}
            <Skeleton variant="rounded" width="70%" height={24} className="mx-auto" />
            
            {/* Search Bar */}
            <div className="mt-8 max-w-2xl mx-auto">
              <Skeleton variant="rounded" width="100%" height={56} />
            </div>
            
            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center mt-6">
              <Skeleton variant="rounded" width={160} height={44} />
              <Skeleton variant="rounded" width={160} height={44} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Featured Properties Section Skeleton
 */
export function FeaturedPropertiesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="rounded" width={200} height={32} />
          <Skeleton variant="rounded" width={300} height={20} />
        </div>
        <Skeleton variant="rounded" width={120} height={40} />
      </div>
      
      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md">
            <SkeletonImage aspectRatio="4/3" />
            <div className="p-4 space-y-3">
              <Skeleton variant="rounded" width={80} height={24} />
              <SkeletonText lines={2} />
              <Skeleton variant="rounded" width={120} height={28} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





