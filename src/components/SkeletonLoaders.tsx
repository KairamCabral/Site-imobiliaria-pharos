/**
 * SkeletonLoaders
 * Componentes de loading state para melhor UX durante carregamento
 * Usa shimmer effect para indicar que está carregando
 */

'use client';

export function PropertyDetailSkeleton() {
  return (
    <div className="bg-white min-h-screen animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="h-4 bg-gray-200 rounded w-64" />
        </div>
      </div>

      {/* Gallery Skeleton */}
      <div className="bg-gray-300 h-[400px] md:h-[500px] lg:h-[600px]" />

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>

            <div className="h-px bg-gray-200" />

            {/* Price */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-12 bg-gray-200 rounded w-64" />
            </div>

            <div className="h-px bg-gray-200" />

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-32" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-100 rounded-2xl p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-12 bg-gray-200 rounded w-full" />
              <div className="h-12 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
      {/* Image */}
      <div className="h-48 bg-gray-300" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4" />

        {/* Location */}
        <div className="h-4 bg-gray-200 rounded w-1/2" />

        {/* Price */}
        <div className="h-8 bg-gray-200 rounded w-2/3" />

        {/* Specs */}
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Shimmer effect overlay para loading states
 */
export function ShimmerEffect({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

/**
 * Loading spinner circular
 */
export function Spinner({ 
  size = 'md', 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-gray-200 border-t-pharos-blue-600 
        rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Carregando..."
    />
  );
}

/**
 * Loading overlay para modals/sections
 */
export function LoadingOverlay({ 
  message = 'Carregando...',
  transparent = false 
}: { 
  message?: string;
  transparent?: boolean;
}) {
  return (
    <div
      className={`
        absolute inset-0 flex flex-col items-center justify-center z-50
        ${transparent ? 'bg-white/70' : 'bg-white'}
        backdrop-blur-sm
      `}
    >
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-pharos-slate-600 font-medium">{message}</p>
      )}
    </div>
  );
}

/**
 * Skeleton para seções de texto
 */
export function TextSkeleton({ 
  lines = 3,
  className = '' 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{
            width: i === lines - 1 ? '75%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton para highlights/cards
 */
export function HighlightCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
      <div className="w-14 h-14 bg-gray-300 rounded-xl mb-4" />
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}

export function HighlightsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <HighlightCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton para tabs
 */
export function TabsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Tab Headers */}
      <div className="flex gap-8 border-b border-gray-200 pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 bg-gray-200 rounded w-24" />
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        <div className="h-20 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton para galeria de imagens
 */
export function ImageGallerySkeleton() {
  return (
    <div className="bg-gray-300 animate-pulse">
      <div className="max-w-7xl mx-auto h-[400px] md:h-[500px] lg:h-[600px]" />
    </div>
  );
}

/**
 * Page-specific skeleton (wrapper completo)
 */
export function PropertyPageSkeleton() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
      </div>

      {/* Gallery */}
      <ImageGallerySkeleton />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Price */}
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-px bg-gray-200 my-4" />
              <div className="h-12 bg-gray-200 rounded w-64" />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
              <TextSkeleton lines={5} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-100 rounded-2xl p-6 space-y-4 animate-pulse sticky top-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-12 bg-gray-200 rounded w-full" />
              <div className="h-12 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8 animate-pulse" />
          <HighlightsGridSkeleton />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <TabsSkeleton />
        </div>
      </div>
    </div>
  );
}

