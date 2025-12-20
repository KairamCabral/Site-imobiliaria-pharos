/**
 * Skeleton Base Component
 * 
 * Componente base para criar skeleton loaders
 * Suporta animação pulse e diferentes variantes
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  
  const animationClasses = animate
    ? 'animate-pulse'
    : '';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };
  
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton Text - Para textos
 */
export function SkeletonText({
  lines = 1,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton Avatar - Para avatares/ícones circulares
 */
export function SkeletonAvatar({
  size = 40,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}

/**
 * Skeleton Image - Para imagens/thumbnails
 */
export function SkeletonImage({
  aspectRatio = '16/9',
  className = '',
}: {
  aspectRatio?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 animate-pulse ${className}`}
      style={{ aspectRatio }}
      aria-hidden="true"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}





