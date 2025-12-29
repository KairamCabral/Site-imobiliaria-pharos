'use client';

import dynamic from 'next/dynamic';
import React from 'react';

/**
 * Skeleton para carregamento do Swiper
 */
function SwiperSkeleton() {
  return (
    <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg">
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Lazy load do SwiperCarousel - só carrega quando componente é renderizado  
 * Isso remove Swiper (~100KB) do bundle inicial
 */
const SwiperCarouselDynamic = dynamic(() => import('./SwiperCarousel'), {
  loading: () => <SwiperSkeleton />,
  ssr: false, // Swiper funciona melhor sem SSR
});

export default SwiperCarouselDynamic;

